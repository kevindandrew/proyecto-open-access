<?php

namespace App\Http\Controllers\GerenteOperativo;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use App\Models\DocumentoLiquidacion;
use App\Models\Embarque;
use App\Models\EmbarqueCosto;
use App\Models\GastoDestino;
use App\Models\Proveedor;
use App\Support\TiposDocumentoLiquidacion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class GastoDestinoController extends Controller
{
    public function index(Embarque $embarque): Response
    {
        $embarque->load([
            'cliente',
            'gastosDestino' => fn ($query) => $query->orderByDesc('id_gasto'),
            'costos' => fn ($query) => $query->with('proveedor')->orderByDesc('id_costo'),
            'documentosLiquidacion' => fn ($query) => $query->with(['cliente', 'proveedor'])->orderByDesc('id_documento'),
        ]);

        return Inertia::render('GerenteOperativo/Liquidacion/Show', [
            'embarque' => [
                'id_embarque' => $embarque->id_embarque,
                'numero_file' => $embarque->numero_file,
                'cliente' => $embarque->cliente?->razon_social,
                'id_cliente' => $embarque->id_cliente,
                'liquidacion_cerrada_en' => $embarque->liquidacion_cerrada_en?->toDateString(),
            ],
            'gastos' => $embarque->gastosDestino->map(fn (GastoDestino $gasto) => [
                'id_gasto' => $gasto->id_gasto,
                'concepto' => $gasto->concepto,
                'monto' => $gasto->monto,
                'moneda' => $gasto->moneda,
                'pagado' => $gasto->pagado,
                'fecha_pago' => $gasto->fecha_pago?->toDateString(),
            ]),
            // Nunca se suma entre monedas distintas — un total por cada moneda
            // que efectivamente aparece en los gastos.
            'totalesPorMoneda' => $embarque->gastosDestino
                ->groupBy(fn (GastoDestino $gasto) => $gasto->moneda ?: 'USD')
                ->map(fn ($grupo) => $grupo->sum('monto')),
            'costos' => $embarque->costos->map(fn (EmbarqueCosto $costo) => [
                'id_costo' => $costo->id_costo,
                'concepto' => $costo->concepto,
                'proveedor' => $costo->proveedor?->nombre,
                'id_proveedor' => $costo->id_proveedor,
                'costo_compra' => $costo->costo_compra,
                'costo_venta' => $costo->costo_venta,
                'moneda' => $costo->moneda,
            ]),
            'documentos' => $embarque->documentosLiquidacion->map(fn (DocumentoLiquidacion $documento) => [
                'id_documento' => $documento->id_documento,
                'tipo' => $documento->tipo,
                'etiqueta' => TiposDocumentoLiquidacion::etiqueta($documento->tipo),
                'categoria' => TiposDocumentoLiquidacion::categoria($documento->tipo),
                'numero' => $documento->numero,
                'contraparte' => $documento->cliente?->razon_social ?? $documento->proveedor?->nombre,
                'moneda' => $documento->moneda,
                'monto' => $documento->monto,
                'fecha' => $documento->fecha->toDateString(),
            ]),
            'tiposDocumento' => TiposDocumentoLiquidacion::todos(),
            'clientes' => Cliente::orderBy('razon_social')->get(['id_cliente', 'razon_social']),
            'proveedores' => Proveedor::where('activo', true)->orderBy('nombre')->get(['id_proveedor', 'nombre']),
        ]);
    }

    public function store(Request $request, Embarque $embarque): RedirectResponse
    {
        abort_if($embarque->liquidacion_cerrada_en, 403, 'La liquidación de este embarque ya está cerrada.');

        $data = $request->validate([
            'concepto' => ['required', Rule::in(['Arancel', 'Impuesto', 'Tasa', 'Otro'])],
            'monto' => ['required', 'numeric'],
            'moneda' => ['required', 'string', 'max:5'],
        ]);

        $embarque->gastosDestino()->create($data);

        return redirect()
            ->route('gerente-operativo.embarques.gastos.index', $embarque->id_embarque)
            ->with('success', 'Gasto de destino agregado correctamente.');
    }

    public function marcarPagado(GastoDestino $gasto): RedirectResponse
    {
        abort_if($gasto->embarque->liquidacion_cerrada_en, 403, 'La liquidación de este embarque ya está cerrada.');

        $gasto->update([
            'pagado' => true,
            'fecha_pago' => Carbon::today(),
        ]);

        return redirect()
            ->route('gerente-operativo.embarques.gastos.index', $gasto->id_embarque)
            ->with('success', 'Gasto marcado como pagado.');
    }
}
