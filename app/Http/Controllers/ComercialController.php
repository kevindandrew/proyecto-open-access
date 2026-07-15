<?php

namespace App\Http\Controllers;

use App\Models\Cotizacion;
use App\Models\Embarque;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ComercialController extends Controller
{
    public function dashboard(): Response
    {
        $idComercial = Auth::user()->empleado->id_empleado;

        $ultimasCotizaciones = Cotizacion::with('cliente')
            ->where('id_comercial', $idComercial)
            ->orderByDesc('id_cotizacion')
            ->limit(10)
            ->get()
            ->map(fn (Cotizacion $cotizacion) => [
                'id_cotizacion' => $cotizacion->id_cotizacion,
                'numero_referencia' => $cotizacion->numero_referencia,
                'cliente' => $cotizacion->cliente?->razon_social,
                'modo_transporte' => $cotizacion->modo_transporte,
                'fecha_validez' => $cotizacion->fecha_validez->toDateString(),
                'estado' => $cotizacion->estado,
            ]);

        return Inertia::render('ComercialDashboard/Index', [
            'contadores' => [
                'cotizacionesActivas' => Cotizacion::where('id_comercial', $idComercial)
                    ->where('estado', 'Cotizado')
                    ->count(),
                'aceptadasEsteMes' => Cotizacion::where('id_comercial', $idComercial)
                    ->where('estado', 'Aceptado')
                    ->whereYear('fecha_emision', now()->year)
                    ->whereMonth('fecha_emision', now()->month)
                    ->count(),
                'embarquesActivos' => Embarque::where('id_comercial', $idComercial)
                    ->where('estado_embarque', '!=', 'Cerrado')
                    ->count(),
                'porVencer' => Cotizacion::where('id_comercial', $idComercial)
                    ->where('estado', 'Cotizado')
                    ->whereDate('fecha_validez', '<=', Carbon::today()->addDays(3))
                    ->count(),
            ],
            'ultimasCotizaciones' => $ultimasCotizaciones,
        ]);
    }
}
