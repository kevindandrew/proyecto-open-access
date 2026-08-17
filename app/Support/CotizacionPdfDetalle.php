<?php

namespace App\Support;

use App\Models\Cotizacion;
use App\Models\CotizacionDetalle;

/**
 * Arma el detalle de costos que se le muestra al cliente en el PDF: nunca
 * incluye la comisión OpenAccess como línea aparte. Si hay comisión cargada
 * (siempre en USD), se suma al costo de una línea que esté también en USD —
 * nunca se mezcla con una línea en otra moneda, para no alterar el monto real
 * por un descalce de tipo de cambio.
 */
class CotizacionPdfDetalle
{
    public static function paraCliente(Cotizacion $cotizacion): array
    {
        $detalle = self::mapearDetalle($cotizacion);
        $comision = (float) $cotizacion->comision_openaccess;

        if ($comision > 0 && count($detalle) > 0) {
            $indice = self::indiceLineaParaComision($detalle, $cotizacion->comision_moneda ?? 'USD');

            if ($indice !== null) {
                $nuevoTotal = (float) $detalle[$indice]['costo_total'] + $comision;
                $base = (float) ($detalle[$indice]['base_calculo'] ?: 1);

                $detalle[$indice]['costo_total'] = $nuevoTotal;
                $detalle[$indice]['costo_unitario'] = round($nuevoTotal / $base, 2);
            }
        }

        return [
            'detalle' => $detalle,
            'total' => array_sum(array_column($detalle, 'costo_total')),
        ];
    }

    /**
     * Versión resumida: colapsa todos los costos (incluida la comisión) en una
     * sola línea "Flete", para clientes que no quieren ver el detalle abierto.
     */
    public static function resumenParaCliente(Cotizacion $cotizacion): array
    {
        $detalle = self::mapearDetalle($cotizacion);
        $totalCostos = array_sum(array_column($detalle, 'costo_total'));
        $comision = (float) $cotizacion->comision_openaccess;
        $moneda = $detalle[0]['moneda'] ?? ($cotizacion->comision_moneda ?? 'USD');
        $total = $totalCostos + $comision;

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
        ])->all();
    }

    private static function indiceLineaParaComision(array $detalle, string $monedaComision): ?int
    {
        foreach ($detalle as $indice => $linea) {
            if (str_starts_with($linea['descripcion'], 'Flete') && $linea['moneda'] === $monedaComision) {
                return $indice;
            }
        }

        foreach ($detalle as $indice => $linea) {
            if ($linea['moneda'] === $monedaComision) {
                return $indice;
            }
        }

        return null;
    }
}
