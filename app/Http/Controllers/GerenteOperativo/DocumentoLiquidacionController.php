<?php

namespace App\Http\Controllers\GerenteOperativo;

use App\Http\Controllers\Controller;
use App\Models\DocumentoLiquidacion;
use App\Models\DocumentoLiquidacionLinea;
use App\Models\Embarque;
use App\Models\EmbarqueCosto;
use App\Models\GastoDestino;
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
            'id_cliente' => ['nullable', 'integer', 'exists:clientes,id_cliente'],
            'id_proveedor' => ['nullable', 'integer', 'exists:proveedores,id_proveedor'],
            'condicion_pago' => ['nullable', 'string', 'max:20'],
            'tipo_cambio' => ['nullable', 'numeric'],
            'observaciones' => ['nullable', 'string'],
            'lineas' => ['required', 'array', 'min:1'],
            'lineas.*.tipo_origen' => ['required', Rule::in(['costo', 'gasto'])],
            'lineas.*.id_origen' => ['required', 'integer'],
        ]);

        $esCobro = TiposDocumentoLiquidacion::esCobro($data['tipo']);

        if ($esCobro && empty($data['id_cliente'])) {
            throw ValidationException::withMessages(['id_cliente' => 'Seleccioná a quién cobrar.']);
        }

        if (! $esCobro && empty($data['id_proveedor'])) {
            throw ValidationException::withMessages(['id_proveedor' => 'Seleccioná a quién pagar.']);
        }

        $lineasResueltas = collect($data['lineas'])->map(function (array $linea) use ($embarque, $esCobro) {
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
        });

        $monedas = $lineasResueltas->pluck('moneda')->unique();

        if ($monedas->count() > 1) {
            throw ValidationException::withMessages([
                'lineas' => 'No se puede generar un documento mezclando líneas de distinta moneda ('.$monedas->implode(', ').').',
            ]);
        }

        // Una misma línea de costo/gasto no puede facturarse (o pagarse) dos
        // veces: si ya aparece en OTRO documento de la misma categoría
        // (cobro o pago) para este embarque, se rechaza — evita que el
        // cliente/proveedor termine cobrado/pagado dos veces por error.
        $tiposMismaCategoria = TiposDocumentoLiquidacion::valoresPorCategoria($esCobro ? 'cobro' : 'pago');

        $lineasYaUsadas = DocumentoLiquidacionLinea::query()
            ->whereHas('documento', fn ($query) => $query
                ->where('id_embarque', $embarque->id_embarque)
                ->whereIn('tipo', $tiposMismaCategoria))
            ->get(['tipo_origen', 'id_origen'])
            ->map(fn ($linea) => "{$linea->tipo_origen}:{$linea->id_origen}");

        $solicitadas = $lineasResueltas->map(fn ($linea) => "{$linea['tipo_origen']}:{$linea['id_origen']}");

        if ($solicitadas->intersect($lineasYaUsadas)->isNotEmpty()) {
            throw ValidationException::withMessages([
                'lineas' => 'Una o más líneas seleccionadas ya fueron usadas en otro documento de '.
                    ($esCobro ? 'cobro' : 'pago')." para este embarque — no se puede ".
                    ($esCobro ? 'facturar' : 'pagar')." la misma línea dos veces.",
            ]);
        }

        $documento = DB::transaction(function () use ($data, $embarque, $lineasResueltas, $monedas) {
            $documento = DocumentoLiquidacion::create([
                'id_embarque' => $embarque->id_embarque,
                'tipo' => $data['tipo'],
                'numero' => GeneradorNumeroDocumentoLiquidacion::generar($data['tipo']),
                'id_cliente' => $data['id_cliente'] ?? null,
                'id_proveedor' => $data['id_proveedor'] ?? null,
                'moneda' => $monedas->first(),
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

    public function pdf(DocumentoLiquidacion $documento): HttpResponse
    {
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
