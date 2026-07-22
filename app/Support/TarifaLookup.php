<?php

namespace App\Support;

use App\Models\Tarifa;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class TarifaLookup
{
    public static function disponibles(array $filtros): Collection
    {
        $hoy = Carbon::today();

        return Tarifa::with(['proveedor', 'cargosAdicionales'])
            ->whereHas('proveedor', fn ($query) => $query->where('activo', true))
            ->where('modo', $filtros['modo_transporte'])
            ->when($filtros['id_pol'] ?? null, fn ($query, $pol) => $query->where('id_origen', $pol))
            ->when($filtros['id_pod'] ?? null, fn ($query, $pod) => $query->where('id_destino', $pod))
            ->when($filtros['tipo_servicio'] ?? null, fn ($query, $tipo) => $query->where('tipo_servicio', $tipo))
            ->where('fecha_inicio_vigencia', '<=', $hoy)
            ->where('fecha_fin_vigencia', '>=', $hoy)
            ->orderBy('fecha_fin_vigencia')
            ->get()
            ->map(fn (Tarifa $tarifa) => [
                'id_tarifa' => $tarifa->id_tarifa,
                'carrier' => $tarifa->proveedor?->nombre,
                'tipo_servicio' => $tarifa->tipo_servicio,
                'moneda' => $tarifa->moneda,
                'dias_transito' => $tarifa->dias_transito,
                'costo_20' => $tarifa->costo_20,
                'costo_40' => $tarifa->costo_40,
                'costo_40hc' => $tarifa->costo_40hc,
                'costo_cbm' => $tarifa->costo_cbm,
                'costo_base' => $tarifa->costo_base,
                'fecha_fin_vigencia' => $tarifa->fecha_fin_vigencia->toDateString(),
                'cargos_adicionales' => $tarifa->cargosAdicionales->map(fn ($cargo) => [
                    'concepto' => $cargo->concepto,
                    'monto' => $cargo->monto,
                    'moneda' => $cargo->moneda,
                ]),
            ]);
    }
}
