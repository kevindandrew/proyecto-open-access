<?php

namespace App\Support;

use App\Models\Cotizacion;
use App\Models\CotizacionDetalle;

/**
 * Arma el detalle de costos que se le muestra al cliente en el PDF: nunca
 * incluye la comisión OpenAccess como línea aparte. Cada línea de detalle
 * puede traer su propia comisión (siempre en USD) — se suma directamente al
 * costo de esa misma línea si está en USD; si la línea está en otra moneda,
 * no se mezcla para no alterar el monto real por un descalce de tipo de cambio.
 */
class CotizacionPdfDetalle
{
    public static function paraCliente(Cotizacion $cotizacion): array
    {
        $detalle = array_map(fn (array $linea) => self::aplicarComision($linea), self::mapearDetalle($cotizacion));

        return [
            'detalle' => $detalle,
            'totales' => self::totalesPorMoneda($detalle),
            // Varias líneas pueden compartir la misma tarifa (y por lo tanto
            // la misma observación) — se muestra una sola vez en un bloque
            // aparte en vez de repetirla debajo de cada línea que la usa.
            'observaciones' => self::observacionesDistintas($detalle),
        ];
    }

    /**
     * Versión resumida: colapsa los costos en una sola línea "Flete" por cada
     * moneda presente (nunca se mezclan monedas distintas en una sola línea),
     * para clientes que no quieren ver el detalle abierto.
     */
    public static function resumenParaCliente(Cotizacion $cotizacion): array
    {
        $detalle = self::mapearDetalle($cotizacion);

        $totalesPorMoneda = self::totalesPorMoneda($detalle);

        // La comisión siempre es en USD, así que se suma únicamente al total
        // en USD, nunca a otra moneda (misma regla que en el detallado).
        $totalComision = array_sum(array_column($detalle, 'comision_openaccess'));
        if ($totalComision > 0) {
            $totalesPorMoneda['USD'] = ($totalesPorMoneda['USD'] ?? 0) + $totalComision;
        }

        $detalleResumen = array_map(fn ($moneda, $total) => [
            'descripcion' => 'Flete',
            'tipo_tarifa_unidad' => 'Flat',
            'costo_unitario' => $total,
            'base_calculo' => 1,
            'moneda' => $moneda,
            'costo_total' => $total,
            'observaciones' => null,
        ], array_keys($totalesPorMoneda), $totalesPorMoneda);

        return [
            'detalle' => $detalleResumen,
            'totales' => $totalesPorMoneda,
            // El resumen colapsa las líneas, así que las observaciones se
            // muestran aparte en lugar de perderse junto con el detalle.
            'observaciones' => self::observacionesDistintas($detalle),
        ];
    }

    private static function observacionesDistintas(array $detalle): array
    {
        return array_values(array_unique(array_filter(array_column($detalle, 'observaciones'))));
    }

    /**
     * Nunca se suma entre monedas distintas — un total por cada moneda que
     * efectivamente aparece en el detalle.
     */
    private static function totalesPorMoneda(array $detalle): array
    {
        $totales = [];

        foreach ($detalle as $linea) {
            $moneda = $linea['moneda'] ?: 'USD';
            $totales[$moneda] = ($totales[$moneda] ?? 0) + (float) $linea['costo_total'];
        }

        return $totales;
    }

    private static function mapearDetalle(Cotizacion $cotizacion): array
    {
        return $cotizacion->detalle->map(fn (CotizacionDetalle $linea) => [
            'descripcion' => $linea->descripcion,
            'tipo_tarifa_unidad' => $linea->tipo_tarifa_unidad,
            'costo_unitario' => $linea->costo_unitario,
            'base_calculo' => $linea->base_calculo,
            'moneda' => $linea->moneda,
            'costo_total' => $linea->costo_total,
            'comision_openaccess' => $linea->comision_openaccess,
            'observaciones' => $linea->observaciones,
        ])->all();
    }

    private static function aplicarComision(array $linea): array
    {
        $comision = (float) $linea['comision_openaccess'];

        if ($comision > 0 && $linea['moneda'] === 'USD') {
            $nuevoTotal = (float) $linea['costo_total'] + $comision;
            $base = (float) ($linea['base_calculo'] ?: 1);

            $linea['costo_total'] = $nuevoTotal;
            $linea['costo_unitario'] = round($nuevoTotal / $base, 2);
        }

        unset($linea['comision_openaccess']);

        return $linea;
    }
}
