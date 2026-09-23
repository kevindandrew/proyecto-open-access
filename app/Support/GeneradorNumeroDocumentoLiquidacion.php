<?php

namespace App\Support;

use App\Models\DocumentoLiquidacion;

class GeneradorNumeroDocumentoLiquidacion
{
    public static function generar(string $tipo): string
    {
        $prefijo = TiposDocumentoLiquidacion::prefijo($tipo) ?? 'DOC';
        $consecutivo = DocumentoLiquidacion::where('tipo', $tipo)->count() + 1;

        return $prefijo.'-'.str_pad((string) $consecutivo, 6, '0', STR_PAD_LEFT);
    }
}
