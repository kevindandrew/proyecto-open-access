<?php

namespace App\Http\Controllers\GerenteComercial;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use App\Models\Cotizacion;
use App\Models\Embarque;
use App\Models\Empleado;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $ultimasCotizaciones = Cotizacion::with(['cliente', 'comercial'])
            ->orderByDesc('id_cotizacion')
            ->limit(10)
            ->get()
            ->map(fn (Cotizacion $cotizacion) => [
                'id_cotizacion' => $cotizacion->id_cotizacion,
                'numero_referencia' => $cotizacion->numero_referencia,
                'cliente' => $cotizacion->cliente?->razon_social,
                'comercial' => $cotizacion->comercial?->nombre_completo,
                'modo_transporte' => $cotizacion->modo_transporte,
                'fecha_validez' => $cotizacion->fecha_validez->toDateString(),
                'estado' => $cotizacion->estado,
            ]);

        return Inertia::render('GerenteComercial/Index', [
            'contadores' => [
                'clientesActivos' => Cliente::count(),
                'comercialesActivos' => Empleado::whereHas('rol', fn ($query) => $query->where('nombre_rol', 'Comercial'))
                    ->where('activo', true)
                    ->count(),
                'cotizacionesActivas' => Cotizacion::where('estado', 'Cotizado')->count(),
                'aceptadasEsteMes' => Cotizacion::where('estado', 'Aceptado')
                    ->whereYear('fecha_emision', now()->year)
                    ->whereMonth('fecha_emision', now()->month)
                    ->count(),
                'embarquesActivos' => Embarque::where('estado_embarque', '!=', 'Cerrado')->count(),
                'porVencer' => Cotizacion::where('estado', 'Cotizado')
                    ->whereDate('fecha_validez', '<=', Carbon::today()->addDays(3))
                    ->count(),
            ],
            'ultimasCotizaciones' => $ultimasCotizaciones,
        ]);
    }
}
