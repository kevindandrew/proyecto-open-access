<?php

use App\Http\Controllers\Comercial\ClienteController;
use App\Http\Controllers\Comercial\CotizacionController;
use App\Http\Controllers\Comercial\EmbarqueController as ComercialEmbarqueController;
use App\Http\Controllers\ComercialController;
use App\Http\Controllers\GerenteOperativo\ClienteController as GerenteOperativoClienteController;
use App\Http\Controllers\GerenteOperativo\CotizacionController as GerenteOperativoCotizacionController;
use App\Http\Controllers\GerenteOperativo\EmbarqueController;
use App\Http\Controllers\GerenteOperativo\GastoDestinoController;
use App\Http\Controllers\GerenteOperativo\PersonalController;
use App\Http\Controllers\GerenteOperativo\ProveedorController;
use App\Http\Controllers\GerenteOperativo\PuertoController;
use App\Http\Controllers\GerenteOperativo\ReporteController;
use App\Http\Controllers\GerenteOperativo\TarifaController;
use App\Http\Controllers\GerenteOperativoController;
use App\Http\Controllers\Operativo\EmbarqueController as OperativoEmbarqueController;
use App\Http\Controllers\OperativoController;
use App\Http\Controllers\ProfileController;
use App\Support\RoleRedirector;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route(RoleRedirector::routeFor(Auth::user()));
    }

    return redirect()->route('login');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Placeholder dashboards for roles that don't have a real screen built yet.
// They exist so the post-login role redirect has somewhere valid to land.
Route::middleware(['auth', 'verified', 'role.empleado:Gerente Comercial'])
    ->get('/gerente-comercial', fn () => Inertia::render('GerenteComercial/Index'))
    ->name('gerente-comercial.dashboard');

Route::middleware(['auth', 'verified', 'role.empleado:Comercial'])
    ->prefix('comercial')
    ->name('comercial.')
    ->group(function () {
        Route::get('/', [ComercialController::class, 'dashboard'])->name('dashboard');

        Route::get('clientes', [ClienteController::class, 'index'])->name('clientes.index');
        Route::get('clientes/buscar', [ClienteController::class, 'buscar'])->name('clientes.buscar');
        Route::post('clientes', [ClienteController::class, 'store'])->name('clientes.store');

        Route::get('cotizaciones/nueva', [CotizacionController::class, 'create'])->name('cotizaciones.create');
        Route::get('cotizaciones/tarifas-disponibles', [CotizacionController::class, 'tarifasDisponibles'])->name('cotizaciones.tarifas-disponibles');
        Route::post('cotizaciones', [CotizacionController::class, 'store'])->name('cotizaciones.store');
        Route::get('cotizaciones/{cotizacion}', [CotizacionController::class, 'show'])->name('cotizaciones.show');
        Route::patch('cotizaciones/{cotizacion}/estado', [CotizacionController::class, 'cambiarEstado'])->name('cotizaciones.cambiar-estado');
        Route::post('cotizaciones/{cotizacion}/convertir', [CotizacionController::class, 'convertirEnEmbarque'])->name('cotizaciones.convertir');

        Route::get('embarques', [ComercialEmbarqueController::class, 'index'])->name('embarques.index');
        Route::get('embarques/{embarque}', [ComercialEmbarqueController::class, 'show'])->name('embarques.show');
    });

Route::middleware(['auth', 'verified', 'role.empleado:Operativo'])
    ->prefix('operativo')
    ->name('operativo.')
    ->group(function () {
        Route::get('/', [OperativoController::class, 'dashboard'])->name('dashboard');

        Route::get('embarques/{embarque}', [OperativoEmbarqueController::class, 'show'])->name('embarques.show');
        Route::patch('embarques/{embarque}/estado', [OperativoEmbarqueController::class, 'cambiarEstado'])->name('embarques.cambiar-estado');
    });

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified', 'role.empleado:Gerente Operativo'])
    ->prefix('gerente-operativo')
    ->name('gerente-operativo.')
    ->group(function () {
        Route::get('/', [GerenteOperativoController::class, 'dashboard'])->name('dashboard');

        Route::resource('tarifas', TarifaController::class)->except(['show']);

        Route::resource('personal', PersonalController::class)
            ->parameters(['personal' => 'empleado'])
            ->except(['show']);

        Route::get('clientes/buscar', [GerenteOperativoClienteController::class, 'buscar'])->name('clientes.buscar');
        Route::patch('clientes/{cliente}/reasignar', [GerenteOperativoClienteController::class, 'reasignar'])->name('clientes.reasignar');
        Route::resource('clientes', GerenteOperativoClienteController::class)
            ->except(['show']);

        Route::get('cotizaciones', [GerenteOperativoCotizacionController::class, 'index'])->name('cotizaciones.index');
        Route::get('cotizaciones/nueva', [GerenteOperativoCotizacionController::class, 'create'])->name('cotizaciones.create');
        Route::get('cotizaciones/tarifas-disponibles', [GerenteOperativoCotizacionController::class, 'tarifasDisponibles'])->name('cotizaciones.tarifas-disponibles');
        Route::post('cotizaciones', [GerenteOperativoCotizacionController::class, 'store'])->name('cotizaciones.store');
        Route::get('cotizaciones/{cotizacion}', [GerenteOperativoCotizacionController::class, 'show'])->name('cotizaciones.show');
        Route::patch('cotizaciones/{cotizacion}/estado', [GerenteOperativoCotizacionController::class, 'cambiarEstado'])->name('cotizaciones.cambiar-estado');
        Route::post('cotizaciones/{cotizacion}/convertir', [GerenteOperativoCotizacionController::class, 'convertirEnEmbarque'])->name('cotizaciones.convertir');

        Route::get('reportes', [ReporteController::class, 'index'])->name('reportes.index');

        Route::prefix('configuracion')->name('configuracion.')->group(function () {
            Route::resource('proveedores', ProveedorController::class)
                ->parameters(['proveedores' => 'proveedor'])
                ->except(['show']);
            Route::resource('puertos', PuertoController::class)->except(['show']);
        });

        Route::get('embarques', [EmbarqueController::class, 'index'])->name('embarques.index');
        Route::get('embarques/{embarque}', [EmbarqueController::class, 'show'])->name('embarques.show');
        Route::patch('embarques/{embarque}/estado', [EmbarqueController::class, 'cambiarEstado'])->name('embarques.cambiar-estado');
        Route::patch('embarques/{embarque}/operativo', [EmbarqueController::class, 'asignarOperativo'])->name('embarques.asignar-operativo');
        Route::get('embarques/{embarque}/gastos', [GastoDestinoController::class, 'index'])->name('embarques.gastos.index');
        Route::post('embarques/{embarque}/gastos', [GastoDestinoController::class, 'store'])->name('embarques.gastos.store');
        Route::patch('gastos/{gasto}/pagar', [GastoDestinoController::class, 'marcarPagado'])->name('gastos.pagar');
    });

require __DIR__.'/auth.php';
