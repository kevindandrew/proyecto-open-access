<?php

namespace App\Support;

use App\Models\User;

class GeneradorUsername
{
    /**
     * Username a partir del nombre completo: 3 letras del nombre + 3 letras
     * del apellido paterno (ej. "Kevin Rodriguez" -> "kevrod"). Solo se le
     * agrega un número al final si ese username ya está en uso.
     */
    public static function generar(string $nombreCompleto): string
    {
        $partes = preg_split('/\s+/', trim($nombreCompleto));
        $nombre = $partes[0] ?? '';
        $apellidoPaterno = $partes[1] ?? $partes[0] ?? '';

        $base = strtolower(substr($nombre, 0, 3).substr($apellidoPaterno, 0, 3));

        if (! User::where('username', $base)->exists()) {
            return $base;
        }

        $contador = 1;
        do {
            $candidato = $base.str_pad((string) $contador, 2, '0', STR_PAD_LEFT);
            $contador++;
        } while (User::where('username', $candidato)->exists());

        return $candidato;
    }
}
