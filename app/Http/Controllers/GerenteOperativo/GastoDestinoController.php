<?php

namespace App\Http\Controllers\GerenteOperativo;

use App\Http\Controllers\Controller;
use App\Models\Embarque;
use App\Models\GastoDestino;
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
        $embarque->load(['cliente', 'gastosDestino' => fn ($query) => $query->orderByDesc('id_gasto')]);

        return Inertia::render('GerenteOperativo/Liquidacion/Show', [
            'embarque' => [
                'id_embarque' => $embarque->id_embarque,
                'numero_file' => $embarque->numero_file,
                'cliente' => $embarque->cliente?->razon_social,
            ],
            'gastos' => $embarque->gastosDestino->map(fn (GastoDestino $gasto) => [
                'id_gasto' => $gasto->id_gasto,
                'concepto' => $gasto->concepto,
                'monto' => $gasto->monto,
                'moneda' => $gasto->moneda,
                'pagado' => $gasto->pagado,
                'fecha_pago' => $gasto->fecha_pago?->toDateString(),
            ]),
            'total' => $embarque->gastosDestino->sum('monto'),
        ]);
    }

    public function store(Request $request, Embarque $embarque): RedirectResponse
    {
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
        $gasto->update([
            'pagado' => true,
            'fecha_pago' => Carbon::today(),
        ]);

        return redirect()
            ->route('gerente-operativo.embarques.gastos.index', $gasto->id_embarque)
            ->with('success', 'Gasto marcado como pagado.');
    }
}
