<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind a different classes or traits.
|
*/

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

function crearRol(string $nombre): \App\Models\RoleEmpleado
{
    return \App\Models\RoleEmpleado::firstOrCreate(['nombre_rol' => $nombre]);
}

/**
 * Crea un Empleado con su User asociado (login por username, como en toda
 * la app real) y devuelve el Empleado con la relación `user` ya cargada.
 */
function crearEmpleado(string $rolNombre, array $atributos = []): \App\Models\Empleado
{
    $rol = crearRol($rolNombre);

    $empleado = \App\Models\Empleado::create(array_merge([
        'nombre_completo' => fake()->name(),
        'email' => fake()->unique()->safeEmail(),
        'id_rol' => $rol->id_rol,
        'activo' => true,
    ], $atributos));

    \App\Models\User::factory()->create([
        'name' => $empleado->nombre_completo,
        'username' => \Illuminate\Support\Str::lower(\Illuminate\Support\Str::random(10)),
        'email' => $empleado->email,
        'empleado_id' => $empleado->id_empleado,
    ]);

    return $empleado->fresh('user');
}

function crearCliente(array $atributos = []): \App\Models\Cliente
{
    return \App\Models\Cliente::create(array_merge([
        'razon_social' => fake()->unique()->company(),
        'condicion_pago' => 'Al contado',
    ], $atributos));
}

function crearProveedor(string $tipo = 'Naviera', array $atributos = []): \App\Models\Proveedor
{
    return \App\Models\Proveedor::create(array_merge([
        'nombre' => fake()->unique()->company(),
        'tipo' => $tipo,
        'activo' => true,
    ], $atributos));
}

function crearEmbarque(array $atributos = []): \App\Models\Embarque
{
    return \App\Models\Embarque::create(array_merge([
        'numero_file' => 'TEST-'.fake()->unique()->numerify('######'),
        'id_cliente' => crearCliente()->id_cliente,
        'modo_transporte' => 'Maritimo',
    ], $atributos));
}

function crearTarifa(array $atributos = []): \App\Models\Tarifa
{
    return \App\Models\Tarifa::create(array_merge([
        'id_proveedor' => crearProveedor()->id_proveedor,
        'modo' => 'Maritimo',
        'tipo_servicio' => 'FCL',
        'costo_base' => 1000,
        'moneda' => 'USD',
        'fecha_inicio_vigencia' => now()->subDays(10),
        'fecha_fin_vigencia' => now()->addDays(20),
    ], $atributos));
}
