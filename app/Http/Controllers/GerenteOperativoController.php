<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Models\Cotizacion;
use App\Models\Embarque;
use App\Models\EmbarqueCosto;
use App\Models\PuertoAeropuerto;
use App\Models\SeguimientoEmbarque;
use App\Support\SecuenciaEstadoEmbarque;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class GerenteOperativoController extends Controller
{
    private const ESTADOS_COTIZACION = ['Cotizado', 'Aceptado', 'Rechazado', 'Vencido'];

    public function dashboard(): Response
    {
        $cotizacionesPorEstado = Cotizacion::selectRaw('estado, count(*) as total')
            ->groupBy('estado')
            ->pluck('total', 'estado');

        $embarquesPorEstado = Embarque::selectRaw('estado_embarque, count(*) as total')
            ->groupBy('estado_embarque')
            ->pluck('total', 'estado_embarque');

        $profit = (float) EmbarqueCosto::selectRaw('COALESCE(SUM(costo_venta - costo_compra), 0) as profit')->value('profit');

        return Inertia::render('GerenteOperativo/Index', [
            'nombre' => explode(' ', Auth::user()->name)[0],
            'contadores' => [
                'totalClientes' => Cliente::count(),
                'cotizacionesActivas' => (int) $cotizacionesPorEstado->get('Cotizado', 0),
                'cotizacionesAceptadas' => (int) $cotizacionesPorEstado->get('Aceptado', 0),
                'cotizacionesRechazadas' => (int) $cotizacionesPorEstado->get('Rechazado', 0),
                'embarquesEnTransito' => (int) $embarquesPorEstado->get('En_Transito', 0),
                'embarquesEntregados' => (int) $embarquesPorEstado->get('Entregado', 0),
                'profit' => $profit,
            ],
            'estadoCotizaciones' => collect(self::ESTADOS_COTIZACION)->map(fn (string $estado) => [
                'estado' => $estado,
                'total' => (int) $cotizacionesPorEstado->get($estado, 0),
            ]),
            'estadoEmbarques' => collect(SecuenciaEstadoEmbarque::ESTADOS)->map(fn (string $estado) => [
                'estado' => $estado,
                'total' => (int) $embarquesPorEstado->get($estado, 0),
            ]),
            'actividadReciente' => $this->actividadReciente(),
            'topRutas' => $this->topRutas(),
            'proximasLlegadas' => $this->proximasLlegadas(),
        ]);
    }

    private function actividadReciente(): array
    {
        $seguimientos = SeguimientoEmbarque::with('embarque')
            ->latest('fecha')
            ->limit(5)
            ->get()
            ->map(fn (SeguimientoEmbarque $s) => [
                'titulo' => $s->comentario ?: "Estado actualizado a {$s->estado}",
                'subtitulo' => $s->embarque?->numero_file,
                'fecha' => $s->fecha,
            ]);

        $cotizaciones = Cotizacion::with('cliente')
            ->latest('created_at')
            ->limit(3)
            ->get()
            ->map(fn (Cotizacion $c) => [
                'titulo' => 'Nueva Cotización',
                'subtitulo' => trim("{$c->numero_referencia} — {$c->cliente?->razon_social}"),
                'fecha' => $c->created_at,
            ]);

        return $seguimientos->concat($cotizaciones)
            ->sortByDesc('fecha')
            ->take(6)
            ->map(fn (array $item) => [
                'titulo' => $item['titulo'],
                'subtitulo' => $item['subtitulo'],
                'fecha' => $item['fecha']->locale('es')->diffForHumans(),
            ])
            ->values()
            ->all();
    }

    private function topRutas()
    {
        $filas = DB::table('embarque_costos')
            ->join('embarques', 'embarques.id_embarque', '=', 'embarque_costos.id_embarque')
            ->whereNotNull('embarques.id_pol')
            ->whereNotNull('embarques.id_pod')
            ->groupBy('embarques.id_pol', 'embarques.id_pod')
            ->selectRaw('embarques.id_pol, embarques.id_pod, SUM(embarque_costos.costo_venta) as valor, COUNT(DISTINCT embarques.id_embarque) as total_embarques')
            ->orderByDesc('valor')
            ->limit(5)
            ->get();

        $codigos = $filas->pluck('id_pol')->merge($filas->pluck('id_pod'))->unique();
        $nombresPuerto = PuertoAeropuerto::whereIn('codigo', $codigos)->pluck('nombre', 'codigo');

        $maximo = (float) $filas->max('valor') ?: 1;

        return $filas->map(fn ($fila) => [
            'ruta' => ($nombresPuerto[$fila->id_pol] ?? $fila->id_pol).' → '.($nombresPuerto[$fila->id_pod] ?? $fila->id_pod),
            'total_embarques' => (int) $fila->total_embarques,
            'valor' => (float) $fila->valor,
            'porcentaje' => round(((float) $fila->valor / $maximo) * 100),
        ])->values();
    }

    private function proximasLlegadas()
    {
        return Embarque::with('cliente')
            ->where('estado_embarque', '!=', 'Cerrado')
            ->whereNotNull('eta')
            ->orderBy('eta')
            ->limit(5)
            ->get()
            ->map(fn (Embarque $embarque) => [
                'id_embarque' => $embarque->id_embarque,
                'numero_file' => $embarque->numero_file,
                'destino' => $embarque->destino_final ?? $embarque->cliente?->razon_social,
                'eta' => $embarque->eta->toDateString(),
                'dias' => now()->startOfDay()->diffInDays($embarque->eta->startOfDay(), false),
                'estado_embarque' => $embarque->estado_embarque,
            ]);
    }
}
