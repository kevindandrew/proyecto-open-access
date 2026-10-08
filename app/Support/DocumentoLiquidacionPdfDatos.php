<?php

namespace App\Support;

use App\Models\DocumentoLiquidacion;
use App\Models\Embarque;
use Illuminate\Support\Collection;

class DocumentoLiquidacionPdfDatos
{
    public static function para(DocumentoLiquidacion $documento): array
    {
        $documento->loadMissing([
            'embarque.pol',
            'embarque.pod',
            'embarque.cliente',
            'embarque.houseBls',
            'embarque.contenedores',
            'houseBl.contenedores',
            'cliente',
            'proveedor',
            'lineas',
        ]);

        $embarque = $documento->embarque;
        $tipo = $documento->tipo;

        // Una nota emitida por house lleva solo los datos de ese house.
        $house = $documento->houseBl;

        return [
            'documento' => [
                'tipo' => $tipo,
                'etiqueta' => TiposDocumentoLiquidacion::etiqueta($tipo),
                'categoria' => TiposDocumentoLiquidacion::categoria($tipo),
                'llevaDisclaimer' => TiposDocumentoLiquidacion::llevaDisclaimerLegal($tipo),
                'leyendaMoneda' => self::leyendaMoneda($tipo, $documento->moneda),
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
                'nombre' => $documento->destinatario_nombre
                    ?? $documento->cliente?->razon_social
                    ?? $documento->proveedor?->nombre,
                'nit' => $documento->destinatario_nit ?? $documento->cliente?->nit,
                'direccion' => $documento->destinatario_direccion ?? $documento->cliente?->direccion,
            ],
            'embarque' => [
                'numero_file' => $embarque->numero_file,
                'mbl' => $embarque->mbl,
                'hbl' => $house
                    ? $house->numero_hbl
                    : $embarque->houseBls->pluck('numero_hbl')->filter()->implode(' / '),
                'cliente' => $embarque->cliente?->razon_social,
                'consignatario' => AlcancesCobro::consignatario($embarque, $house?->id_hbl)['nombre'] ?? null,
                'shipper_nombre' => $house?->shipper_nombre ?: $embarque->shipper_nombre,
                'tipo' => collect([$embarque->modo_transporte, $embarque->tipo_embarque])->filter()->implode(' / '),
                'unidades' => self::unidades($embarque, $house?->contenedores ?? $embarque->contenedores),
                'pol' => $embarque->pol?->nombre,
                'pod' => $embarque->pod?->nombre,
                'etd' => $embarque->etd?->toDateString(),
                'eta' => $embarque->eta?->toDateString(),
            ],
            'lineas' => $documento->lineas->map(fn ($linea) => [
                'descripcion' => $linea->descripcion,
                'tipo_documento' => $linea->tipo_documento,
                'numero_documento' => $linea->numero_documento,
                'fecha_documento' => $linea->fecha_documento?->format('d-m-Y'),
                'moneda' => $linea->moneda,
                'cantidad' => (float) $linea->cantidad,
                'precio_unitario' => $linea->precio_unitario !== null ? (float) $linea->precio_unitario : (float) $linea->monto,
                'monto' => (float) $linea->monto,
            ])->all(),
        ];
    }

    /**
     * Punto 1 del bloque legal de las notas de cobro, según en qué moneda se
     * emitió la nota.
     */
    private static function leyendaMoneda(string $tipo, string $moneda): string
    {
        $etiqueta = TiposDocumentoLiquidacion::etiqueta($tipo);

        return match ($moneda) {
            'EUR' => "El monto de esta {$etiqueta} deberá ser cancelado en Euros.",
            'BOB' => "El monto de esta {$etiqueta} deberá ser cancelado en Bolivianos.",
            default => "El monto de esta {$etiqueta} deberá ser cancelado en Dólares Americanos.",
        };
    }

    /**
     * "5 * 40' DRY / 2 * 20' DRY" — o, sin contenedores (aéreo / carga
     * suelta), las piezas y el peso del embarque.
     */
    private static function unidades(Embarque $embarque, Collection $contenedores): ?string
    {
        if ($contenedores->isNotEmpty()) {
            return $contenedores
                ->groupBy(fn ($contenedor) => $contenedor->tipo_contenedor ?: '—')
                ->map(fn ($grupo, $tipo) => $grupo->sum(fn ($c) => $c->cantidad ?: 1)." * {$tipo}")
                ->implode(' / ');
        }

        $piezas = $embarque->nro_piezas ? trim("{$embarque->nro_piezas} {$embarque->unidad_piezas}") : null;
        $peso = $embarque->peso_kg ? number_format((float) $embarque->peso_kg, 2).' kg' : null;

        return collect([$piezas, $peso])->filter()->implode(' / ') ?: null;
    }
}
