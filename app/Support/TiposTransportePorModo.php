<?php

namespace App\Support;

class TiposTransportePorModo
{
    public static function para(string $modo): array
    {
        return match ($modo) {
            'Maritimo' => ['Naviera'],
            'Aereo' => ['Aerolinea'],
            'Terrestre' => ['Transportista'],
            default => [],
        };
    }
}
