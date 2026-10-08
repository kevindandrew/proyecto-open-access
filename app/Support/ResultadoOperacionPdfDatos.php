<?php

namespace App\Support;

use App\Models\DocumentoLiquidacion;
use App\Models\Embarque;
use Illuminate\Support\Collection;

class ResultadoOperacionPdfDatos
{
    // Crédito Fiscal: 13% de las Órdenes de Pago con CF — suma a la venta.
    public const PORCENTAJE_CREDITO_FISCAL = 13;

    // Débito Fiscal (13% IVA) + IT (3%) de las Facturas emitidas — suma a la compra.
    public const PORCENTAJE_DEBITO_FISCAL_IT = 16;

    public static function para(Embarque $embarque): array
    {
        $embarque->loadMissing([
            'pol',
            'pod',
            'cliente',
            'comercial.categoriaComision',
            'navieraAerolinea',
            'agenteOrigen',
            'houseBls',
            'documentosLiquidacion' => fn ($query) => $query->with(['cliente', 'proveedor', 'lineas'])->orderBy('id_documento'),
        ]);

        $documentos = $embarque->documentosLiquidacion;

        $ingresos = $documentos
            ->filter(fn (DocumentoLiquidacion $doc) => TiposDocumentoLiquidacion::esCobro($doc->tipo))
            ->map(fn (DocumentoLiquidacion $doc) => self::fila($doc, $doc->destinatario_nombre ?? $doc->cliente?->razon_social))
            ->values();

        // Todas las órdenes de pago son egreso, salvo las Provisionales que ya
        // quedaron anuladas por una orden definitiva (si no, ese costo se
        // sumaría dos veces).
        $anuladas = self::provisionalesAnuladas($documentos);

        $egresos = $documentos
            ->filter(fn (DocumentoLiquidacion $doc) => TiposDocumentoLiquidacion::esPago($doc->tipo))
            ->reject(fn (DocumentoLiquidacion $doc) => isset($anuladas[$doc->id_documento]))
            ->map(fn (DocumentoLiquidacion $doc) => self::fila($doc, $doc->proveedor?->nombre))
            ->values();

        // Nunca se suma entre monedas distintas — un total por cada moneda que
        // aparece. Los documentos emitidos en otra moneda (ej. Factura en Bs)
        // cuentan con su monto de origen, para sumar con el resto del file.
        $totalVenta = $ingresos->groupBy('moneda')->map(fn ($grupo) => $grupo->sum('monto'));
        $totalCompra = $egresos->groupBy('moneda')->map(fn ($grupo) => $grupo->sum('monto'));

        $creditoFiscal = $egresos->where('tipo_valor', 'orden_pago_cf')->groupBy('moneda')
            ->map(fn ($grupo) => round($grupo->sum('monto') * self::PORCENTAJE_CREDITO_FISCAL / 100, 2));
        $debitoFiscal = $ingresos->where('tipo_valor', 'factura')->groupBy('moneda')
            ->map(fn ($grupo) => round($grupo->sum('monto') * self::PORCENTAJE_DEBITO_FISCAL_IT / 100, 2));

        $porcentajeComision = self::porcentajeComision($embarque);

        $monedas = $totalVenta->keys()->merge($totalCompra->keys())->unique()->values();

        $totales = $monedas->mapWithKeys(function (string $moneda) use ($totalVenta, $totalCompra, $creditoFiscal, $debitoFiscal, $porcentajeComision) {
            $netoVenta = ($totalVenta[$moneda] ?? 0) + ($creditoFiscal[$moneda] ?? 0);
            $netoCompra = ($totalCompra[$moneda] ?? 0) + ($debitoFiscal[$moneda] ?? 0);
            $preliminar = round($netoVenta - $netoCompra, 2);
            $comercial = round($preliminar * $porcentajeComision / 100, 2);

            return [$moneda => [
                'venta' => $totalVenta[$moneda] ?? 0,
                'credito_fiscal' => $creditoFiscal[$moneda] ?? 0,
                'neto_venta' => $netoVenta,
                'compra' => $totalCompra[$moneda] ?? 0,
                'debito_fiscal' => $debitoFiscal[$moneda] ?? 0,
                'neto_compra' => $netoCompra,
                'profit_preliminar' => $preliminar,
                'profit_comercial' => $comercial,
                'profit_final' => round($preliminar - $comercial, 2),
            ]];
        });

        return [
            'embarque' => [
                'numero_file' => $embarque->numero_file,
                'cliente' => $embarque->cliente?->razon_social,
                'consignatario' => $embarque->consignatario_nombre,
                'comercial' => $embarque->comercial?->nombre_completo,
                'categoria_comision' => $embarque->comercial?->categoriaComision?->nombre,
                'modo_transporte' => $embarque->modo_transporte,
                'tipo_embarque' => $embarque->tipo_embarque,
                'naviera_aerolinea' => $embarque->navieraAerolinea?->nombre,
                'agente' => $embarque->agenteOrigen?->nombre,
                'pol' => $embarque->pol?->nombre,
                'pod' => $embarque->pod?->nombre,
                'mbl' => $embarque->mbl,
                'hbl' => $embarque->houseBls->pluck('numero_hbl')->filter()->implode(' / '),
                'etd' => $embarque->etd?->toDateString(),
                'eta' => $embarque->eta?->toDateString(),
                'liquidacion_cerrada_en' => $embarque->liquidacion_cerrada_en?->toDateString(),
            ],
            'ingresos' => $ingresos->all(),
            'egresos' => $egresos->all(),
            'totales' => $totales->all(),
            'porcentajeComision' => $porcentajeComision,
            'porcentajeCreditoFiscal' => self::PORCENTAJE_CREDITO_FISCAL,
            'porcentajeDebitoFiscal' => self::PORCENTAJE_DEBITO_FISCAL_IT,
        ];
    }

