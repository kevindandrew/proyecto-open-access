<?php

namespace App\Support;

use App\Models\Cotizacion;
use App\Models\Embarque;
use Illuminate\Support\Facades\DB;

/**
 * Convierte una cotización aceptada en embarque, copiando los datos ya
 * cargados (cliente, ruta, carga, contenedores y costos). Lo usan Comercial,
 * Gerente Comercial y Gerente Operativo.
 */
class ConvertidorCotizacionEmbarque
{
    /**
     * Motivo por el que no se puede convertir, o null si se puede.
     */
    public static function impedimento(Cotizacion $cotizacion): ?string
    {
        if ($cotizacion->estado !== 'Aceptado') {
            return 'Solo se puede convertir una cotización Aceptada.';
        }

        if ($cotizacion->embarques()->exists()) {
            return 'Esta cotización ya fue convertida en un embarque.';
        }

        return null;
    }

    public static function convertir(Cotizacion $cotizacion): Embarque
    {
        $cotizacion->loadMissing('cliente.consignatarios', 'contenedores', 'detalle');

        return DB::transaction(function () use ($cotizacion) {
            $consignatarioPrincipal = $cotizacion->cliente?->consignatarios->first();

            $embarque = Embarque::create([
                // Sin Nro. de File: lo asigna Gerente Operativo según la fecha de
                // arribo. Mientras tanto se identifica por la cotización.
                'numero_file' => null,
                'id_cotizacion' => $cotizacion->id_cotizacion,
                'id_cliente' => $cotizacion->id_cliente,
                'id_consignatario' => $consignatarioPrincipal?->id_consignatario,
                'consignatario_nombre' => $consignatarioPrincipal?->nombre,
                'consignatario_nit' => $consignatarioPrincipal?->nit,
                'consignatario_direccion' => $consignatarioPrincipal?->direccion,
                'consignatario_celular' => $consignatarioPrincipal?->celular,
                'consignatario_correo' => $consignatarioPrincipal?->correo,
                'id_comercial' => $cotizacion->id_comercial,
                'id_operativo' => null,
                'id_agente_origen' => $cotizacion->id_agente_origen,
                'id_naviera_aerolinea' => $cotizacion->id_naviera_aerolinea,
                'modo_transporte' => $cotizacion->modo_transporte,
                'tipo_servicio' => $cotizacion->tipo_servicio,
                'tipo_embarque' => $cotizacion->tipo_embarque,
                'oficina_venta' => 'La Paz',
                'oficina_operacional' => 'La Paz',
                'id_pol' => $cotizacion->id_pol,
                'id_pod' => $cotizacion->id_pod,
                'destino_final' => $cotizacion->destino_final,
                'peso_kg' => $cotizacion->peso_kg,
                'volumen_cbm' => $cotizacion->volumen_cbm,
                'estado_embarque' => 'Confirmado_Origen',
            ]);

            foreach ($cotizacion->contenedores as $contenedor) {
                // Cada contenedor físico es único (numero_contenedor, sello,
                // etc.), así que se crea una fila por unidad en vez de una
                // sola fila con cantidad=N — esos datos individuales todavía
                // no se conocen a esta altura y se completan más adelante.
                for ($i = 0; $i < $contenedor->cantidad; $i++) {
                    $embarque->contenedores()->create([
                        'tipo_contenedor' => $contenedor->tipo_contenedor,
                        'cantidad' => 1,
                    ]);
                }
            }

            foreach ($cotizacion->detalle as $linea) {
                // Proveedor se puede inferir con confianza solo para los dos
                // casos conocidos: el flete se le paga a la naviera/aerolínea,
                // el trámite lo gestiona el agente de origen. Las líneas
                // manuales/personalizadas quedan sin proveedor.
                $idProveedor = match (true) {
                    str_starts_with($linea->descripcion, 'Flete') => $cotizacion->id_naviera_aerolinea,
                    $linea->descripcion === 'Trámite' => $cotizacion->id_agente_origen,
                    default => null,
                };

                $embarque->costos()->create([
                    'concepto' => substr($linea->descripcion, 0, 100),
                    'id_proveedor' => $idProveedor,
                    'costo_compra' => $linea->costo_total,
                    'costo_venta' => $linea->costo_total + $linea->comision_openaccess,
                    'moneda' => $linea->moneda,
                ]);
            }

            $embarque->seguimientos()->create([
                'fecha' => now(),
                'estado' => 'Confirmado_Origen',
                'comentario' => "Embarque creado desde la cotización {$cotizacion->numero_referencia}",
                'id_empleado_responsable' => $cotizacion->id_comercial,
            ]);

            return $embarque;
        });
    }
}
