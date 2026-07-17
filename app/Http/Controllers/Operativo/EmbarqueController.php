<?php

namespace App\Http\Controllers\Operativo;

use App\Http\Controllers\Controller;
use App\Models\Embarque;
use App\Models\EmbarqueContenedor;
use App\Models\SeguimientoEmbarque;
use App\Support\SecuenciaEstadoEmbarque;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class EmbarqueController extends Controller
{
    public function show(Embarque $embarque): Response
    {
        $this->autorizar($embarque);

        $embarque->load([
            'cliente', 'comercial', 'operativo', 'agenteOrigen', 'navieraAerolinea', 'pol', 'pod',
            'contenedores',
            'seguimientos' => fn ($query) => $query->orderByDesc('fecha')->with('empleadoResponsable'),
        ]);

        return Inertia::render('Operativo/Embarques/Show', [
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
                'siguiente_estado' => SecuenciaEstadoEmbarque::siguiente($embarque->estado_embarque),
            ],
            'contenedores' => $embarque->contenedores->map(fn (EmbarqueContenedor $contenedor) => [
                'tipo_contenedor' => $contenedor->tipo_contenedor,
                'numero_contenedor' => $contenedor->numero_contenedor,
                'numero_sello' => $contenedor->numero_sello,
                'peso_kg' => $contenedor->peso_kg,
                'volumen_cbm' => $contenedor->volumen_cbm,
            ]),
            'seguimientos' => $embarque->seguimientos->map(fn (SeguimientoEmbarque $seguimiento) => [
                'id_seguimiento' => $seguimiento->id_seguimiento,
                'fecha' => $seguimiento->fecha->format('Y-m-d H:i'),
                'estado' => $seguimiento->estado,
                'comentario' => $seguimiento->comentario,
                'empleado' => $seguimiento->empleadoResponsable?->nombre_completo,
            ]),
        ]);
    }

    public function cambiarEstado(Request $request, Embarque $embarque): RedirectResponse
    {
        $this->autorizar($embarque);

        $siguiente = SecuenciaEstadoEmbarque::siguiente($embarque->estado_embarque);

        if (! $siguiente) {
            return redirect()
                ->route('operativo.embarques.show', $embarque->id_embarque)
                ->with('error', 'Este embarque ya está cerrado, no tiene un siguiente estado.');
        }

        $data = $request->validate([
            'comentario' => ['nullable', 'string', 'max:500'],
        ]);

        DB::transaction(function () use ($embarque, $siguiente, $data) {
            $embarque->update(['estado_embarque' => $siguiente]);

            $embarque->seguimientos()->create([
                'fecha' => now(),
                'estado' => $siguiente,
                'comentario' => $data['comentario'] ?? null,
                'id_empleado_responsable' => Auth::user()->empleado?->id_empleado,
            ]);
        });

        return redirect()
            ->route('operativo.embarques.show', $embarque->id_embarque)
            ->with('success', "Estado actualizado a \"{$siguiente}\".");
    }

    private function autorizar(Embarque $embarque): void
    {
        $idOperativo = Auth::user()->empleado->id_empleado;

        abort_unless($embarque->id_operativo === $idOperativo, 403);
    }
}
