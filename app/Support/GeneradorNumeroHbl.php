<?php

namespace App\Support;

use App\Models\Embarque;
use App\Models\HouseBl;
use Illuminate\Support\Str;

/**
 * Número de HBL automático, cuando no se carga uno a mano: "OA-" + un código
 * base de 6 caracteres propio del embarque + una letra por house
 * (OA-NH7XHTa, OA-NH7XHTb...). Todos los houses de un mismo embarque
 * comparten la base, así se reconocen juntos.
 */
class GeneradorNumeroHbl
{
    // Sin 0/O ni 1/I para que no se confundan al dictarlo o transcribirlo.
    private const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    public static function para(Embarque $embarque): string
    {
        $base = $embarque->codigo_house_base ?: self::nuevaBase($embarque);
        $prefijo = "OA-{$base}";

        foreach (self::sufijos() as $sufijo) {
            $candidato = $prefijo.$sufijo;

            if (! HouseBl::where('numero_hbl', $candidato)->exists()) {
                return $candidato;
            }
        }

        // Más de 702 houses en un embarque no ocurre; por las dudas, no falla.
        return $prefijo.'-'.Str::lower(Str::random(4));
    }

    private static function nuevaBase(Embarque $embarque): string
    {
        do {
            $base = '';
            for ($i = 0; $i < 6; $i++) {
                $base .= self::ALFABETO[random_int(0, strlen(self::ALFABETO) - 1)];
            }
        } while (Embarque::where('codigo_house_base', $base)->exists());

        $embarque->update(['codigo_house_base' => $base]);

        return $base;
    }

    /**
     * a, b, ..., z, aa, ab, ...
     */
    private static function sufijos(): \Generator
    {
        foreach (range('a', 'z') as $letra) {
            yield $letra;
        }

        foreach (range('a', 'z') as $primera) {
            foreach (range('a', 'z') as $segunda) {
                yield $primera.$segunda;
            }
        }
    }
}
