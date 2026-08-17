<?php

namespace App\Http\Controllers\GerenteOperativo;

use App\Http\Controllers\Controller;
use App\Models\Proveedor;
use App\Support\CloudinaryUploader;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProveedorController extends Controller
{
    private const TIPOS = ['Naviera', 'Aerolinea', 'Transportista', 'Agente_Origen'];

    public function index(): Response
    {
        $proveedores = Proveedor::orderBy('nombre')
            ->get()
            ->map(fn (Proveedor $proveedor) => [
                'id_proveedor' => $proveedor->id_proveedor,
                'tipo' => $proveedor->tipo,
                'nombre' => $proveedor->nombre,
                'nombre_fantasia' => $proveedor->nombre_fantasia,
                'contacto' => $proveedor->contacto,
                'telefono' => $proveedor->telefono,
                'email' => $proveedor->email,
                'pais' => $proveedor->pais,
                'activo' => $proveedor->activo,
            ]);

        return Inertia::render('GerenteOperativo/Configuracion/Proveedores/Index', [
            'proveedores' => $proveedores,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('GerenteOperativo/Configuracion/Proveedores/Form', [
            'proveedor' => null,
            'tipos' => self::TIPOS,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validado($request);

        if ($request->hasFile('documento_nit')) {
            $data['documento_nit_url'] = CloudinaryUploader::subir($request->file('documento_nit'), 'open-access/proveedores/documentos');
        }

        Proveedor::create($data);

        return redirect()
            ->route('gerente-operativo.configuracion.proveedores.index')
            ->with('success', 'Proveedor creado correctamente.');
    }

    public function edit(Proveedor $proveedor): Response
    {
        return Inertia::render('GerenteOperativo/Configuracion/Proveedores/Form', [
            'proveedor' => [
                'id_proveedor' => $proveedor->id_proveedor,
                'tipo' => $proveedor->tipo,
                'nombre' => $proveedor->nombre,
                'nombre_fantasia' => $proveedor->nombre_fantasia,
                'codigo_interno' => $proveedor->codigo_interno,
                'contacto' => $proveedor->contacto,
                'direccion1' => $proveedor->direccion1,
                'direccion2' => $proveedor->direccion2,
                'ciudad' => $proveedor->ciudad,
                'pais' => $proveedor->pais,
                'telefono' => $proveedor->telefono,
                'celular' => $proveedor->celular,
                'nit' => $proveedor->nit,
                'documento_nit_url' => $proveedor->documento_nit_url,
                'email' => $proveedor->email,
                'activo' => $proveedor->activo,
            ],
            'tipos' => self::TIPOS,
        ]);
    }

    public function update(Request $request, Proveedor $proveedor): RedirectResponse
    {
        $data = $this->validado($request);

        $data['documento_nit_url'] = $request->hasFile('documento_nit')
            ? CloudinaryUploader::subir($request->file('documento_nit'), 'open-access/proveedores/documentos')
            : $proveedor->documento_nit_url;

        $proveedor->update($data);

        return redirect()
            ->route('gerente-operativo.configuracion.proveedores.index')
            ->with('success', 'Proveedor actualizado correctamente.');
    }

    public function destroy(Proveedor $proveedor): RedirectResponse
    {
        $proveedor->update(['activo' => false]);

        return redirect()
            ->route('gerente-operativo.configuracion.proveedores.index')
            ->with('success', "{$proveedor->nombre} fue desactivado.");
    }

    private function validado(Request $request): array
    {
        $data = $request->validate([
            'tipo' => ['required', Rule::in(self::TIPOS)],
            'nombre' => ['required', 'string', 'max:200'],
            'nombre_fantasia' => ['nullable', 'string', 'max:100'],
            'codigo_interno' => ['nullable', 'string', 'max:20'],
            'contacto' => ['nullable', 'string', 'max:150'],
            'direccion1' => ['nullable', 'string'],
            'direccion2' => ['nullable', 'string'],
            'ciudad' => ['nullable', 'string', 'max:100'],
            'pais' => ['nullable', 'string', 'max:60'],
            'telefono' => ['nullable', 'string', 'max:50'],
            'celular' => ['nullable', 'string', 'max:30'],
            'nit' => ['nullable', 'string', 'max:30'],
            'documento_nit' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'email' => ['nullable', 'email', 'max:200'],
            'activo' => ['boolean'],
        ]);

        $data['activo'] = $request->boolean('activo', true);
        unset($data['documento_nit']);

        return $data;
    }
}
