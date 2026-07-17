<?php

namespace App\Support;

use Illuminate\Support\Carbon;

class EstadoTarifa
{
    public const ESTADOS = ['Activo', 'Por Vencer', 'Vencida'];

    public static function de(Carbon $fechaFin, Carbon $hoy, Carbon $vencePronto): string
    {
        if ($fechaFin->lt($hoy)) {
            return 'Vencida';
        }

        if ($fechaFin->lte($vencePronto)) {
            return 'Por Vencer';
        }

        return 'Activo';
    }
}
