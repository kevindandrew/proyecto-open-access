<?php

namespace App\Support;

class TiposTransportePorModo
{
    public static function para(string $modo, ?string $tipoServicio = null): array
    {
        return match ($modo) {
            // En LCL es normal que el "carrier" cotizado sea en realidad un
            // consolidador/agente (NVOCC) y no una naviera con buque propio.
            'Maritimo' => $tipoServicio === 'LCL' ? ['Naviera', 'Agente_Origen'] : ['Naviera'],
            'Aereo' => ['Aerolinea'],
            'Terrestre' => ['Transportista'],
            default => [],
        };
    }
}
