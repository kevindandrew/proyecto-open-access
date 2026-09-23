<?php

namespace App\Support;

use App\Models\Cliente;

class ConsignatariosSincronizador
{
    /**
     * @param  array<int, array{id_consignatario: ?int, nombre: ?string, nit: ?string, direccion: ?string, celular: ?string, correo: ?string}>  $consignatarios
     * @param  array<int, int>  $eliminados
     */
    public static function sincronizar(Cliente $cliente, array $consignatarios, array $eliminados = []): void
    {
        if (! empty($eliminados)) {
            $cliente->consignatarios()->whereIn('id_consignatario', $eliminados)->delete();
        }

        foreach ($consignatarios as $consignatario) {
            $datos = [
                'nombre' => $consignatario['nombre'] ?? null,
                'nit' => $consignatario['nit'] ?? null,
                'direccion' => $consignatario['direccion'] ?? null,
                'celular' => $consignatario['celular'] ?? null,
                'correo' => $consignatario['correo'] ?? null,
            ];

            if (! empty($consignatario['id_consignatario'])) {
                $cliente->consignatarios()
                    ->where('id_consignatario', $consignatario['id_consignatario'])
                    ->update($datos);
            } else {
                $cliente->consignatarios()->create($datos);
            }
        }
    }
}
