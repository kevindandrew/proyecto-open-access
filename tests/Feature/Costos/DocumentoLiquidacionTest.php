<?php

use App\Models\DocumentoLiquidacion;
use App\Support\TiposDocumentoLiquidacion;

function embarqueConCostoYGasto(): array
{
    $gerente = crearEmpleado('Gerente Operativo');
    $cliente = crearCliente();
    $proveedor = crearProveedor();
    $embarque = crearEmbarque(['id_cliente' => $cliente->id_cliente]);

    $costo = $embarque->costos()->create([
        'concepto' => 'Ocean Freight',
        'id_proveedor' => $proveedor->id_proveedor,
        'costo_compra' => 1800,
        'costo_venta' => 2400,
        'moneda' => 'USD',
    ]);

    $gasto = $embarque->gastosDestino()->create([
        'concepto' => 'Arancel',
        'monto' => 350,
        'moneda' => 'USD',
    ]);

    return compact('gerente', 'cliente', 'proveedor', 'embarque', 'costo', 'gasto');
}

test('generar una nota de cobranza toma el costo_venta del costo, no el costo_compra', function () {
    ['gerente' => $gerente, 'cliente' => $cliente, 'embarque' => $embarque, 'costo' => $costo, 'gasto' => $gasto] = embarqueConCostoYGasto();

    $this->actingAs($gerente->user)->post(
        route('gerente-operativo.documentos-liquidacion.store', $embarque->id_embarque),
        [
            'tipo' => 'nota_cobranza',
            'id_cliente' => $cliente->id_cliente,
            'lineas' => [
                ['tipo_origen' => 'costo', 'id_origen' => $costo->id_costo],
                ['tipo_origen' => 'gasto', 'id_origen' => $gasto->id_gasto],
            ],
        ],
    )->assertRedirect();

    $documento = DocumentoLiquidacion::where('id_embarque', $embarque->id_embarque)->where('tipo', 'nota_cobranza')->first();

    expect($documento)->not->toBeNull();
    // 2400 (costo_venta) + 350 (gasto) — nunca el costo_compra.
    expect((float) $documento->monto)->toBe(2750.0);
    expect($documento->numero)->toStartWith('NC-');
});

test('generar una orden de pago toma el costo_compra del costo, no el costo_venta', function () {
    ['gerente' => $gerente, 'proveedor' => $proveedor, 'embarque' => $embarque, 'costo' => $costo, 'gasto' => $gasto] = embarqueConCostoYGasto();

    $this->actingAs($gerente->user)->post(
        route('gerente-operativo.documentos-liquidacion.store', $embarque->id_embarque),
        [
            'tipo' => 'orden_pago',
            'id_proveedor' => $proveedor->id_proveedor,
            'lineas' => [
                ['tipo_origen' => 'costo', 'id_origen' => $costo->id_costo],
                ['tipo_origen' => 'gasto', 'id_origen' => $gasto->id_gasto],
            ],
        ],
    )->assertRedirect();

    $documento = DocumentoLiquidacion::where('id_embarque', $embarque->id_embarque)->where('tipo', 'orden_pago')->first();

    // 1800 (costo_compra) + 350 (gasto) — nunca el costo_venta.
    expect((float) $documento->monto)->toBe(2150.0);
    expect($documento->numero)->toStartWith('OP-');
});

test('no se puede generar un documento mezclando lineas de distinta moneda', function () {
    ['gerente' => $gerente, 'cliente' => $cliente, 'embarque' => $embarque, 'costo' => $costoUsd] = embarqueConCostoYGasto();

    $costoBob = $embarque->costos()->create([
        'concepto' => 'Flete Terrestre', 'costo_compra' => 100, 'costo_venta' => 150, 'moneda' => 'BOB',
    ]);

    $this->actingAs($gerente->user)->post(
        route('gerente-operativo.documentos-liquidacion.store', $embarque->id_embarque),
        [
            'tipo' => 'nota_cobranza',
            'id_cliente' => $cliente->id_cliente,
            'lineas' => [
                ['tipo_origen' => 'costo', 'id_origen' => $costoUsd->id_costo],
                ['tipo_origen' => 'costo', 'id_origen' => $costoBob->id_costo],
            ],
        ],
    )->assertSessionHasErrors('lineas');

    expect(DocumentoLiquidacion::where('id_embarque', $embarque->id_embarque)->count())->toBe(0);
});

