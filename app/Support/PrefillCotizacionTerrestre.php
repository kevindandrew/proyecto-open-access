<?php

namespace App\Support;

use App\Models\Cotizacion;

class PrefillCotizacionTerrestre
{
    public static function desde(?int $idCotizacionOrigen): ?array
    {
        if (! $idCotizacionOrigen) {
            return null;
        }

        $origen = Cotizacion::with('cliente')->find($idCotizacionOrigen);

        $modosOrigenValidos = ['Maritimo', 'Aereo'];

        if (! $origen || ! in_array($origen->modo_transporte, $modosOrigenValidos, true) || ! $origen->id_pod) {
            return null;
        }

        return [
            'id_cotizacion_origen' => $origen->id_cotizacion,
            'modo_transporte_origen' => $origen->modo_transporte,
            'id_cliente' => $origen->id_cliente,
            'cliente_nombre' => $origen->cliente?->razon_social,
            'id_pol' => $origen->id_pod,
        ];
    }
}
