<?php

namespace App\Support;

use App\Models\Embarque;
use Illuminate\Support\Str;

class GeneradorCodigoHouse
{
    /**
     * Recalcula el numero_hbl de TODOS los houses del embarque, en orden de
     * creación: con un solo house no lleva letra; a partir del segundo, se
     * numeran a, b, c, d... Se llama después de crear o borrar un house,
     * porque agregar o quitar uno puede cambiar si los demás necesitan letra.
     */
    public static function renumerar(Embarque $embarque): void
    {
        $base = self::baseParaEmbarque($embarque);
        $houses = $embarque->houseBls()->orderBy('id_hbl')->get();

        foreach ($houses->values() as $index => $house) {
            $letra = $houses->count() > 1 ? chr(ord('a') + $index) : '';
            $nuevoNumero = "OA-{$base}{$letra}";

            if ($house->numero_hbl !== $nuevoNumero) {
                $house->update(['numero_hbl' => $nuevoNumero]);
            }
        }
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
