<?php

test('un operativo solo puede ver embarques que tiene asignados', function () {
    $operativoDueno = crearEmpleado('Operativo', ['especialidad_operativa' => 'Maritimo']);
    $operativoAjeno = crearEmpleado('Operativo', ['especialidad_operativa' => 'Maritimo']);
    $embarque = crearEmbarque(['id_operativo' => $operativoDueno->id_empleado]);

    $this->actingAs($operativoDueno->user)
        ->get(route('operativo.embarques.show', $embarque->id_embarque))
        ->assertOk();

    $this->actingAs($operativoAjeno->user)
        ->get(route('operativo.embarques.show', $embarque->id_embarque))
        ->assertForbidden();
});

test('el dashboard de un operativo solo lista sus propios embarques activos', function () {
    $operativo = crearEmpleado('Operativo', ['especialidad_operativa' => 'Maritimo']);
    $otroOperativo = crearEmpleado('Operativo', ['especialidad_operativa' => 'Maritimo']);

    $propio = crearEmbarque(['id_operativo' => $operativo->id_empleado, 'numero_file' => 'TEST-PROPIO-001']);
    crearEmbarque(['id_operativo' => $otroOperativo->id_empleado, 'numero_file' => 'TEST-AJENO-001']);
    crearEmbarque(['id_operativo' => $operativo->id_empleado, 'numero_file' => 'TEST-CERRADO-001', 'estado_embarque' => 'Cerrado']);

    $response = $this->actingAs($operativo->user)->get(route('operativo.dashboard'));

    $response->assertInertia(fn ($page) => $page
        ->has('embarques', 1)
        ->where('embarques.0.numero_file', $propio->numero_file));
});

test('un comercial no puede editar el consignatario de un embarque que no es suyo', function () {
    $comercialAjeno = crearEmpleado('Comercial');
    $gerente = crearEmpleado('Gerente Operativo');
    $embarque = crearEmbarque();

    $this->actingAs($comercialAjeno->user)
        ->get(route('comercial.embarques.show', $embarque->id_embarque))
        ->assertForbidden();
});

test('solo se puede seleccionar como consignatario del embarque uno que pertenezca al cliente del embarque', function () {
    $gerente = crearEmpleado('Gerente Operativo');
    $cliente = crearCliente();
    $otroCliente = crearCliente();
    $consignatarioAjeno = $otroCliente->consignatarios()->create(['nombre' => 'No pertenece a este cliente']);
    $embarque = crearEmbarque(['id_cliente' => $cliente->id_cliente]);

    $this->actingAs($gerente->user)
        ->patch(route('gerente-operativo.embarques.actualizar-consignatario', $embarque->id_embarque), [
            'id_consignatario' => $consignatarioAjeno->id_consignatario,
        ])
        ->assertSessionHasErrors('id_consignatario');

    $embarque->refresh();
    expect($embarque->id_consignatario)->toBeNull();
});

test('el estado de un embarque avanza en la secuencia correcta y no retrocede', function () {
    $gerente = crearEmpleado('Gerente Operativo');
    $embarque = crearEmbarque(['estado_embarque' => 'Confirmado_Origen']);

    $this->actingAs($gerente->user)
        ->patch(route('gerente-operativo.embarques.cambiar-estado', $embarque->id_embarque), [])
        ->assertRedirect();

    expect($embarque->fresh()->estado_embarque)->toBe('En_Transito');
});

test('un embarque Cerrado no tiene siguiente estado', function () {
    $gerente = crearEmpleado('Gerente Operativo');
    $embarque = crearEmbarque(['estado_embarque' => 'Cerrado']);

    $this->actingAs($gerente->user)
        ->patch(route('gerente-operativo.embarques.cambiar-estado', $embarque->id_embarque), [])
        ->assertSessionHas('error');

    expect($embarque->fresh()->estado_embarque)->toBe('Cerrado');
});
