<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * Por qué una tarifa (o tarifa de agente) cargada no le aparece al Comercial
 * en la cotización — mismas condiciones que TarifaLookup / TarifaAgenteLookup
 * y que los selectores de puerto del wizard. Lista vacía = se ve.
 */
class VisibilidadTarifa
{
    // El wizard de cotización solo ofrece estos tipos de puerto por modo.
    private const TIPO_PUERTO_POR_MODO = [
        'Maritimo' => 'Puerto',
        'Aereo' => 'Aeropuerto',
    ];

    public static function problemas(Model $tarifa, Carbon $hoy): array
    {
        $problemas = [];

        if ($tarifa->proveedor && ! $tarifa->proveedor->activo) {
            $problemas[] = "El proveedor {$tarifa->proveedor->nombre} está desactivado.";
        }

        if ($tarifa->fecha_inicio_vigencia && $tarifa->fecha_inicio_vigencia->gt($hoy)) {
            $problemas[] = 'Su vigencia empieza el '.$tarifa->fecha_inicio_vigencia->format('d/m/Y').' — recién desde ese día aparece.';
        }

        if ($tarifa->fecha_fin_vigencia && $tarifa->fecha_fin_vigencia->lt($hoy)) {
            $problemas[] = 'Está vencida.';
        }

        $tipoRequerido = self::TIPO_PUERTO_POR_MODO[$tarifa->modo] ?? null;
        $modo = ['Maritimo' => 'Marítimo', 'Aereo' => 'Aéreo'][$tarifa->modo] ?? $tarifa->modo;

        foreach (['origen' => $tarifa->origen, 'destino' => $tarifa->destino] as $lado => $puerto) {
            if (! $puerto) {
                continue;
            }

            if (! $puerto->activo) {
                $problemas[] = "El {$lado} {$puerto->nombre} ({$puerto->codigo}) está desactivado — no se puede elegir al cotizar.";
            }

            if ($tipoRequerido && $puerto->tipo !== $tipoRequerido) {
                $problemas[] = "El {$lado} {$puerto->nombre} ({$puerto->codigo}) está cargado como {$puerto->tipo}; en {$modo} la cotización solo ofrece de tipo {$tipoRequerido}.";
            }
        }

        return $problemas;
    }
}
