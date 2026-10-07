<?php

namespace App\Http\Controllers\GerenteOperativo;

use App\Http\Controllers\Controller;
use App\Models\DocumentoLiquidacion;
use App\Models\DocumentoLiquidacionLinea;
use App\Models\Embarque;
use App\Models\EmbarqueCosto;
use App\Models\GastoDestino;
use App\Support\AlcancesCobro;
use App\Support\DocumentoLiquidacionPdfDatos;
use App\Support\GeneradorNumeroDocumentoLiquidacion;
use App\Support\ResultadoOperacionPdfDatos;
use App\Support\TiposDocumentoLiquidacion;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class DocumentoLiquidacionController extends Controller
{
    public function store(Request $request, Embarque $embarque): RedirectResponse
    {
        abort_if($embarque->liquidacion_cerrada_en, 403, 'La liquidación de este embarque ya está cerrada.');

        $data = $request->validate([
            'tipo' => ['required', Rule::in(TiposDocumentoLiquidacion::valores())],
            'id_proveedor' => ['nullable', 'integer', 'exists:proveedores,id_proveedor'],
            // Solo cobros: por qué se emite (null = MBL, o un house del
            // embarque), a quién (cliente o consignatario) y en qué moneda.
            'id_hbl' => ['nullable', 'integer'],
            'destinatario' => ['nullable', Rule::in(['cliente', 'consignatario'])],
            'moneda' => ['nullable', Rule::in(['USD', 'BOB', 'EUR'])],
            'numero_factura' => [
                'nullable', 'required_if:tipo,factura', 'string', 'max:50',
                Rule::unique('documentos_liquidacion', 'numero_factura')->where('tipo', 'factura'),
            ],
            'condicion_pago' => ['nullable', 'string', 'max:50'],
            'tipo_cambio' => ['nullable', 'numeric', 'gt:0'],
            'observaciones' => ['nullable', 'string'],
            'lineas' => ['required', 'array', 'min:1'],
            'lineas.*.tipo_origen' => ['required', Rule::in(['costo', 'gasto'])],
            'lineas.*.id_origen' => ['required', 'integer'],
            // Opcionales: si vienen, pisan lo que sale del costo/gasto de origen.
            // El monto ya viene en la moneda del documento.
            'lineas.*.descripcion' => ['nullable', 'string', 'max:200'],
            'lineas.*.tipo_documento' => ['nullable', 'string', 'max:50'],
            'lineas.*.numero_documento' => ['nullable', 'string', 'max:50'],
            'lineas.*.fecha_documento' => ['nullable', 'date'],
            'lineas.*.monto' => ['nullable', 'numeric'],
            // Cobros: si viene el unitario, el monto es cantidad × unitario.
            'lineas.*.cantidad' => ['nullable', 'numeric', 'gt:0'],
            'lineas.*.precio_unitario' => ['nullable', 'numeric'],
        ], [
            'numero_factura.required_if' => 'Ingresá el N° de la factura emitida.',
            'numero_factura.unique' => 'Ya hay una Factura registrada con ese número.',
        ]);

        $esCobro = TiposDocumentoLiquidacion::esCobro($data['tipo']);
        $idHbl = $esCobro ? ($data['id_hbl'] ?? null) : null;
        $destinatario = null;

        if ($esCobro) {
            $alcance = AlcancesCobro::alcance($embarque, $idHbl);

            if (! $alcance) {
                throw ValidationException::withMessages(['id_hbl' => 'El house elegido no pertenece a este embarque.']);
            }

            $destinatario = collect($alcance['destinatarios'])->firstWhere('clave', $data['destinatario'] ?? null);

            if (! $destinatario) {
                throw ValidationException::withMessages(['destinatario' => 'Seleccioná a quién cobrar (cliente o consignatario).']);
            }
        }

        if (! $esCobro && empty($data['id_proveedor'])) {
            throw ValidationException::withMessages(['id_proveedor' => 'Seleccioná a quién pagar.']);
        }

        $lineasOrigen = collect($data['lineas'])
            ->map(fn (array $linea) => $this->resolverLineaOrigen($linea, $embarque, $esCobro));

        $monedasOrigen = $lineasOrigen->pluck('moneda')->unique();

        if ($monedasOrigen->count() > 1) {
            throw ValidationException::withMessages([
                'lineas' => 'No se puede generar un documento mezclando líneas de distinta moneda ('.$monedasOrigen->implode(', ').').',
            ]);
        }

        // Los cobros se pueden emitir en otra moneda (USD, BOB o EUR): los
        // montos de origen se convierten con el T/C (1 moneda de origen = T/C
        // moneda del documento). Los pagos van siempre en la moneda de origen.
        $monedaOrigen = $monedasOrigen->first();
        $moneda = $esCobro ? ($data['moneda'] ?? $monedaOrigen) : $monedaOrigen;
        $conversion = 1.0;

        if ($moneda !== $monedaOrigen) {
            if (empty($data['tipo_cambio'])) {
                throw ValidationException::withMessages([
                    'tipo_cambio' => "Ingresá el T/C para emitir en {$moneda} (1 {$monedaOrigen} = ? {$moneda}).",
                ]);
            }

            $conversion = (float) $data['tipo_cambio'];
        }

        $enNegativo = TiposDocumentoLiquidacion::registraEnNegativo($data['tipo']);

        $lineasResueltas = $lineasOrigen->map(function (array $origen, int $indice) use ($data, $moneda, $conversion, $enNegativo) {
            $linea = $data['lineas'][$indice];
            $cantidad = filled($linea['cantidad'] ?? null) ? (float) $linea['cantidad'] : 1.0;
            $precioUnitario = filled($linea['precio_unitario'] ?? null) ? (float) $linea['precio_unitario'] : null;

            $monto = match (true) {
                $precioUnitario !== null => round($cantidad * $precioUnitario, 2),
                filled($linea['monto'] ?? null) => (float) $linea['monto'],
                default => round($origen['monto'] * $conversion, 2),
            };

            return [
                ...$origen,
                'descripcion' => filled($linea['descripcion'] ?? null) ? $linea['descripcion'] : $origen['descripcion'],
                'tipo_documento' => $linea['tipo_documento'] ?? null,
                'numero_documento' => $linea['numero_documento'] ?? null,
                'fecha_documento' => $linea['fecha_documento'] ?? null,
                'cantidad' => $cantidad,
                'precio_unitario' => $precioUnitario ?? round($monto / $cantidad, 2),
                'moneda' => $moneda,
                'monto' => $enNegativo ? -abs($monto) : $monto,
            ];
        });

        // Una misma línea de costo/gasto no puede facturarse dos veces. En
        // cobros choca con otro documento de cobro del mismo alcance: una nota
        // por MBL choca con cualquier otra, y una por house choca con las del
        // mismo house o las del MBL — así la misma línea se puede repartir
        // entre las notas de distintos houses. En pagos: una línea puede ir en
        // una Provisional y después en la orden definitiva (Orden de Pago o con
        // CF, que chocan entre sí porque ambas suman en el Resultado), y la
        // Orden de Pago (-) solo choca con otra (-).
        $tiposQueChocan = match ($data['tipo']) {
            'orden_pago', 'orden_pago_cf' => ['orden_pago', 'orden_pago_cf'],
            'orden_pago_provisional', 'orden_pago_negativa' => [$data['tipo']],
            default => TiposDocumentoLiquidacion::valoresPorCategoria('cobro'),
        };

        $lineasYaUsadas = DocumentoLiquidacionLinea::query()
            ->whereHas('documento', fn ($query) => $query
                ->where('id_embarque', $embarque->id_embarque)
                ->whereIn('tipo', $tiposQueChocan)
                ->when($idHbl, fn ($query) => $query->where(fn ($query) => $query
                    ->whereNull('id_hbl')
                    ->orWhere('id_hbl', $idHbl))))
            ->get(['tipo_origen', 'id_origen'])
            ->map(fn ($linea) => "{$linea->tipo_origen}:{$linea->id_origen}");

        $solicitadas = $lineasResueltas->map(fn ($linea) => "{$linea['tipo_origen']}:{$linea['id_origen']}");

        if ($solicitadas->intersect($lineasYaUsadas)->isNotEmpty()) {
            throw ValidationException::withMessages([
                'lineas' => $esCobro
                    ? 'Una o más líneas seleccionadas ya fueron cobradas en otro documento de cobro de este '.($idHbl ? 'house (o del MBL)' : 'embarque').' — no se puede facturar la misma línea dos veces.'
                    : 'Una o más líneas seleccionadas ya fueron pagadas en otra orden de pago ('.collect($tiposQueChocan)->map(fn ($tipo) => TiposDocumentoLiquidacion::etiqueta($tipo))->implode(' / ').') de este embarque — no se puede pagar la misma línea dos veces.',
            ]);
        }

        $documento = DB::transaction(function () use ($data, $embarque, $lineasResueltas, $moneda, $idHbl, $destinatario) {
            $documento = DocumentoLiquidacion::create([
                'id_embarque' => $embarque->id_embarque,
                'id_hbl' => $idHbl,
                'tipo' => $data['tipo'],
                'numero' => GeneradorNumeroDocumentoLiquidacion::generar($data['tipo']),
                'numero_factura' => $data['tipo'] === 'factura' ? $data['numero_factura'] : null,
                'id_cliente' => $destinatario['id_cliente'] ?? null,
                'id_proveedor' => $destinatario ? null : ($data['id_proveedor'] ?? null),
                'destinatario_nombre' => $destinatario['nombre'] ?? null,
                'destinatario_nit' => $destinatario['nit'] ?? null,
                'destinatario_direccion' => $destinatario['direccion'] ?? null,
                'moneda' => $moneda,
                'monto' => $lineasResueltas->sum('monto'),
                'condicion_pago' => $data['condicion_pago'] ?? null,
                'tipo_cambio' => $data['tipo_cambio'] ?? null,
                'fecha' => Carbon::today(),
                'observaciones' => $data['observaciones'] ?? null,
                'id_empleado_generador' => Auth::user()?->empleado?->id_empleado,
            ]);

            foreach ($lineasResueltas as $linea) {
                $documento->lineas()->create($linea);
            }

            return $documento;
        });

        return redirect()
            ->route('gerente-operativo.embarques.gastos.index', $embarque->id_embarque)
            ->with('success', TiposDocumentoLiquidacion::etiqueta($data['tipo'])." {$documento->numero} generado correctamente.");
    }

    /**
     * Descripción, monto y moneda por defecto de la línea según el costo o
     * gasto de origen (que tiene que pertenecer a este embarque).
     */
    private function resolverLineaOrigen(array $linea, Embarque $embarque, bool $esCobro): array
    {
        if ($linea['tipo_origen'] === 'costo') {
            $costo = EmbarqueCosto::where('id_embarque', $embarque->id_embarque)
                ->where('id_costo', $linea['id_origen'])
                ->first();

            abort_unless($costo, 422, 'Uno de los costos seleccionados no pertenece a este embarque.');

            return [
                'tipo_origen' => 'costo',
                'id_origen' => $costo->id_costo,
                'descripcion' => $costo->concepto,
                'monto' => (float) ($esCobro ? $costo->costo_venta : $costo->costo_compra),
                'moneda' => $costo->moneda,
            ];
        }

        $gasto = GastoDestino::where('id_embarque', $embarque->id_embarque)
            ->where('id_gasto', $linea['id_origen'])
            ->first();

        abort_unless($gasto, 422, 'Uno de los gastos seleccionados no pertenece a este embarque.');

        return [
            'tipo_origen' => 'gasto',
            'id_origen' => $gasto->id_gasto,
            'descripcion' => $gasto->concepto,
            'monto' => (float) $gasto->monto,
            'moneda' => $gasto->moneda,
        ];
    }

    public function pdf(DocumentoLiquidacion $documento): HttpResponse
    {
        abort_if(
            TiposDocumentoLiquidacion::esRegistroExterno($documento->tipo),
            404,
            'La Factura se emite en el sistema de facturación externo — acá solo queda registrada.',
        );

        $datos = DocumentoLiquidacionPdfDatos::para($documento);
        $nombreArchivo = str_replace(['/', '\\'], '-', $documento->numero);

        $vista = TiposDocumentoLiquidacion::esCobro($documento->tipo)
            ? 'pdf.liquidacion.documento_cobro'
            : 'pdf.liquidacion.orden_pago';

        $pdf = Pdf::loadView($vista, [
            ...$datos,
            'generadoEn' => Carbon::now()->locale('es')->isoFormat('D [de] MMMM [de] YYYY, HH:mm'),
        ]);

        return $pdf->stream("{$nombreArchivo}.pdf");
    }

    public function cerrarLiquidacion(Embarque $embarque): HttpResponse
    {
        if (! $embarque->liquidacion_cerrada_en) {
            $embarque->update(['liquidacion_cerrada_en' => now()]);
        }

        $datos = ResultadoOperacionPdfDatos::para($embarque->fresh());
        $nombreArchivo = 'Resultado-Operacion-'.str_replace(['/', '\\'], '-', $embarque->numero_file);

        $pdf = Pdf::loadView('pdf.liquidacion.resultado_operacion', [
            ...$datos,
            'generadoEn' => Carbon::now()->locale('es')->isoFormat('D [de] MMMM [de] YYYY, HH:mm'),
        ]);

        return $pdf->stream("{$nombreArchivo}.pdf");
    }
}
