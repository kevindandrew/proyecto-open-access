<?php

namespace App\Support;

use App\Models\Embarque;
use App\Models\HouseBl;

/**
 * Por qué se puede emitir una nota de cobro (el MBL completo o cada house)
 * y a quién: al cliente del embarque, al consignatario de ese alcance, a los
 * consignatarios registrados del cliente, al shipper o al agente de origen.
 */
class AlcancesCobro
{
    public static function para(Embarque $embarque): array
    {
        $embarque->loadMissing(['cliente.consignatarios', 'agenteOrigen', 'houseBls.cliente', 'houseBls.consignatario']);

        $alcances = [[
            'id_hbl' => null,
            'etiqueta' => 'MBL'.($embarque->mbl ? " {$embarque->mbl}" : ' (todo el embarque)'),
            'consignatario' => self::consignatarioDelEmbarque($embarque),
            'shipper' => ['nombre' => $embarque->shipper_nombre, 'direccion' => $embarque->shipper_direccion],
        ]];

        foreach ($embarque->houseBls->sortBy('id_hbl') as $house) {
            $alcances[] = [
                'id_hbl' => $house->id_hbl,
                'etiqueta' => "House {$house->numero_hbl}",
                'consignatario' => self::consignatarioDelHouse($house, $embarque),
                // Un house con shipper propio cobra a ese; si no, al del embarque.
                'shipper' => $house->shipper_nombre
                    ? ['nombre' => $house->shipper_nombre, 'direccion' => $house->shipper_direccion]
                    : ['nombre' => $embarque->shipper_nombre, 'direccion' => $embarque->shipper_direccion],
            ];
        }

        return array_map(fn (array $alcance) => [
            'id_hbl' => $alcance['id_hbl'],
            'etiqueta' => $alcance['etiqueta'],
            'destinatarios' => self::destinatarios($embarque, $alcance['consignatario'], $alcance['shipper']),
        ], $alcances);
    }

    public static function alcance(Embarque $embarque, ?int $idHbl): ?array
    {
        return collect(self::para($embarque))->firstWhere('id_hbl', $idHbl);
    }

    public static function consignatario(Embarque $embarque, ?int $idHbl): ?array
    {
        $embarque->loadMissing(['houseBls.cliente', 'houseBls.consignatario']);
        $house = $idHbl ? $embarque->houseBls->firstWhere('id_hbl', $idHbl) : null;

        return $house
            ? self::consignatarioDelHouse($house, $embarque)
            : self::consignatarioDelEmbarque($embarque);
    }

    private static function destinatarios(Embarque $embarque, ?array $consignatario, array $shipper): array
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

        if ($consignatario) {
            $destinatarios[] = ['clave' => 'consignatario', 'etiqueta' => 'Consignatario', ...$consignatario];
        }

        // Los demás consignatarios registrados del cliente.
        foreach ($embarque->cliente?->consignatarios ?? [] as $registrado) {
            $destinatarios[] = [
                'clave' => "consignatario:{$registrado->id_consignatario}",
                'etiqueta' => 'Consignatario',
                'nombre' => $registrado->nombre,
                'nit' => $registrado->nit,
                'direccion' => $registrado->direccion,
                'id_cliente' => $embarque->id_cliente,
            ];
        }

        if ($shipper['nombre']) {
            $destinatarios[] = [
                'clave' => 'shipper',
                'etiqueta' => 'Shipper',
                'nombre' => $shipper['nombre'],
                'nit' => null,
                'direccion' => $shipper['direccion'],
                'id_cliente' => null,
            ];
        }

        if ($embarque->agenteOrigen) {
            $destinatarios[] = [
                'clave' => 'agente',
                'etiqueta' => 'Agente',
                'nombre' => $embarque->agenteOrigen->nombre,
                'nit' => $embarque->agenteOrigen->nit,
                'direccion' => collect([$embarque->agenteOrigen->direccion1, $embarque->agenteOrigen->direccion2])->filter()->implode(', ') ?: null,
                'id_cliente' => null,
                'id_proveedor' => $embarque->id_agente_origen,
            ];
        }

        // Un mismo nombre no se ofrece dos veces (ej. el consignatario del
        // embarque suele ser también uno de los registrados del cliente).
        return collect($destinatarios)->unique(fn ($d) => mb_strtolower(trim($d['nombre'])))->values()->all();
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
        // Un house sin consignee propio usa el consignatario del embarque.
        $datos = ConsigneeHouse::datos($house);

        if (! $datos) {
            return self::consignatarioDelEmbarque($embarque);
        }

        return [
            'nombre' => $datos['nombre'],
            'nit' => $datos['nit'],
            'direccion' => $datos['direccion'],
            'id_cliente' => $datos['id_cliente'] ?? $embarque->id_cliente,
        ];
    }
}
