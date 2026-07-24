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

        if (! $origen || $origen->modo_transporte !== 'Maritimo' || $origen->estado !== 'Aceptado' || ! $origen->id_pod) {
            return null;
        }

        return [
            'id_cotizacion_origen' => $origen->id_cotizacion,
            'id_cliente' => $origen->id_cliente,
            'cliente_nombre' => $origen->cliente?->razon_social,
            'id_pol' => $origen->id_pod,
            'destino_final' => $origen->destino_final,
        ];
    }
}
