<?php

namespace App\Support;

use App\Models\Embarque;
use App\Models\HouseBl;

/**
 * Por qué se puede emitir una nota de cobro (el MBL completo o cada house)
 * y a quién: solo al cliente del embarque o al consignatario de ese alcance.
 */
class AlcancesCobro
{
    public static function para(Embarque $embarque): array
    {
        $embarque->loadMissing(['cliente', 'houseBls.cliente']);

        $alcances = [[
            'id_hbl' => null,
            'etiqueta' => 'MBL'.($embarque->mbl ? " {$embarque->mbl}" : ' (todo el embarque)'),
            'consignatario' => self::consignatarioDelEmbarque($embarque),
        ]];

        foreach ($embarque->houseBls->sortBy('id_hbl') as $house) {
            $alcances[] = [
                'id_hbl' => $house->id_hbl,
                'etiqueta' => "House {$house->numero_hbl}",
                'consignatario' => self::consignatarioDelHouse($house, $embarque),
            ];
        }

        return array_map(fn (array $alcance) => [
            'id_hbl' => $alcance['id_hbl'],
            'etiqueta' => $alcance['etiqueta'],
            'destinatarios' => self::destinatarios($embarque, $alcance['consignatario']),
        ], $alcances);
    }

    public static function alcance(Embarque $embarque, ?int $idHbl): ?array
    {
        return collect(self::para($embarque))->firstWhere('id_hbl', $idHbl);
    }

    public static function consignatario(Embarque $embarque, ?int $idHbl): ?array
    {
        $embarque->loadMissing(['houseBls.cliente']);
        $house = $idHbl ? $embarque->houseBls->firstWhere('id_hbl', $idHbl) : null;

        return $house
            ? self::consignatarioDelHouse($house, $embarque)
            : self::consignatarioDelEmbarque($embarque);
    }

    private static function destinatarios(Embarque $embarque, ?array $consignatario): array
    {
        $destinatarios = [];

        if ($embarque->cliente) {
            $destinatarios[] = [
                'clave' => 'cliente',
                'etiqueta' => 'Cliente',
                'nombre' => $embarque->cliente->razon_social,
                'nit' => $embarque->cliente->nit,
                'direccion' => $embarque->cliente->direccion,
                'id_cliente' => $embarque->id_cliente,
            ];
        }

        if ($consignatario && $consignatario['nombre'] !== ($embarque->cliente?->razon_social)) {
            $destinatarios[] = ['clave' => 'consignatario', 'etiqueta' => 'Consignatario', ...$consignatario];
        }

        return $destinatarios;
    }

    private static function consignatarioDelEmbarque(Embarque $embarque): ?array
    {
        if (! $embarque->consignatario_nombre) {
            return null;
        }

        return [
            'nombre' => $embarque->consignatario_nombre,
            'nit' => $embarque->consignatario_nit,
            'direccion' => $embarque->consignatario_direccion,
            'id_cliente' => $embarque->id_cliente,
        ];
    }

    private static function consignatarioDelHouse(HouseBl $house, Embarque $embarque): ?array
    {
        // Un house sin cliente propio usa el consignatario del embarque.
        if (! $house->cliente) {
            return self::consignatarioDelEmbarque($embarque);
        }

        return [
            'nombre' => $house->cliente->razon_social,
            'nit' => $house->cliente->nit,
            'direccion' => $house->cliente->direccion,
            'id_cliente' => $house->id_cliente,
        ];
    }
}
