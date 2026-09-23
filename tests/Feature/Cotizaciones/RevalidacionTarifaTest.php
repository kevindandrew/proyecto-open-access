<?php

use App\Models\CotizacionDetalle;
use App\Models\Tarifa;

function comercialConClienteYTarifaAerea(array $atributosTarifa = []): array
{
    $comercial = crearEmpleado('Comercial');
    $cliente = crearCliente(['id_comercial' => $comercial->id_empleado]);

    $tarifa = crearTarifa(array_merge([
        'modo' => 'Aereo',
        'costo_base' => 5.50,
        'moneda' => 'USD',
    ], $atributosTarifa));

    return compact('comercial', 'cliente', 'tarifa');
}

function payloadCotizacionAerea(array $cliente, array $lineaDetalle): array
{
    return [
        'id_cliente' => $cliente['id_cliente'],
        'modo_transporte' => 'Aereo',
        'tipo_embarque' => 'IMPO',
        'fecha_validez' => now()->addDays(10)->toDateString(),
        'detalle' => [$lineaDetalle],
    ];
}

test('el costo_unitario y moneda que manda el navegador para una linea de tarifa se ignoran, se usa el valor real de la tarifa', function () {
    ['comercial' => $comercial, 'cliente' => $cliente, 'tarifa' => $tarifa] = comercialConClienteYTarifaAerea();

    // Un request manipulado: la línea dice venir de la tarifa real (id_tarifa +
    // origen_campo), pero el costo_unitario y la moneda que manda el navegador
    // no coinciden con lo que esa tarifa realmente vale.
    $this->actingAs($comercial->user)->post(route('comercial.cotizaciones.store'), payloadCotizacionAerea(
        $cliente->toArray(),
        [
            'descripcion' => 'Flete',
            'tipo_tarifa_unidad' => 'Per Kg',
            'costo_unitario' => 0.01, // manipulado: la tarifa real vale 5.50
            'base_calculo' => 100,
            'moneda' => 'BOB', // manipulado: la tarifa real es USD
            'bloqueada' => true,
            'id_tarifa' => $tarifa->id_tarifa,
            'origen_campo' => 'costo_base',
            'comision_openaccess' => 0,
        ],
    ))->assertRedirect();

    $detalle = CotizacionDetalle::where('descripcion', 'Flete')->firstOrFail();

    expect((float) $detalle->costo_unitario)->toBe(5.50);
    expect($detalle->moneda)->toBe('USD');
});

test('una tarifa que vencio entre que se aplico en el wizard y se guardo la cotizacion es rechazada', function () {
    ['comercial' => $comercial, 'cliente' => $cliente, 'tarifa' => $tarifa] = comercialConClienteYTarifaAerea([
        'fecha_inicio_vigencia' => now()->subDays(30),
        'fecha_fin_vigencia' => now()->subDay(), // ya venció justo antes de guardar
    ]);
    // Una segunda tarifa activa para la misma ruta/modo — así el chequeo
    // previo de "existe una tarifa para esta ruta" pasa igual, y el error
    // que interesa probar es específicamente el de la línea referenciada.
    crearTarifa(['modo' => 'Aereo']);

    $respuesta = $this->actingAs($comercial->user)->post(route('comercial.cotizaciones.store'), payloadCotizacionAerea(
        $cliente->toArray(),
        [
            'descripcion' => 'Flete',
            'tipo_tarifa_unidad' => 'Per Kg',
            'costo_unitario' => 5.50,
            'base_calculo' => 100,
            'moneda' => 'USD',
            'bloqueada' => true,
            'id_tarifa' => $tarifa->id_tarifa,
            'origen_campo' => 'costo_base',
            'comision_openaccess' => 0,
        ],
    ));

    $respuesta->assertSessionHasErrors('detalle');
    expect(CotizacionDetalle::where('descripcion', 'Flete')->exists())->toBeFalse();
});

test('una tarifa de un proveedor inactivo es rechazada aunque la fecha siga vigente', function () {
    ['comercial' => $comercial, 'cliente' => $cliente, 'tarifa' => $tarifa] = comercialConClienteYTarifaAerea();
    // Una segunda tarifa activa para la misma ruta/modo — así el chequeo
    // previo de "existe una tarifa para esta ruta" pasa igual, y el error
    // que interesa probar es específicamente el de la línea referenciada.
    crearTarifa(['modo' => 'Aereo']);
    $tarifa->proveedor->update(['activo' => false]);

    $this->actingAs($comercial->user)->post(route('comercial.cotizaciones.store'), payloadCotizacionAerea(
        $cliente->toArray(),
        [
            'descripcion' => 'Flete',
            'tipo_tarifa_unidad' => 'Per Kg',
            'costo_unitario' => 5.50,
            'base_calculo' => 100,
            'moneda' => 'USD',
            'bloqueada' => true,
            'id_tarifa' => $tarifa->id_tarifa,
            'origen_campo' => 'costo_base',
            'comision_openaccess' => 0,
        ],
    ))->assertSessionHasErrors('detalle');

    expect(CotizacionDetalle::where('descripcion', 'Flete')->exists())->toBeFalse();
});

test('una linea manual sin referencia a tarifa se guarda tal cual la mando el comercial', function () {
    ['comercial' => $comercial, 'cliente' => $cliente] = comercialConClienteYTarifaAerea();

    // Sin id_tarifa/origen_campo — costo ad hoc tipeado a mano, no viene de
    // ninguna tarifa cargada, así que no hay nada contra qué revalidarlo.
    $this->actingAs($comercial->user)->post(route('comercial.cotizaciones.store'), payloadCotizacionAerea(
        $cliente->toArray(),
        [
            'descripcion' => 'Cargo extra acordado con el cliente',
            'tipo_tarifa_unidad' => 'Flat',
            'costo_unitario' => 42,
            'base_calculo' => 1,
            'moneda' => 'USD',
            'comision_openaccess' => 0,
        ],
    ))->assertRedirect();

    $detalle = CotizacionDetalle::where('descripcion', 'Cargo extra acordado con el cliente')->firstOrFail();

    expect((float) $detalle->costo_unitario)->toBe(42.0);
});
