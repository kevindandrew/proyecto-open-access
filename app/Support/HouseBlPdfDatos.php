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
            'cliente',
        ]);

        $embarque = $house->embarque;

        // Cada house puede ir consignado a un cliente distinto del que figura
        // en el embarque (ej. un solo master con houses para varios
        // compradores finales) — si el house tiene su propio cliente
        // seleccionado, ese es el consignatario que se muestra; si no, se usa
        // el del embarque como hasta ahora.
        $consignatario = $house->cliente
            ? [
                'nombre' => $house->cliente->razon_social,
                'nit' => $house->cliente->nit,
                'direccion' => $house->cliente->direccion,
                'celular' => $house->cliente->celular_whatsapp ?: $house->cliente->telefono1,
                'correo' => $house->cliente->email,
            ]
            : [
                'nombre' => $embarque->consignatario_nombre,
                'nit' => $embarque->consignatario_nit,
                'direccion' => $embarque->consignatario_direccion,
                'celular' => $embarque->consignatario_celular,
                'correo' => $embarque->consignatario_correo,
            ];

        return [
            'house' => [
                'numero_hbl' => $house->numero_hbl,
                'condicion_pago' => $house->condicion_pago,
                'fecha_emision' => $house->fecha_emision?->toDateString(),
                'congelado_en' => $house->congelado_en?->toDateString(),
            ],
            'embarque' => [
                'numero_file' => $embarque->numero_file,
                'mbl' => $embarque->mbl,
                'cliente' => $embarque->cliente?->razon_social,
                'consignatario_nombre' => $consignatario['nombre'],
                'consignatario_nit' => $consignatario['nit'],
                'consignatario_direccion' => $consignatario['direccion'],
                'consignatario_celular' => $consignatario['celular'],
                'consignatario_correo' => $consignatario['correo'],
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
            // Si el contenedor lo comparten varios houses, cada uno declara
            // solo su porción (guardada en el pivot) — nunca el peso/volumen/
            // descripción del contenedor completo. Si un house todavía no
            // tiene su porción definida, se usa el dato del contenedor
            // completo como valor por defecto.
            'contenedores' => $house->contenedores->map(fn ($contenedor) => [
                'tipo_contenedor' => $contenedor->tipo_contenedor,
                'cantidad' => $contenedor->cantidad,
                'numero_contenedor' => $contenedor->numero_contenedor,
                'numero_sello' => $contenedor->numero_sello,
                'peso_kg' => $contenedor->pivot->peso_kg ?? $contenedor->peso_kg,
                'volumen_cbm' => $contenedor->pivot->volumen_cbm ?? $contenedor->volumen_cbm,
                'descripcion_mercancia' => $contenedor->pivot->descripcion_mercancia ?: $contenedor->descripcion_mercancia,
            ])->all(),
            'totalPeso' => $house->contenedores->sum(fn ($c) => $c->pivot->peso_kg ?? $c->peso_kg),
            'totalVolumen' => $house->contenedores->sum(fn ($c) => $c->pivot->volumen_cbm ?? $c->volumen_cbm),
        ];
    }
}
