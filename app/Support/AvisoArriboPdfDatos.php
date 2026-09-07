<?php

namespace App\Support;

use App\Models\Embarque;
use App\Models\EmbarqueContenedor;
use App\Models\HouseBl;

class AvisoArriboPdfDatos
{
    public static function para(Embarque $embarque): array
    {
        $embarque->loadMissing([
            'pol',
            'pod',
            'navieraAerolinea',
            'houseBls.contenedores',
            'costos',
        ]);

        $houses = $embarque->houseBls->map(fn (HouseBl $house) => [
            'numero_hbl' => $house->numero_hbl,
            'contenedores_texto' => $house->contenedores
                ->map(fn (EmbarqueContenedor $c) => trim(
                    ($c->numero_contenedor ?: '—').' / '.FormatoContenedor::conPies($c->tipo_contenedor),
                ))
                ->implode(' / '),
        ])->all();

        $todosLosContenedores = $embarque->houseBls->flatMap(fn (HouseBl $h) => $h->contenedores);

        // Solo se suma el costo_venta de las líneas de Flete — nunca se
        // mezclan monedas distintas, un total por cada una que aparezca.
        $totalesPorMoneda = $embarque->costos
            ->filter(fn ($costo) => str_starts_with($costo->concepto, 'Flete'))
            ->groupBy(fn ($costo) => $costo->moneda ?: 'USD')
            ->map(fn ($grupo) => $grupo->sum('costo_venta'))
            ->all();

        return [
            'embarque' => [
                'numero_file' => $embarque->numero_file,
                'consignatario_nombre' => $embarque->consignatario_nombre,
                'shipper_nombre' => $embarque->shipper_nombre,
                'pol' => $embarque->pol?->nombre,
                'pod' => $embarque->pod?->nombre,
                'eta' => $embarque->eta?->toDateString(),
                'pago_master' => $embarque->pago_master,
                'naviera_aerolinea' => $embarque->navieraAerolinea?->nombre,
            ],
            'houses' => $houses,
            'resumenContenedores' => self::resumen($todosLosContenedores),
            'totalesPorMoneda' => $totalesPorMoneda,
            'numerosHbl' => $embarque->houseBls->pluck('numero_hbl')->implode(' / '),
        ];
    }

    private static function resumen($contenedores): string
    {
        $conteo = [];

        foreach ($contenedores as $contenedor) {
            $tipo = str_replace(' ', '', $contenedor->tipo_contenedor ?? '—');
            $conteo[$tipo] = ($conteo[$tipo] ?? 0) + 1;
        }

        $partes = [];
        foreach ($conteo as $tipo => $cantidad) {
            $partes[] = "{$cantidad}X{$tipo}";
        }

        return implode(', ', $partes);
    }
}
