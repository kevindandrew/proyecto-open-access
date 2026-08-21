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
            'total' => array_sum(array_column($detalle, 'costo_total')),
        ];
    }

    /**
     * Versión resumida: colapsa todos los costos (incluidas las comisiones de
     * cada línea) en una sola línea "Flete", para clientes que no quieren ver
     * el detalle abierto.
     */
    public static function resumenParaCliente(Cotizacion $cotizacion): array
    {
        $detalle = self::mapearDetalle($cotizacion);
        $total = array_sum(array_column($detalle, 'costo_total'))
            + array_sum(array_column($detalle, 'comision_openaccess'));
        $moneda = $detalle[0]['moneda'] ?? 'USD';

        return [
            'detalle' => [[
                'descripcion' => 'Flete',
                'tipo_tarifa_unidad' => 'Flat',
                'costo_unitario' => $total,
                'base_calculo' => 1,
                'moneda' => $moneda,
                'costo_total' => $total,
            ]],
            'total' => $total,
        ];
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
