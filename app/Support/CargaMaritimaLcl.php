<?php

namespace App\Support;

/**
 * Carga a cobrar de un LCL marítimo (regla Ton/CBM o "W/M" — Weight or
 * Measurement): se compara el volumen total (Largo x Ancho x Alto en metros
 * x cantidad) contra el peso total en toneladas (kg / 1000) y se cobra el
 * mayor, con un mínimo de 1. Un bulto no apilable se calcula con el alto
 * interno del contenedor, porque el espacio de encima queda inutilizado.
 * Mismo cálculo que calcularCargaVolumetricaMaritima() del wizard.
 */
class CargaMaritimaLcl
{
    public const ALTO_INTERNO_CONTENEDOR_M = 2.40;

    public const MINIMO_COBRO = 1;

    public static function reglas(bool $obligatorios): array
    {
        return [
            'bultos' => [$obligatorios ? 'required' : 'nullable', 'array', $obligatorios ? 'min:1' : 'min:0'],
            'bultos.*.descripcion' => ['nullable', 'string', 'max:100'],
            'bultos.*.cantidad' => ['required', 'integer', 'min:1'],
            'bultos.*.largo' => ['required', 'numeric', 'gt:0'],
            'bultos.*.ancho' => ['required', 'numeric', 'gt:0'],
            'bultos.*.no_apilable' => ['boolean'],
            'bultos.*.alto' => ['exclude_if:bultos.*.no_apilable,true', 'required', 'numeric', 'gt:0'],
            'bultos.*.peso_real_kg' => ['required', 'numeric', 'gt:0'],
            'mercancia_peligrosa' => ['boolean'],
        ];
    }

    public static function mensajes(): array
    {
        return [
            'bultos.required' => 'Para LCL cargá los bultos (Largo x Ancho x Alto en metros, cantidad y peso) — Operaciones los necesita para cotizar.',
            'bultos.min' => 'Para LCL cargá al menos un bulto.',
        ];
    }

    public static function calcular(array $bultos): array
    {
        $lineas = [];
        $pesoReal = 0.0;
        $volumenM3 = 0.0;

        foreach (array_values($bultos) as $indice => $bulto) {
            $cantidad = (int) ($bulto['cantidad'] ?? 1);
            $noApilable = filter_var($bulto['no_apilable'] ?? false, FILTER_VALIDATE_BOOLEAN);
            $alto = $noApilable ? self::ALTO_INTERNO_CONTENEDOR_M : (float) $bulto['alto'];
            $volumenUnitario = (float) $bulto['largo'] * (float) $bulto['ancho'] * $alto;
            $volumenLinea = $volumenUnitario * $cantidad;

            $pesoReal += (float) $bulto['peso_real_kg'];
            $volumenM3 += $volumenLinea;

            $lineas[] = [
                'descripcion' => filled($bulto['descripcion'] ?? null) ? $bulto['descripcion'] : 'Bulto '.($indice + 1),
                'cantidad' => $cantidad,
                'largo' => (float) $bulto['largo'],
                'ancho' => (float) $bulto['ancho'],
                'alto' => $alto,
                'no_apilable' => $noApilable,
                'peso_real_kg' => (float) $bulto['peso_real_kg'],
                'volumen_unitario_m3' => round($volumenUnitario, 3),
                'volumen_total_m3' => round($volumenLinea, 3),
            ];
        }

        $toneladas = $pesoReal / 1000;
        $mayor = max($volumenM3, $toneladas);

        return [
            'tipo' => 'lcl',
            'bultos' => $lineas,
            'resumen' => [
                'cantidad_bultos' => array_sum(array_column($lineas, 'cantidad')),
                'peso_real_kg' => round($pesoReal, 2),
                'toneladas' => round($toneladas, 3),
                'volumen_total_m3' => round($volumenM3, 3),
                // Lo que se cobra: el mayor entre CBM y Ton, mínimo 1.
                'carga_a_cobrar' => round($mayor > 0 ? max($mayor, self::MINIMO_COBRO) : 0, 3),
                'cobra_por' => $volumenM3 >= $toneladas ? 'CBM' : 'Ton',
            ],
        ];
    }
}
