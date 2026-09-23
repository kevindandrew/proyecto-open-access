<?php

namespace App\Support;

class MontoEnLetras
{
    private const UNIDADES = [
        '', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE',
        'DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE',
    ];

    private const DECENAS = [
        '', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA',
    ];

    private const CENTENAS = [
        '', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS',
        'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS',
    ];

    /**
     * "214.14" + "USD" -> "DOSCIENTOS CATORCE 14/100 Dólares Americanos"
     */
    public static function para(float $monto, string $moneda): string
    {
        $entero = (int) floor(round($monto, 2));
        $centavos = (int) round((round($monto, 2) - $entero) * 100);

        $texto = $entero === 0 ? 'CERO' : self::convertirEntero($entero);
        $centavosTexto = str_pad((string) $centavos, 2, '0', STR_PAD_LEFT);
        $nombreMoneda = self::nombreMoneda($moneda);

        return "{$texto} {$centavosTexto}/100 {$nombreMoneda}";
    }

    private static function nombreMoneda(string $moneda): string
    {
        return match (strtoupper($moneda)) {
            'BOB', 'BS' => 'Bolivianos',
            default => 'Dólares Americanos',
        };
    }

    private static function convertirEntero(int $numero): string
    {
        if ($numero === 0) {
            return 'CERO';
        }

        if ($numero < 0) {
            return 'MENOS '.self::convertirEntero(-$numero);
        }

        if ($numero < 20) {
            return self::UNIDADES[$numero];
        }

        if ($numero < 100) {
            $decena = intdiv($numero, 10);
            $unidad = $numero % 10;

            if ($decena === 2) {
                return $unidad === 0 ? 'VEINTE' : 'VEINTI'.self::UNIDADES[$unidad];
            }

            return $unidad === 0
                ? self::DECENAS[$decena]
                : self::DECENAS[$decena].' Y '.self::UNIDADES[$unidad];
        }

        if ($numero < 1000) {
            $centena = intdiv($numero, 100);
            $resto = $numero % 100;

            if ($numero === 100) {
                return 'CIEN';
            }

            $texto = self::CENTENAS[$centena];

            return $resto === 0 ? $texto : $texto.' '.self::convertirEntero($resto);
        }

        if ($numero < 1_000_000) {
            $miles = intdiv($numero, 1000);
            $resto = $numero % 1000;
            $texto = $miles === 1 ? 'MIL' : self::convertirEntero($miles).' MIL';

            return $resto === 0 ? $texto : $texto.' '.self::convertirEntero($resto);
        }

        $millones = intdiv($numero, 1_000_000);
        $resto = $numero % 1_000_000;
        $texto = $millones === 1 ? 'UN MILLON' : self::convertirEntero($millones).' MILLONES';

        return $resto === 0 ? $texto : $texto.' '.self::convertirEntero($resto);
    }
}
