<?php

namespace App\Support;

use App\Models\Embarque;
use App\Models\HouseBl;
use Illuminate\Validation\ValidationException;

/**
 * El consignee de un house se elige solo entre el cliente del embarque y los
 * consignatarios registrados de ese cliente (no entre todos los clientes).
 * Sin elección, el house usa el consignatario del embarque.
 *
 * En el selector cada opción se identifica como "cliente:{id}" o
 * "consignatario:{id}" ('' = el del embarque).
 */
class ConsigneeHouse
{
    public static function opciones(Embarque $embarque): array
    {
        $embarque->loadMissing(['cliente.consignatarios']);
        $cliente = $embarque->cliente;

        if (! $cliente) {
            return [];
        }

        return [
            ['valor' => "cliente:{$cliente->id_cliente}", 'etiqueta' => "Cliente: {$cliente->razon_social}"],
            ...$cliente->consignatarios->sortBy('nombre')->map(fn ($consignatario) => [
                'valor' => "consignatario:{$consignatario->id_consignatario}",
                'etiqueta' => "Consignatario: {$consignatario->nombre}",
            ])->values()->all(),
        ];
    }

    public static function valor(HouseBl $house): string
    {
        return match (true) {
            (bool) $house->id_consignatario => "consignatario:{$house->id_consignatario}",
            (bool) $house->id_cliente => "cliente:{$house->id_cliente}",
            default => '',
        };
    }

    /**
     * Nombre visible de lo que el house tiene elegido hoy (null = el del
     * embarque) — sirve para seguir mostrando un cliente cargado antes de este
     * cambio aunque ya no esté entre las opciones.
     */
    public static function etiqueta(HouseBl $house): ?string
    {
        return match (true) {
            (bool) $house->consignatario => "Consignatario: {$house->consignatario->nombre}",
            (bool) $house->cliente => "Cliente: {$house->cliente->razon_social}",
            default => null,
        };
    }

    /**
     * Datos del consignee del house, o null si usa el del embarque.
     */
    public static function datos(HouseBl $house): ?array
    {
        $house->loadMissing(['consignatario', 'cliente']);

        if ($house->consignatario) {
            return [
                'nombre' => $house->consignatario->nombre,
                'nit' => $house->consignatario->nit,
                'direccion' => $house->consignatario->direccion,
                'celular' => $house->consignatario->celular,
                'correo' => $house->consignatario->correo,
                'id_cliente' => $house->consignatario->id_cliente,
            ];
        }

        if ($house->cliente) {
            return [
                'nombre' => $house->cliente->razon_social,
                'nit' => $house->cliente->nit,
                'direccion' => $house->cliente->direccion,
                'celular' => $house->cliente->celular_whatsapp ?: $house->cliente->telefono1,
                'correo' => $house->cliente->email,
                'id_cliente' => $house->id_cliente,
            ];
        }

        return null;
    }

    /**
     * Traduce el valor del selector a las columnas del house, validando que
     * sea una de las opciones permitidas (o lo que el house ya tenía).
     */
    public static function resolver(?string $valor, Embarque $embarque, ?HouseBl $house = null): array
    {
        if (blank($valor)) {
            return ['id_cliente' => null, 'id_consignatario' => null];
        }

        $permitidos = collect(self::opciones($embarque))->pluck('valor');

        if ($house && self::valor($house) !== '') {
            $permitidos->push(self::valor($house));
        }

        if (! $permitidos->contains($valor)) {
            throw ValidationException::withMessages([
                'consignee' => 'Elegí el cliente del embarque o uno de sus consignatarios.',
            ]);
        }

        [$tipo, $id] = explode(':', $valor, 2);

        return $tipo === 'consignatario'
            ? ['id_cliente' => null, 'id_consignatario' => (int) $id]
            : ['id_cliente' => (int) $id, 'id_consignatario' => null];
    }
}
