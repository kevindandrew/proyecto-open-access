<?php

namespace App\Support;

use App\Models\Embarque;
use Illuminate\Support\Carbon;

/**
 * El Nro. de File lo asigna Gerente Operativo a mano. Su formato es
 * AAMM + consecutivo de 3 dígitos según el mes de ARRIBO (ej. ETA en
 * noviembre 2026 -> 2611001, 2611002...). Esto solo sugiere el siguiente.
 */
class GeneradorNumeroFile
{
    public static function sugerir(?Carbon $eta): string
    {
        $prefijo = ($eta ?? Carbon::today())->format('ym');

        $ultimo = Embarque::where('numero_file', 'like', "{$prefijo}%")
            ->pluck('numero_file')
            ->map(fn (string $numero) => (int) substr($numero, strlen($prefijo)))
            ->max() ?? 0;

        return $prefijo.str_pad((string) ($ultimo + 1), 3, '0', STR_PAD_LEFT);
    }
}
