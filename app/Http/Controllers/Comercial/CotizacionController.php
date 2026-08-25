<?php

namespace App\Http\Controllers\Comercial;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use App\Models\ConceptoCostoExtra;
use App\Models\Cotizacion;
use App\Models\CotizacionContenedor;
use App\Models\CotizacionDetalle;
use App\Models\Embarque;
use App\Models\PuertoAeropuerto;
use App\Support\CotizacionPdfDetalle;
use App\Support\GeneradorNumeroFile;
use App\Support\GeneradorNumeroReferencia;
use App\Support\PrefillCotizacionTerrestre;
use App\Support\SolicitudTarifaRegistrador;
use App\Support\TarifaAgenteLookup;
use App\Support\TarifaLookup;
use App\Support\TiposTransportePorModo;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class CotizacionController extends Controller
{
    public function index(): Response
    {
        $comercial = Auth::user()->empleado;

        $cotizaciones = Cotizacion::with(['cliente', 'pol', 'pod'])
            ->withSum('detalle as total', 'costo_total')
            ->where('id_comercial', $comercial->id_empleado)
            ->orderByDesc('fecha_emision')
            ->get()
            ->map(fn (Cotizacion $cotizacion) => [
                'id_cotizacion' => $cotizacion->id_cotizacion,
                'numero_referencia' => $cotizacion->numero_referencia,
                'cliente' => $cotizacion->cliente?->razon_social,
                'modo_transporte' => $cotizacion->modo_transporte,
                'pol' => $cotizacion->pol?->nombre,
                'pod' => $cotizacion->pod?->nombre,
                'fecha_emision' => $cotizacion->fecha_emision->toDateString(),
                'fecha_validez' => $cotizacion->fecha_validez->toDateString(),
                'total' => $cotizacion->total,
                'estado' => $cotizacion->estado,
            ]);

        return Inertia::render('Comercial/Cotizaciones/Index', [
            'cotizaciones' => $cotizaciones,
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Comercial/Cotizaciones/Nueva', [
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

    public function tarifasAgenteDisponibles(Request $request): JsonResponse
    {
        $data = $request->validate([
            'modo_transporte' => ['required', Rule::in(['Maritimo', 'Aereo', 'Terrestre'])],
            'id_pol' => ['nullable', 'string'],
            'id_pod' => ['nullable', 'string'],
        ]);

        return response()->json(TarifaAgenteLookup::disponibles($data));
    }

    public function solicitarTarifa(Request $request): JsonResponse
    {
        $data = $request->validate([
            'id_cliente' => ['nullable', 'integer', 'exists:clientes,id_cliente'],
            'modo_transporte' => ['required', Rule::in(['Maritimo', 'Aereo', 'Terrestre'])],
            'tipo_servicio' => ['nullable', Rule::in(['FCL', 'LCL'])],
            'id_pol' => ['nullable', 'string', 'exists:puertos_aeropuertos,codigo'],
            'id_pod' => ['nullable', 'string', 'exists:puertos_aeropuertos,codigo'],
        ]);

        $comercial = Auth::user()->empleado;

        SolicitudTarifaRegistrador::registrar($data, $data['id_cliente'] ?? null, $comercial->id_empleado);

        return response()->json(['mensaje' => 'Solicitud registrada correctamente.']);
    }

    public function store(Request $request): RedirectResponse
    {
        $comercial = Auth::user()->empleado;

        $data = $request->validate([
            'id_cotizacion_origen' => ['nullable', 'integer', 'exists:cotizaciones,id_cotizacion'],
            'id_cliente' => ['required', 'integer', 'exists:clientes,id_cliente'],
            'modo_transporte' => ['required', Rule::in(['Maritimo', 'Aereo', 'Terrestre'])],
            'tipo_embarque' => ['required', Rule::in(['IMPO', 'EXPO', 'DOM'])],
            'id_agente_origen' => ['nullable', 'integer', 'exists:proveedores,id_proveedor'],
            'id_naviera_aerolinea' => [
                'nullable',
                'integer',
                Rule::exists('proveedores', 'id_proveedor')
                    ->where(fn ($query) => $query->whereIn('tipo', TiposTransportePorModo::para($request->input('modo_transporte')))),
            ],
            'tipo_servicio' => [
                Rule::requiredIf(fn () => in_array($request->input('modo_transporte'), ['Maritimo', 'Terrestre'], true)),
                'nullable',
                Rule::in(['FCL', 'LCL']),
            ],
            'incoterm' => ['nullable', 'string', 'max:10'],
            'id_pol' => ['nullable', 'string', 'exists:puertos_aeropuertos,codigo'],
            'id_pod' => ['nullable', 'string', 'exists:puertos_aeropuertos,codigo'],
            'peso_kg' => ['nullable', 'numeric'],
            'volumen_cbm' => ['nullable', 'numeric'],
            'mercancia_peligrosa' => ['boolean'],
            'fecha_validez' => ['required', 'date'],
            'dias_transito' => ['nullable', 'integer'],
            'contenedores' => ['array'],
            'contenedores.*.tipo_contenedor' => ['required', 'string', 'max:50'],
            'contenedores.*.cantidad' => ['required', 'integer', 'min:1'],
            'detalle' => ['required', 'array', 'min:1'],
            'detalle.*.descripcion' => ['required', 'string', 'max:200'],
            'detalle.*.tipo_tarifa_unidad' => ['nullable', 'string', 'max:50'],
            'detalle.*.costo_unitario' => ['nullable', 'numeric'],
            'detalle.*.base_calculo' => ['nullable', 'numeric', function ($attribute, $value, $fail) use ($request) {
                preg_match('/^detalle\.(\d+)\.base_calculo$/', $attribute, $matches);
                $indice = $matches[1] ?? null;
                $unidad = $indice !== null ? $request->input("detalle.{$indice}.tipo_tarifa_unidad") : null;

                if ($unidad === 'Per Container' && $value !== null && floor($value) != $value) {
                    $fail('La cantidad de contenedores no puede tener decimales.');
                }
            }],
            'detalle.*.moneda' => ['nullable', 'string', 'max:5'],
            'detalle.*.comision_openaccess' => ['nullable', 'numeric', 'min:0'],
        ]);

        $clientePertenece = Cliente::where('id_cliente', $data['id_cliente'])
            ->where('id_comercial', $comercial->id_empleado)
            ->exists();

        abort_unless($clientePertenece, 403);

        if (! empty($data['id_cotizacion_origen'])) {
            $origenPertenece = Cotizacion::where('id_cotizacion', $data['id_cotizacion_origen'])
                ->where('id_comercial', $comercial->id_empleado)
                ->exists();

            abort_unless($origenPertenece, 403);
        }

        $filtrosRuta = [
            'modo_transporte' => $data['modo_transporte'],
            'tipo_servicio' => $data['tipo_servicio'] ?? null,
            'id_pol' => $data['id_pol'] ?? null,
            'id_pod' => $data['id_pod'] ?? null,
        ];

        if (! TarifaLookup::existeParaRuta($filtrosRuta)) {
            SolicitudTarifaRegistrador::registrar($filtrosRuta, $data['id_cliente'], $comercial->id_empleado);

            throw ValidationException::withMessages([
                'tarifa' => 'No existe una tarifa cargada para esta ruta. Se avisó a Gerente Operativo para que la cree; una vez cargada vas a poder crear esta cotización. Solo Gerente Comercial puede crear cotizaciones sin una tarifa existente.',
            ]);
        }

        $cotizacion = DB::transaction(function () use ($data, $comercial) {
            $cotizacion = Cotizacion::create([
                'numero_referencia' => GeneradorNumeroReferencia::generar($comercial),
                'id_cotizacion_origen' => $data['id_cotizacion_origen'] ?? null,
                'id_cliente' => $data['id_cliente'],
                'id_comercial' => $comercial->id_empleado,
                'modo_transporte' => $data['modo_transporte'],
                'tipo_embarque' => $data['tipo_embarque'],
                'id_agente_origen' => $data['id_agente_origen'] ?? null,
                'id_naviera_aerolinea' => $data['id_naviera_aerolinea'] ?? null,
                'tipo_servicio' => in_array($data['modo_transporte'], ['Maritimo', 'Terrestre'], true) ? ($data['tipo_servicio'] ?? null) : null,
                'incoterm' => $data['incoterm'] ?? null,
                'id_pol' => $data['id_pol'] ?? null,
                'id_pod' => $data['id_pod'] ?? null,
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
                    'comision_openaccess' => $linea['comision_openaccess'] ?? 0,
                ]);
            }

            return $cotizacion;
        });

        return redirect()
            ->route('comercial.cotizaciones.show', $cotizacion->id_cotizacion)
            ->with('success', 'Cotización creada correctamente.');
    }

    public function edit(Cotizacion $cotizacion): Response
    {
        $this->autorizar($cotizacion);

        abort_if($cotizacion->estado === 'Aceptado', 403);

        $cotizacion->load('detalle');

        return Inertia::render('Comercial/Cotizaciones/Editar', [
            'cotizacion' => [
                'id_cotizacion' => $cotizacion->id_cotizacion,
                'numero_referencia' => $cotizacion->numero_referencia,
                'incoterm' => $cotizacion->incoterm,
                'mercancia_peligrosa' => $cotizacion->mercancia_peligrosa,
                'dias_transito' => $cotizacion->dias_transito,
            ],
            'lineasFlete' => $cotizacion->detalle
                ->filter(fn (CotizacionDetalle $linea) => str_starts_with($linea->descripcion, 'Flete'))
                ->map(fn (CotizacionDetalle $linea) => [
                    'id_detalle' => $linea->id_detalle,
                    'descripcion' => $linea->descripcion,
                    'comision_openaccess' => $linea->comision_openaccess,
                ])
                ->values(),
        ]);
    }

    public function update(Request $request, Cotizacion $cotizacion): RedirectResponse
    {
        $this->autorizar($cotizacion);

        abort_if($cotizacion->estado === 'Aceptado', 403);

        $data = $request->validate([
            'incoterm' => ['nullable', 'string', 'max:10'],
            'mercancia_peligrosa' => ['boolean'],
            'dias_transito' => ['nullable', 'integer'],
            'lineas_flete' => ['array'],
            'lineas_flete.*.id_detalle' => [
                'required', 'integer',
                Rule::exists('cotizacion_detalle', 'id_detalle')->where('id_cotizacion', $cotizacion->id_cotizacion),
            ],
            'lineas_flete.*.comision_openaccess' => ['nullable', 'numeric', 'min:0'],
        ]);

        $cotizacion->update([
            'incoterm' => $data['incoterm'] ?? null,
            'mercancia_peligrosa' => $data['mercancia_peligrosa'] ?? false,
            'dias_transito' => $data['dias_transito'] ?? null,
        ]);

        foreach ($data['lineas_flete'] ?? [] as $linea) {
            CotizacionDetalle::where('id_detalle', $linea['id_detalle'])
                ->where('id_cotizacion', $cotizacion->id_cotizacion)
                ->update(['comision_openaccess' => $linea['comision_openaccess'] ?? 0]);
        }

        return redirect()
            ->route('comercial.cotizaciones.show', $cotizacion->id_cotizacion)
            ->with('success', 'Cotización actualizada correctamente.');
    }

    public function show(Cotizacion $cotizacion): Response
    {
        $this->autorizar($cotizacion);

        $cotizacion->load(['cliente', 'agenteOrigen', 'navieraAerolinea', 'pol', 'pod', 'contenedores', 'detalle', 'embarques', 'origen', 'continuaciones']);

        return Inertia::render('Comercial/Cotizaciones/Show', [
            'cotizacion' => [
                'id_cotizacion' => $cotizacion->id_cotizacion,
                'numero_referencia' => $cotizacion->numero_referencia,
                'origen' => $cotizacion->origen ? [
                    'id_cotizacion' => $cotizacion->origen->id_cotizacion,
                    'numero_referencia' => $cotizacion->origen->numero_referencia,
                ] : null,
                'continuaciones' => $cotizacion->continuaciones->map(fn (Cotizacion $c) => [
                    'id_cotizacion' => $c->id_cotizacion,
                    'numero_referencia' => $c->numero_referencia,
                ]),
                'cliente' => $cotizacion->cliente?->razon_social,
                'modo_transporte' => $cotizacion->modo_transporte,
                'tipo_embarque' => $cotizacion->tipo_embarque,
                'agente_origen' => $cotizacion->agenteOrigen?->nombre,
                'naviera_aerolinea' => $cotizacion->navieraAerolinea?->nombre,
                'tipo_servicio' => $cotizacion->tipo_servicio,
                'incoterm' => $cotizacion->incoterm,
                'pol' => $cotizacion->pol?->nombre,
                'pod' => $cotizacion->pod?->nombre,
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
                'comision_openaccess' => $linea->comision_openaccess,
            ]),
            'total' => $cotizacion->detalle->sum('costo_total'),
        ]);
    }

    public function pdf(Request $request, Cotizacion $cotizacion): HttpResponse
    {
        $this->autorizar($cotizacion);

        $cotizacion->load(['cliente', 'comercial', 'pol', 'pod', 'contenedores', 'detalle']);

        ['detalle' => $detalleParaPdf, 'total' => $totalParaPdf] = $request->query('vista') === 'resumen'
            ? CotizacionPdfDetalle::resumenParaCliente($cotizacion)
            : CotizacionPdfDetalle::paraCliente($cotizacion);

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
            'detalle' => $detalleParaPdf,
            'total' => $totalParaPdf,
            'generadoEn' => Carbon::now()->locale('es')->isoFormat('D [de] MMMM [de] YYYY, HH:mm'),
        ]);

        $nombreArchivo = str_replace(['/', '\\'], '-', $cotizacion->numero_referencia);

        return $pdf->stream("Cotizacion-{$nombreArchivo}.pdf");
    }

    public function cambiarEstado(Request $request, Cotizacion $cotizacion): RedirectResponse
    {
        $this->autorizar($cotizacion);

        $data = $request->validate([
            'estado' => ['required', Rule::in(['Aceptado', 'Rechazado'])],
            'motivo' => ['nullable', 'string', 'max:500'],
        ]);

        if ($cotizacion->estado !== 'Cotizado') {
            return redirect()
                ->route('comercial.cotizaciones.show', $cotizacion->id_cotizacion)
                ->with('error', 'Esta cotización ya no está en estado Cotizado.');
        }

        $cotizacion->update([
            'estado' => $data['estado'],
            'motivo_rechazo' => $data['estado'] === 'Rechazado' ? ($data['motivo'] ?? null) : null,
        ]);

        return redirect()
            ->route('comercial.cotizaciones.show', $cotizacion->id_cotizacion)
            ->with('success', "Cotización marcada como {$data['estado']}.");
    }

    public function convertirEnEmbarque(Cotizacion $cotizacion): RedirectResponse
    {
        $this->autorizar($cotizacion);

        if ($cotizacion->estado !== 'Aceptado') {
            return redirect()
                ->route('comercial.cotizaciones.show', $cotizacion->id_cotizacion)
                ->with('error', 'Solo se puede convertir una cotización Aceptada.');
        }

        if ($cotizacion->embarques()->exists()) {
            return redirect()
                ->route('comercial.cotizaciones.show', $cotizacion->id_cotizacion)
                ->with('error', 'Esta cotización ya fue convertida en un embarque.');
        }

        $cotizacion->loadMissing('cliente', 'contenedores', 'detalle');

        $embarque = DB::transaction(function () use ($cotizacion) {
            $embarque = Embarque::create([
                'numero_file' => GeneradorNumeroFile::generar(),
                'id_cotizacion' => $cotizacion->id_cotizacion,
                'id_cliente' => $cotizacion->id_cliente,
                'consignatario_nombre' => $cotizacion->cliente?->consignatario_nombre,
                'consignatario_nit' => $cotizacion->cliente?->consignatario_nit,
                'consignatario_direccion' => $cotizacion->cliente?->consignatario_direccion,
                'consignatario_celular' => $cotizacion->cliente?->consignatario_celular,
                'consignatario_correo' => $cotizacion->cliente?->consignatario_correo,
                'id_comercial' => $cotizacion->id_comercial,
                'id_operativo' => null,
                'id_agente_origen' => $cotizacion->id_agente_origen,
                'id_naviera_aerolinea' => $cotizacion->id_naviera_aerolinea,
                'modo_transporte' => $cotizacion->modo_transporte,
                'tipo_servicio' => $cotizacion->tipo_servicio,
                'tipo_embarque' => $cotizacion->tipo_embarque,
                'oficina_venta' => 'La Paz',
                'oficina_operacional' => 'La Paz',
                'id_pol' => $cotizacion->id_pol,
                'id_pod' => $cotizacion->id_pod,
                'destino_final' => $cotizacion->destino_final,
                'peso_kg' => $cotizacion->peso_kg,
                'volumen_cbm' => $cotizacion->volumen_cbm,
                'estado_embarque' => 'Confirmado_Origen',
            ]);

            foreach ($cotizacion->contenedores as $contenedor) {
                // Cada contenedor físico es único (numero_contenedor, sello,
                // etc.), así que se crea una fila por unidad en vez de una
                // sola fila con cantidad=N — esos datos individuales todavía
                // no se conocen a esta altura y se completan más adelante.
                for ($i = 0; $i < $contenedor->cantidad; $i++) {
                    $embarque->contenedores()->create([
                        'tipo_contenedor' => $contenedor->tipo_contenedor,
                        'cantidad' => 1,
                    ]);
                }
            }

            foreach ($cotizacion->detalle as $linea) {
                // Proveedor se puede inferir con confianza solo para los dos
                // casos conocidos: el flete se le paga a la naviera/aerolínea,
                // el trámite lo gestiona el agente de origen. Las líneas
                // manuales/personalizadas quedan sin proveedor.
                $idProveedor = match (true) {
                    str_starts_with($linea->descripcion, 'Flete') => $cotizacion->id_naviera_aerolinea,
                    $linea->descripcion === 'Trámite' => $cotizacion->id_agente_origen,
                    default => null,
                };

                $embarque->costos()->create([
                    'concepto' => substr($linea->descripcion, 0, 100),
                    'id_proveedor' => $idProveedor,
                    'costo_compra' => $linea->costo_total,
                    'costo_venta' => $linea->costo_total + $linea->comision_openaccess,
                    'moneda' => $linea->moneda,
                ]);
            }

            $embarque->seguimientos()->create([
                'fecha' => now(),
                'estado' => 'Confirmado_Origen',
                'comentario' => 'Embarque creado desde cotización aceptada',
                'id_empleado_responsable' => $cotizacion->id_comercial,
            ]);

            return $embarque;
        });

        return redirect()
            ->route('comercial.embarques.show', $embarque->id_embarque)
            ->with('success', 'Embarque creado correctamente a partir de la cotización.');
    }

    private function autorizar(Cotizacion $cotizacion): void
    {
        $idComercial = Auth::user()->empleado->id_empleado;

        abort_unless($cotizacion->id_comercial === $idComercial, 403);
    }

}