test('la numeracion correlativa de cada tipo de documento es unica e incremental', function () {
    ['gerente' => $gerente, 'cliente' => $cliente, 'embarque' => $embarque, 'costo' => $costo] = embarqueConCostoYGasto();
    $otroEmbarque = crearEmbarque(['id_cliente' => $cliente->id_cliente]);
    $otroCosto = $otroEmbarque->costos()->create(['concepto' => 'Ocean Freight', 'costo_venta' => 500, 'costo_compra' => 400, 'moneda' => 'USD']);

    $generar = fn ($embarque, $costo) => $this->actingAs($gerente->user)->post(
        route('gerente-operativo.documentos-liquidacion.store', $embarque->id_embarque),
        [
            'tipo' => 'nota_cobranza',
            'id_cliente' => $cliente->id_cliente,
            'lineas' => [['tipo_origen' => 'costo', 'id_origen' => $costo->id_costo]],
        ],
    );

    $generar($embarque, $costo);
    $generar($otroEmbarque, $otroCosto);

    $numeros = DocumentoLiquidacion::where('tipo', 'nota_cobranza')->orderBy('id_documento')->pluck('numero');

    expect($numeros->unique())->toHaveCount($numeros->count());
    expect($numeros->last())->not->toBe($numeros->first());
});

test('cerrar la liquidacion bloquea costos, gastos y nuevos documentos pero no otras acciones del embarque', function () {
    ['gerente' => $gerente, 'cliente' => $cliente, 'embarque' => $embarque, 'costo' => $costo] = embarqueConCostoYGasto();

    $this->actingAs($gerente->user)
        ->get(route('gerente-operativo.embarques.liquidacion.cerrar', $embarque->id_embarque))
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf');

    $embarque->refresh();
    expect($embarque->liquidacion_cerrada_en)->not->toBeNull();

    $this->post(route('gerente-operativo.embarques.costos.store', $embarque->id_embarque), [
        'concepto' => 'Nuevo', 'moneda' => 'USD',
    ])->assertForbidden();

    $this->post(route('gerente-operativo.documentos-liquidacion.store', $embarque->id_embarque), [
        'tipo' => 'nota_cobranza',
        'id_cliente' => $cliente->id_cliente,
        'lineas' => [['tipo_origen' => 'costo', 'id_origen' => $costo->id_costo]],
    ])->assertForbidden();

    // El estado del embarque, en cambio, sigue editable normalmente.
    $this->patch(route('gerente-operativo.embarques.cambiar-estado', $embarque->id_embarque), [])
        ->assertRedirect();
});

test('los 9 tipos de documento de liquidacion generan un PDF valido', function () {
    ['gerente' => $gerente, 'cliente' => $cliente, 'proveedor' => $proveedor, 'embarque' => $embarque] = embarqueConCostoYGasto();

    $this->actingAs($gerente->user);

    // Una línea de costo/gasto solo puede usarse una vez por categoría (ver
    // el test de doble facturación), así que cada tipo necesita su propia
    // línea de origen para no chocar con el bloqueo de doble uso.
    foreach (TiposDocumentoLiquidacion::valores() as $tipo) {
        $esCobro = TiposDocumentoLiquidacion::esCobro($tipo);

        $costo = $embarque->costos()->create([
            'concepto' => "Costo para {$tipo}",
            'id_proveedor' => $proveedor->id_proveedor,
            'costo_compra' => 1800,
            'costo_venta' => 2400,
            'moneda' => 'USD',
        ]);

        $this->post(route('gerente-operativo.documentos-liquidacion.store', $embarque->id_embarque), [
            'tipo' => $tipo,
            'id_cliente' => $esCobro ? $cliente->id_cliente : null,
            'id_proveedor' => $esCobro ? null : $proveedor->id_proveedor,
            'lineas' => [
                ['tipo_origen' => 'costo', 'id_origen' => $costo->id_costo],
            ],
        ])->assertRedirect();

        $documento = DocumentoLiquidacion::where('id_embarque', $embarque->id_embarque)->where('tipo', $tipo)->firstOrFail();

        $this->get(route('gerente-operativo.documentos-liquidacion.pdf', $documento->id_documento))
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');
    }
});

