<?php

namespace App\Http\Controllers\GerenteOperativo;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use App\Models\ConceptoCostoExtra;
use App\Models\Cotizacion;
use App\Models\CotizacionContenedor;
use App\Models\CotizacionDetalle;
use App\Models\Embarque;
use App\Models\Empleado;
use App\Models\Proveedor;
use App\Models\PuertoAeropuerto;
use App\Support\GeneradorNumeroFile;
use App\Support\GeneradorNumeroReferencia;
use App\Support\PrefillCotizacionTerrestre;
use App\Support\TarifaLookup;
use App\Support\TiposTransportePorModo;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class CotizacionController extends Controller
{
    public function create(Request $request): Response
    {
        return Inertia::render('GerenteOperativo/Cotizaciones/Nueva', [
            'puertos' => PuertoAeropuerto::where('activo', true)->orderBy('nombre')->get(['codigo', 'nombre', 'tipo']),
            'conceptosCostoExtra' => ConceptoCostoExtra::where('activo', true)->orderBy('nombre')->get(['id_concepto', 'nombre']),
            'origen' => PrefillCotizacionTerrestre::desde($request->integer('desde_cotizacion') ?: null),
        ]);
    }

    public function tarifasDisponibles(Request $request): JsonResponse
    {
        $data = $request->validate([
            'modo_transporte' => ['required', Rule::in(['Maritimo', 'Aereo', 'Terrestre'])],
            'id_pol' => ['nullable', 'string'],
            'id_pod' => ['nullable', 'string'],
            'tipo_servicio' => ['nullable', Rule::in(['FCL', 'LCL'])],
        ]);

        return response()->json(TarifaLookup::disponibles($data));
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'id_cliente' => ['required', 'integer', 'exists:clientes,id_cliente'],
            'modo_transporte' => ['required', Rule::in(['Maritimo', 'Aereo', 'Terrestre'])],
            'tipo_servicio' => [
                Rule::requiredIf(fn () => in_array($request->input('modo_transporte'), ['Maritimo', 'Terrestre'], true)),
                'nullable',
                Rule::in(['FCL', 'LCL']),
            ],
            'incoterm' => ['nullable', 'string', 'max:10'],
            'id_pol' => ['nullable', 'string', 'exists:puertos_aeropuertos,codigo'],
            'id_pod' => ['nullable', 'string', 'exists:puertos_aeropuertos,codigo'],
            'destino_final' => ['nullable', 'string', 'max:150'],
            'peso_kg' => ['nullable', 'numeric'],
            'volumen_cbm' => ['nullable', 'numeric'],
            'mercancia_peligrosa' => ['boolean'],
            'fecha_validez' => ['required', 'date'],
            'dias_transito' => ['nullable', 'integer'],
            'contenedores' => ['array'],
            'contenedores.*.tipo_contenedor' => ['required', 'string', 'max:10'],
            'contenedores.*.cantidad' => ['required', 'integer', 'min:1'],
            'detalle' => ['required', 'array', 'min:1'],
            'detalle.*.descripcion' => ['required', 'string', 'max:200'],
            'detalle.*.tipo_tarifa_unidad' => ['nullable', 'string', 'max:50'],
            'detalle.*.costo_unitario' => ['nullable', 'numeric'],
            'detalle.*.base_calculo' => ['nullable', 'numeric'],
            'detalle.*.moneda' => ['nullable', 'string', 'max:5'],
        ]);

        $cliente = Cliente::findOrFail($data['id_cliente']);
        $comercialAsignado = $cliente->id_comercial
            ? Empleado::find($cliente->id_comercial)
            : Auth::user()->empleado;

        $cotizacion = DB::transaction(function () use ($data, $comercialAsignado) {
            $cotizacion = Cotizacion::create([
                'numero_referencia' => GeneradorNumeroReferencia::generar($comercialAsignado),
                'id_cliente' => $data['id_cliente'],
                'id_comercial' => $comercialAsignado->id_empleado,
                'modo_transporte' => $data['modo_transporte'],
                'tipo_servicio' => in_array($data['modo_transporte'], ['Maritimo', 'Terrestre'], true) ? ($data['tipo_servicio'] ?? null) : null,
                'incoterm' => $data['incoterm'] ?? null,
                'id_pol' => $data['id_pol'] ?? null,
                'id_pod' => $data['id_pod'] ?? null,
                'destino_final' => $data['destino_final'] ?? null,
                'fecha_validez' => $data['fecha_validez'],
                'estado' => 'Cotizado',
                'peso_kg' => $data['peso_kg'] ?? null,
                'volumen_cbm' => $data['volumen_cbm'] ?? null,
                'mercancia_peligrosa' => $data['mercancia_peligrosa'] ?? false,
                'dias_transito' => $data['dias_transito'] ?? null,
            ]);

            foreach ($data['contenedores'] ?? [] as $contenedor) {
                $cotizacion->contenedores()->create($contenedor);
            }

            foreach ($data['detalle'] as $index => $linea) {
                $costoUnitario = $linea['costo_unitario'] ?? 0;
                $baseCalculo = $linea['base_calculo'] ?? 1;

                $cotizacion->detalle()->create([
                    'nro_item' => $index + 1,
                    'descripcion' => $linea['descripcion'],
                    'tipo_tarifa_unidad' => $linea['tipo_tarifa_unidad'] ?? null,
                    'costo_unitario' => $costoUnitario,
                    'base_calculo' => $baseCalculo,
                    'moneda' => $linea['moneda'] ?? 'USD',
                    'costo_total' => $costoUnitario * $baseCalculo,
                ]);
            }

            return $cotizacion;
        });

        return redirect()
            ->route('gerente-operativo.cotizaciones.show', $cotizacion->id_cotizacion)
            ->with('success', 'Cotización creada correctamente.');
    }

    public function index(): Response
    {
        $cotizaciones = Cotizacion::with(['cliente', 'comercial', 'pol', 'pod'])
            ->withSum('detalle as total', 'costo_total')
            ->orderByDesc('fecha_emision')
            ->get()
            ->map(fn (Cotizacion $cotizacion) => [
                'id_cotizacion' => $cotizacion->id_cotizacion,
                'numero_referencia' => $cotizacion->numero_referencia,
                'cliente' => $cotizacion->cliente?->razon_social,
                'comercial' => $cotizacion->comercial?->nombre_completo,
                'modo_transporte' => $cotizacion->modo_transporte,
                'pol' => $cotizacion->pol?->nombre,
                'pod' => $cotizacion->pod?->nombre,
                'fecha_emision' => $cotizacion->fecha_emision->toDateString(),
                'fecha_validez' => $cotizacion->fecha_validez->toDateString(),
                'total' => $cotizacion->total,
                'estado' => $cotizacion->estado,
            ]);

        return Inertia::render('GerenteOperativo/Cotizaciones/Index', [
            'cotizaciones' => $cotizaciones,
        ]);
    }

    public function show(Cotizacion $cotizacion): Response
    {
        $cotizacion->load(['cliente', 'comercial', 'pol', 'pod', 'contenedores', 'detalle', 'embarques']);

        return Inertia::render('GerenteOperativo/Cotizaciones/Show', [
            'cotizacion' => [
                'id_cotizacion' => $cotizacion->id_cotizacion,
                'numero_referencia' => $cotizacion->numero_referencia,
                'cliente' => $cotizacion->cliente?->razon_social,
                'comercial' => $cotizacion->comercial?->nombre_completo,
                'modo_transporte' => $cotizacion->modo_transporte,
                'tipo_servicio' => $cotizacion->tipo_servicio,
                'incoterm' => $cotizacion->incoterm,
                'pol' => $cotizacion->pol?->nombre,
                'pod' => $cotizacion->pod?->nombre,
                'destino_final' => $cotizacion->destino_final,
                'fecha_emision' => $cotizacion->fecha_emision->toDateString(),
                'fecha_validez' => $cotizacion->fecha_validez->toDateString(),
                'estado' => $cotizacion->estado,
                'motivo_rechazo' => $cotizacion->motivo_rechazo,
                'peso_kg' => $cotizacion->peso_kg,
                'volumen_cbm' => $cotizacion->volumen_cbm,
                'mercancia_peligrosa' => $cotizacion->mercancia_peligrosa,
                'dias_transito' => $cotizacion->dias_transito,
                'tiene_embarque' => $cotizacion->embarques->isNotEmpty(),
                'embarque_id' => $cotizacion->embarques->first()?->id_embarque,
            ],
            'contenedores' => $cotizacion->contenedores->map(fn (CotizacionContenedor $item) => [
                'tipo_contenedor' => $item->tipo_contenedor,
                'cantidad' => $item->cantidad,
            ]),
            'detalle' => $cotizacion->detalle->map(fn (CotizacionDetalle $linea) => [
                'descripcion' => $linea->descripcion,
                'tipo_tarifa_unidad' => $linea->tipo_tarifa_unidad,
                'costo_unitario' => $linea->costo_unitario,
                'base_calculo' => $linea->base_calculo,
                'moneda' => $linea->moneda,
                'costo_total' => $linea->costo_total,
            ]),
            'total' => $cotizacion->detalle->sum('costo_total'),
            'proveedoresAgenteOrigen' => Proveedor::where('tipo', 'Agente_Origen')
                ->where('activo', true)
                ->orderBy('nombre')
                ->get(['id_proveedor', 'nombre']),
            'proveedoresTransporte' => Proveedor::whereIn('tipo', TiposTransportePorModo::para($cotizacion->modo_transporte))
                ->where('activo', true)
                ->orderBy('nombre')
                ->get(['id_proveedor', 'nombre']),
        ]);
    }

    public function pdf(Cotizacion $cotizacion): HttpResponse
    {
        $cotizacion->load(['cliente', 'comercial', 'pol', 'pod', 'contenedores', 'detalle']);

        $pdf = Pdf::loadView('pdf.cotizacion', [
            'cotizacion' => [
                'numero_referencia' => $cotizacion->numero_referencia,
                'cliente' => $cotizacion->cliente?->razon_social,
                'comercial' => $cotizacion->comercial?->nombre_completo,
                'modo_transporte' => $cotizacion->modo_transporte,
                'tipo_servicio' => $cotizacion->tipo_servicio,
                'incoterm' => $cotizacion->incoterm,
                'pol' => $cotizacion->pol?->nombre,
                'pod' => $cotizacion->pod?->nombre,
                'destino_final' => $cotizacion->destino_final,
                'fecha_emision' => $cotizacion->fecha_emision->toDateString(),
                'fecha_validez' => $cotizacion->fecha_validez->toDateString(),
                'estado' => $cotizacion->estado,
                'motivo_rechazo' => $cotizacion->motivo_rechazo,
                'peso_kg' => $cotizacion->peso_kg,
                'volumen_cbm' => $cotizacion->volumen_cbm,
                'mercancia_peligrosa' => $cotizacion->mercancia_peligrosa,
                'dias_transito' => $cotizacion->dias_transito,
            ],
            'contenedores' => $cotizacion->contenedores->map(fn (CotizacionContenedor $item) => [
                'tipo_contenedor' => $item->tipo_contenedor,
                'cantidad' => $item->cantidad,
            ])->all(),
            'detalle' => $cotizacion->detalle->map(fn (CotizacionDetalle $linea) => [
                'descripcion' => $linea->descripcion,
                'tipo_tarifa_unidad' => $linea->tipo_tarifa_unidad,
                'costo_unitario' => $linea->costo_unitario,
                'base_calculo' => $linea->base_calculo,
                'moneda' => $linea->moneda,
                'costo_total' => $linea->costo_total,
            ])->all(),
            'total' => $cotizacion->detalle->sum('costo_total'),
            'generadoEn' => Carbon::now()->locale('es')->isoFormat('D [de] MMMM [de] YYYY, HH:mm'),
        ]);

        $nombreArchivo = str_replace(['/', '\\'], '-', $cotizacion->numero_referencia);

        return $pdf->stream("Cotizacion-{$nombreArchivo}.pdf");
    }

    public function cambiarEstado(Request $request, Cotizacion $cotizacion): RedirectResponse
    {
        $data = $request->validate([
            'estado' => ['required', Rule::in(['Aceptado', 'Rechazado'])],
            'motivo' => ['nullable', 'string', 'max:500'],
        ]);

        if ($cotizacion->estado !== 'Cotizado') {
            return redirect()
                ->route('gerente-operativo.cotizaciones.show', $cotizacion->id_cotizacion)
                ->with('error', 'Esta cotización ya no está en estado Cotizado.');
        }

        $cotizacion->update([
            'estado' => $data['estado'],
            'motivo_rechazo' => $data['estado'] === 'Rechazado' ? ($data['motivo'] ?? null) : null,
        ]);

        return redirect()
            ->route('gerente-operativo.cotizaciones.show', $cotizacion->id_cotizacion)
            ->with('success', "Cotización marcada como {$data['estado']}.");
    }

    public function convertirEnEmbarque(Request $request, Cotizacion $cotizacion): RedirectResponse
    {
        if ($cotizacion->estado !== 'Aceptado') {
            return redirect()
                ->route('gerente-operativo.cotizaciones.show', $cotizacion->id_cotizacion)
                ->with('error', 'Solo se puede convertir una cotización Aceptada.');
        }

        if ($cotizacion->embarques()->exists()) {
            return redirect()
                ->route('gerente-operativo.cotizaciones.show', $cotizacion->id_cotizacion)
                ->with('error', 'Esta cotización ya fue convertida en un embarque.');
        }

        $data = $request->validate([
            'consignatario' => ['nullable', 'string', 'max:200'],
            'id_agente_origen' => ['nullable', 'integer', 'exists:proveedores,id_proveedor'],
            'id_naviera_aerolinea' => [
                'nullable',
                'integer',
                Rule::exists('proveedores', 'id_proveedor')
                    ->where(fn ($query) => $query->whereIn('tipo', TiposTransportePorModo::para($cotizacion->modo_transporte))),
            ],
        ]);

        $embarque = DB::transaction(function () use ($data, $cotizacion) {
            $embarque = Embarque::create([
                'numero_file' => GeneradorNumeroFile::generar(),
                'id_cotizacion' => $cotizacion->id_cotizacion,
                'id_cliente' => $cotizacion->id_cliente,
                'consignatario' => $data['consignatario'] ?? null,
                'id_comercial' => $cotizacion->id_comercial,
                'id_operativo' => null,
                'id_agente_origen' => $data['id_agente_origen'] ?? null,
                'id_naviera_aerolinea' => $data['id_naviera_aerolinea'] ?? null,
                'modo_transporte' => $cotizacion->modo_transporte,
                'id_pol' => $cotizacion->id_pol,
                'id_pod' => $cotizacion->id_pod,
                'destino_final' => $cotizacion->destino_final,
                'estado_embarque' => 'Confirmado_Origen',
            ]);

            $embarque->seguimientos()->create([
                'fecha' => now(),
                'estado' => 'Confirmado_Origen',
                'comentario' => 'Embarque creado desde cotización aceptada',
                'id_empleado_responsable' => $cotizacion->id_comercial,
            ]);

            return $embarque;
        });

        return redirect()
            ->route('gerente-operativo.embarques.show', $embarque->id_embarque)
            ->with('success', 'Embarque creado correctamente a partir de la cotización.');
    }
}
