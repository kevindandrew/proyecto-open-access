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

        // Si el contenedor lo comparten varios houses, cada uno declara solo
        // su porción (guardada en el pivot) — nunca el peso/volumen/
        // descripción del contenedor completo. Si un house todavía no tiene
        // su porción definida, se usa el dato del contenedor completo como
        // valor por defecto.
        $contenedores = $house->contenedores->map(fn ($contenedor) => [
            'tipo_contenedor' => $contenedor->tipo_contenedor,
            'numero_contenedor' => $contenedor->numero_contenedor,
            'numero_sello' => $contenedor->numero_sello,
            'peso_kg' => $contenedor->pivot->peso_kg ?? $contenedor->peso_kg,
            'volumen_cbm' => $contenedor->pivot->volumen_cbm ?? $contenedor->volumen_cbm,
            'descripcion_mercancia' => $contenedor->pivot->descripcion_mercancia ?: $contenedor->descripcion_mercancia,
        ])->all();

        $condicionPago = $house->condicion_pago ?? 'Collect';
        $valorFlete = $house->flete_valor_texto ?: 'AS AGREED';

        return [
            'house' => [
                'numero_hbl' => $house->numero_hbl,
                'condicion_pago' => $condicionPago,
                'flete_valor_texto' => $valorFlete,
                'fecha_emision' => $house->fecha_emision?->toDateString(),
                'congelado_en' => $house->congelado_en?->toDateString(),
            ],
            'embarque' => [
                'numero_file' => $embarque->numero_file,
                'mbl' => $embarque->mbl,
                'cliente' => $embarque->cliente?->razon_social,
                'shipper_nombre' => $embarque->shipper_nombre,
                'shipper_direccion' => $embarque->shipper_direccion,
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
            'contenedores' => $contenedores,
            'resumenContenedores' => self::resumenContenedores($contenedores),
            'totalPeso' => array_sum(array_column($contenedores, 'peso_kg')),
            'totalVolumen' => array_sum(array_column($contenedores, 'volumen_cbm')),
        ];
    }

    /**
     * "2X20DRY, 1X40HC" — la línea que resume cuántos contenedores de cada
     * tipo trae este house, como sale en el Bill of Lading real.
     */
    private static function resumenContenedores(array $contenedores): string
    {
        $conteo = [];

        foreach ($contenedores as $contenedor) {
            $tipo = str_replace(' ', '', $contenedor['tipo_contenedor'] ?? '—');
            $conteo[$tipo] = ($conteo[$tipo] ?? 0) + 1;
        }

        $partes = [];
        foreach ($conteo as $tipo => $cantidad) {
            $partes[] = "{$cantidad}X{$tipo}";
        }

        return implode(', ', $partes);
    }
}
