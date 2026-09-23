<?php

namespace App\Support;

use App\Models\DocumentoLiquidacion;

class DocumentoLiquidacionPdfDatos
{
    public static function para(DocumentoLiquidacion $documento): array
    {
        $documento->loadMissing([
            'embarque.pol',
            'embarque.pod',
            'embarque.cliente',
            'embarque.houseBls',
            'cliente',
            'proveedor',
            'lineas',
        ]);

        $embarque = $documento->embarque;
        $tipo = $documento->tipo;

        return [
            'documento' => [
                'tipo' => $tipo,
                'etiqueta' => TiposDocumentoLiquidacion::etiqueta($tipo),
                'categoria' => TiposDocumentoLiquidacion::categoria($tipo),
                'llevaDisclaimer' => TiposDocumentoLiquidacion::llevaDisclaimerLegal($tipo),
                'numero' => $documento->numero,
                'fecha' => $documento->fecha->toDateString(),
                'condicion_pago' => $documento->condicion_pago,
                'tipo_cambio' => $documento->tipo_cambio,
                'moneda' => $documento->moneda,
                'monto' => (float) $documento->monto,
                'monto_usd' => $documento->moneda === 'USD' ? (float) $documento->monto : 0,
                'monto_bob' => $documento->moneda === 'BOB' ? (float) $documento->monto : 0,
                'monto_en_letras' => MontoEnLetras::para((float) $documento->monto, $documento->moneda),
                'observaciones' => $documento->observaciones,
            ],
            'contraparte' => [
                'nombre' => $documento->cliente?->razon_social ?? $documento->proveedor?->nombre,
                'nit' => $documento->cliente?->nit,
            ],
            'embarque' => [
                'numero_file' => $embarque->numero_file,
                'mbl' => $embarque->mbl,
                'hbl' => $embarque->houseBls->pluck('numero_hbl')->filter()->implode(' / '),
                'cliente' => $embarque->cliente?->razon_social,
                'shipper_nombre' => $embarque->shipper_nombre,
                'pol' => $embarque->pol?->nombre,
                'pod' => $embarque->pod?->nombre,
                'etd' => $embarque->etd?->toDateString(),
                'eta' => $embarque->eta?->toDateString(),
            ],
            'lineas' => $documento->lineas->map(fn ($linea) => [
                'descripcion' => $linea->descripcion,
                'monto' => (float) $linea->monto,
            ])->all(),
        ];
    }
}
