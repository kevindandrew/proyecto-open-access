<?php

namespace App\Http\Controllers\GerenteOperativo;

use App\Http\Controllers\Controller;
use App\Models\Embarque;
use App\Models\HouseBl;
use App\Support\GeneradorCodigoHouse;
use App\Support\HouseBlPdfDatos;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class HouseBlController extends Controller
{
    public function pdf(HouseBl $house): HttpResponse
    {
        $datos = HouseBlPdfDatos::para($house);

        $pdf = Pdf::loadView('pdf.house_bl', [
            ...$datos,
            'generadoEn' => Carbon::now()->locale('es')->isoFormat('D [de] MMMM [de] YYYY, HH:mm'),
        ]);

        $nombreArchivo = str_replace(['/', '\\'], '-', $house->numero_hbl);

        return $pdf->stream("House-{$nombreArchivo}.pdf");
    }

    public function store(Request $request, Embarque $embarque): RedirectResponse
    {
        $data = $this->validado($request, $embarque);

        DB::transaction(function () use ($embarque, $data) {
            $house = $embarque->houseBls()->create([
                'numero_hbl' => 'PENDIENTE',
                'condicion_pago' => $data['condicion_pago'] ?? null,
                'fecha_emision' => $data['fecha_emision'] ?? null,
            ]);

            $house->contenedores()->sync($data['contenedores'] ?? []);

            GeneradorCodigoHouse::renumerar($embarque);
        });

        return redirect()
            ->route('gerente-operativo.embarques.show', $embarque->id_embarque)
            ->with('success', 'House agregado correctamente.');
    }

    public function update(Request $request, HouseBl $house): RedirectResponse
    {
        $data = $this->validado($request, $house->embarque);

        $house->update([
            'condicion_pago' => $data['condicion_pago'] ?? null,
            'fecha_emision' => $data['fecha_emision'] ?? null,
        ]);

        $house->contenedores()->sync($data['contenedores'] ?? []);

        return redirect()
            ->route('gerente-operativo.embarques.show', $house->id_embarque)
            ->with('success', 'House actualizado correctamente.');
    }

    public function destroy(HouseBl $house): RedirectResponse
    {
        $embarque = $house->embarque;
        $idEmbarque = $house->id_embarque;

        DB::transaction(function () use ($house, $embarque) {
            $house->delete();
            GeneradorCodigoHouse::renumerar($embarque);
        });

        return redirect()
            ->route('gerente-operativo.embarques.show', $idEmbarque)
            ->with('success', 'House eliminado correctamente.');
    }

    private function validado(Request $request, Embarque $embarque): array
    {
        return $request->validate([
            'condicion_pago' => ['nullable', Rule::in(['Prepaid', 'Collect'])],
            'fecha_emision' => ['nullable', 'date'],
            'contenedores' => ['nullable', 'array'],
            'contenedores.*' => [
                'integer',
                Rule::exists('embarque_contenedores', 'id_item')->where('id_embarque', $embarque->id_embarque),
            ],
        ]);
    }
}
