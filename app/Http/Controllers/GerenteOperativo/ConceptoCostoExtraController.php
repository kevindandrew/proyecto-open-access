<?php

namespace App\Http\Controllers\GerenteOperativo;

use App\Http\Controllers\Controller;
use App\Models\ConceptoCostoExtra;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConceptoCostoExtraController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('GerenteOperativo/Configuracion/CostosExtra/Index', [
            'conceptos' => ConceptoCostoExtra::orderBy('nombre')->get(['id_concepto', 'nombre', 'activo']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:100'],
        ]);

        ConceptoCostoExtra::create($data);

        return redirect()
            ->route('gerente-operativo.configuracion.costos-extra.index')
            ->with('success', 'Concepto de costo extra creado correctamente.');
    }

    public function update(Request $request, ConceptoCostoExtra $concepto): RedirectResponse
    {
        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:100'],
            'activo' => ['boolean'],
        ]);

        $data['activo'] = $request->boolean('activo', true);

        $concepto->update($data);

        return redirect()
            ->route('gerente-operativo.configuracion.costos-extra.index')
            ->with('success', 'Concepto actualizado correctamente.');
    }

    public function destroy(ConceptoCostoExtra $concepto): RedirectResponse
    {
        $concepto->update(['activo' => false]);

        return redirect()
            ->route('gerente-operativo.configuracion.costos-extra.index')
            ->with('success', "{$concepto->nombre} fue desactivado.");
    }
}
