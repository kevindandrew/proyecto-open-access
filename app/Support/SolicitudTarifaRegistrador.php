<?php

namespace App\Support;

use App\Models\SolicitudTarifa;

class SolicitudTarifaRegistrador
{
    public static function registrar(array $filtros, ?int $idCliente, ?int $idComercial): SolicitudTarifa
    {
        $existente = SolicitudTarifa::where('estado', 'Pendiente')
            ->where('modo_transporte', $filtros['modo_transporte'])
            ->where('tipo_servicio', $filtros['tipo_servicio'] ?? null)
            ->where('id_pol', $filtros['id_pol'] ?? null)
            ->where('id_pod', $filtros['id_pod'] ?? null)
            ->first();

        if ($existente) {
            return $existente;
        }

        return SolicitudTarifa::create([
            'id_cliente' => $idCliente,
            'id_comercial' => $idComercial,
            'modo_transporte' => $filtros['modo_transporte'],
            'tipo_servicio' => $filtros['tipo_servicio'] ?? null,
            'id_pol' => $filtros['id_pol'] ?? null,
            'id_pod' => $filtros['id_pod'] ?? null,
            'estado' => 'Pendiente',
        ]);
    }
}
