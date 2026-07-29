<?php

namespace App\Support;

use App\Models\Embarque;
use Illuminate\Support\Str;

class GeneradorCodigoHouse
{
    public static function siguienteNumeroHouse(Embarque $embarque): string
    {
        $base = self::baseParaEmbarque($embarque);

        // Se calcula a partir de la última letra usada (no de un conteo de filas)
        // para que borrar un house intermedio nunca genere un código repetido.
        $ultimaLetra = $embarque->houseBls()
            ->where('numero_hbl', 'like', "OA-{$base}%")
            ->get()
            ->map(fn ($house) => substr($house->numero_hbl, -1))
            ->filter(fn ($letra) => ctype_lower($letra))
            ->sort()
            ->last();

        $siguienteLetra = $ultimaLetra ? chr(ord($ultimaLetra) + 1) : 'a';

        return "OA-{$base}{$siguienteLetra}";
    }

    private static function baseParaEmbarque(Embarque $embarque): string
    {
        if ($embarque->codigo_house_base) {
            return $embarque->codigo_house_base;
        }

        do {
            $base = strtoupper(Str::random(6));
        } while (Embarque::where('codigo_house_base', $base)->exists());

        $embarque->update(['codigo_house_base' => $base]);

        return $base;
    }
}
