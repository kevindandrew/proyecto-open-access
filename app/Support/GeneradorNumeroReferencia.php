<?php

namespace App\Support;

use App\Models\Cotizacion;
use App\Models\Empleado;

class GeneradorNumeroReferencia
{
    public static function generar(Empleado $comercial): string
    {
        $iniciales = self::iniciales($comercial->nombre_completo);
        $ciudad = 'LPZ';
        $anio = now()->format('y');
        $prefijo = "{$iniciales}{$ciudad}/{$anio}-";

        $consecutivo = Cotizacion::where('numero_referencia', 'like', "{$prefijo}%")->count() + 1;

        return $prefijo.str_pad((string) $consecutivo, 4, '0', STR_PAD_LEFT);
    }

    private static function iniciales(string $nombreCompleto): string
    {
        $partes = preg_split('/\s+/', trim($nombreCompleto));
        $primerNombre = $partes[0] ?? '';
        $primerApellido = $partes[1] ?? $partes[0] ?? '';

        return strtoupper(substr($primerNombre, 0, 2).substr($primerApellido, 0, 2));
    }
}
