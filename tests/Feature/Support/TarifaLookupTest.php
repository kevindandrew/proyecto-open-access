<?php

use App\Support\TarifaLookup;

test('disponibles excluye tarifas vencidas', function () {
    $vencida = crearTarifa([
        'fecha_inicio_vigencia' => now()->subDays(30),
        'fecha_fin_vigencia' => now()->subDay(),
    ]);

    $vigente = crearTarifa();

    $resultado = TarifaLookup::disponibles(['modo_transporte' => 'Maritimo']);

    expect($resultado->pluck('id_tarifa'))->not->toContain($vencida->id_tarifa);
    expect($resultado->pluck('id_tarifa'))->toContain($vigente->id_tarifa);
});

test('disponibles excluye tarifas que todavia no entraron en vigencia', function () {
    $futura = crearTarifa([
        'fecha_inicio_vigencia' => now()->addDays(5),
        'fecha_fin_vigencia' => now()->addDays(35),
    ]);

    $vigente = crearTarifa();

    $resultado = TarifaLookup::disponibles(['modo_transporte' => 'Maritimo']);

    expect($resultado->pluck('id_tarifa'))->not->toContain($futura->id_tarifa);
    expect($resultado->pluck('id_tarifa'))->toContain($vigente->id_tarifa);
});

test('disponibles excluye tarifas de proveedores inactivos', function () {
    $proveedorInactivo = crearProveedor('Naviera', ['activo' => false]);
    $tarifaInactiva = crearTarifa(['id_proveedor' => $proveedorInactivo->id_proveedor]);

    $vigente = crearTarifa();

    $resultado = TarifaLookup::disponibles(['modo_transporte' => 'Maritimo']);

    expect($resultado->pluck('id_tarifa'))->not->toContain($tarifaInactiva->id_tarifa);
    expect($resultado->pluck('id_tarifa'))->toContain($vigente->id_tarifa);
});

test('existeParaRuta distingue por modo de transporte', function () {
    crearTarifa(['modo' => 'Maritimo']);

    expect(TarifaLookup::existeParaRuta(['modo_transporte' => 'Maritimo']))->toBeTrue();
    expect(TarifaLookup::existeParaRuta(['modo_transporte' => 'Aereo']))->toBeFalse();
});
