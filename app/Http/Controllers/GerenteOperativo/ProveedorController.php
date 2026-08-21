<?php

namespace App\Http\Controllers\GerenteOperativo;

use App\Http\Controllers\Controller;
use App\Models\DocumentoProveedor;
use App\Models\Proveedor;
use App\Support\CloudinaryUploader;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;
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

        $documentosParaCrear = collect($data['documentos'] ?? [])
            ->values()
            ->map(function (array $documento, int $index) use ($request) {
                return [
                    'tipo_documento' => $documento['tipo_documento'],
                    'frente_url' => $request->hasFile("documentos.{$index}.frente")
                        ? CloudinaryUploader::subir($request->file("documentos.{$index}.frente"), 'open-access/proveedores/documentos')
                        : null,
                    'dorso_url' => $documento['tipo_documento'] === 'CI' && $request->hasFile("documentos.{$index}.dorso")
                        ? CloudinaryUploader::subir($request->file("documentos.{$index}.dorso"), 'open-access/proveedores/documentos')
                        : null,
                ];
            });

        unset($data['documentos'], $data['documentos_eliminados']);

        DB::transaction(function () use ($data, $documentosParaCrear) {
            $proveedor = Proveedor::create($data);

            foreach ($documentosParaCrear as $documento) {
                $proveedor->documentos()->create($documento);
            }
        });

        return redirect()
            ->route('gerente-operativo.configuracion.proveedores.index')
            ->with('success', 'Proveedor creado correctamente.');
    }

    public function edit(Proveedor $proveedor): Response
    {
        $proveedor->loadMissing('documentos');

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
                'documentos' => $proveedor->documentos->map(fn (DocumentoProveedor $documento) => [
                    'id_documento' => $documento->id_documento,
                    'tipo_documento' => $documento->tipo_documento,
                    'frente_url' => $documento->frente_url,
                    'dorso_url' => $documento->dorso_url,
                ]),
                'email' => $proveedor->email,
                'activo' => $proveedor->activo,
            ],
            'tipos' => self::TIPOS,
        ]);
    }

    public function update(Request $request, Proveedor $proveedor): RedirectResponse
    {
        $proveedor->loadMissing('documentos');
        $data = $this->validado($request, $proveedor);

        $documentosResueltos = collect($data['documentos'] ?? [])
            ->values()
            ->map(function (array $documento, int $index) use ($request, $proveedor) {
                $existente = ! empty($documento['id_documento'])
                    ? $proveedor->documentos->firstWhere('id_documento', (int) $documento['id_documento'])
                    : null;

                $frenteUrl = $request->hasFile("documentos.{$index}.frente")
                    ? CloudinaryUploader::subir($request->file("documentos.{$index}.frente"), 'open-access/proveedores/documentos')
                    : $existente?->frente_url;

                $dorsoUrl = match (true) {
                    $documento['tipo_documento'] !== 'CI' => null,
                    $request->hasFile("documentos.{$index}.dorso") => CloudinaryUploader::subir($request->file("documentos.{$index}.dorso"), 'open-access/proveedores/documentos'),
                    default => $existente?->dorso_url,
                };

                return [
                    'id_documento' => $existente?->id_documento,
                    'tipo_documento' => $documento['tipo_documento'],
                    'frente_url' => $frenteUrl,
                    'dorso_url' => $dorsoUrl,
                ];
            });

        $documentosEliminados = $data['documentos_eliminados'] ?? [];
        unset($data['documentos'], $data['documentos_eliminados']);

        DB::transaction(function () use ($proveedor, $data, $documentosResueltos, $documentosEliminados) {
            $proveedor->update($data);

            if (! empty($documentosEliminados)) {
                $proveedor->documentos()->whereIn('id_documento', $documentosEliminados)->delete();
            }

            foreach ($documentosResueltos as $documento) {
                if ($documento['id_documento']) {
                    $proveedor->documentos()
                        ->where('id_documento', $documento['id_documento'])
                        ->update([
                            'tipo_documento' => $documento['tipo_documento'],
                            'frente_url' => $documento['frente_url'],
                            'dorso_url' => $documento['dorso_url'],
                        ]);
                } else {
                    $proveedor->documentos()->create([
                        'tipo_documento' => $documento['tipo_documento'],
                        'frente_url' => $documento['frente_url'],
                        'dorso_url' => $documento['dorso_url'],
                    ]);
                }
            }
        });

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

    private function validado(Request $request, ?Proveedor $proveedor = null): array
    {
        $validator = validator($request->all(), [
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
            'documentos' => ['nullable', 'array'],
            'documentos.*.id_documento' => ['nullable', 'integer'],
            'documentos.*.tipo_documento' => ['required', 'string', 'max:50'],
            'documentos.*.frente' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'documentos.*.dorso' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'documentos_eliminados' => ['nullable', 'array'],
            'documentos_eliminados.*' => ['integer'],
            'email' => ['nullable', 'email', 'max:200'],
            'activo' => ['boolean'],
        ])->after(function (Validator $validator) use ($request, $proveedor) {
            foreach ($request->input('documentos', []) as $index => $documento) {
                $tipo = $documento['tipo_documento'] ?? null;
                $idDocumento = $documento['id_documento'] ?? null;
                $existente = $idDocumento && $proveedor
                    ? $proveedor->documentos->firstWhere('id_documento', (int) $idDocumento)
                    : null;

                $tendraFrente = $request->hasFile("documentos.{$index}.frente") || (bool) $existente?->frente_url;

                if (! $tendraFrente) {
                    $validator->errors()->add("documentos.{$index}.frente", 'Hace falta subir el archivo de este documento.');

                    continue;
                }

                if ($tipo === 'CI') {
                    $tendraDorso = $request->hasFile("documentos.{$index}.dorso") || (bool) $existente?->dorso_url;

                    if (! $tendraDorso) {
                        $validator->errors()->add("documentos.{$index}.dorso", 'Para un CI hace falta la foto de ambos lados (frente y dorso).');
                    }
                }
            }
        });

        $data = $validator->validate();
        $data['activo'] = $request->boolean('activo', true);

        return $data;
    }
}