    /**
     * El % de comisión del comercial para este file: el ajuste manual del
     * embarque si lo hay, si no el de la categoría del comercial.
     */
    public static function porcentajeComision(Embarque $embarque): float
    {
        $embarque->loadMissing('comercial.categoriaComision');

        return (float) ($embarque->porcentaje_comision
            ?? $embarque->comercial?->categoriaComision?->porcentaje
            ?? 0);
    }

    /**
     * Provisionales anuladas: alguna de sus líneas ya se pagó con una orden
     * definitiva (Orden de Pago o con CF). Devuelve [id_documento => N° de la
     * orden definitiva que la reemplaza]. Necesita las líneas cargadas.
     */
    public static function provisionalesAnuladas(Collection $documentos): array
    {
        $definitivas = $documentos->filter(
            fn (DocumentoLiquidacion $doc) => in_array($doc->tipo, ['orden_pago', 'orden_pago_cf'], true),
        );

        $anuladas = [];

        foreach ($documentos as $doc) {
            if (! TiposDocumentoLiquidacion::esProvisional($doc->tipo)) {
                continue;
            }

            $claves = $doc->lineas->map(fn ($linea) => "{$linea->tipo_origen}:{$linea->id_origen}");

            $reemplazo = $definitivas->first(fn (DocumentoLiquidacion $definitiva) => $definitiva->lineas
                ->contains(fn ($linea) => $claves->contains("{$linea->tipo_origen}:{$linea->id_origen}")));

            if ($reemplazo) {
                $anuladas[$doc->id_documento] = $reemplazo->numero;
            }
        }

        return $anuladas;
    }

    private static function fila(DocumentoLiquidacion $doc, ?string $contraparte): array
    {
        $convertido = $doc->moneda_origen && $doc->monto_origen !== null;

        return [
            'contraparte' => $contraparte ?? '—',
            'tipo' => TiposDocumentoLiquidacion::etiqueta($doc->tipo),
            'tipo_valor' => $doc->tipo,
            'numero' => $doc->numero_factura ?? $doc->numero,
            'moneda' => $convertido ? $doc->moneda_origen : $doc->moneda,
            'monto' => (float) ($convertido ? $doc->monto_origen : $doc->monto),
            // Lo emitido en la otra moneda, solo para mostrar (ej. "344.40 BOB").
            'emitido' => $convertido ? number_format((float) $doc->monto, 2).' '.$doc->moneda : null,
        ];
    }
}
