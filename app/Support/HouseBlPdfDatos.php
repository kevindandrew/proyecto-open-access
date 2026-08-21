<?php

namespace App\Support;

use App\Models\HouseBl;

class HouseBlPdfDatos
{
    public static function para(HouseBl $house): array
    {
        $house->loadMissing([
            'embarque.cliente',
            'embarque.pol',
            'embarque.pod',
            'embarque.navieraAerolinea',
            'contenedores',
        ]);

        $embarque = $house->embarque;

        return [
            'house' => [
                'numero_hbl' => $house->numero_hbl,
                'condicion_pago' => $house->condicion_pago,
                'fecha_emision' => $house->fecha_emision?->toDateString(),
            ],
            'embarque' => [
                'numero_file' => $embarque->numero_file,
                'mbl' => $embarque->mbl,
                'cliente' => $embarque->cliente?->razon_social,
                'consignatario_nombre' => $embarque->consignatario_nombre,
                'consignatario_nit' => $embarque->consignatario_nit,
                'consignatario_direccion' => $embarque->consignatario_direccion,
                'consignatario_celular' => $embarque->consignatario_celular,
                'consignatario_correo' => $embarque->consignatario_correo,
                'modo_transporte' => $embarque->modo_transporte,
                'tipo_servicio' => $embarque->tipo_servicio,
                'pol' => $embarque->pol?->nombre,
                'pod' => $embarque->pod?->nombre,
                'destino_final' => $embarque->destino_final,
                'nave' => $embarque->nave,
                'viaje' => $embarque->viaje,
                'naviera_aerolinea' => $embarque->navieraAerolinea?->nombre,
                'etd' => $embarque->etd?->toDateString(),
                'eta' => $embarque->eta?->toDateString(),
                'pago_master' => $embarque->pago_master,
            ],
            'contenedores' => $house->contenedores->map(fn ($contenedor) => [
                'tipo_contenedor' => $contenedor->tipo_contenedor,
                'cantidad' => $contenedor->cantidad,
                'numero_contenedor' => $contenedor->numero_contenedor,
                'numero_sello' => $contenedor->numero_sello,
                'peso_kg' => $contenedor->peso_kg,
                'volumen_cbm' => $contenedor->volumen_cbm,
                'descripcion_mercancia' => $contenedor->descripcion_mercancia,
            ])->all(),
            'totalPeso' => $house->contenedores->sum('peso_kg'),
            'totalVolumen' => $house->contenedores->sum('volumen_cbm'),
        ];
    }
}
