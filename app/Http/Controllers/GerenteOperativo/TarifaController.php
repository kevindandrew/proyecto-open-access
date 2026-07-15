<?php

namespace App\Http\Controllers\GerenteOperativo;

use App\Http\Controllers\Controller;
use App\Models\Proveedor;
use App\Models\PuertoAeropuerto;
use App\Models\Tarifa;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TarifaController extends Controller
{
    public function index(): Response
    {
        $vencePronto = Carbon::today()->addDays(5);

        $tarifas = Tarifa::with(['proveedor', 'origen', 'destino'])
            ->orderBy('fecha_fin_vigencia')
            ->get()
            ->map(fn (Tarifa $tarifa) => [
                'id_tarifa' => $tarifa->id_tarifa,
                'proveedor' => $tarifa->proveedor?->nombre,
                'modo' => $tarifa->modo,
                'origen' => $tarifa->origen?->codigo,
                'destino' => $tarifa->destino?->codigo,
                'costo_20' => $tarifa->costo_20,
                'costo_40' => $tarifa->costo_40,
                'costo_40hc' => $tarifa->costo_40hc,
                'moneda' => $tarifa->moneda,
                'tipo_tarifa' => $tarifa->tipo_tarifa,
                'fecha_fin_vigencia' => $tarifa->fecha_fin_vigencia->toDateString(),
                'por_vencer' => $tarifa->fecha_fin_vigencia->lessThanOrEqualTo($vencePronto),
            ]);

        return Inertia::render('GerenteOperativo/Tarifas/Index', [
            'tarifas' => $tarifas,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('GerenteOperativo/Tarifas/Form', [
            'tarifa' => null,
            'proveedores' => $this->proveedoresOptions(),
            'puertos' => $this->puertosOptions(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);

        $tarifa = Tarifa::create($data['tarifa']);

        foreach ($data['cargos_adicionales'] as $cargo) {
            $tarifa->cargosAdicionales()->create($cargo);
        }

        return redirect()->route('gerente-operativo.tarifas.index')
            ->with('success', 'Tarifa creada correctamente.');
    }

    public function edit(Tarifa $tarifa): Response
    {
        $tarifa->load('cargosAdicionales');

        return Inertia::render('GerenteOperativo/Tarifas/Form', [
            'tarifa' => [
                'id_tarifa' => $tarifa->id_tarifa,
                'id_proveedor' => $tarifa->id_proveedor,
                'id_origen' => $tarifa->id_origen,
                'id_destino' => $tarifa->id_destino,
                'modo' => $tarifa->modo,
                'tipo_servicio' => $tarifa->tipo_servicio,
                'costo_20' => $tarifa->costo_20,
                'costo_40' => $tarifa->costo_40,
                'costo_40hc' => $tarifa->costo_40hc,
                'moneda' => $tarifa->moneda,
                'tipo_tarifa' => $tarifa->tipo_tarifa,
                'fecha_inicio_vigencia' => $tarifa->fecha_inicio_vigencia->toDateString(),
                'fecha_fin_vigencia' => $tarifa->fecha_fin_vigencia->toDateString(),
                'cargos_adicionales' => $tarifa->cargosAdicionales->map(fn ($cargo) => [
                    'id_cargo' => $cargo->id_cargo,
                    'concepto' => $cargo->concepto,
                    'monto' => $cargo->monto,
                ]),
            ],
            'proveedores' => $this->proveedoresOptions(),
            'puertos' => $this->puertosOptions(),
        ]);
    }

    public function update(Request $request, Tarifa $tarifa): RedirectResponse
    {
        $data = $this->validated($request);

        $tarifa->update($data['tarifa']);

        $tarifa->cargosAdicionales()->delete();
        foreach ($data['cargos_adicionales'] as $cargo) {
            $tarifa->cargosAdicionales()->create($cargo);
        }

        return redirect()->route('gerente-operativo.tarifas.index')
            ->with('success', 'Tarifa actualizada correctamente.');
    }

    public function destroy(Tarifa $tarifa): RedirectResponse
    {
        $tarifa->delete();

        return redirect()->route('gerente-operativo.tarifas.index')
            ->with('success', 'Tarifa eliminada correctamente.');
    }

    private function validated(Request $request): array
    {
        $validated = $request->validate([
            'id_proveedor' => ['required', 'integer', 'exists:proveedores,id_proveedor'],
            'id_origen' => ['nullable', 'string', 'exists:puertos_aeropuertos,codigo'],
            'id_destino' => ['nullable', 'string', 'exists:puertos_aeropuertos,codigo'],
            'modo' => ['required', Rule::in(['Maritimo', 'Aereo', 'Terrestre'])],
            'tipo_servicio' => ['nullable', Rule::in(['FCL', 'LCL'])],
            'costo_20' => ['nullable', 'numeric'],
            'costo_40' => ['nullable', 'numeric'],
            'costo_40hc' => ['nullable', 'numeric'],
            'moneda' => ['required', 'string', 'max:5'],
            'tipo_tarifa' => ['required', 'string', 'max:20'],
            'fecha_inicio_vigencia' => ['required', 'date'],
            'fecha_fin_vigencia' => ['required', 'date', 'after_or_equal:fecha_inicio_vigencia'],
            'cargos_adicionales' => ['array'],
            'cargos_adicionales.*.concepto' => ['required', 'string', 'max:100'],
            'cargos_adicionales.*.monto' => ['required', 'numeric'],
        ]);

        return [
            'tarifa' => collect($validated)->except('cargos_adicionales')->toArray(),
            'cargos_adicionales' => $validated['cargos_adicionales'] ?? [],
        ];
    }

    private function proveedoresOptions()
    {
        return Proveedor::select('id_proveedor', 'nombre', 'tipo')
            ->orderBy('nombre')
            ->get();
    }

    private function puertosOptions()
    {
        return PuertoAeropuerto::select('codigo', 'nombre', 'tipo')
            ->orderBy('nombre')
            ->get();
    }
}
