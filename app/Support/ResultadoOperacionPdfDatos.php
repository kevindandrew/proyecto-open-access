<?php

namespace App\Support;

use App\Models\DocumentoLiquidacion;
use App\Models\Embarque;

class ResultadoOperacionPdfDatos
{
    public static function para(Embarque $embarque): array
    {
        $embarque->loadMissing([
            'pol',
            'pod',
            'cliente',
            'comercial',
            'navieraAerolinea',
            'documentosLiquidacion' => fn ($query) => $query->with(['cliente', 'proveedor'])->orderBy('id_documento'),
        ]);

        $ingresos = $embarque->documentosLiquidacion
            ->filter(fn (DocumentoLiquidacion $doc) => TiposDocumentoLiquidacion::esCobro($doc->tipo))
            ->map(fn (DocumentoLiquidacion $doc) => [
                'contraparte' => $doc->cliente?->razon_social ?? '—',
                'tipo' => TiposDocumentoLiquidacion::etiqueta($doc->tipo),
                'numero' => $doc->numero,
                'moneda' => $doc->moneda,
                'monto' => (float) $doc->monto,
            ])
            ->values();

        $egresos = $embarque->documentosLiquidacion
            ->filter(fn (DocumentoLiquidacion $doc) => TiposDocumentoLiquidacion::esPago($doc->tipo))
            ->map(fn (DocumentoLiquidacion $doc) => [
                'contraparte' => $doc->proveedor?->nombre ?? '—',
                'tipo' => TiposDocumentoLiquidacion::etiqueta($doc->tipo),
                'numero' => $doc->numero,
                'moneda' => $doc->moneda,
                'monto' => (float) $doc->monto,
            ])
            ->values();

        // Nunca se suma entre monedas distintas — un total de venta/compra por
        // cada moneda que efectivamente aparece en los documentos generados.
        $totalVentaPorMoneda = $ingresos->groupBy('moneda')->map(fn ($grupo) => $grupo->sum('monto'));
        $totalCompraPorMoneda = $egresos->groupBy('moneda')->map(fn ($grupo) => $grupo->sum('monto'));

        $monedas = $totalVentaPorMoneda->keys()->merge($totalCompraPorMoneda->keys())->unique()->values();

        $profitNetoPorMoneda = $monedas->mapWithKeys(fn ($moneda) => [
            $moneda => ($totalVentaPorMoneda[$moneda] ?? 0) - ($totalCompraPorMoneda[$moneda] ?? 0),
        ]);

        return [
            'embarque' => [
                'numero_file' => $embarque->numero_file,
                'cliente' => $embarque->cliente?->razon_social,
                'comercial' => $embarque->comercial?->nombre_completo,
                'modo_transporte' => $embarque->modo_transporte,
                'naviera_aerolinea' => $embarque->navieraAerolinea?->nombre,
                'pol' => $embarque->pol?->nombre,
                'pod' => $embarque->pod?->nombre,
                'mbl' => $embarque->mbl,
                'liquidacion_cerrada_en' => $embarque->liquidacion_cerrada_en?->toDateString(),
            ],
            'ingresos' => $ingresos->all(),
            'egresos' => $egresos->all(),
            'totalVentaPorMoneda' => $totalVentaPorMoneda->all(),
            'totalCompraPorMoneda' => $totalCompraPorMoneda->all(),
            'profitNetoPorMoneda' => $profitNetoPorMoneda->all(),
        ];
    }
}
