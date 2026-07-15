<?php

namespace App\Http\Controllers\Comercial;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use App\Models\Cotizacion;
use App\Models\CotizacionContenedor;
use App\Models\CotizacionDetalle;
use App\Models\Embarque;
use App\Models\Empleado;
use App\Models\Proveedor;
use App\Models\PuertoAeropuerto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CotizacionController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Comercial/Cotizaciones/Nueva', [
            'puertos' => PuertoAeropuerto::orderBy('nombre')->get(['codigo', 'nombre', 'tipo']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $comercial = Auth::user()->empleado;

        $data = $request->validate([
            'id_cliente' => ['required', 'integer', 'exists:clientes,id_cliente'],
            'modo_transporte' => ['required', Rule::in(['Maritimo', 'Aereo', 'Terrestre'])],
            'tipo_servicio' => ['nullable', Rule::in(['FCL', 'LCL'])],
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

        $clientePertenece = Cliente::where('id_cliente', $data['id_cliente'])
            ->where('id_comercial', $comercial->id_empleado)
            ->exists();

        abort_unless($clientePertenece, 403);

        $cotizacion = DB::transaction(function () use ($data, $comercial) {
            $cotizacion = Cotizacion::create([
                'numero_referencia' => $this->generarNumeroReferencia($comercial),
                'id_cliente' => $data['id_cliente'],
                'id_comercial' => $comercial->id_empleado,
                'modo_transporte' => $data['modo_transporte'],
                'tipo_servicio' => $data['tipo_servicio'] ?? null,
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
            ->route('comercial.cotizaciones.show', $cotizacion->id_cotizacion)
            ->with('success', 'Cotización creada correctamente.');
    }

    public function show(Cotizacion $cotizacion): Response
    {
        $this->autorizar($cotizacion);

        $cotizacion->load(['cliente', 'pol', 'pod', 'contenedores', 'detalle', 'embarques']);

        return Inertia::render('Comercial/Cotizaciones/Show', [
            'cotizacion' => [
                'id_cotizacion' => $cotizacion->id_cotizacion,
                'numero_referencia' => $cotizacion->numero_referencia,
                'cliente' => $cotizacion->cliente?->razon_social,
                'modo_transporte' => $cotizacion->modo_transporte,
                'tipo_servicio' => $cotizacion->tipo_servicio,
                'incoterm' => $cotizacion->incoterm,
                'pol' => $cotizacion->pol?->nombre,
                'pod' => $cotizacion->pod?->nombre,
                'destino_final' => $cotizacion->destino_final,
                'fecha_emision' => $cotizacion->fecha_emision->toDateString(),
                'fecha_validez' => $cotizacion->fecha_validez->toDateString(),
                'estado' => $cotizacion->estado,
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
                ->orderBy('nombre')
                ->get(['id_proveedor', 'nombre']),
            'proveedoresTransporte' => Proveedor::whereIn('tipo', $this->tiposTransportePara($cotizacion->modo_transporte))
                ->orderBy('nombre')
                ->get(['id_proveedor', 'nombre']),
        ]);
    }

    public function cambiarEstado(Request $request, Cotizacion $cotizacion): RedirectResponse
    {
        $this->autorizar($cotizacion);

        $data = $request->validate([
            'estado' => ['required', Rule::in(['Aceptado', 'Rechazado'])],
        ]);

        if ($cotizacion->estado !== 'Cotizado') {
            return redirect()
                ->route('comercial.cotizaciones.show', $cotizacion->id_cotizacion)
                ->with('error', 'Esta cotización ya no está en estado Cotizado.');
        }

        $cotizacion->update(['estado' => $data['estado']]);

        return redirect()
            ->route('comercial.cotizaciones.show', $cotizacion->id_cotizacion)
            ->with('success', "Cotización marcada como {$data['estado']}.");
    }

    public function convertirEnEmbarque(Request $request, Cotizacion $cotizacion): RedirectResponse
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

        $data = $request->validate([
            'consignatario' => ['nullable', 'string', 'max:200'],
            'id_agente_origen' => ['nullable', 'integer', 'exists:proveedores,id_proveedor'],
            'id_naviera_aerolinea' => [
                'nullable',
                'integer',
                Rule::exists('proveedores', 'id_proveedor')
                    ->where(fn ($query) => $query->whereIn('tipo', $this->tiposTransportePara($cotizacion->modo_transporte))),
            ],
        ]);

        $embarque = DB::transaction(function () use ($data, $cotizacion) {
            $embarque = Embarque::create([
                'numero_file' => $this->generarNumeroFile(),
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
            ->route('comercial.embarques.show', $embarque->id_embarque)
            ->with('success', 'Embarque creado correctamente a partir de la cotización.');
    }

    private function autorizar(Cotizacion $cotizacion): void
    {
        $idComercial = Auth::user()->empleado->id_empleado;

        abort_unless($cotizacion->id_comercial === $idComercial, 403);
    }

    private function tiposTransportePara(string $modo): array
    {
        return match ($modo) {
            'Maritimo' => ['Naviera'],
            'Aereo' => ['Aerolinea'],
            'Terrestre' => ['Transportista'],
            default => [],
        };
    }

    private function generarNumeroReferencia(Empleado $comercial): string
    {
        $iniciales = $this->iniciales($comercial->nombre_completo);
        $ciudad = 'LPZ';
        $anio = now()->format('y');
        $prefijo = "{$iniciales}{$ciudad}/{$anio}-";

        $consecutivo = Cotizacion::where('numero_referencia', 'like', "{$prefijo}%")->count() + 1;

        return $prefijo.str_pad((string) $consecutivo, 4, '0', STR_PAD_LEFT);
    }

    private function iniciales(string $nombreCompleto): string
    {
        $partes = preg_split('/\s+/', trim($nombreCompleto));
        $primerNombre = $partes[0] ?? '';
        $primerApellido = $partes[1] ?? $partes[0] ?? '';

        return strtoupper(substr($primerNombre, 0, 2).substr($primerApellido, 0, 2));
    }

    private function generarNumeroFile(): string
    {
        $prefijo = now()->format('ym');
        $consecutivo = Embarque::where('numero_file', 'like', "{$prefijo}%")->count() + 1;

        return $prefijo.str_pad((string) $consecutivo, 3, '0', STR_PAD_LEFT);
    }
}
