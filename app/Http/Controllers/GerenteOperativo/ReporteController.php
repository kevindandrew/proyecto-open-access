<?php

namespace App\Http\Controllers\GerenteOperativo;

use App\Http\Controllers\Controller;
use App\Models\Cotizacion;
use App\Models\Empleado;
use App\Models\Tarifa;
use App\Support\EstadoTarifa;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReporteController extends Controller
{
    private const MODOS = ['Maritimo', 'Aereo', 'Terrestre'];

    public function index(): Response
    {
        return Inertia::render('GerenteOperativo/Reportes/Index', [
            'embarquesPorModo' => $this->embarquesPorModo(),
            'tarifasPorEstado' => $this->tarifasPorEstado(),
            'personalPorRol' => $this->personalPorRol(),
            'topClientes' => $this->topClientes(),
            'cotizacionesPorMes' => $this->cotizacionesPorMes(),
            'profitPorMes' => $this->profitPorMes(),
        ]);
    }

    private function embarquesPorModo(): array
    {
        $conteos = DB::table('embarques')
            ->selectRaw('modo_transporte, count(*) as total')
            ->groupBy('modo_transporte')
            ->pluck('total', 'modo_transporte');

        return collect(self::MODOS)
            ->map(fn ($modo) => ['modo' => $modo, 'total' => (int) ($conteos[$modo] ?? 0)])
            ->toArray();
    }

    private function tarifasPorEstado(): array
    {
        $hoy = Carbon::today();
        $vencePronto = $hoy->copy()->addDays(5);

        $conteos = Tarifa::all()
            ->groupBy(fn (Tarifa $tarifa) => EstadoTarifa::de($tarifa->fecha_fin_vigencia, $hoy, $vencePronto))
            ->map->count();

        return collect(EstadoTarifa::ESTADOS)
            ->map(fn ($estado) => ['estado' => $estado, 'total' => (int) ($conteos[$estado] ?? 0)])
            ->toArray();
    }

    private function personalPorRol(): array
    {
        return Empleado::where('activo', true)
            ->with('rol')
            ->get()
            ->groupBy(fn (Empleado $empleado) => $empleado->rol?->nombre_rol ?? 'Sin rol')
            ->map(fn ($grupo, $rol) => ['rol' => $rol, 'total' => $grupo->count()])
            ->sortByDesc('total')
            ->values()
            ->toArray();
    }

    private function topClientes()
    {
        return DB::table('embarque_costos')
            ->join('embarques', 'embarque_costos.id_embarque', '=', 'embarques.id_embarque')
            ->join('clientes', 'embarques.id_cliente', '=', 'clientes.id_cliente')
            ->groupBy('clientes.id_cliente', 'clientes.razon_social')
            ->selectRaw('clientes.razon_social, COALESCE(SUM(embarque_costos.costo_venta), 0) as total')
            ->orderByDesc('total')
            ->limit(5)
            ->get();
    }

    private function cotizacionesPorMes()
    {
        return Cotizacion::selectRaw("to_char(fecha_emision, 'YYYY-MM') as mes, count(*) as total")
            ->groupBy('mes')
            ->orderBy('mes')
            ->get()
            ->map(fn ($fila) => ['mes' => $this->mesEs($fila->mes), 'total' => (int) $fila->total]);
    }

    private function profitPorMes()
    {
        return DB::table('embarque_costos')
            ->join('embarques', 'embarque_costos.id_embarque', '=', 'embarques.id_embarque')
            ->selectRaw("to_char(embarques.created_at, 'YYYY-MM') as mes, COALESCE(SUM(embarque_costos.costo_venta - embarque_costos.costo_compra), 0) as profit")
            ->groupBy('mes')
            ->orderBy('mes')
            ->get()
            ->map(fn ($fila) => ['mes' => $this->mesEs($fila->mes), 'profit' => (float) $fila->profit]);
    }

    private function mesEs(string $mes): string
    {
        return str_replace('.', '', Carbon::createFromFormat('Y-m', $mes)->locale('es')->isoFormat('MMM YYYY'));
    }
}
