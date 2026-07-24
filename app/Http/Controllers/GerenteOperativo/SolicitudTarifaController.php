<?php

namespace App\Http\Controllers\GerenteOperativo;

use App\Http\Controllers\Controller;
use App\Models\SolicitudTarifa;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SolicitudTarifaController extends Controller
{
    public function index(): Response
    {
        $solicitudes = SolicitudTarifa::with(['cliente', 'comercial', 'pol', 'pod'])
            ->orderByRaw("CASE WHEN estado = 'Pendiente' THEN 0 ELSE 1 END")
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (SolicitudTarifa $solicitud) => [
                'id_solicitud' => $solicitud->id_solicitud,
                'cliente' => $solicitud->cliente?->razon_social,
                'comercial' => $solicitud->comercial?->nombre_completo,
                'modo_transporte' => $solicitud->modo_transporte,
                'tipo_servicio' => $solicitud->tipo_servicio,
                'pol' => $solicitud->pol?->nombre,
                'pod' => $solicitud->pod?->nombre,
                'estado' => $solicitud->estado,
                'creado_en' => $solicitud->created_at->toDateString(),
            ]);

        return Inertia::render('GerenteOperativo/SolicitudesTarifa/Index', [
            'solicitudes' => $solicitudes,
        ]);
    }

    public function atender(SolicitudTarifa $solicitud): RedirectResponse
    {
        $solicitud->update(['estado' => 'Atendida']);

        return redirect()
            ->route('gerente-operativo.solicitudes-tarifa.index')
            ->with('success', 'Solicitud marcada como atendida.');
    }
}
