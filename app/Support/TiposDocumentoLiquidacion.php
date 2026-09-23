<?php

namespace App\Support;

class TiposDocumentoLiquidacion
{
    private const TIPOS = [
        'nota_reembolso' => ['categoria' => 'cobro', 'etiqueta' => 'Nota de Reembolso', 'prefijo' => 'NR'],
        'nota_cobranza' => ['categoria' => 'cobro', 'etiqueta' => 'Nota de Cobranza', 'prefijo' => 'NC'],
        'nota_interna' => ['categoria' => 'cobro', 'etiqueta' => 'Nota Interna', 'prefijo' => 'NI'],
        'invoice' => ['categoria' => 'cobro', 'etiqueta' => 'Invoice', 'prefijo' => 'INV'],
        'nota_descuento' => ['categoria' => 'cobro', 'etiqueta' => 'Nota de Descuento', 'prefijo' => 'ND'],
        'orden_pago' => ['categoria' => 'pago', 'etiqueta' => 'Orden de Pago', 'prefijo' => 'OP'],
        'orden_pago_provisional' => ['categoria' => 'pago', 'etiqueta' => 'Orden de Pago Provisional', 'prefijo' => 'OPP'],
        'orden_pago_cf' => ['categoria' => 'pago', 'etiqueta' => 'Orden de Pago con CF', 'prefijo' => 'OPCF'],
        'orden_pago_negativa' => ['categoria' => 'pago', 'etiqueta' => 'Orden de Pago (-)', 'prefijo' => 'OPN'],
    ];

    public static function todos(): array
    {
        return self::TIPOS;
    }

    public static function valores(): array
    {
        return array_keys(self::TIPOS);
    }

    public static function categoria(string $tipo): ?string
    {
        return self::TIPOS[$tipo]['categoria'] ?? null;
    }

    public static function etiqueta(string $tipo): ?string
    {
        return self::TIPOS[$tipo]['etiqueta'] ?? null;
    }

    public static function prefijo(string $tipo): ?string
    {
        return self::TIPOS[$tipo]['prefijo'] ?? null;
    }

    public static function esCobro(string $tipo): bool
    {
        return self::categoria($tipo) === 'cobro';
    }

    public static function esPago(string $tipo): bool
    {
        return self::categoria($tipo) === 'pago';
    }

    /**
     * Todos los tipos ('nota_reembolso', 'orden_pago', ...) que caen en la
     * categoría dada — se usa para detectar si una línea de costo/gasto ya
     * fue facturada (o pagada) en otro documento de la misma categoría.
     */
    public static function valoresPorCategoria(string $categoria): array
    {
        return array_keys(array_filter(self::TIPOS, fn ($info) => $info['categoria'] === $categoria));
    }

    /**
     * Los 3 tipos de cobro que llevan el bloque de 5 puntos legales
     * ("El monto de esta Nota... puede/debe ser cancelado...") en el PDF —
     * Invoice y Nota de Descuento van sin ese bloque.
     */
    public static function llevaDisclaimerLegal(string $tipo): bool
    {
        return in_array($tipo, ['nota_reembolso', 'nota_cobranza', 'nota_interna'], true);
    }
}
