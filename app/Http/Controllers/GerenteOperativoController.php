<?php

namespace App\Http\Controllers;

use App\Models\Embarque;
use App\Models\GastoDestino;
use App\Models\Tarifa;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class GerenteOperativoController extends Controller
{
    private const ESTADOS = [
        'Confirmado_Origen',
        'En_Transito',
        'En_Aduana_Destino',
        'Entregado',
        'Cerrado',
    ];

    public function dashboard(): Response
    {
        $embarquesPorEstado = Embarque::with('cliente')
            ->orderByDesc('id_embarque')
            ->get()
            ->groupBy('estado_embarque');

        $kanban = collect(self::ESTADOS)->mapWithKeys(function (string $estado) use ($embarquesPorEstado) {
            $items = $embarquesPorEstado->get($estado, collect())->map(fn (Embarque $embarque) => [
                'id_embarque' => $embarque->id_embarque,
                'numero_file' => $embarque->numero_file,
                'cliente' => $embarque->cliente?->razon_social,
                'modo_transporte' => $embarque->modo_transporte,
            ])->values();

            return [$estado => $items];
        });

        return Inertia::render('GerenteOperativo/Index', [
            'contadores' => [
                'embarquesActivos' => Embarque::where('estado_embarque', '!=', 'Cerrado')->count(),
                'embarquesEnAduana' => Embarque::where('estado_embarque', 'En_Aduana_Destino')->count(),
                'tarifasPorVencer' => Tarifa::whereDate('fecha_fin_vigencia', '<=', Carbon::today()->addDays(5))->count(),
                'gastosPendientes' => GastoDestino::where('pagado', false)->count(),
            ],
            'kanban' => $kanban,
            'estados' => self::ESTADOS,
        ]);
    }
}
