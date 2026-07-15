<?php

namespace App\Http\Controllers\Comercial;

use App\Http\Controllers\Controller;
use App\Models\Embarque;
use App\Models\SeguimientoEmbarque;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class EmbarqueController extends Controller
{
    public function index(Request $request): Response
    {
        $idComercial = Auth::user()->empleado->id_empleado;

        $embarques = Embarque::with('cliente')
            ->where('id_comercial', $idComercial)
            ->orderByDesc('id_embarque')
            ->get()
            ->map(fn (Embarque $embarque) => [
                'id_embarque' => $embarque->id_embarque,
                'numero_file' => $embarque->numero_file,
                'cliente' => $embarque->cliente?->razon_social,
                'modo_transporte' => $embarque->modo_transporte,
                'estado_embarque' => $embarque->estado_embarque,
                'eta' => $embarque->eta?->toDateString(),
            ]);

        return Inertia::render('Comercial/Embarques/Index', [
            'embarques' => $embarques,
        ]);
    }

    public function show(Embarque $embarque): Response
    {
        $idComercial = Auth::user()->empleado->id_empleado;

        abort_unless($embarque->id_comercial === $idComercial, 403);

        $embarque->load([
            'cliente', 'comercial', 'operativo', 'agenteOrigen', 'navieraAerolinea', 'pol', 'pod',
            'seguimientos' => fn ($query) => $query->orderByDesc('fecha')->with('empleadoResponsable'),
        ]);

        return Inertia::render('Comercial/Embarques/Show', [
            'embarque' => [
                'id_embarque' => $embarque->id_embarque,
                'numero_file' => $embarque->numero_file,
                'cliente' => $embarque->cliente?->razon_social,
                'consignatario' => $embarque->consignatario,
                'comercial' => $embarque->comercial?->nombre_completo,
                'operativo' => $embarque->operativo?->nombre_completo,
                'agente_origen' => $embarque->agenteOrigen?->nombre,
                'naviera_aerolinea' => $embarque->navieraAerolinea?->nombre,
                'modo_transporte' => $embarque->modo_transporte,
                'tipo_embarque' => $embarque->tipo_embarque,
                'mbl' => $embarque->mbl,
                'pol' => $embarque->pol?->nombre,
                'pod' => $embarque->pod?->nombre,
                'destino_final' => $embarque->destino_final,
                'etd' => $embarque->etd?->toDateString(),
                'eta' => $embarque->eta?->toDateString(),
                'nave' => $embarque->nave,
                'viaje' => $embarque->viaje,
                'pago_master' => $embarque->pago_master,
                'estado_embarque' => $embarque->estado_embarque,
                'siguiente_estado' => null,
            ],
            'seguimientos' => $embarque->seguimientos->map(fn (SeguimientoEmbarque $seguimiento) => [
                'id_seguimiento' => $seguimiento->id_seguimiento,
                'fecha' => $seguimiento->fecha->format('Y-m-d H:i'),
                'estado' => $seguimiento->estado,
                'comentario' => $seguimiento->comentario,
                'empleado' => $seguimiento->empleadoResponsable?->nombre_completo,
            ]),
        ]);
    }
}
