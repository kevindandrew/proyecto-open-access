<?php

namespace App\Support;

use App\Models\PuertoAeropuerto;

/**
 * Un mismo puerto/aeropuerto puede haber quedado cargado dos veces con
 * códigos distintos (ej. "Shanghai Pudong" como PVG y como CNPVG). Para que
 * una tarifa cargada con uno aparezca al cotizar con el otro, la búsqueda
 * trata como equivalentes a los del mismo nombre y mismo tipo.
 */
class PuertosEquivalentes
{
    public static function codigos(string $codigo): array
    {
        $puerto = PuertoAeropuerto::where('codigo', $codigo)->first(['codigo', 'nombre', 'tipo']);

        if (! $puerto) {
            return [$codigo];
        }

        return PuertoAeropuerto::where('tipo', $puerto->tipo)
            ->whereRaw('LOWER(TRIM(nombre)) = ?', [self::normalizar($puerto->nombre)])
            ->pluck('codigo')
            ->push($codigo)
            ->unique()
            ->values()
            ->all();
    }

    public static function normalizar(string $nombre): string
    {
        return mb_strtolower(trim($nombre));
    }
}
