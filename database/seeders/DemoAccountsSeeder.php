<?php

namespace Database\Seeders;

use App\Models\Cliente;
use App\Models\Cotizacion;
use App\Models\Embarque;
use App\Models\Empleado;
use App\Models\Proveedor;
use App\Models\PuertoAeropuerto;
use App\Models\RoleEmpleado;
use App\Models\Tarifa;
use App\Models\User;
use App\Support\GeneradorUsername;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

/**
 * Demo data: one User per business role (for the login screen's demo
 * accounts and for role-based redirect testing) plus enough Gerente
 * Operativo records to exercise its screens against real data. Not part
 * of the production RoleSeeder.
 */
class DemoAccountsSeeder extends Seeder
{
    public function run(): void
    {
        $rolGerenteOperativo = RoleEmpleado::where('nombre_rol', 'Gerente Operativo')->firstOrFail();
        $rolOperativo = RoleEmpleado::where('nombre_rol', 'Operativo')->firstOrFail();
        $rolGerenteComercial = RoleEmpleado::where('nombre_rol', 'Gerente Comercial')->firstOrFail();
        $rolComercial = RoleEmpleado::where('nombre_rol', 'Comercial')->firstOrFail();

        $puertoOrigen = PuertoAeropuerto::firstOrCreate(
            ['codigo' => 'CHSHA'],
            ['nombre' => 'Shanghai', 'tipo' => 'Puerto', 'pais' => 'China'],
        );

        $puertoDestino = PuertoAeropuerto::firstOrCreate(
            ['codigo' => 'LPB'],
            ['nombre' => 'Aeropuerto El Alto', 'tipo' => 'Aeropuerto', 'pais' => 'Bolivia'],
        );

        $aeropuertoOrigen = PuertoAeropuerto::firstOrCreate(
            ['codigo' => 'PVG'],
            ['nombre' => 'Shanghai Pudong', 'tipo' => 'Aeropuerto', 'pais' => 'China'],
        );

        $fronteraTerrestre = PuertoAeropuerto::firstOrCreate(
            ['codigo' => 'DESA'],
            ['nombre' => 'Desaguadero', 'tipo' => 'Frontera', 'pais' => 'Bolivia'],
        );

        $naviera = Proveedor::firstOrCreate(
            ['nombre' => 'MSC'],
            ['tipo' => 'Naviera', 'pais' => 'Suiza'],
        );

        $navieraVencida = Proveedor::firstOrCreate(
            ['nombre' => 'COSCO Shipping'],
            ['tipo' => 'Naviera', 'pais' => 'China'],
        );

        $aerolinea = Proveedor::firstOrCreate(
            ['nombre' => 'LATAM Cargo'],
            ['tipo' => 'Aerolinea', 'pais' => 'Chile'],
        );

        $transportista = Proveedor::firstOrCreate(
            ['nombre' => 'Transportes del Altiplano'],
            ['tipo' => 'Transportista', 'pais' => 'Bolivia'],
        );

        $gerenteComercial = Empleado::firstOrCreate(
            ['email' => 'carlos.mendoza@openaccess.bo'],
            ['nombre_completo' => 'Carlos Mendoza', 'id_rol' => $rolGerenteComercial->id_rol, 'activo' => true],
        );

        $comercial = Empleado::firstOrCreate(
            ['email' => 'maria.quispe@openaccess.bo'],
            ['nombre_completo' => 'Maria Quispe', 'id_rol' => $rolComercial->id_rol, 'id_jefe' => $gerenteComercial->id_empleado, 'activo' => true],
        );

        $gerenteOperativo = Empleado::firstOrCreate(
            ['email' => 'jorge.mamani@openaccess.bo'],
            ['nombre_completo' => 'Jorge Mamani', 'id_rol' => $rolGerenteOperativo->id_rol, 'activo' => true],
        );

        $operativo = Empleado::firstOrCreate(
            ['email' => 'ana.rocha@openaccess.bo'],
            [
                'nombre_completo' => 'Ana Rocha',
                'id_rol' => $rolOperativo->id_rol,
                'especialidad_operativa' => 'Maritimo',
                'id_jefe' => $gerenteOperativo->id_empleado,
                'activo' => true,
            ],
        );

        $operativoTerrestre = Empleado::firstOrCreate(
            ['email' => 'luis.fernandez@openaccess.bo'],
            [
                'nombre_completo' => 'Luis Fernandez',
                'id_rol' => $rolOperativo->id_rol,
                'especialidad_operativa' => 'Terrestre',
                'id_jefe' => $gerenteOperativo->id_empleado,
                'activo' => true,
            ],
        );

        // A propósito no se crea ningún operativo con especialidad Aereo, para
        // poder probar el mensaje de "no hay operativos con esa especialidad".

        $demoUsers = [
            ['nombre' => 'Carlos Mendoza', 'empleado' => $gerenteComercial],
            ['nombre' => 'Maria Quispe', 'empleado' => $comercial],
            ['nombre' => 'Jorge Mamani', 'empleado' => $gerenteOperativo],
            ['nombre' => 'Ana Rocha', 'empleado' => $operativo],
            ['nombre' => 'Luis Fernandez', 'empleado' => $operativoTerrestre],
        ];

        foreach ($demoUsers as $demo) {
            User::firstOrCreate(
                ['email' => $demo['empleado']->email],
                [
                    'name' => $demo['nombre'],
                    'username' => GeneradorUsername::generar($demo['nombre']),
                    'password' => bcrypt('password'),
                    'empleado_id' => $demo['empleado']->id_empleado,
                    'email_verified_at' => now(),
                ],
            );
        }

        $cliente = Cliente::firstOrCreate(
            ['razon_social' => 'Importadora Andina S.A.'],
            ['id_comercial' => $comercial->id_empleado, 'condicion_pago' => 'Al contado'],
        );

        $embarques = [
            ['numero_file' => 'OA-2026-0001', 'estado_embarque' => 'Confirmado_Origen', 'modo_transporte' => 'Maritimo', 'id_operativo' => $operativo->id_empleado, 'eta' => Carbon::today()->addDay()],
            ['numero_file' => 'OA-2026-0002', 'estado_embarque' => 'En_Transito', 'modo_transporte' => 'Maritimo', 'id_operativo' => $operativo->id_empleado, 'eta' => Carbon::today()->addDays(12)],
            ['numero_file' => 'OA-2026-0003', 'estado_embarque' => 'En_Aduana_Destino', 'modo_transporte' => 'Aereo', 'id_operativo' => null, 'eta' => Carbon::today()->addDays(10)],
            ['numero_file' => 'OA-2026-0004', 'estado_embarque' => 'En_Aduana_Destino', 'modo_transporte' => 'Maritimo', 'id_operativo' => null, 'eta' => Carbon::today()->addDays(10)],
            ['numero_file' => 'OA-2026-0005', 'estado_embarque' => 'Entregado', 'modo_transporte' => 'Terrestre', 'id_operativo' => $operativoTerrestre->id_empleado, 'eta' => Carbon::today()->addDays(10)],
            ['numero_file' => 'OA-2026-0006', 'estado_embarque' => 'Cerrado', 'modo_transporte' => 'Maritimo', 'id_operativo' => $operativo->id_empleado, 'eta' => Carbon::today()->addDays(10)],
        ];

        $embarquesCreados = [];
        foreach ($embarques as $datos) {
            $embarquesCreados[$datos['numero_file']] = Embarque::firstOrCreate(
                ['numero_file' => $datos['numero_file']],
                [
                    'id_cliente' => $cliente->id_cliente,
                    'id_comercial' => $comercial->id_empleado,
                    'id_operativo' => $datos['id_operativo'],
                    'id_naviera_aerolinea' => $datos['modo_transporte'] === 'Aereo' ? $aerolinea->id_proveedor : $naviera->id_proveedor,
                    'modo_transporte' => $datos['modo_transporte'],
                    'id_pol' => $puertoOrigen->codigo,
                    'id_pod' => $puertoDestino->codigo,
                    'estado_embarque' => $datos['estado_embarque'],
                    'eta' => $datos['eta'],
                ],
            );
        }

        $embarqueMaritimoUrgente = $embarquesCreados['OA-2026-0001'];

        if ($embarqueMaritimoUrgente->contenedores()->count() === 0) {
            $embarqueMaritimoUrgente->contenedores()->createMany([
                [
                    'tipo_contenedor' => '40 DRY',
                    'numero_contenedor' => 'MSCU1234567',
                    'numero_sello' => 'SL-88213',
                    'peso_kg' => 18500,
                    'volumen_cbm' => 58.6,
                ],
                [
                    'tipo_contenedor' => '20 DRY',
                    'numero_contenedor' => 'MSCU7654321',
                    'numero_sello' => 'SL-88214',
                    'peso_kg' => 9200,
                    'volumen_cbm' => 28.3,
                ],
            ]);
        }

        $tarifaMaritima = Tarifa::firstOrCreate(
            ['id_proveedor' => $naviera->id_proveedor, 'modo' => 'Maritimo', 'id_origen' => $puertoOrigen->codigo, 'id_destino' => $puertoDestino->codigo],
            [
                'tipo_servicio' => 'FCL',
                'dias_transito' => 35,
                'costo_20' => 1200,
                'costo_40' => 2000,
                'costo_40hc' => 2200,
                'moneda' => 'USD',
                'tipo_tarifa' => 'Normal',
                'fecha_inicio_vigencia' => Carbon::today()->subMonths(2),
                'fecha_fin_vigencia' => Carbon::today()->addDays(3),
            ],
        );
        $tarifaMaritima->update(['dias_transito' => 35]);

        if ($tarifaMaritima->cargosAdicionales()->count() === 0) {
            $tarifaMaritima->cargosAdicionales()->create([
                'concepto' => 'THC/CNTR',
                'monto' => 150,
                'moneda' => 'USD',
            ]);
        }

        $puertoArica = PuertoAeropuerto::firstOrCreate(
            ['codigo' => 'ARI'],
            ['nombre' => 'Arica', 'tipo' => 'Puerto', 'pais' => 'Chile'],
        );

        Tarifa::firstOrCreate(
            ['id_proveedor' => $naviera->id_proveedor, 'modo' => 'Maritimo', 'tipo_servicio' => 'LCL', 'id_origen' => $puertoOrigen->codigo, 'id_destino' => $puertoArica->codigo],
            [
                'dias_transito' => 35,
                'costo_cbm' => 95,
                'moneda' => 'USD',
                'tipo_tarifa' => 'Normal',
                'fecha_inicio_vigencia' => Carbon::today()->subMonths(2),
                'fecha_fin_vigencia' => Carbon::today()->addDays(45),
            ],
        );

        Tarifa::firstOrCreate(
            ['id_proveedor' => $navieraVencida->id_proveedor, 'modo' => 'Maritimo', 'id_origen' => $puertoOrigen->codigo, 'id_destino' => $puertoDestino->codigo],
            [
                'tipo_servicio' => 'FCL',
                'dias_transito' => 36,
                'costo_20' => 1100,
                'costo_40' => 1900,
                'costo_40hc' => 3000,
                'moneda' => 'USD',
                'tipo_tarifa' => 'Normal',
                'fecha_inicio_vigencia' => Carbon::today()->subMonths(3),
                'fecha_fin_vigencia' => Carbon::today()->subDays(10),
            ],
        );

        $tarifaAerea = Tarifa::firstOrCreate(
            ['id_proveedor' => $aerolinea->id_proveedor, 'modo' => 'Aereo', 'id_origen' => $aeropuertoOrigen->codigo, 'id_destino' => $puertoDestino->codigo],
            [
                'dias_transito' => 5,
                'costo_base' => 4.20,
                'moneda' => 'USD',
                'tipo_tarifa' => 'Normal',
                'fecha_inicio_vigencia' => Carbon::today()->subMonth(),
                'fecha_fin_vigencia' => Carbon::today()->addDays(60),
            ],
        );
        $tarifaAerea->update(['dias_transito' => 5, 'costo_base' => 4.20]);

        Tarifa::firstOrCreate(
            ['id_proveedor' => $transportista->id_proveedor, 'modo' => 'Terrestre', 'id_origen' => $fronteraTerrestre->codigo, 'id_destino' => $puertoDestino->codigo],
            [
                'dias_transito' => 2,
                'costo_base' => 850,
                'moneda' => 'USD',
                'tipo_tarifa' => 'Normal',
                'fecha_inicio_vigencia' => Carbon::today()->subMonth(),
                'fecha_fin_vigencia' => Carbon::today()->addDays(90),
            ],
        );

        $embarqueEnAduana = $embarquesCreados['OA-2026-0003'];

        if ($embarqueEnAduana->gastosDestino()->count() === 0) {
            $embarqueEnAduana->gastosDestino()->create([
                'concepto' => 'Arancel',
                'monto' => 850,
                'moneda' => 'USD',
                'pagado' => false,
            ]);

            $embarqueEnAduana->gastosDestino()->create([
                'concepto' => 'Impuesto',
                'monto' => 320,
                'moneda' => 'USD',
                'pagado' => true,
                'fecha_pago' => Carbon::today()->subDays(2),
            ]);
        }

        $costosPorEmbarque = [
            'OA-2026-0001' => [
                ['concepto' => 'Ocean Freight', 'id_proveedor' => $naviera->id_proveedor, 'costo_compra' => 1800, 'costo_venta' => 2400],
                ['concepto' => 'THC Origen', 'id_proveedor' => $naviera->id_proveedor, 'costo_compra' => 120, 'costo_venta' => 180],
            ],
            'OA-2026-0002' => [
                ['concepto' => 'Ocean Freight', 'id_proveedor' => $naviera->id_proveedor, 'costo_compra' => 1900, 'costo_venta' => 2450],
            ],
            'OA-2026-0005' => [
                ['concepto' => 'Land Freight', 'id_proveedor' => null, 'costo_compra' => 600, 'costo_venta' => 850],
            ],
            'OA-2026-0006' => [
                ['concepto' => 'Ocean Freight', 'id_proveedor' => $naviera->id_proveedor, 'costo_compra' => 1750, 'costo_venta' => 2200],
                ['concepto' => 'Freight Forwarder Fee', 'id_proveedor' => null, 'costo_compra' => 0, 'costo_venta' => 300],
            ],
        ];

        foreach ($costosPorEmbarque as $numeroFile => $lineas) {
            $embarque = $embarquesCreados[$numeroFile];

            if ($embarque->costos()->count() === 0) {
                foreach ($lineas as $linea) {
                    $embarque->costos()->create([
                        'concepto' => $linea['concepto'],
                        'id_proveedor' => $linea['id_proveedor'],
                        'costo_compra' => $linea['costo_compra'],
                        'costo_venta' => $linea['costo_venta'],
                        'moneda' => 'USD',
                    ]);
                }
            }
        }

        $clienteTextiles = Cliente::firstOrCreate(
            ['razon_social' => 'Textiles La Paz Ltda.'],
            ['id_comercial' => $comercial->id_empleado, 'condicion_pago' => 'Credito 30 dias'],
        );

        $cotizaciones = [
            [
                'numero_referencia' => 'MAQULPZ/26-0001',
                'id_cliente' => $cliente->id_cliente,
                'modo_transporte' => 'Maritimo',
                'tipo_servicio' => 'FCL',
                'incoterm' => 'FOB',
                'estado' => 'Cotizado',
                'fecha_emision' => Carbon::today()->subDays(5),
                'fecha_validez' => Carbon::today()->addDays(20),
                'contenedores' => [['tipo_contenedor' => '40 DRY', 'cantidad' => 2]],
                'detalle' => [
                    ['descripcion' => 'Ocean Freight', 'tipo_tarifa_unidad' => 'Per Container', 'costo_unitario' => 2000, 'base_calculo' => 2, 'moneda' => 'USD'],
                    ['descripcion' => 'THC Origen', 'tipo_tarifa_unidad' => 'Per Container', 'costo_unitario' => 150, 'base_calculo' => 2, 'moneda' => 'USD'],
                ],
            ],
            [
                'numero_referencia' => 'MAQULPZ/26-0002',
                'id_cliente' => $clienteTextiles->id_cliente,
                'modo_transporte' => 'Aereo',
                'tipo_servicio' => null,
                'incoterm' => 'EXW',
                'estado' => 'Cotizado',
                'fecha_emision' => Carbon::today()->subDay(),
                'fecha_validez' => Carbon::today()->addDays(2),
                'peso_kg' => 450,
                'volumen_cbm' => 2.1,
                'detalle' => [
                    ['descripcion' => 'Air Freight', 'tipo_tarifa_unidad' => 'Per Shipment', 'costo_unitario' => 980, 'base_calculo' => 1, 'moneda' => 'USD'],
                ],
            ],
            [
                'numero_referencia' => 'MAQULPZ/26-0003',
                'id_cliente' => $cliente->id_cliente,
                'modo_transporte' => 'Maritimo',
                'tipo_servicio' => 'FCL',
                'incoterm' => 'CIF',
                'estado' => 'Aceptado',
                'fecha_emision' => Carbon::today()->subDays(2),
                'fecha_validez' => Carbon::today()->addDays(25),
                'contenedores' => [['tipo_contenedor' => '20 DRY', 'cantidad' => 1]],
                'detalle' => [
                    ['descripcion' => 'Ocean Freight', 'tipo_tarifa_unidad' => 'Per Container', 'costo_unitario' => 1200, 'base_calculo' => 1, 'moneda' => 'USD'],
                ],
            ],
            [
                'numero_referencia' => 'MAQULPZ/26-0004',
                'id_cliente' => $clienteTextiles->id_cliente,
                'modo_transporte' => 'Terrestre',
                'tipo_servicio' => 'LCL',
                'incoterm' => 'DDP',
                'estado' => 'Rechazado',
                'fecha_emision' => Carbon::today()->subDays(10),
                'fecha_validez' => Carbon::today()->subDays(1),
                'peso_kg' => 800,
                'volumen_cbm' => 4.5,
                'detalle' => [
                    ['descripcion' => 'Land Freight', 'tipo_tarifa_unidad' => 'Per Shipment', 'costo_unitario' => 650, 'base_calculo' => 1, 'moneda' => 'USD'],
                ],
            ],
        ];

        foreach ($cotizaciones as $datos) {
            $cotizacion = Cotizacion::firstOrCreate(
                ['numero_referencia' => $datos['numero_referencia']],
                [
                    'id_cliente' => $datos['id_cliente'],
                    'id_comercial' => $comercial->id_empleado,
                    'modo_transporte' => $datos['modo_transporte'],
                    'tipo_servicio' => $datos['tipo_servicio'] ?? null,
                    'incoterm' => $datos['incoterm'],
                    'id_pol' => $puertoOrigen->codigo,
                    'id_pod' => $puertoDestino->codigo,
                    'fecha_emision' => $datos['fecha_emision'],
                    'fecha_validez' => $datos['fecha_validez'],
                    'estado' => $datos['estado'],
                    'peso_kg' => $datos['peso_kg'] ?? null,
                    'volumen_cbm' => $datos['volumen_cbm'] ?? null,
                ],
            );

            if ($cotizacion->contenedores()->count() === 0) {
                foreach ($datos['contenedores'] ?? [] as $contenedor) {
                    $cotizacion->contenedores()->create($contenedor);
                }
            }

            if ($cotizacion->detalle()->count() === 0) {
                foreach ($datos['detalle'] as $index => $linea) {
                    $cotizacion->detalle()->create([
                        'nro_item' => $index + 1,
                        'descripcion' => $linea['descripcion'],
                        'tipo_tarifa_unidad' => $linea['tipo_tarifa_unidad'],
                        'costo_unitario' => $linea['costo_unitario'],
                        'base_calculo' => $linea['base_calculo'],
                        'moneda' => $linea['moneda'],
                        'costo_total' => $linea['costo_unitario'] * $linea['base_calculo'],
                    ]);
                }
            }
        }
    }
}
