<?php

namespace App\Http\Controllers\GerenteOperativo;

use App\Http\Controllers\Controller;
use App\Models\Proveedor;
use App\Models\PuertoAeropuerto;
use App\Models\Tarifa;
use App\Support\EstadoTarifa;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;
use Inertia\Inertia;
use Inertia\Response;

class TarifaController extends Controller
{
    public function index(): Response
    {
        $hoy = Carbon::today();
        $vencePronto = $hoy->copy()->addDays(5);

        $tarifas = Tarifa::with(['proveedor', 'origen', 'destino', 'costos'])
            ->orderBy('fecha_fin_vigencia')
            ->get()
            ->flatMap(fn (Tarifa $tarifa) => $this->filasVisibles($tarifa, $hoy, $vencePronto));

        return Inertia::render('GerenteOperativo/Tarifas/Index', [
            'tarifas' => $tarifas->values(),
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

    private function proveedoresOptions(?int $incluirId = null)
    {
        return Proveedor::select('id_proveedor', 'nombre', 'tipo')
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

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validado($request);

        $tarifa = Tarifa::create($data['tarifa']);

        $this->sincronizarCostos($tarifa, $data);

        return redirect()->route('gerente-operativo.tarifas.index')
            ->with('success', 'Tarifa creada correctamente.');
    }

    public function edit(Tarifa $tarifa): Response
    {
        $tarifa->load('cargosAdicionales', 'costos');

        return Inertia::render('GerenteOperativo/Tarifas/Form', [
            'tarifa' => [
                'id_tarifa' => $tarifa->id_tarifa,
                'id_proveedor' => $tarifa->id_proveedor,
                'id_origen' => $tarifa->id_origen,
                'id_destino' => $tarifa->id_destino,
                'modo' => $tarifa->modo,
                'incluye_fcl' => str_contains((string) $tarifa->tipo_servicio, 'FCL'),
                'incluye_lcl' => str_contains((string) $tarifa->tipo_servicio, 'LCL'),
                'dias_transito' => $tarifa->dias_transito,
                'costo_base' => $tarifa->costo_base,
                'costo_tramite' => $tarifa->costo_tramite,
                'moneda_tramite' => $tarifa->moneda_tramite,
                'moneda' => $tarifa->moneda,
                'tipo_tarifa' => $tarifa->tipo_tarifa,
                'observaciones' => $tarifa->observaciones,
                'fecha_inicio_vigencia' => $tarifa->fecha_inicio_vigencia->toDateString(),
                'fecha_fin_vigencia' => $tarifa->fecha_fin_vigencia->toDateString(),
                'costos_fcl' => $tarifa->costos->where('tipo_servicio', 'FCL')->values()->map(fn ($costo) => [
                    'tipo_contenedor' => $costo->tipo_contenedor,
                    'costo' => $costo->costo,
                    'moneda' => $costo->moneda,
                ]),
                'costos_lcl' => $tarifa->costos->where('tipo_servicio', 'LCL')->values()->map(fn ($costo) => [
                    'costo' => $costo->costo,
                    'moneda' => $costo->moneda,
                ]),
                'cargos_adicionales' => $tarifa->cargosAdicionales->map(fn ($cargo) => [
                    'id_cargo' => $cargo->id_cargo,
                    'concepto' => $cargo->concepto,
                    'monto' => $cargo->monto,
                    'moneda' => $cargo->moneda,
                ]),
            ],
            'proveedores' => $this->proveedoresOptions($tarifa->id_proveedor),
            'puertos' => $this->puertosOptions([$tarifa->id_origen, $tarifa->id_destino]),
        ]);
    }

    public function update(Request $request, Tarifa $tarifa): RedirectResponse
    {
        $data = $this->validado($request);

        $tarifa->update($data['tarifa']);

        $this->sincronizarCostos($tarifa, $data);

        return redirect()->route('gerente-operativo.tarifas.index')
            ->with('success', 'Tarifa actualizada correctamente.');
    }

    public function destroy(Tarifa $tarifa): RedirectResponse
    {
        $tarifa->delete();

        return redirect()->route('gerente-operativo.tarifas.index')
            ->with('success', 'Tarifa eliminada correctamente.');
    }

    private function sincronizarCostos(Tarifa $tarifa, array $data): void
    {
        $tarifa->costos()->delete();

        foreach ($data['costos_fcl'] as $costo) {
            $tarifa->costos()->create([
                'tipo_servicio' => 'FCL',
                'tipo_contenedor' => $costo['tipo_contenedor'],
                'costo' => $costo['costo'],
                'moneda' => $costo['moneda'],
            ]);
        }

        foreach ($data['costos_lcl'] as $costo) {
            $tarifa->costos()->create([
                'tipo_servicio' => 'LCL',
                'tipo_contenedor' => null,
                'costo' => $costo['costo'],
                'moneda' => $costo['moneda'],
            ]);
        }

        $tarifa->cargosAdicionales()->delete();
        foreach ($data['cargos_adicionales'] as $cargo) {
            $tarifa->cargosAdicionales()->create($cargo);
        }
    }

    private function validado(Request $request): array
    {
        $validator = validator($request->all(), [
            'id_proveedor' => ['required', 'integer', 'exists:proveedores,id_proveedor'],
            'id_origen' => ['nullable', 'string', 'exists:puertos_aeropuertos,codigo'],
            'id_destino' => ['nullable', 'string', 'exists:puertos_aeropuertos,codigo'],
            'modo' => ['required', Rule::in(['Maritimo', 'Aereo', 'Terrestre'])],
            'incluye_fcl' => ['boolean'],
            'incluye_lcl' => ['boolean'],
            'dias_transito' => ['nullable', 'integer', 'min:0'],
            'costo_base' => ['nullable', 'numeric'],
            'costo_tramite' => ['nullable', 'numeric'],
            'moneda_tramite' => ['nullable', 'string', 'max:5'],
            'moneda' => ['required', 'string', 'max:5'],
            'tipo_tarifa' => ['required', 'string', 'max:20'],
            'observaciones' => ['nullable', 'string'],
            'fecha_inicio_vigencia' => ['required', 'date'],
            'fecha_fin_vigencia' => ['required', 'date', 'after_or_equal:fecha_inicio_vigencia'],
            'costos_fcl' => ['array'],
            'costos_fcl.*.tipo_contenedor' => ['required', 'string', 'max:20'],
            'costos_fcl.*.costo' => ['required', 'numeric'],
            'costos_fcl.*.moneda' => ['required', 'string', 'max:5'],
            'costos_lcl' => ['array'],
            'costos_lcl.*.costo' => ['required', 'numeric'],
            'costos_lcl.*.moneda' => ['required', 'string', 'max:5'],
            'cargos_adicionales' => ['array'],
            'cargos_adicionales.*.concepto' => ['required', 'string', 'max:100'],
            'cargos_adicionales.*.monto' => ['required', 'numeric'],
            'cargos_adicionales.*.moneda' => ['required', 'string', 'max:5'],
        ])->after(function (Validator $validator) use ($request) {
            $modo = $request->input('modo');
            $incluyeFcl = $request->boolean('incluye_fcl');
            $incluyeLcl = $request->boolean('incluye_lcl');

            if (in_array($modo, ['Maritimo', 'Terrestre'], true)) {
                if (! $incluyeFcl && ! $incluyeLcl) {
                    $validator->errors()->add('incluye_fcl', 'Seleccioná al menos FCL o LCL.');
                }

                if ($incluyeFcl && count($request->input('costos_fcl', [])) === 0) {
                    $validator->errors()->add('costos_fcl', 'Cargá al menos un costo por tipo de contenedor.');
                }

                if ($incluyeLcl && count($request->input('costos_lcl', [])) === 0) {
                    $validator->errors()->add('costos_lcl', 'Cargá al menos un costo LCL.');
                }
            } elseif ($modo === 'Aereo' && ! $request->filled('costo_base')) {
                $validator->errors()->add('costo_base', 'La tarifa por kilo es obligatoria para Aéreo.');
            }
        });

        $validated = $validator->validate();

        $modo = $validated['modo'];
        $incluyeFcl = $request->boolean('incluye_fcl');
        $incluyeLcl = $request->boolean('incluye_lcl');
        $esFclTerrestre = $modo === 'Terrestre' && $incluyeFcl;

        $tipoServicio = in_array($modo, ['Maritimo', 'Terrestre'], true)
            ? implode(',', array_filter([$incluyeFcl ? 'FCL' : null, $incluyeLcl ? 'LCL' : null]))
            : null;

        $tarifa = collect($validated)
            ->only([
                'id_proveedor', 'id_origen', 'id_destino', 'modo', 'dias_transito',
                'costo_base', 'moneda', 'tipo_tarifa', 'observaciones',
                'fecha_inicio_vigencia', 'fecha_fin_vigencia',
            ])
            ->toArray();

        $tarifa['tipo_servicio'] = $tipoServicio ?: null;
        $tarifa['costo_base'] = $modo === 'Aereo' ? ($tarifa['costo_base'] ?? null) : null;
        $tarifa['costo_tramite'] = $esFclTerrestre ? ($validated['costo_tramite'] ?? null) : null;
        $tarifa['moneda_tramite'] = $esFclTerrestre ? ($validated['moneda_tramite'] ?? null) : null;

        return [
            'tarifa' => $tarifa,
            'costos_fcl' => $incluyeFcl ? ($validated['costos_fcl'] ?? []) : [],
            'costos_lcl' => $incluyeLcl ? ($validated['costos_lcl'] ?? []) : [],
            'cargos_adicionales' => $validated['cargos_adicionales'] ?? [],
        ];
    }

    private function filasVisibles(Tarifa $tarifa, Carbon $hoy, Carbon $vencePronto): array
    {
        $base = [
            'id_tarifa' => $tarifa->id_tarifa,
            'modo' => $tarifa->modo,
            'carrier' => $tarifa->proveedor?->nombre,
            'origen' => $tarifa->origen?->nombre,
            'destino' => $tarifa->destino?->nombre,
            'dias_transito' => $tarifa->dias_transito,
            'valido_desde' => $this->fechaEs($tarifa->fecha_inicio_vigencia),
            'valido_hasta' => $this->fechaEs($tarifa->fecha_fin_vigencia),
            'estado' => EstadoTarifa::de($tarifa->fecha_fin_vigencia, $hoy, $vencePronto),
        ];

        if (in_array($tarifa->modo, ['Maritimo', 'Terrestre'], true)) {
            $filas = [];

            foreach ($tarifa->costos as $costo) {
                $filas[] = [
                    ...$base,
                    'servicio' => $costo->tipo_servicio === 'FCL'
                        ? "FCL {$costo->tipo_contenedor}"
                        : 'LCL',
                    'unidad' => $costo->tipo_servicio === 'FCL' ? 'contenedor' : 'm³',
                    'tarifa_base' => $costo->costo,
                    'moneda' => $costo->moneda,
                ];
            }

            if ($tarifa->costo_tramite !== null) {
                $filas[] = [
                    ...$base,
                    'servicio' => 'Trámite',
                    'unidad' => 'trámite',
                    'tarifa_base' => $tarifa->costo_tramite,
                    'moneda' => $tarifa->moneda_tramite,
                ];
            }

            return $filas;
        }

        return [[
            ...$base,
            'servicio' => 'Aéreo',
            'unidad' => 'kg',
            'tarifa_base' => $tarifa->costo_base,
            'moneda' => $tarifa->moneda,
        ]];
    }

    private function fechaEs(Carbon $fecha): string
    {
        return str_replace('.', '', $fecha->locale('es')->isoFormat('D MMM YYYY'));
    }
}
