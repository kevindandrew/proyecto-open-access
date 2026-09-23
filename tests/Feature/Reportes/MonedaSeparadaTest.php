<?php

use App\Models\PuertoAeropuerto;

test('el profit del dashboard nunca mezcla monedas distintas', function () {
    $gerente = crearEmpleado('Gerente Operativo');
    $embarque = crearEmbarque();

    $embarque->costos()->create([
        'concepto' => 'Ocean Freight', 'costo_compra' => 1000, 'costo_venta' => 1500, 'moneda' => 'USD',
    ]);
    $embarque->costos()->create([
        'concepto' => 'Flete Terrestre', 'costo_compra' => 100, 'costo_venta' => 250, 'moneda' => 'BOB',
    ]);

    $respuesta = $this->actingAs($gerente->user)->get(route('gerente-operativo.dashboard'));

    $respuesta->assertOk();
    $profitPorMoneda = $respuesta->viewData('page')['props']['contadores']['profitPorMoneda'];

    // USD: 1500-1000=500. BOB: 250-100=150. Nunca 650 mezclado en una sola cifra.
    expect((float) $profitPorMoneda['USD'])->toBe(500.0);
    expect((float) $profitPorMoneda['BOB'])->toBe(150.0);
});

test('top rutas del dashboard separa cada moneda en su propia fila para la misma ruta', function () {
    $gerente = crearEmpleado('Gerente Operativo');

    $pol = PuertoAeropuerto::create(['codigo' => 'TEST-POL', 'nombre' => 'Puerto Origen Test', 'pais' => 'Bolivia', 'tipo' => 'Puerto']);
    $pod = PuertoAeropuerto::create(['codigo' => 'TEST-POD', 'nombre' => 'Puerto Destino Test', 'pais' => 'China', 'tipo' => 'Puerto']);

    $embarqueUsd = crearEmbarque(['id_pol' => $pol->codigo, 'id_pod' => $pod->codigo]);
    $embarqueUsd->costos()->create(['concepto' => 'Ocean Freight', 'costo_compra' => 1000, 'costo_venta' => 2000, 'moneda' => 'USD']);

    $embarqueBob = crearEmbarque(['id_pol' => $pol->codigo, 'id_pod' => $pod->codigo]);
    $embarqueBob->costos()->create(['concepto' => 'Flete Terrestre', 'costo_compra' => 100, 'costo_venta' => 300, 'moneda' => 'BOB']);

    $respuesta = $this->actingAs($gerente->user)->get(route('gerente-operativo.dashboard'));
    $respuesta->assertOk();

    $topRutas = collect($respuesta->viewData('page')['props']['topRutas']);
    $filasDeEstaRuta = $topRutas->filter(fn ($fila) => str_contains($fila['ruta'], 'Puerto Origen Test'));

    expect($filasDeEstaRuta)->toHaveCount(2);

    $filaUsd = $filasDeEstaRuta->firstWhere('moneda', 'USD');
    $filaBob = $filasDeEstaRuta->firstWhere('moneda', 'BOB');

    expect((float) $filaUsd['valor'])->toBe(2000.0);
    expect((float) $filaBob['valor'])->toBe(300.0);
});

test('top clientes de reportes separa el total de cada cliente por moneda', function () {
    $gerente = crearEmpleado('Gerente Operativo');
    $cliente = crearCliente(['razon_social' => 'Cliente Multi Moneda Test']);

    $embarqueUsd = crearEmbarque(['id_cliente' => $cliente->id_cliente]);
    $embarqueUsd->costos()->create(['concepto' => 'Ocean Freight', 'costo_compra' => 1000, 'costo_venta' => 1800, 'moneda' => 'USD']);

    $embarqueBob = crearEmbarque(['id_cliente' => $cliente->id_cliente]);
    $embarqueBob->costos()->create(['concepto' => 'Flete Terrestre', 'costo_compra' => 100, 'costo_venta' => 400, 'moneda' => 'BOB']);

    $respuesta = $this->actingAs($gerente->user)->get(route('gerente-operativo.reportes.index'));
    $respuesta->assertOk();

    $topClientes = collect($respuesta->viewData('page')['props']['topClientes']);

    $filaUsd = $topClientes->first(fn ($fila) => $fila->razon_social === 'Cliente Multi Moneda Test (USD)');
    $filaBob = $topClientes->first(fn ($fila) => $fila->razon_social === 'Cliente Multi Moneda Test (BOB)');

    expect($filaUsd)->not->toBeNull();
    expect($filaBob)->not->toBeNull();
    expect((float) $filaUsd->total)->toBe(1800.0);
    expect((float) $filaBob->total)->toBe(400.0);
});

test('profit por mes de reportes separa el profit del mismo mes por moneda', function () {
    $gerente = crearEmpleado('Gerente Operativo');

    $embarqueUsd = crearEmbarque();
    $embarqueUsd->costos()->create(['concepto' => 'Ocean Freight', 'costo_compra' => 1000, 'costo_venta' => 1700, 'moneda' => 'USD']);

    $embarqueBob = crearEmbarque();
    $embarqueBob->costos()->create(['concepto' => 'Flete Terrestre', 'costo_compra' => 100, 'costo_venta' => 350, 'moneda' => 'BOB']);

    $respuesta = $this->actingAs($gerente->user)->get(route('gerente-operativo.reportes.index'));
    $respuesta->assertOk();

    $profitPorMes = collect($respuesta->viewData('page')['props']['profitPorMes']);

    $mesActual = now()->locale('es')->isoFormat('MMM YYYY');
    $mesActual = str_replace('.', '', $mesActual);

    $filaUsd = $profitPorMes->first(fn ($fila) => $fila['mes'] === "{$mesActual} (USD)");
    $filaBob = $profitPorMes->first(fn ($fila) => $fila['mes'] === "{$mesActual} (BOB)");

    expect($filaUsd)->not->toBeNull();
    expect($filaBob)->not->toBeNull();
    expect((float) $filaUsd['profit'])->toBe(700.0);
    expect((float) $filaBob['profit'])->toBe(250.0);
});
