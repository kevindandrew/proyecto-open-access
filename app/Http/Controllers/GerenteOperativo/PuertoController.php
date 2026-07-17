<?php

namespace App\Http\Controllers\GerenteOperativo;

use App\Http\Controllers\Controller;
use App\Models\PuertoAeropuerto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PuertoController extends Controller
{
    private const TIPOS = ['Puerto', 'Aeropuerto', 'Frontera'];

    public function index(): Response
    {
        $puertos = PuertoAeropuerto::orderBy('nombre')
            ->get()
            ->map(fn (PuertoAeropuerto $puerto) => [
                'codigo' => $puerto->codigo,
                'nombre' => $puerto->nombre,
                'tipo' => $puerto->tipo,
                'pais' => $puerto->pais,
                'activo' => $puerto->activo,
            ]);

        return Inertia::render('GerenteOperativo/Configuracion/Puertos/Index', [
            'puertos' => $puertos,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('GerenteOperativo/Configuracion/Puertos/Form', [
            'puerto' => null,
            'tipos' => self::TIPOS,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'codigo' => ['required', 'string', 'max:10', 'alpha_num', Rule::unique('puertos_aeropuertos', 'codigo')],
            'nombre' => ['required', 'string', 'max:150'],
            'tipo' => ['required', Rule::in(self::TIPOS)],
            'pais' => ['nullable', 'string', 'max:60'],
        ]);

        $data['codigo'] = strtoupper($data['codigo']);
        $data['activo'] = true;

        PuertoAeropuerto::create($data);

        return redirect()
            ->route('gerente-operativo.configuracion.puertos.index')
            ->with('success', 'Puerto/Aeropuerto creado correctamente.');
    }

    public function edit(PuertoAeropuerto $puerto): Response
    {
        return Inertia::render('GerenteOperativo/Configuracion/Puertos/Form', [
            'puerto' => [
                'codigo' => $puerto->codigo,
                'nombre' => $puerto->nombre,
                'tipo' => $puerto->tipo,
                'pais' => $puerto->pais,
                'activo' => $puerto->activo,
            ],
            'tipos' => self::TIPOS,
        ]);
    }

    public function update(Request $request, PuertoAeropuerto $puerto): RedirectResponse
    {
        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:150'],
            'tipo' => ['required', Rule::in(self::TIPOS)],
            'pais' => ['nullable', 'string', 'max:60'],
            'activo' => ['boolean'],
        ]);

        $data['activo'] = $request->boolean('activo', true);

        $puerto->update($data);

        return redirect()
            ->route('gerente-operativo.configuracion.puertos.index')
            ->with('success', 'Puerto/Aeropuerto actualizado correctamente.');
    }

    public function destroy(PuertoAeropuerto $puerto): RedirectResponse
    {
        $puerto->update(['activo' => false]);

        return redirect()
            ->route('gerente-operativo.configuracion.puertos.index')
            ->with('success', "{$puerto->nombre} fue desactivado.");
    }
}
