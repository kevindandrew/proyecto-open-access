<?php

use App\Http\Controllers\Comercial\ClienteController;
use App\Http\Controllers\Comercial\CotizacionController;
use App\Http\Controllers\Comercial\EmbarqueController as ComercialEmbarqueController;
use App\Http\Controllers\ComercialController;
use App\Http\Controllers\GerenteOperativo\EmbarqueController;
use App\Http\Controllers\GerenteOperativo\GastoDestinoController;
use App\Http\Controllers\GerenteOperativo\TarifaController;
use App\Http\Controllers\GerenteOperativoController;
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
        Route::post('cotizaciones', [CotizacionController::class, 'store'])->name('cotizaciones.store');
        Route::get('cotizaciones/{cotizacion}', [CotizacionController::class, 'show'])->name('cotizaciones.show');
        Route::patch('cotizaciones/{cotizacion}/estado', [CotizacionController::class, 'cambiarEstado'])->name('cotizaciones.cambiar-estado');
        Route::post('cotizaciones/{cotizacion}/convertir', [CotizacionController::class, 'convertirEnEmbarque'])->name('cotizaciones.convertir');

        Route::get('embarques', [ComercialEmbarqueController::class, 'index'])->name('embarques.index');
        Route::get('embarques/{embarque}', [ComercialEmbarqueController::class, 'show'])->name('embarques.show');
    });

Route::middleware(['auth', 'verified', 'role.empleado:Operativo'])
    ->get('/operativo', fn () => Inertia::render('Operativo/Index'))
    ->name('operativo.dashboard');

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

        Route::get('embarques', [EmbarqueController::class, 'index'])->name('embarques.index');
        Route::get('embarques/{embarque}', [EmbarqueController::class, 'show'])->name('embarques.show');
        Route::patch('embarques/{embarque}/estado', [EmbarqueController::class, 'cambiarEstado'])->name('embarques.cambiar-estado');
        Route::get('embarques/{embarque}/gastos', [GastoDestinoController::class, 'index'])->name('embarques.gastos.index');
        Route::post('embarques/{embarque}/gastos', [GastoDestinoController::class, 'store'])->name('embarques.gastos.store');
        Route::patch('gastos/{gasto}/pagar', [GastoDestinoController::class, 'marcarPagado'])->name('gastos.pagar');
    });

require __DIR__.'/auth.php';