test('una linea de costo no se puede facturar dos veces en dos notas de cobranza', function () {
    ['gerente' => $gerente, 'cliente' => $cliente, 'embarque' => $embarque, 'costo' => $costo] = embarqueConCostoYGasto();

    $generar = fn () => $this->actingAs($gerente->user)->post(
        route('gerente-operativo.documentos-liquidacion.store', $embarque->id_embarque),
        [
            'tipo' => 'nota_cobranza',
            'id_cliente' => $cliente->id_cliente,
            'lineas' => [['tipo_origen' => 'costo', 'id_origen' => $costo->id_costo]],
        ],
    );

    $generar()->assertRedirect();
    $generar()->assertSessionHasErrors('lineas');

    expect(DocumentoLiquidacion::where('id_embarque', $embarque->id_embarque)->where('tipo', 'nota_cobranza')->count())->toBe(1);
});

test('una linea de costo no se puede pagar dos veces en dos ordenes de pago', function () {
    ['gerente' => $gerente, 'proveedor' => $proveedor, 'embarque' => $embarque, 'costo' => $costo] = embarqueConCostoYGasto();

    $generar = fn () => $this->actingAs($gerente->user)->post(
        route('gerente-operativo.documentos-liquidacion.store', $embarque->id_embarque),
        [
            'tipo' => 'orden_pago',
            'id_proveedor' => $proveedor->id_proveedor,
            'lineas' => [['tipo_origen' => 'costo', 'id_origen' => $costo->id_costo]],
        ],
    );

    $generar()->assertRedirect();
    $generar()->assertSessionHasErrors('lineas');

    expect(DocumentoLiquidacion::where('id_embarque', $embarque->id_embarque)->where('tipo', 'orden_pago')->count())->toBe(1);
});

test('una linea usada ya en un documento de cobro se puede usar tambien en uno de pago, y viceversa', function () {
    ['gerente' => $gerente, 'cliente' => $cliente, 'proveedor' => $proveedor, 'embarque' => $embarque, 'costo' => $costo] = embarqueConCostoYGasto();

    $this->actingAs($gerente->user)->post(
        route('gerente-operativo.documentos-liquidacion.store', $embarque->id_embarque),
        [
            'tipo' => 'nota_cobranza',
            'id_cliente' => $cliente->id_cliente,
            'lineas' => [['tipo_origen' => 'costo', 'id_origen' => $costo->id_costo]],
        ],
    )->assertRedirect();

    // Misma línea de costo, ahora usada para pagarle al proveedor — es el
    // uso dual legítimo (cobrar al cliente y pagar al proveedor por la
    // misma línea), no debe ser rechazado.
    $this->actingAs($gerente->user)->post(
        route('gerente-operativo.documentos-liquidacion.store', $embarque->id_embarque),
        [
            'tipo' => 'orden_pago',
            'id_proveedor' => $proveedor->id_proveedor,
            'lineas' => [['tipo_origen' => 'costo', 'id_origen' => $costo->id_costo]],
        ],
    )->assertRedirect();

    expect(DocumentoLiquidacion::where('id_embarque', $embarque->id_embarque)->count())->toBe(2);
});

test('distintas notas de cobranza sobre lineas distintas del mismo embarque conviven sin problema', function () {
    ['gerente' => $gerente, 'cliente' => $cliente, 'embarque' => $embarque, 'costo' => $costo, 'gasto' => $gasto] = embarqueConCostoYGasto();

    $this->actingAs($gerente->user)->post(
        route('gerente-operativo.documentos-liquidacion.store', $embarque->id_embarque),
        [
            'tipo' => 'nota_cobranza',
            'id_cliente' => $cliente->id_cliente,
            'lineas' => [['tipo_origen' => 'costo', 'id_origen' => $costo->id_costo]],
        ],
    )->assertRedirect();

    $this->actingAs($gerente->user)->post(
        route('gerente-operativo.documentos-liquidacion.store', $embarque->id_embarque),
        [
            'tipo' => 'nota_cobranza',
            'id_cliente' => $cliente->id_cliente,
            'lineas' => [['tipo_origen' => 'gasto', 'id_origen' => $gasto->id_gasto]],
        ],
    )->assertRedirect();

    expect(DocumentoLiquidacion::where('id_embarque', $embarque->id_embarque)->where('tipo', 'nota_cobranza')->count())->toBe(2);
});
