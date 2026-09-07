<?php

namespace App\Support;

class FormatoContenedor
{
    /**
     * "40 HC" -> "40' HC" — así se escribe el tipo de contenedor en los
     * documentos de embarque reales (Bill of Lading, Aviso de Arribo).
     */
    public static function conPies(?string $tipo): string
    {
        if (! $tipo) {
            return '—';
        }

        return preg_replace('/^(\d+)\s*/', '$1\' ', $tipo);
    }
}
