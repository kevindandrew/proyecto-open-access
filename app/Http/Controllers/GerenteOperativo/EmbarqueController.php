<?php

namespace App\Http\Controllers\GerenteOperativo;

use App\Http\Controllers\Controller;
use App\Models\Cotizacion;
use App\Models\Embarque;
use App\Models\EmbarqueContenedor;
use App\Models\Empleado;
use App\Models\RoleEmpleado;
use App\Models\SeguimientoEmbarque;
use App\Support\SecuenciaEstadoEmbarque;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class EmbarqueController extends Controller
{
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
            'estados' => SecuenciaEstadoEmbarque::ESTADOS,
        ]);
    }

   public function show(Embarque $embarque): Response
    {
        // Cargar solo las relaciones que SÍ están definidas en Embarque.php
        $embarque->load([
            'cotizacion',
            'cliente', 
            'comercial', 
            'operativo', 
            'agenteOrigen', 
            'agenteDestino',
            'navieraAerolinea', 
            'pol', 
            'pod',
            'contenedores',
            'seguimientos' => fn ($query) => $query->orderByDesc('fecha')->with('empleadoResponsable'),
        ]);

        return Inertia::render('GerenteOperativo/Embarques/Show', [
            'embarque' => [
                'id_embarque' => $embarque->id_embarque,
                'numero_file' => $embarque->numero_file,
                
                // --- Datos del Embarque / Cotización ---
                'quote_reference' => $embarque->cotizacion?->codigo_cotizacion 
                    ?? $embarque->cotizacion?->numero_cotizacion 
                    ?? $embarque->id_cotizacion,
                'modo_transporte' => $embarque->modo_transporte,
                'tipo_embarque' => $embarque->tipo_embarque ?? $embarque->cotizacion?->tipo_embarque,
                
                // Leemos las columnas directas del embarque (o de la cotización si están vacías)
                'oficina_venta' => $embarque->oficina_venta 
                    ?? $embarque->cotizacion?->oficina_venta 
                    ?? '—',
                'oficina_operacional' => $embarque->oficina_operacional 
                    ?? $embarque->cotizacion?->oficina_operacional 
                    ?? '—',

                'generado_por' => $embarque->comercial?->nombre_completo 
                    ?? $embarque->cotizacion?->comercial?->nombre_completo 
                    ?? '—',
                'cliente' => $embarque->cliente?->razon_social,
                'consignatario' => $embarque->consignatario,
                'pol' => $embarque->pol?->nombre,
                'pod' => $embarque->pod?->nombre,
                'destino_final' => $embarque->destino_final ?? $embarque->cotizacion?->destino_final,
                'agente_origen' => $embarque->agenteOrigen?->nombre,
                'agente_destino' => $embarque->agenteDestino?->nombre 
                    ?? $embarque->cotizacion?->agenteDestino?->nombre 
                    ?? '—',
                'naviera_aerolinea' => $embarque->navieraAerolinea?->nombre,

                // --- Datos Operativos / Control ---
                'operativo' => $embarque->operativo?->nombre_completo,
                'mbl' => $embarque->mbl,
                'etd' => $embarque->etd?->toDateString(),
                'eta' => $embarque->eta?->toDateString(),
                'nave' => $embarque->nave,
                'viaje' => $embarque->viaje,
                'pago_master' => $embarque->pago_master ?? 'COLLECT',
                'estado_embarque' => $embarque->estado_embarque,
                'id_operativo' => $embarque->id_operativo,
            ],
            'contenedores' => $embarque->contenedores,
            'seguimientos' => $embarque->seguimientos,
            'operativosDisponibles' => $this->operativosPara($embarque->modo_transporte),
        ]);
    }

    /**
     * Actualiza la información operativa del Embarque (Master BL, Fechas, Terrestre, etc.)
     */
    public function update(Request $request, Embarque $embarque): RedirectResponse
    {
        $validated = $request->validate([
            'master_bl_hawb' => ['nullable', 'string', 'max:100'],
            'etd' => ['nullable', 'date'],
            'eta' => ['nullable', 'date'],
            'nave' => ['nullable', 'string', 'max:100'],
            'viaje' => ['nullable', 'string', 'max:100'],
            'pago_master' => ['nullable', 'string', 'in:COLLECT,PREPAID'],
            'pago_house' => ['nullable', 'string', 'in:COLLECT,PREPAID'],
            'houses' => ['nullable', 'array'],
            'houses.*.codigo' => ['required', 'string'],
            // Campos específicos para Terrestre
            'es_sobrefacturado' => ['nullable', 'string'],
            'monto_sobrefacturado' => ['nullable', 'numeric'],
            'flete_menor' => ['nullable', 'string'],
            'porcentajes_terrestre' => ['nullable', 'string'],
            'recinto_aduanero' => ['nullable', 'string', 'max:150'],
            'tramite_aduanero' => ['nullable', 'string', 'max:150'],
            'tramite_puerto' => ['nullable', 'string', 'max:150'],
            'pagos_liberacion' => ['nullable', 'string', 'max:150'],
        ]);

        $embarque->update($validated);

        return redirect()
            ->route('gerente-operativo.embarques.show', $embarque->id_embarque)
            ->with('success', 'Información operativa actualizada correctamente.');
    }

    /**
     * Generación automática del FILE a partir de una Cotización aprobada
     */
    public function crearDesdeCotizacion(Cotizacion $cotizacion): RedirectResponse
    {
        return DB::transaction(function () use ($cotizacion) {
            $prefijoFecha = Carbon::now()->format('ym'); // AñoMes: ej. 2604

            $ultimoFile = Embarque::where('numero_file', 'LIKE', $prefijoFecha . '%')
                ->orderBy('numero_file', 'desc')
                ->value('numero_file');

            $correlativo = $ultimoFile ? ((int) substr($ultimoFile, -3)) + 1 : 1;
            $numeroFile = $prefijoFecha . str_pad($correlativo, 3, '0', STR_PAD_LEFT);

            $embarque = Embarque::create([
                'id_cotizacion' => $cotizacion->id_cotizacion,
                'numero_file' => $numeroFile,
                'id_cliente' => $cotizacion->id_cliente,
                'consignatario' => $cotizacion->consignatario,
                'modo_transporte' => $cotizacion->modo_transporte,
                'id_pol' => $cotizacion->id_pol,
                'id_pod' => $cotizacion->id_pod,
                'id_agente_origen' => $cotizacion->id_agente_origen,
                'id_naviera_aerolinea' => $cotizacion->id_naviera_aerolinea,
                'estado_embarque' => 'ABIERTO',
            ]);

            return redirect()
                ->route('gerente-operativo.embarques.show', $embarque->id_embarque)
                ->with('success', "Embarque aperturado exitosamente con el FILE #{$numeroFile}");
        });
    }

    /**
     * Guarda un contenedor asociado al embarque desde el modal
     */
    public function storeContenedor(Request $request, Embarque $embarque): RedirectResponse
    {
        $validated = $request->validate([
            'fecha_devolucion' => ['nullable', 'date'],
            'numero_contenedor' => ['required', 'string', 'max:50'],
            'numero_sello' => ['nullable', 'string', 'max:50'],
            'tipo_contenedor' => ['required', 'string', 'max:50'],
            'peso_kg' => ['nullable', 'numeric'],
            'volumen_cbm' => ['nullable', 'numeric'],
            'nro_piezas' => ['nullable', 'integer'],
            'unidad_piezas' => ['nullable', 'string', 'max:20'],
            'descripcion_mercaderia' => ['nullable', 'string'],
        ]);

        $embarque->contenedores()->create($validated);

        return redirect()
            ->route('gerente-operativo.embarques.show', $embarque->id_embarque)
            ->with('success', 'Contenedor o unidad de carga agregada correctamente.');
    }

    /**
     * Actualiza un contenedor desde el modal
     */
    public function updateContenedor(Request $request, EmbarqueContenedor $contenedor): RedirectResponse
    {
        $validated = $request->validate([
            'fecha_devolucion' => ['nullable', 'date'],
            'numero_contenedor' => ['required', 'string', 'max:50'],
            'numero_sello' => ['nullable', 'string', 'max:50'],
            'tipo_contenedor' => ['required', 'string', 'max:50'],
            'peso_kg' => ['nullable', 'numeric'],
            'volumen_cbm' => ['nullable', 'numeric'],
            'nro_piezas' => ['nullable', 'integer'],
            'unidad_piezas' => ['nullable', 'string', 'max:20'],
            'descripcion_mercaderia' => ['nullable', 'string'],
        ]);

        $contenedor->update($validated);

        return redirect()
            ->route('gerente-operativo.embarques.show', $contenedor->id_embarque)
            ->with('success', 'Contenedor actualizado correctamente.');
    }

    public function asignarOperativo(Request $request, Embarque $embarque): RedirectResponse
    {
        $rolOperativoId = RoleEmpleado::where('nombre_rol', 'Operativo')->value('id_rol');

        $data = $request->validate([
            'id_operativo' => [
                'required',
                'integer',
                Rule::exists('empleados', 'id_empleado')->where(
                    fn ($query) => $query
                        ->where('id_rol', $rolOperativoId)
                        ->where('especialidad_operativa', $embarque->modo_transporte)
                        ->where('activo', true),
                ),
            ],
        ]);

        $anterior = $embarque->operativo?->nombre_completo;
        $nuevo = Empleado::findOrFail($data['id_operativo'])->nombre_completo;

        DB::transaction(function () use ($embarque, $data, $anterior, $nuevo) {
            $embarque->update(['id_operativo' => $data['id_operativo']]);

            $comentario = $anterior
                ? "Operativo reasignado de {$anterior} a {$nuevo}"
                : "Operativo asignado: {$nuevo}";

            $embarque->seguimientos()->create([
                'fecha' => now(),
                'estado' => $embarque->estado_embarque,
                'comentario' => $comentario,
                'id_empleado_responsable' => Auth::user()->empleado?->id_empleado,
            ]);
        });

        return redirect()
            ->route('gerente-operativo.embarques.show', $embarque->id_embarque)
            ->with('success', "Operativo asignado: {$nuevo}.");
    }

    private function operativosPara(string $modoTransporte)
    {
        return Empleado::whereHas('rol', fn ($q) => $q->where('nombre_rol', 'Operativo'))
            ->where('especialidad_operativa', $modoTransporte)
            ->where('activo', true)
            ->orderBy('nombre_completo')
            ->get(['id_empleado', 'nombre_completo']);
    }

    public function cambiarEstado(Request $request, Embarque $embarque): RedirectResponse
    {
        $siguiente = SecuenciaEstadoEmbarque::siguiente($embarque->estado_embarque);

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
}