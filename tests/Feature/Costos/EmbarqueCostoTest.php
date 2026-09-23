<?php

use App\Models\Embarque;

test('un comercial no puede ver los costos de un embarque de otro comercial', function () {
    $comercialDueno = crearEmpleado('Comercial');
    $comercialAjeno = crearEmpleado('Comercial');
    $cliente = crearCliente(['id_comercial' => $comercialDueno->id_empleado]);
    $embarque = crearEmbarque(['id_cliente' => $cliente->id_cliente, 'id_comercial' => $comercialDueno->id_empleado]);

    $this->actingAs($comercialAjeno->user)
        ->get(route('comercial.embarques.show', $embarque->id_embarque))
        ->assertForbidden();
});

test('gerente operativo puede agregar un costo con compra y venta en distinta moneda cada linea', function () {
    $gerente = crearEmpleado('Gerente Operativo');
    $embarque = crearEmbarque();
    $proveedor = crearProveedor();

    $this->actingAs($gerente->user)->post(
        route('gerente-operativo.embarques.costos.store', $embarque->id_embarque),
        [
            'concepto' => 'Ocean Freight',
            'id_proveedor' => $proveedor->id_proveedor,
            'costo_compra' => 1800,
            'costo_venta' => 2400,
            'moneda' => 'USD',
        ],
    )->assertRedirect();

    $this->assertDatabaseHas('embarque_costos', [
        'id_embarque' => $embarque->id_embarque,
        'concepto' => 'Ocean Freight',
        'costo_compra' => 1800,
        'costo_venta' => 2400,
        'moneda' => 'USD',
    ]);
});

test('los totales de costos por embarque nunca mezclan monedas distintas', function () {
    $gerente = crearEmpleado('Gerente Operativo');
    $embarque = crearEmbarque();

    $embarque->costos()->create(['concepto' => 'Ocean Freight', 'costo_compra' => 1000, 'costo_venta' => 1200, 'moneda' => 'USD']);
    $embarque->costos()->create(['concepto' => 'Flete Terrestre', 'costo_compra' => 100, 'costo_venta' => 150, 'moneda' => 'BOB']);

    $response = $this->actingAs($gerente->user)->get(route('gerente-operativo.embarques.show', $embarque->id_embarque));

    $response->assertInertia(fn ($page) => $page
        ->where('totalesPorMoneda.USD.compra', fn ($valor) => (float) $valor === 1000.0)
        ->where('totalesPorMoneda.USD.venta', fn ($valor) => (float) $valor === 1200.0)
        ->where('totalesPorMoneda.BOB.compra', fn ($valor) => (float) $valor === 100.0)
        ->where('totalesPorMoneda.BOB.venta', fn ($valor) => (float) $valor === 150.0));
});

test('una vez cerrada la liquidacion no se pueden agregar, editar ni borrar costos', function () {
    $gerente = crearEmpleado('Gerente Operativo');
    $embarque = crearEmbarque(['liquidacion_cerrada_en' => now()]);
    $costo = $embarque->costos()->create(['concepto' => 'Ocean Freight', 'costo_compra' => 1000, 'costo_venta' => 1200, 'moneda' => 'USD']);

    $this->actingAs($gerente->user);

    $this->post(route('gerente-operativo.embarques.costos.store', $embarque->id_embarque), [
        'concepto' => 'Otro', 'moneda' => 'USD',
    ])->assertForbidden();

    $this->patch(route('gerente-operativo.costos.update', $costo->id_costo), [
        'concepto' => 'Editado', 'moneda' => 'USD',
    ])->assertForbidden();

    $this->delete(route('gerente-operativo.costos.destroy', $costo->id_costo))->assertForbidden();

    $this->assertDatabaseHas('embarque_costos', ['id_costo' => $costo->id_costo, 'concepto' => 'Ocean Freight']);
});
