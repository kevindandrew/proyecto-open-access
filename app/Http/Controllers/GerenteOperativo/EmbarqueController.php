<?php

namespace App\Http\Controllers\GerenteOperativo;

use App\Http\Controllers\Controller;
use App\Models\Embarque;
use App\Models\Empleado;
use App\Models\SeguimientoEmbarque;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class EmbarqueController extends Controller
{
    private const ESTADOS = [
        'Confirmado_Origen',
        'En_Transito',
        'En_Aduana_Destino',
        'Entregado',
        'Cerrado',
    ];

    private const MODOS = ['Maritimo', 'Aereo', 'Terrestre'];

    public function index(Request $request): Response
    {
        $filtros = $request->only(['id_operativo', 'modo_transporte', 'estado_embarque']);

        $embarques = Embarque::with(['cliente', 'operativo'])
            ->when($filtros['id_operativo'] ?? null, fn ($q, $id) => $q->where('id_operativo', $id))
            ->when($filtros['modo_transporte'] ?? null, fn ($q, $modo) => $q->where('modo_transporte', $modo))
            ->when($filtros['estado_embarque'] ?? null, fn ($q, $estado) => $q->where('estado_embarque', $estado))
            ->orderByDesc('id_embarque')
            ->get()
            ->map(fn (Embarque $embarque) => [
                'id_embarque' => $embarque->id_embarque,
                'numero_file' => $embarque->numero_file,
                'cliente' => $embarque->cliente?->razon_social,
                'operativo' => $embarque->operativo?->nombre_completo,
                'modo_transporte' => $embarque->modo_transporte,
                'eta' => $embarque->eta?->toDateString(),
                'estado_embarque' => $embarque->estado_embarque,
            ]);

        return Inertia::render('GerenteOperativo/Embarques/Index', [
            'embarques' => $embarques,
            'filtros' => $filtros,
            'operativos' => Empleado::whereHas('rol', fn ($q) => $q->where('nombre_rol', 'Operativo'))
                ->orderBy('nombre_completo')
                ->get(['id_empleado', 'nombre_completo']),
            'modos' => self::MODOS,
            'estados' => self::ESTADOS,
        ]);
    }

    public function show(Embarque $embarque): Response
    {
        $embarque->load([
            'cliente', 'comercial', 'operativo', 'agenteOrigen', 'navieraAerolinea', 'pol', 'pod',
            'seguimientos' => fn ($query) => $query->orderByDesc('fecha')->with('empleadoResponsable'),
        ]);

        return Inertia::render('GerenteOperativo/Embarques/Show', [
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
                'siguiente_estado' => $this->siguienteEstado($embarque->estado_embarque),
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

    public function cambiarEstado(Request $request, Embarque $embarque): RedirectResponse
    {
        $siguiente = $this->siguienteEstado($embarque->estado_embarque);

        if (! $siguiente) {
            return redirect()
                ->route('gerente-operativo.embarques.show', $embarque->id_embarque)
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
            ->route('gerente-operativo.embarques.show', $embarque->id_embarque)
            ->with('success', "Estado actualizado a \"{$siguiente}\".");
    }

    private function siguienteEstado(string $actual): ?string
    {
        $index = array_search($actual, self::ESTADOS, true);

        return $index !== false && isset(self::ESTADOS[$index + 1])
            ? self::ESTADOS[$index + 1]
            : null;
    }
}
