<?php

namespace App\Http\Controllers\GerenteOperativo;

use App\Http\Controllers\Controller;
use App\Models\Embarque;
use App\Models\HouseBl;
use App\Support\GeneradorCodigoHouse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class HouseBlController extends Controller
{
    public function store(Request $request, Embarque $embarque): RedirectResponse
    {
        $data = $request->validate([
            'condicion_pago' => ['nullable', Rule::in(['Prepaid', 'Collect'])],
            'fecha_emision' => ['nullable', 'date'],
        ]);

        $embarque->houseBls()->create([
            'numero_hbl' => GeneradorCodigoHouse::siguienteNumeroHouse($embarque),
            'condicion_pago' => $data['condicion_pago'] ?? null,
            'fecha_emision' => $data['fecha_emision'] ?? null,
        ]);

        return redirect()
            ->route('gerente-operativo.embarques.show', $embarque->id_embarque)
            ->with('success', 'House agregado correctamente.');
    }

    public function update(Request $request, HouseBl $house): RedirectResponse
    {
        $data = $request->validate([
            'condicion_pago' => ['nullable', Rule::in(['Prepaid', 'Collect'])],
            'fecha_emision' => ['nullable', 'date'],
        ]);

        $house->update($data);

        return redirect()
            ->route('gerente-operativo.embarques.show', $house->id_embarque)
            ->with('success', 'House actualizado correctamente.');
    }

    public function destroy(HouseBl $house): RedirectResponse
    {
        $idEmbarque = $house->id_embarque;
        $house->delete();

        return redirect()
            ->route('gerente-operativo.embarques.show', $idEmbarque)
            ->with('success', 'House eliminado correctamente.');
    }
}
