<?php

namespace App\Support;

use App\Models\TarifaAgente;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class TarifaAgenteLookup
{
    public static function disponibles(array $filtros): Collection
    {
        $hoy = Carbon::today();
        $vencePronto = $hoy->copy()->addDays(5);

        return self::query($filtros)
            ->with(['proveedor', 'costos'])
            ->where('fecha_inicio_vigencia', '<=', $hoy)
            ->orderBy('fecha_fin_vigencia')
            ->get()
            ->map(fn (TarifaAgente $tarifa) => [
                'id_tarifa_agente' => $tarifa->id_tarifa_agente,
                'id_proveedor' => $tarifa->id_proveedor,
                'agente' => $tarifa->proveedor?->nombre,
                'fecha_fin_vigencia' => $tarifa->fecha_fin_vigencia->toDateString(),
                'estado' => EstadoTarifa::de($tarifa->fecha_fin_vigencia, $hoy, $vencePronto),
                'costos' => $tarifa->costos->map(fn ($costo) => [
                    'concepto' => $costo->concepto,
                    'costo' => $costo->costo,
                    'moneda' => $costo->moneda,
                ]),
            ]);
    }

    private static function query(array $filtros)
    {
        return TarifaAgente::whereHas('proveedor', fn ($query) => $query->where('activo', true))
            ->where('modo', $filtros['modo_transporte'])
            ->where('fecha_fin_vigencia', '>=', Carbon::today())
            ->when($filtros['id_pol'] ?? null, fn ($query, $pol) => $query->where('id_origen', $pol))
            ->when($filtros['id_pod'] ?? null, fn ($query, $pod) => $query->where('id_destino', $pod));
    }
}
