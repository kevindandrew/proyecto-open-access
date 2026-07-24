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
        $vencePronto = $hoy->copy()->addDays(5);

        return self::query($filtros)
            ->with(['proveedor', 'cargosAdicionales', 'costos'])
            ->where('fecha_inicio_vigencia', '<=', $hoy)
            ->orderBy('fecha_fin_vigencia')
            ->get()
            ->map(fn (Tarifa $tarifa) => [
                'id_tarifa' => $tarifa->id_tarifa,
                'carrier' => $tarifa->proveedor?->nombre,
                'tipo_servicio' => $tarifa->tipo_servicio,
                'moneda' => $tarifa->moneda,
                'dias_transito' => $tarifa->dias_transito,
                'costo_base' => $tarifa->costo_base,
                'costo_tramite' => $tarifa->costo_tramite,
                'moneda_tramite' => $tarifa->moneda_tramite,
                'fecha_fin_vigencia' => $tarifa->fecha_fin_vigencia->toDateString(),
                'estado' => EstadoTarifa::de($tarifa->fecha_fin_vigencia, $hoy, $vencePronto),
                'costos' => $tarifa->costos->map(fn ($costo) => [
                    'tipo_servicio' => $costo->tipo_servicio,
                    'tipo_contenedor' => $costo->tipo_contenedor,
                    'costo' => $costo->costo,
                    'moneda' => $costo->moneda,
                ]),
                'cargos_adicionales' => $tarifa->cargosAdicionales->map(fn ($cargo) => [
                    'concepto' => $cargo->concepto,
                    'monto' => $cargo->monto,
                    'moneda' => $cargo->moneda,
                ]),
            ]);
    }

    public static function existeParaRuta(array $filtros): bool
    {
        return self::query($filtros)->exists();
    }

    private static function query(array $filtros)
    {
        return Tarifa::whereHas('proveedor', fn ($query) => $query->where('activo', true))
            ->where('modo', $filtros['modo_transporte'])
            ->when($filtros['id_pol'] ?? null, fn ($query, $pol) => $query->where('id_origen', $pol))
            ->when($filtros['id_pod'] ?? null, fn ($query, $pod) => $query->where('id_destino', $pod))
            ->when($filtros['tipo_servicio'] ?? null, fn ($query, $tipo) => $query->where('tipo_servicio', 'like', "%{$tipo}%"));
    }
}
