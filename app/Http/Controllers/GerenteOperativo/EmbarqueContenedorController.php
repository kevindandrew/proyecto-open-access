<?php

namespace App\Http\Controllers\GerenteOperativo;

use App\Http\Controllers\Controller;
use App\Models\Embarque;
use App\Models\EmbarqueContenedor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EmbarqueContenedorController extends Controller
{
    public function store(Request $request, Embarque $embarque): RedirectResponse
    {
        $data = $this->validado($request);

        $embarque->contenedores()->create($data);

        return redirect()
            ->route('gerente-operativo.embarques.show', $embarque->id_embarque)
            ->with('success', 'Contenedor agregado correctamente.');
    }

    public function update(Request $request, EmbarqueContenedor $contenedor): RedirectResponse
    {
        $data = $this->validado($request);

        $contenedor->update($data);

        return redirect()
            ->route('gerente-operativo.embarques.show', $contenedor->id_embarque)
            ->with('success', 'Contenedor actualizado correctamente.');
    }

    public function destroy(EmbarqueContenedor $contenedor): RedirectResponse
    {
        $idEmbarque = $contenedor->id_embarque;
        $contenedor->delete();

        return redirect()
            ->route('gerente-operativo.embarques.show', $idEmbarque)
            ->with('success', 'Contenedor eliminado correctamente.');
    }

    private function validado(Request $request): array
    {
        return $request->validate([
            'tipo_contenedor' => ['nullable', 'string', 'max:50'],
            'cantidad' => ['nullable', 'integer', 'min:1'],
            'numero_contenedor' => ['nullable', 'string', 'max:20'],
            'numero_sello' => ['nullable', 'string', 'max:20'],
            'peso_kg' => ['nullable', 'numeric'],
            'volumen_cbm' => ['nullable', 'numeric'],
            'descripcion_mercancia' => ['nullable', 'string'],
            'fecha_devolucion' => ['nullable', 'date'],
        ]);
    }
}
