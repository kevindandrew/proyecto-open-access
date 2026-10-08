<?php

namespace App\Http\Controllers\GerenteOperativo;

use App\Http\Controllers\Controller;
use App\Models\CategoriaComision;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoriaComisionController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('GerenteOperativo/Configuracion/Comisiones/Index', [
            'categorias' => CategoriaComision::withCount('empleados')
                ->orderBy('nombre')
                ->get(['id_categoria', 'nombre', 'porcentaje', 'activo']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        CategoriaComision::create($this->validado($request));

        return redirect()
            ->route('gerente-operativo.configuracion.comisiones.index')
            ->with('success', 'Categoría de comisión creada correctamente.');
    }

    public function update(Request $request, CategoriaComision $categoria): RedirectResponse
    {
        $data = $this->validado($request);
        $data['activo'] = $request->boolean('activo', true);

        $categoria->update($data);

        return redirect()
            ->route('gerente-operativo.configuracion.comisiones.index')
            ->with('success', 'Categoría actualizada correctamente.');
    }

    public function destroy(CategoriaComision $categoria): RedirectResponse
    {
        $categoria->update(['activo' => false]);

        return redirect()
            ->route('gerente-operativo.configuracion.comisiones.index')
            ->with('success', "{$categoria->nombre} fue desactivada.");
    }

    private function validado(Request $request): array
    {
        return $request->validate([
            'nombre' => ['required', 'string', 'max:50'],
            'porcentaje' => ['required', 'numeric', 'min:0', 'max:100'],
        ]);
    }
}
