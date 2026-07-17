<?php

namespace App\Http\Controllers\GerenteOperativo;

use App\Http\Controllers\Controller;
use App\Models\Cotizacion;
use App\Models\CotizacionContenedor;
use App\Models\CotizacionDetalle;
use Inertia\Inertia;
use Inertia\Response;

class CotizacionController extends Controller
{
    public function index(): Response
    {
        $cotizaciones = Cotizacion::with(['cliente', 'comercial', 'pol', 'pod'])
            ->withSum('detalle as total', 'costo_total')
            ->orderByDesc('fecha_emision')
            ->get()
            ->map(fn (Cotizacion $cotizacion) => [
                'id_cotizacion' => $cotizacion->id_cotizacion,
                'numero_referencia' => $cotizacion->numero_referencia,
                'cliente' => $cotizacion->cliente?->razon_social,
                'comercial' => $cotizacion->comercial?->nombre_completo,
                'modo_transporte' => $cotizacion->modo_transporte,
                'pol' => $cotizacion->pol?->nombre,
                'pod' => $cotizacion->pod?->nombre,
                'fecha_emision' => $cotizacion->fecha_emision->toDateString(),
                'fecha_validez' => $cotizacion->fecha_validez->toDateString(),
                'total' => $cotizacion->total,
                'estado' => $cotizacion->estado,
            ]);

        return Inertia::render('GerenteOperativo/Cotizaciones/Index', [
            'cotizaciones' => $cotizaciones,
        ]);
    }

    public function show(Cotizacion $cotizacion): Response
    {
        $cotizacion->load(['cliente', 'comercial', 'pol', 'pod', 'contenedores', 'detalle', 'embarques']);

        return Inertia::render('GerenteOperativo/Cotizaciones/Show', [
            'cotizacion' => [
                'id_cotizacion' => $cotizacion->id_cotizacion,
                'numero_referencia' => $cotizacion->numero_referencia,
                'cliente' => $cotizacion->cliente?->razon_social,
                'comercial' => $cotizacion->comercial?->nombre_completo,
                'modo_transporte' => $cotizacion->modo_transporte,
                'tipo_servicio' => $cotizacion->tipo_servicio,
                'incoterm' => $cotizacion->incoterm,
                'pol' => $cotizacion->pol?->nombre,
                'pod' => $cotizacion->pod?->nombre,
                'destino_final' => $cotizacion->destino_final,
                'fecha_emision' => $cotizacion->fecha_emision->toDateString(),
                'fecha_validez' => $cotizacion->fecha_validez->toDateString(),
                'estado' => $cotizacion->estado,
                'peso_kg' => $cotizacion->peso_kg,
                'volumen_cbm' => $cotizacion->volumen_cbm,
                'mercancia_peligrosa' => $cotizacion->mercancia_peligrosa,
                'dias_transito' => $cotizacion->dias_transito,
                'tiene_embarque' => $cotizacion->embarques->isNotEmpty(),
                'embarque_id' => $cotizacion->embarques->first()?->id_embarque,
            ],
            'contenedores' => $cotizacion->contenedores->map(fn (CotizacionContenedor $item) => [
                'tipo_contenedor' => $item->tipo_contenedor,
                'cantidad' => $item->cantidad,
            ]),
            'detalle' => $cotizacion->detalle->map(fn (CotizacionDetalle $linea) => [
                'descripcion' => $linea->descripcion,
                'tipo_tarifa_unidad' => $linea->tipo_tarifa_unidad,
                'costo_unitario' => $linea->costo_unitario,
                'base_calculo' => $linea->base_calculo,
                'moneda' => $linea->moneda,
                'costo_total' => $linea->costo_total,
            ]),
            'total' => $cotizacion->detalle->sum('costo_total'),
        ]);
    }
}
