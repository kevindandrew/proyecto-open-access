<?php

namespace App\Http\Controllers\GerenteOperativo;

use App\Http\Controllers\Controller;
use App\Models\Embarque;
use App\Models\EmbarqueCosto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EmbarqueCostoController extends Controller
{
    public function store(Request $request, Embarque $embarque): RedirectResponse
    {
        $data = $request->validate([
            'concepto' => ['required', 'string', 'max:100'],
            'id_proveedor' => ['nullable', 'integer', 'exists:proveedores,id_proveedor'],
            'costo_compra' => ['nullable', 'numeric'],
            'costo_venta' => ['nullable', 'numeric'],
            'moneda' => ['required', 'string', 'max:5'],
        ]);

        $embarque->costos()->create($data);

        return redirect()
            ->route('gerente-operativo.embarques.show', $embarque->id_embarque)
            ->with('success', 'Costo agregado correctamente.');
    }

    public function update(Request $request, EmbarqueCosto $costo): RedirectResponse
    {
        $data = $request->validate([
            'concepto' => ['required', 'string', 'max:100'],
            'id_proveedor' => ['nullable', 'integer', 'exists:proveedores,id_proveedor'],
            'costo_compra' => ['nullable', 'numeric'],
            'costo_venta' => ['nullable', 'numeric'],
            'moneda' => ['required', 'string', 'max:5'],
        ]);

        $costo->update($data);

        return redirect()
            ->route('gerente-operativo.embarques.show', $costo->id_embarque)
            ->with('success', 'Costo actualizado correctamente.');
    }

    public function destroy(EmbarqueCosto $costo): RedirectResponse
    {
        $idEmbarque = $costo->id_embarque;
        $costo->delete();

        return redirect()
            ->route('gerente-operativo.embarques.show', $idEmbarque)
            ->with('success', 'Costo eliminado correctamente.');
    }
}
