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
        $cantidad = max(1, (int) ($data['cantidad'] ?? 1));

        // Cada contenedor físico es único (su propio número, sello, peso,
        // etc.), así que cantidad > 1 siempre se desdobla en filas separadas
        // en vez de una sola fila "5x 20 DRY" con un solo número compartido.
        for ($i = 0; $i < $cantidad; $i++) {
            $embarque->contenedores()->create([
                'tipo_contenedor' => $data['tipo_contenedor'] ?? null,
                'cantidad' => 1,
                'numero_contenedor' => $cantidad === 1 ? ($data['numero_contenedor'] ?? null) : null,
                'numero_sello' => $cantidad === 1 ? ($data['numero_sello'] ?? null) : null,
                'peso_kg' => $cantidad === 1 ? ($data['peso_kg'] ?? null) : null,
                'volumen_cbm' => $cantidad === 1 ? ($data['volumen_cbm'] ?? null) : null,
                'descripcion_mercancia' => $data['descripcion_mercancia'] ?? null,
                'fecha_devolucion' => $cantidad === 1 ? ($data['fecha_devolucion'] ?? null) : null,
            ]);
        }

        return redirect()
            ->route('gerente-operativo.embarques.show', $embarque->id_embarque)
            ->with('success', $cantidad > 1 ? "{$cantidad} contenedores agregados correctamente." : 'Contenedor agregado correctamente.');
    }

    public function update(Request $request, EmbarqueContenedor $contenedor): RedirectResponse
    {
        $data = $this->validado($request);
        unset($data['cantidad']);

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
