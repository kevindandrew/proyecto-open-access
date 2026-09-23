<?php

use App\Models\Cotizacion;
use App\Models\Embarque;
use App\Models\EmbarqueCosto;

function cotizacionAceptada(array $atributos = []): array
{
    $comercial = crearEmpleado('Comercial');
    $cliente = crearCliente(['id_comercial' => $comercial->id_empleado]);

    $consignatarioPrincipal = $cliente->consignatarios()->create([
        'nombre' => 'Consignatario Principal',
        'nit' => '123456',
    ]);
    $cliente->consignatarios()->create(['nombre' => 'Otro Consignatario']);

    $cotizacion = Cotizacion::create(array_merge([
        'numero_referencia' => 'REF-'.fake()->unique()->numerify('######'),
        'id_cliente' => $cliente->id_cliente,
        'id_comercial' => $comercial->id_empleado,
        'modo_transporte' => 'Maritimo',
        'fecha_validez' => now()->addDays(15),
        'estado' => 'Aceptado',
    ], $atributos));

    return compact('comercial', 'cliente', 'consignatarioPrincipal', 'cotizacion');
}

test('convertir una cotizacion aceptada crea un embarque con el consignatario principal del cliente copiado', function () {
    ['comercial' => $comercial, 'cliente' => $cliente, 'consignatarioPrincipal' => $consignatario, 'cotizacion' => $cotizacion] = cotizacionAceptada();

    $this->actingAs($comercial->user)
        ->post(route('comercial.cotizaciones.convertir', $cotizacion->id_cotizacion))
        ->assertRedirect();

    $embarque = Embarque::where('id_cotizacion', $cotizacion->id_cotizacion)->first();

    expect($embarque)->not->toBeNull();
    expect($embarque->id_cliente)->toBe($cliente->id_cliente);
    expect($embarque->id_comercial)->toBe($comercial->id_empleado);
    expect($embarque->id_consignatario)->toBe($consignatario->id_consignatario);
    expect($embarque->consignatario_nombre)->toBe('Consignatario Principal');
    expect($embarque->numero_file)->not->toBeEmpty();
});

test('una cotizacion no se puede convertir dos veces', function () {
    ['comercial' => $comercial, 'cotizacion' => $cotizacion] = cotizacionAceptada();

    $this->actingAs($comercial->user)->post(route('comercial.cotizaciones.convertir', $cotizacion->id_cotizacion));

    expect(Embarque::where('id_cotizacion', $cotizacion->id_cotizacion)->count())->toBe(1);

    $this->actingAs($comercial->user)
        ->post(route('comercial.cotizaciones.convertir', $cotizacion->id_cotizacion))
        ->assertSessionHas('error');

    expect(Embarque::where('id_cotizacion', $cotizacion->id_cotizacion)->count())->toBe(1);
});

test('una cotizacion que no esta Aceptada no se puede convertir', function () {
    ['comercial' => $comercial, 'cotizacion' => $cotizacion] = cotizacionAceptada(['estado' => 'Cotizado']);

    $this->actingAs($comercial->user)
        ->post(route('comercial.cotizaciones.convertir', $cotizacion->id_cotizacion))
        ->assertSessionHas('error');

    expect(Embarque::where('id_cotizacion', $cotizacion->id_cotizacion)->exists())->toBeFalse();
});

test('un comercial no puede convertir la cotizacion de otro comercial', function () {
    ['cotizacion' => $cotizacion] = cotizacionAceptada();
    $otroComercial = crearEmpleado('Comercial');

    $this->actingAs($otroComercial->user)
        ->post(route('comercial.cotizaciones.convertir', $cotizacion->id_cotizacion))
        ->assertForbidden();
});

test('convertir una cotizacion copia cada linea de detalle a un EmbarqueCosto con la formula correcta', function () {
    ['comercial' => $comercial, 'cotizacion' => $cotizacion] = cotizacionAceptada();

    // costo_venta esperado = costo_total + comision_openaccess — nunca al revés,
    // y costo_compra = costo_total tal cual, sin la comisión.
    $cotizacion->detalle()->create([
        'nro_item' => 1,
        'descripcion' => 'Ocean Freight',
        'tipo_tarifa_unidad' => 'Contenedor',
        'costo_unitario' => 1800,
        'base_calculo' => 1,
        'moneda' => 'USD',
        'costo_total' => 1800,
        'comision_openaccess' => 200,
    ]);

    $cotizacion->detalle()->create([
        'nro_item' => 2,
        'descripcion' => 'Flete Terrestre',
        'tipo_tarifa_unidad' => 'Contenedor',
        'costo_unitario' => 100,
        'base_calculo' => 1,
        'moneda' => 'BOB',
        'costo_total' => 100,
        'comision_openaccess' => 0,
    ]);

    $this->actingAs($comercial->user)
        ->post(route('comercial.cotizaciones.convertir', $cotizacion->id_cotizacion))
        ->assertRedirect();

    $embarque = Embarque::where('id_cotizacion', $cotizacion->id_cotizacion)->firstOrFail();
    $costos = EmbarqueCosto::where('id_embarque', $embarque->id_embarque)->orderBy('id_costo')->get();

    expect($costos)->toHaveCount(2);

    $oceanFreight = $costos->firstWhere('concepto', 'Ocean Freight');
    expect((float) $oceanFreight->costo_compra)->toBe(1800.0);
    expect((float) $oceanFreight->costo_venta)->toBe(2000.0); // 1800 + 200 de comisión
    expect($oceanFreight->moneda)->toBe('USD');

    $fleteTerrestre = $costos->firstWhere('concepto', 'Flete Terrestre');
    expect((float) $fleteTerrestre->costo_compra)->toBe(100.0);
    expect((float) $fleteTerrestre->costo_venta)->toBe(100.0); // sin comisión
    expect($fleteTerrestre->moneda)->toBe('BOB');
});
