<?php

namespace App\Support;

class SecuenciaEstadoEmbarque
{
    public const ESTADOS = [
        'Confirmado_Origen',
        'En_Transito',
        'En_Aduana_Destino',
        'Entregado',
        'Cerrado',
    ];

    /**
     * Next valid state in the linear sequence, or null when already Cerrado
     * (or the current value isn't a recognized state).
     */
    public static function siguiente(string $actual): ?string
    {
        $index = array_search($actual, self::ESTADOS, true);

        return $index !== false && isset(self::ESTADOS[$index + 1])
            ? self::ESTADOS[$index + 1]
            : null;
    }
}
