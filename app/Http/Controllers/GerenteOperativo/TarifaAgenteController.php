<?php

namespace App\Http\Controllers\GerenteOperativo;

use App\Http\Controllers\Controller;
use App\Models\Proveedor;
use App\Models\PuertoAeropuerto;
use App\Models\TarifaAgente;
use App\Support\EstadoTarifa;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TarifaAgenteController extends Controller
{
    public function index(): Response
    {
        $hoy = Carbon::today();
        $vencePronto = $hoy->copy()->addDays(5);

        $tarifasAgente = TarifaAgente::with(['proveedor', 'origen', 'destino', 'costos'])
            ->orderBy('fecha_fin_vigencia')
            ->get()
            ->flatMap(fn (TarifaAgente $tarifa) => $tarifa->costos->map(fn ($costo) => [
                'id_tarifa_agente' => $tarifa->id_tarifa_agente,
                'id_costo' => $costo->id_costo,
                'agente' => $tarifa->proveedor?->nombre,
                'origen' => $tarifa->origen?->nombre,
                'destino' => $tarifa->destino?->nombre,
                'modo' => $tarifa->modo,
                'concepto' => $costo->concepto,
                'costo' => $costo->costo,
                'moneda' => $costo->moneda,
                'valido_desde' => $this->fechaEs($tarifa->fecha_inicio_vigencia),
                'valido_hasta' => $this->fechaEs($tarifa->fecha_fin_vigencia),
                'estado' => EstadoTarifa::de($tarifa->fecha_fin_vigencia, $hoy, $vencePronto),
            ]));

        return Inertia::render('GerenteOperativo/Tarifas/IndexAgentes', [
            'tarifasAgente' => $tarifasAgente->values(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('GerenteOperativo/Tarifas/FormAgente', [
            'tarifaAgente' => null,
            'agentes' => $this->agentesOptions(),
            'puertos' => $this->puertosOptions(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validado($request);

        $tarifaAgente = TarifaAgente::create($data['tarifa']);
        $this->sincronizarCostos($tarifaAgente, $data['costos']);

        return redirect()
            ->route('gerente-operativo.tarifas-agente.index')
            ->with('success', 'Tarifa de agente creada correctamente.');
    }

    public function edit(TarifaAgente $tarifaAgente): Response
    {
        $tarifaAgente->load('costos');

        return Inertia::render('GerenteOperativo/Tarifas/FormAgente', [
            'tarifaAgente' => [
                'id_tarifa_agente' => $tarifaAgente->id_tarifa_agente,
                'id_proveedor' => $tarifaAgente->id_proveedor,
                'id_origen' => $tarifaAgente->id_origen,
                'id_destino' => $tarifaAgente->id_destino,
                'modo' => $tarifaAgente->modo,
                'observaciones' => $tarifaAgente->observaciones,
                'fecha_inicio_vigencia' => $tarifaAgente->fecha_inicio_vigencia->toDateString(),
                'fecha_fin_vigencia' => $tarifaAgente->fecha_fin_vigencia->toDateString(),
                'costos' => $tarifaAgente->costos->map(fn ($costo) => [
                    'concepto' => $costo->concepto,
                    'costo' => $costo->costo,
                    'moneda' => $costo->moneda,
                ]),
            ],
            'agentes' => $this->agentesOptions($tarifaAgente->id_proveedor),
            'puertos' => $this->puertosOptions([$tarifaAgente->id_origen, $tarifaAgente->id_destino]),
        ]);
    }

    public function update(Request $request, TarifaAgente $tarifaAgente): RedirectResponse
    {
        $data = $this->validado($request);

        $tarifaAgente->update($data['tarifa']);
        $this->sincronizarCostos($tarifaAgente, $data['costos']);

        return redirect()
            ->route('gerente-operativo.tarifas-agente.index')
            ->with('success', 'Tarifa de agente actualizada correctamente.');
    }

    public function destroy(TarifaAgente $tarifaAgente): RedirectResponse
    {
        $tarifaAgente->delete();

        return redirect()
            ->route('gerente-operativo.tarifas-agente.index')
            ->with('success', 'Tarifa de agente eliminada correctamente.');
    }

    private function sincronizarCostos(TarifaAgente $tarifaAgente, array $costos): void
    {
        $tarifaAgente->costos()->delete();

        foreach ($costos as $costo) {
            $tarifaAgente->costos()->create($costo);
        }
    }

    private function validado(Request $request): array
    {
        $validated = $request->validate([
            'id_proveedor' => [
                'required',
                'integer',
                Rule::exists('proveedores', 'id_proveedor')->where('tipo', 'Agente_Origen'),
            ],
            'modo' => ['required', Rule::in(['Maritimo', 'Aereo', 'Terrestre'])],
            'id_origen' => ['nullable', 'string', 'exists:puertos_aeropuertos,codigo'],
            'id_destino' => ['nullable', 'string', 'exists:puertos_aeropuertos,codigo'],
            'observaciones' => ['nullable', 'string'],
            'fecha_inicio_vigencia' => ['required', 'date'],
            'fecha_fin_vigencia' => ['required', 'date', 'after_or_equal:fecha_inicio_vigencia'],
            'costos' => ['array', 'min:1'],
            'costos.*.concepto' => ['required', 'string', 'max:100'],
            'costos.*.costo' => ['required', 'numeric'],
            'costos.*.moneda' => ['required', 'string', 'max:5'],
        ]);

        return [
            'tarifa' => collect($validated)
                ->only(['id_proveedor', 'modo', 'id_origen', 'id_destino', 'observaciones', 'fecha_inicio_vigencia', 'fecha_fin_vigencia'])
                ->toArray(),
            'costos' => $validated['costos'],
        ];
    }

    private function agentesOptions(?int $incluirId = null)
    {
        return Proveedor::select('id_proveedor', 'nombre')
            ->where('tipo', 'Agente_Origen')
            ->where(fn ($query) => $query->where('activo', true)->when($incluirId, fn ($q, $id) => $q->orWhere('id_proveedor', $id)))
            ->orderBy('nombre')
            ->get();
    }

    private function puertosOptions(array $incluirCodigos = [])
    {
        $incluirCodigos = array_values(array_filter($incluirCodigos));

        return PuertoAeropuerto::select('codigo', 'nombre', 'tipo')
            ->where(fn ($query) => $query->where('activo', true)->when($incluirCodigos, fn ($q) => $q->orWhereIn('codigo', $incluirCodigos)))
            ->orderBy('nombre')
            ->get();
    }

    private function fechaEs(Carbon $fecha): string
    {
        return str_replace('.', '', $fecha->locale('es')->isoFormat('D MMM YYYY'));
    }
}
