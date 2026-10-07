<?php

namespace App\Support;

use App\Models\DocumentoLiquidacion;

class GeneradorNumeroDocumentoLiquidacion
{
    /**
     * Las órdenes de pago (normal, provisional, CF y negativa) comparten un
     * solo correlativo global — OP-000001, OPP-000002, OPN-000003... — y cada
     * tipo de cobro lleva el suyo propio. Se toma el mayor número ya emitido
     * (no la cantidad de documentos) para no repetir nunca un número.
     */
    public static function generar(string $tipo): string
    {
        $prefijo = TiposDocumentoLiquidacion::prefijo($tipo) ?? 'DOC';

        $tiposQueComparten = TiposDocumentoLiquidacion::esPago($tipo)
            ? TiposDocumentoLiquidacion::valoresPorCategoria('pago')
            : [$tipo];

        $ultimo = DocumentoLiquidacion::whereIn('tipo', $tiposQueComparten)
            ->pluck('numero')
            ->map(fn (string $numero) => (int) substr($numero, strrpos($numero, '-') + 1))
            ->max() ?? 0;

        return $prefijo.'-'.str_pad((string) ($ultimo + 1), 6, '0', STR_PAD_LEFT);
    }
}
