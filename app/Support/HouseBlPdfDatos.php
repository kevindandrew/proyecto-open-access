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
            'embarque.agenteOrigen',
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

        // Mismo criterio que el consignatario: un solo master puede
        // consolidar carga de varios exportadores distintos, uno por house —
        // si el house tiene su propio shipper cargado, ese es el que se
        // muestra; si no, se usa el del embarque como hasta ahora.
        $shipper = $house->shipper_nombre
            ? ['nombre' => $house->shipper_nombre, 'direccion' => $house->shipper_direccion]
            : ['nombre' => $embarque->shipper_nombre, 'direccion' => $embarque->shipper_direccion];

        $condicionPago = $house->condicion_pago ?? 'Collect';
        $valorFlete = $house->flete_valor_texto ?: 'AS AGREED';

        // Si el contenedor lo comparten varios houses, cada uno declara solo
        // su porción (guardada en el pivot) — nunca el peso/volumen/
        // descripción del contenedor completo. Si un house todavía no tiene
        // su porción definida, se usa el dato del contenedor completo como
        // valor por defecto. La condición de pago y el monto del flete
        // siguen el mismo criterio: cada contenedor puede tener el suyo
        // propio (por ejemplo, distintos acuerdos de flete dentro del mismo
        // house); si no lo tiene, se usa el del house como valor por defecto.
        $contenedores = $house->contenedores->map(fn ($contenedor) => [
            'tipo_contenedor' => $contenedor->tipo_contenedor,
            'numero_contenedor' => $contenedor->numero_contenedor,
            'numero_sello' => $contenedor->numero_sello,
            'peso_kg' => $contenedor->pivot->peso_kg ?? $contenedor->peso_kg,
            'volumen_cbm' => $contenedor->pivot->volumen_cbm ?? $contenedor->volumen_cbm,
            'descripcion_mercancia' => $contenedor->pivot->descripcion_mercancia ?: $contenedor->descripcion_mercancia,
            'condicion_pago' => $contenedor->pivot->condicion_pago ?: $condicionPago,
            'flete_valor_texto' => $contenedor->pivot->flete_valor_texto ?: $valorFlete,
        ])->all();

        // Cuando todos los contenedores comparten la misma condición de pago
        // se muestra esa; si hay una mezcla de Prepaid y Collect dentro del
        // mismo house, se muestran ambas (ej. "PREPAID / COLLECT").
        $condicionesPresentes = collect($contenedores)->pluck('condicion_pago')->unique()->values();
        $condicionPagoResumen = $condicionesPresentes->isNotEmpty()
            ? $condicionesPresentes->map(fn ($c) => strtoupper($c))->implode(' / ')
            : strtoupper($condicionPago);

        return [
            'house' => [
                'numero_hbl' => $house->numero_hbl,
                'condicion_pago' => $condicionPago,
                'condicion_pago_resumen' => $condicionPagoResumen,
                'flete_valor_texto' => $valorFlete,
                'fecha_emision' => $house->fecha_emision?->toDateString(),
                'congelado_en' => $house->congelado_en?->toDateString(),
            ],
            'embarque' => [
                'numero_file' => $embarque->numero_file,
                'mbl' => $embarque->mbl,
                'cliente' => $embarque->cliente?->razon_social,
                'shipper_nombre' => $shipper['nombre'],
                'shipper_direccion' => $shipper['direccion'],
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
                'agente_origen' => $embarque->agenteOrigen?->nombre,
                'etd' => $embarque->etd?->toDateString(),
                'eta' => $embarque->eta?->toDateString(),
                'pago_master' => $embarque->pago_master,
            ],
            'contenedores' => $contenedores,
            'resumenContenedores' => self::resumenContenedores($contenedores),
            'totalPeso' => array_sum(array_column($contenedores, 'peso_kg')),
            'totalVolumen' => array_sum(array_column($contenedores, 'volumen_cbm')),
            'totalFletePrepaid' => self::totalFlete($contenedores, 'Prepaid'),
            'totalFleteCollect' => self::totalFlete($contenedores, 'Collect'),
        ];
    }

    /**
     * Suma los montos de flete de una columna (Prepaid o Collect) solo
     * cuando TODOS los valores presentes son números — el campo es texto
     * libre (puede llevar "AS AGREED"), así que si aparece algún valor no
     * numérico en esa columna no se calcula un total, para no mostrar una
     * suma incorrecta.
     */
    private static function totalFlete(array $contenedores, string $condicion): ?string
    {
        $valores = collect($contenedores)
            ->filter(fn ($c) => $c['condicion_pago'] === $condicion)
            ->pluck('flete_valor_texto')
            ->filter(fn ($valor) => filled($valor));

        if ($valores->isEmpty()) {
            return null;
        }

        $sonNumericos = $valores->every(fn ($valor) => is_numeric(str_replace(',', '', $valor)));

        if (! $sonNumericos) {
            return null;
        }

        $total = $valores->sum(fn ($valor) => (float) str_replace(',', '', $valor));

        return number_format($total, 2);
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
