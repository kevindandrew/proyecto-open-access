<?php

namespace App\Support;

use App\Models\Embarque;

class GeneradorNumeroFile
{
    public static function generar(): string
    {
        $prefijo = now()->format('ym');
        $consecutivo = Embarque::where('numero_file', 'like', "{$prefijo}%")->count() + 1;

        return $prefijo.str_pad((string) $consecutivo, 3, '0', STR_PAD_LEFT);
    }
}
