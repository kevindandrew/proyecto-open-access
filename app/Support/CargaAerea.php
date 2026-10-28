<?php

namespace App\Support;

/**
 * Peso tasable de una carga aérea (fórmula IATA): por cada bulto se calcula
 * el volumen Largo x Ancho x Alto (cm) x cantidad; el peso volumétrico es el
 * volumen total / 6000 y se cobra el mayor entre ese y el peso real en báscula.
 * Mismo cálculo que calcularPesoTasable() del wizard de cotización.
 */
class CargaAerea
{
    public const DIVISOR_IATA = 6000;

    /**
     * Reglas para validar los bultos que manda el wizard. Son obligatorios
     * cuando el modo es Aéreo: sin ellos Operaciones no puede pedir tarifa.
     */
    public static function reglas(bool $obligatorios): array
    {
        return [
            'bultos' => [$obligatorios ? 'required' : 'nullable', 'array', $obligatorios ? 'min:1' : 'min:0'],
            'bultos.*.descripcion' => ['nullable', 'string', 'max:100'],
            'bultos.*.cantidad' => ['required', 'integer', 'min:1'],
            'bultos.*.largo' => ['required', 'numeric', 'gt:0'],
            'bultos.*.ancho' => ['required', 'numeric', 'gt:0'],
            'bultos.*.alto' => ['required', 'numeric', 'gt:0'],
            'bultos.*.peso_real_kg' => ['required', 'numeric', 'gt:0'],
            'mercancia_peligrosa' => ['boolean'],
        ];
    }

    public static function mensajes(): array
    {
        return [
            'bultos.required' => 'Para Aéreo cargá los bultos (Largo x Ancho x Alto, cantidad y peso en báscula) — Operaciones los necesita para cotizar.',
            'bultos.min' => 'Para Aéreo cargá al menos un bulto.',
        ];
    }

    /**
     * Detalle listo para guardar/mostrar: cada bulto con su volumen y el
     * resumen de la carga (peso real, volumen, peso volumétrico y tasable).
     */
    public static function calcular(array $bultos): array
    {
        $lineas = [];
        $pesoReal = 0.0;
        $volumenCm3 = 0.0;

        foreach (array_values($bultos) as $indice => $bulto) {
            $cantidad = (int) ($bulto['cantidad'] ?? 1);
            $volumenUnitario = (float) $bulto['largo'] * (float) $bulto['ancho'] * (float) $bulto['alto'];
            $volumenLinea = $volumenUnitario * $cantidad;

            $pesoReal += (float) $bulto['peso_real_kg'];
            $volumenCm3 += $volumenLinea;

            $lineas[] = [
                'descripcion' => filled($bulto['descripcion'] ?? null) ? $bulto['descripcion'] : 'Bulto '.($indice + 1),
                'cantidad' => $cantidad,
                'largo' => (float) $bulto['largo'],
                'ancho' => (float) $bulto['ancho'],
                'alto' => (float) $bulto['alto'],
                'peso_real_kg' => (float) $bulto['peso_real_kg'],
                'volumen_unitario_cm3' => round($volumenUnitario, 2),
                'volumen_total_cm3' => round($volumenLinea, 2),
            ];
        }

        $pesoVolumetrico = $volumenCm3 / self::DIVISOR_IATA;

        return [
            'tipo' => 'aereo',
            'bultos' => $lineas,
            'resumen' => [
                'cantidad_bultos' => array_sum(array_column($lineas, 'cantidad')),
                'peso_real_kg' => round($pesoReal, 2),
                'volumen_total_cm3' => round($volumenCm3, 2),
                'volumen_total_m3' => round($volumenCm3 / 1_000_000, 3),
                'peso_volumetrico_kg' => round($pesoVolumetrico, 2),
                'peso_tasable_kg' => round(max($pesoReal, $pesoVolumetrico), 2),
            ],
        ];
    }
}
