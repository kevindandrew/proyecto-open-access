<?php

namespace App\Support;

use App\Models\SolicitudTarifa;

class SolicitudTarifaRegistrador
{
    /**
     * Reglas y mensajes de los bultos según el modo: obligatorios en Aéreo
     * y en Marítimo LCL, porque Operaciones los necesita para pedir la
     * tarifa afuera. Para el resto no se piden.
     */
    public static function reglasCarga(?string $modo, ?string $servicio): array
    {
        return match (true) {
            $modo === 'Aereo' => [CargaAerea::reglas(true), CargaAerea::mensajes()],
            $modo === 'Maritimo' && $servicio === 'LCL' => [CargaMaritimaLcl::reglas(true), CargaMaritimaLcl::mensajes()],
            default => [[], []],
        };
    }

    public static function detalleCarga(array $data): ?array
    {
        $calculado = match (true) {
            $data['modo_transporte'] === 'Aereo' => CargaAerea::calcular($data['bultos']),
            $data['modo_transporte'] === 'Maritimo' && ($data['tipo_servicio'] ?? null) === 'LCL' => CargaMaritimaLcl::calcular($data['bultos']),
            default => null,
        };

        return $calculado
            ? [...$calculado, 'mercancia_peligrosa' => (bool) ($data['mercancia_peligrosa'] ?? false)]
            : null;
    }

    public static function registrar(array $filtros, ?int $idCliente, ?int $idComercial, ?array $detalleCarga = null): SolicitudTarifa
    {
        // Con detalle de carga (ej. bultos de un Aéreo) cada pedido es una
        // carga distinta a cotizar afuera, así que siempre se registra aparte;
        // sin detalle, una ruta pendiente no se duplica.
        if ($detalleCarga) {
            return self::crear($filtros, $idCliente, $idComercial, $detalleCarga);
        }

        $existente = SolicitudTarifa::where('estado', 'Pendiente')
            ->where('modo_transporte', $filtros['modo_transporte'])
            ->where('tipo_servicio', $filtros['tipo_servicio'] ?? null)
            ->where('id_pol', $filtros['id_pol'] ?? null)
            ->where('id_pod', $filtros['id_pod'] ?? null)
            ->first();

        if ($existente) {
            return $existente;
        }

        return self::crear($filtros, $idCliente, $idComercial, null);
    }

    private static function crear(array $filtros, ?int $idCliente, ?int $idComercial, ?array $detalleCarga): SolicitudTarifa
    {
        return SolicitudTarifa::create([
            'id_cliente' => $idCliente,
            'id_comercial' => $idComercial,
            'modo_transporte' => $filtros['modo_transporte'],
            'tipo_servicio' => $filtros['tipo_servicio'] ?? null,
            'id_pol' => $filtros['id_pol'] ?? null,
            'id_pod' => $filtros['id_pod'] ?? null,
            'detalle_carga' => $detalleCarga,
            'estado' => 'Pendiente',
        ]);
    }
}
