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
    private const TIPOS_PDF = [
        'dam', 'copia', 'original', 'original_digital', 'certificado_flete', 'certificado_flete_digital',
    ];

    // Copia y Original se imprimen sobre papel pre-impreso con el logo ya
    // encima — por eso van sin logo. DAM y las versiones "digital" sí lo
    // llevan porque se mandan tal cual, sin papel pre-impreso de por medio.
    private const MUESTRA_LOGO = [
        'dam' => true,
        'copia' => false,
        'original' => false,
        'original_digital' => true,
        'certificado_flete' => false,
        'certificado_flete_digital' => true,
    ];

    private const ETIQUETAS_PDF = [
        'copia' => 'COPY NON NEGOTIABLE',
        'original' => 'ORIGINAL',
        'original_digital' => 'ORIGINAL',
    ];

    public function pdf(Request $request, HouseBl $house): HttpResponse
    {
        $tipo = in_array($request->query('tipo'), self::TIPOS_PDF, true) ? $request->query('tipo') : 'dam';

        // El HBL Original (impreso o digital) es el instrumento legal
        // definitivo — la primera vez que se genera, el house queda
        // congelado para proteger esos datos.
        if (in_array($tipo, ['original', 'original_digital'], true) && ! $house->congelado_en) {
            $house->update(['congelado_en' => now()]);
        }

        $datos = HouseBlPdfDatos::para($house);
        $generadoEn = Carbon::now()->locale('es')->isoFormat('D [de] MMMM [de] YYYY, HH:mm');
        $nombreArchivo = str_replace(['/', '\\'], '-', $house->numero_hbl);
        $mostrarLogo = self::MUESTRA_LOGO[$tipo] ?? true;

        if (in_array($tipo, ['certificado_flete', 'certificado_flete_digital'], true)) {
            $pdf = Pdf::loadView('pdf.house_bl_certificado_flete', [
                ...$datos,
                'mostrarLogo' => $mostrarLogo,
                'generadoEn' => $generadoEn,
            ]);

            return $pdf->stream("Certificado-Flete-{$nombreArchivo}.pdf");
        }

        $pdf = Pdf::loadView('pdf.house_bl', [
            ...$datos,
            'tipo' => $tipo,
            'tipoEtiqueta' => self::ETIQUETAS_PDF[$tipo] ?? null,
            'mostrarLogo' => $mostrarLogo,
            'generadoEn' => $generadoEn,
        ]);

        return $pdf->stream("House-{$nombreArchivo}.pdf");
    }

    public function store(Request $request, Embarque $embarque): RedirectResponse
    {
        $data = $this->validado($request, $embarque);

        DB::transaction(function () use ($embarque, $data) {
            $house = $embarque->houseBls()->create([
                'numero_hbl' => 'PENDIENTE',
                'id_cliente' => $data['id_cliente'] ?? null,
                'condicion_pago' => $data['condicion_pago'] ?? null,
                'flete_valor_texto' => $data['flete_valor_texto'] ?? null,
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

        DB::transaction(function () use ($house, $data) {
            $house->update([
                'id_cliente' => $data['id_cliente'] ?? null,
                'condicion_pago' => $data['condicion_pago'] ?? null,
                'flete_valor_texto' => $data['flete_valor_texto'] ?? null,
                'fecha_emision' => $data['fecha_emision'] ?? null,
            ]);

            // Un mismo contenedor puede repartirse entre varios houses, así
            // que peso/volumen/descripción de "la porción de este house" se
            // guardan en el pivot — nunca sobreescribiendo el dato del
            // contenedor completo, que es compartido por todos los houses
            // que lo usan.
            $camposPorId = collect($data['contenedores_campos'] ?? [])->keyBy('id_item');

            $sincronizacion = collect($data['contenedores'] ?? [])
                ->mapWithKeys(function ($idItem) use ($camposPorId) {
                    $campos = $camposPorId->get($idItem, []);

                    return [$idItem => [
                        'descripcion_mercancia' => $campos['descripcion_mercancia'] ?? null,
                        'peso_kg' => $campos['peso_kg'] ?? null,
                        'volumen_cbm' => $campos['volumen_cbm'] ?? null,
                    ]];
                })
                ->all();

            $house->contenedores()->sync($sincronizacion);
        });

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
            'id_cliente' => ['nullable', 'integer', 'exists:clientes,id_cliente'],
            'condicion_pago' => ['nullable', Rule::in(['Prepaid', 'Collect'])],
            'flete_valor_texto' => ['nullable', 'string', 'max:50'],
            'fecha_emision' => ['nullable', 'date'],
            'contenedores' => ['nullable', 'array'],
            'contenedores.*' => [
                'integer',
                Rule::exists('embarque_contenedores', 'id_item')->where('id_embarque', $embarque->id_embarque),
            ],
            'contenedores_campos' => ['nullable', 'array'],
            'contenedores_campos.*.id_item' => [
                'required',
                'integer',
                Rule::exists('embarque_contenedores', 'id_item')->where('id_embarque', $embarque->id_embarque),
            ],
            'contenedores_campos.*.descripcion_mercancia' => ['nullable', 'string'],
            'contenedores_campos.*.peso_kg' => ['nullable', 'numeric'],
            'contenedores_campos.*.volumen_cbm' => ['nullable', 'numeric'],
        ]);
    }
}
