<?php

use App\Support\MontoEnLetras;

test('convierte montos reales verificados contra los PDFs que envió el cliente', function () {
    expect(MontoEnLetras::para(214.14, 'USD'))->toBe('DOSCIENTOS CATORCE 14/100 Dólares Americanos');
    expect(MontoEnLetras::para(2595.38, 'BOB'))->toBe('DOS MIL QUINIENTOS NOVENTA Y CINCO 38/100 Bolivianos');
});

test('maneja cero, cifras redondas y millones', function () {
    expect(MontoEnLetras::para(0, 'USD'))->toBe('CERO 00/100 Dólares Americanos');
    expect(MontoEnLetras::para(100, 'USD'))->toBe('CIEN 00/100 Dólares Americanos');
    expect(MontoEnLetras::para(1000, 'USD'))->toBe('MIL 00/100 Dólares Americanos');
    expect(MontoEnLetras::para(1_500_000.50, 'USD'))->toBe('UN MILLON QUINIENTOS MIL 50/100 Dólares Americanos');
});

test('nunca confunde USD con BOB', function () {
    expect(MontoEnLetras::para(10, 'USD'))->toContain('Dólares Americanos');
    expect(MontoEnLetras::para(10, 'BOB'))->toContain('Bolivianos');
});
