<?php

use App\Support\AvisoArriboPdfDatos;

function embarqueConHouseYContenedores(): array
{
    $gerente = crearEmpleado('Gerente Operativo');
    $cliente = crearCliente();
    $naviera = crearProveedor('Naviera');
    $embarque = crearEmbarque([
        'id_cliente' => $cliente->id_cliente,
        'id_naviera_aerolinea' => $naviera->id_proveedor,
        'shipper_nombre' => 'Shipper de Prueba',
        'mbl' => 'MEDUTEST123456',
    ]);

    $contenedor = $embarque->contenedores()->create([
        'tipo_contenedor' => '40 HC',
        'numero_contenedor' => 'TEST1234567',
        'peso_kg' => 4000,
        'volumen_cbm' => 25,
    ]);

    $house = $embarque->houseBls()->create([
        'numero_hbl' => 'TEST-HBL-'.fake()->unique()->numerify('####'),
        'condicion_pago' => 'Collect',
        'flete_valor_texto' => 'AS AGREED',
        'fecha_emision' => now(),
    ]);
    $house->contenedores()->sync([$contenedor->id_item]);

    return compact('gerente', 'cliente', 'embarque', 'contenedor', 'house');
}

test('los 6 tipos de PDF de house BL se generan sin excepcion', function () {
    ['gerente' => $gerente, 'house' => $house] = embarqueConHouseYContenedores();

    $this->actingAs($gerente->user);

    foreach (['dam', 'copia', 'original', 'original_digital', 'certificado_flete', 'certificado_flete_digital'] as $tipo) {
        $this->get(route('gerente-operativo.houses.pdf', $house->id_hbl).'?tipo='.$tipo)
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');
    }

    // El HBL Original queda congelado la primera vez que se emite.
    expect($house->fresh()->congelado_en)->not->toBeNull();
});

test('el aviso de arribo se genera sin excepcion y cuenta cada contenedor compartido una sola vez', function () {
    ['gerente' => $gerente, 'embarque' => $embarque, 'contenedor' => $contenedorCompartido] = embarqueConHouseYContenedores();

    // Un segundo house comparte el mismo contenedor físico (caso real de
    // 2 consignatarios en un mismo contenedor).
    $segundoHouse = $embarque->houseBls()->create([
        'numero_hbl' => 'TEST-HBL-B-'.fake()->unique()->numerify('####'),
        'condicion_pago' => 'Collect',
    ]);
    $segundoHouse->contenedores()->sync([$contenedorCompartido->id_item]);

    $datos = AvisoArriboPdfDatos::para($embarque->fresh());

    expect($datos['resumenContenedores'])->toBe('1X40HC');

    $this->actingAs($gerente->user)
        ->get(route('gerente-operativo.embarques.aviso-arribo', $embarque->id_embarque))
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf');
});

test('cada modo de transporte de embarque genera correctamente el PDF de aviso de arribo', function () {
    $gerente = crearEmpleado('Gerente Operativo');

    foreach (['Maritimo', 'Aereo', 'Terrestre'] as $modo) {
        $embarque = crearEmbarque(['modo_transporte' => $modo]);

        $this->actingAs($gerente->user)
            ->get(route('gerente-operativo.embarques.aviso-arribo', $embarque->id_embarque))
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');
    }
});
