<?php

namespace App\Http\Controllers\GerenteComercial;

use App\Http\Controllers\Controller;
use App\Models\Ciudad;
use App\Models\Cliente;
use App\Models\DocumentoCliente;
use App\Models\Empleado;
use App\Support\CloudinaryUploader;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;
use Inertia\Inertia;
use Inertia\Response;

class ClienteController extends Controller
{
    private const MESES_SIN_SEGUIMIENTO = 6;

    public function index(): Response
    {
        $limiteSeguimiento = Carbon::today()->subMonths(self::MESES_SIN_SEGUIMIENTO);

        $clientes = Cliente::withTrashed()
            ->with(['ciudad', 'comercial'])
            ->withMax('cotizaciones as ultima_cotizacion', 'fecha_emision')
            ->orderBy('razon_social')
            ->get()
            ->map(fn (Cliente $cliente) => [
                'id_cliente' => $cliente->id_cliente,
                'razon_social' => $cliente->razon_social,
                'nit' => $cliente->nit,
                'ciudad' => $cliente->ciudad?->nombre_ciudad ?? $cliente->ciudad_personalizada,
                'id_ciudad' => $cliente->id_ciudad,
                'ciudad_personalizada' => $cliente->ciudad_personalizada,
                'direccion' => $cliente->direccion,
                'persona_contacto' => $cliente->persona_contacto,
                'telefono1' => $cliente->telefono1,
                'celular_whatsapp' => $cliente->celular_whatsapp,
                'email' => $cliente->email,
                'correo_factura' => $cliente->correo_factura,
                'condicion_pago' => $cliente->condicion_pago,
                'otro' => $cliente->otro,
                'id_comercial' => $cliente->id_comercial,
                'comercial' => $cliente->comercial?->nombre_completo,
                'activo' => $cliente->deleted_at === null,
                'ultima_cotizacion' => $cliente->ultima_cotizacion
                    ? Carbon::parse($cliente->ultima_cotizacion)->toDateString()
                    : null,
                'sin_seguimiento' => is_null($cliente->ultima_cotizacion)
                    || Carbon::parse($cliente->ultima_cotizacion)->lt($limiteSeguimiento),
                'fue_reasignado' => $cliente->reasignado_en !== null,
                'reasignado_en' => $cliente->reasignado_en?->toDateString(),
                'consignatario_nombre' => $cliente->consignatario_nombre,
                'consignatario_nit' => $cliente->consignatario_nit,
                'consignatario_direccion' => $cliente->consignatario_direccion,
                'consignatario_celular' => $cliente->consignatario_celular,
                'consignatario_correo' => $cliente->consignatario_correo,
            ]);

        return Inertia::render('GerenteComercial/Clientes/Index', [
            'clientes' => $clientes,
            'ciudades' => $this->ciudades(),
            'comerciales' => $this->comerciales(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('GerenteComercial/Clientes/Form', [
            'cliente' => null,
            'ciudades' => $this->ciudades(),
            'comerciales' => $this->comerciales(),
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
                        ? CloudinaryUploader::subir($request->file("documentos.{$index}.frente"), 'open-access/clientes/documentos')
                        : null,
                    'dorso_url' => $documento['tipo_documento'] === 'CI' && $request->hasFile("documentos.{$index}.dorso")
                        ? CloudinaryUploader::subir($request->file("documentos.{$index}.dorso"), 'open-access/clientes/documentos')
                        : null,
                ];
            });

        unset($data['documentos'], $data['documentos_eliminados']);

        DB::transaction(function () use ($data, $documentosParaCrear) {
            $cliente = Cliente::create($data);

            foreach ($documentosParaCrear as $documento) {
                $cliente->documentos()->create($documento);
            }
        });

        return redirect()
            ->route('gerente-comercial.clientes.index')
            ->with('success', 'Cliente creado correctamente.');
    }

    public function edit(Cliente $cliente): Response
    {
        $cliente->loadMissing('documentos');

        return Inertia::render('GerenteComercial/Clientes/Form', [
            'cliente' => [
                'id_cliente' => $cliente->id_cliente,
                'razon_social' => $cliente->razon_social,
                'nit' => $cliente->nit,
                'documentos' => $cliente->documentos->map(fn (DocumentoCliente $documento) => [
                    'id_documento' => $documento->id_documento,
                    'tipo_documento' => $documento->tipo_documento,
                    'frente_url' => $documento->frente_url,
                    'dorso_url' => $documento->dorso_url,
                ]),
                'id_ciudad' => $cliente->id_ciudad,
                'ciudad_personalizada' => $cliente->ciudad_personalizada,
                'direccion' => $cliente->direccion,
                'persona_contacto' => $cliente->persona_contacto,
                'telefono1' => $cliente->telefono1,
                'celular_whatsapp' => $cliente->celular_whatsapp,
                'email' => $cliente->email,
                'correo_factura' => $cliente->correo_factura,
                'condicion_pago' => $cliente->condicion_pago,
                'otro' => $cliente->otro,
                'id_comercial' => $cliente->id_comercial,
                'activo' => $cliente->deleted_at === null,
                'consignatario_nombre' => $cliente->consignatario_nombre,
                'consignatario_nit' => $cliente->consignatario_nit,
                'consignatario_direccion' => $cliente->consignatario_direccion,
                'consignatario_celular' => $cliente->consignatario_celular,
                'consignatario_correo' => $cliente->consignatario_correo,
            ],
            'ciudades' => $this->ciudades(),
            'comerciales' => $this->comerciales(),
        ]);
    }

    public function update(Request $request, Cliente $cliente): RedirectResponse
    {
        $cliente->loadMissing('documentos');
        $data = $this->validado($request, $cliente);

        $documentosResueltos = collect($data['documentos'] ?? [])
            ->values()
            ->map(function (array $documento, int $index) use ($request, $cliente) {
                $existente = ! empty($documento['id_documento'])
                    ? $cliente->documentos->firstWhere('id_documento', (int) $documento['id_documento'])
                    : null;

                $frenteUrl = $request->hasFile("documentos.{$index}.frente")
                    ? CloudinaryUploader::subir($request->file("documentos.{$index}.frente"), 'open-access/clientes/documentos')
                    : $existente?->frente_url;

                $dorsoUrl = match (true) {
                    $documento['tipo_documento'] !== 'CI' => null,
                    $request->hasFile("documentos.{$index}.dorso") => CloudinaryUploader::subir($request->file("documentos.{$index}.dorso"), 'open-access/clientes/documentos'),
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

        DB::transaction(function () use ($request, $data, $cliente, $documentosResueltos, $documentosEliminados) {
            $cliente->update($data);

            if ($request->boolean('activo')) {
                $cliente->restore();
            } else {
                $cliente->delete();
            }

            if (! empty($documentosEliminados)) {
                $cliente->documentos()->whereIn('id_documento', $documentosEliminados)->delete();
            }

            foreach ($documentosResueltos as $documento) {
                if ($documento['id_documento']) {
                    $cliente->documentos()
                        ->where('id_documento', $documento['id_documento'])
                        ->update([
                            'tipo_documento' => $documento['tipo_documento'],
                            'frente_url' => $documento['frente_url'],
                            'dorso_url' => $documento['dorso_url'],
                        ]);
                } else {
                    $cliente->documentos()->create([
                        'tipo_documento' => $documento['tipo_documento'],
                        'frente_url' => $documento['frente_url'],
                        'dorso_url' => $documento['dorso_url'],
                    ]);
                }
            }
        });

        return redirect()
            ->route('gerente-comercial.clientes.index')
            ->with('success', 'Cliente actualizado correctamente.');
    }

    public function destroy(Cliente $cliente): RedirectResponse
    {
        $cliente->delete();

        return redirect()
            ->route('gerente-comercial.clientes.index')
            ->with('success', "{$cliente->razon_social} fue desactivado.");
    }

    public function reasignar(Request $request, Cliente $cliente): RedirectResponse
    {
        $data = $request->validate([
            'id_comercial' => ['required', 'integer', Rule::exists('empleados', 'id_empleado')],
        ]);

        $nuevoComercial = Empleado::findOrFail($data['id_comercial']);

        $cliente->update([
            'id_comercial' => $data['id_comercial'],
            'reasignado_en' => now(),
        ]);

        return redirect()
            ->route('gerente-comercial.clientes.index')
            ->with('success', "{$cliente->razon_social} fue reasignado a {$nuevoComercial->nombre_completo}.");
    }

    public function buscar(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));

        $clientes = Cliente::when($q !== '', fn ($query) => $query->where('razon_social', 'ilike', "%{$q}%"))
            ->orderBy('razon_social')
            ->limit(50)
            ->get(['id_cliente', 'razon_social', 'nit']);

        return response()->json($clientes);
    }

    private function validado(Request $request, ?Cliente $cliente = null): array
    {
        $validator = validator($request->all(), [
            'razon_social' => ['required', 'string', 'max:200'],
            'nit' => ['nullable', 'string', 'max:30'],
            'documentos' => ['nullable', 'array'],
            'documentos.*.id_documento' => ['nullable', 'integer'],
            'documentos.*.tipo_documento' => ['required', 'string', 'max:50'],
            'documentos.*.frente' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'documentos.*.dorso' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'documentos_eliminados' => ['nullable', 'array'],
            'documentos_eliminados.*' => ['integer'],
            'id_ciudad' => ['nullable', 'string'],
            'ciudad_personalizada' => ['nullable', 'string', 'max:100'],
            'direccion' => ['nullable', 'string'],
            'persona_contacto' => ['nullable', 'string', 'max:150'],
            'telefono1' => ['nullable', 'string', 'max:30'],
            'celular_whatsapp' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:120'],
            'correo_factura' => ['nullable', 'email', 'max:120'],
            'condicion_pago' => ['nullable', 'string', 'max:50'],
            'otro' => ['nullable', 'string'],
            'id_comercial' => [
                'required', 'integer',
                Rule::exists('empleados', 'id_empleado'),
            ],
            'consignatario_nombre' => ['nullable', 'string', 'max:150'],
            'consignatario_nit' => ['nullable', 'string', 'max:30'],
            'consignatario_direccion' => ['nullable', 'string'],
            'consignatario_celular' => ['nullable', 'string', 'max:30'],
            'consignatario_correo' => ['nullable', 'email', 'max:120'],
        ])->after(function (Validator $validator) use ($request, $cliente) {
            $idCiudad = $request->input('id_ciudad');

            if ($idCiudad === 'OTRO') {
                if (! $request->filled('ciudad_personalizada')) {
                    $validator->errors()->add('ciudad_personalizada', 'Especificá la ciudad o país.');
                }
            } elseif (filled($idCiudad) && ! Ciudad::where('cod_ciudad', $idCiudad)->exists()) {
                $validator->errors()->add('id_ciudad', 'La ciudad seleccionada no es válida.');
            }

            foreach ($request->input('documentos', []) as $index => $documento) {
                $tipo = $documento['tipo_documento'] ?? null;
                $idDocumento = $documento['id_documento'] ?? null;
                $existente = $idDocumento && $cliente
                    ? $cliente->documentos->firstWhere('id_documento', (int) $idDocumento)
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

        $validated = $validator->validate();

        if ($validated['id_ciudad'] === 'OTRO') {
            $validated['id_ciudad'] = null;
        } else {
            $validated['ciudad_personalizada'] = null;
            $validated['id_ciudad'] = $validated['id_ciudad'] !== '' ? $validated['id_ciudad'] : null;
        }

        return $validated;
    }

    private function ciudades()
    {
        return Ciudad::orderBy('nombre_ciudad')->get(['cod_ciudad', 'nombre_ciudad']);
    }

    private function comerciales()
    {
        return Empleado::whereHas('rol', fn ($query) => $query->whereIn('nombre_rol', ['Comercial', 'Gerente Comercial']))
            ->where('activo', true)
            ->orderBy('nombre_completo')
            ->get(['id_empleado', 'nombre_completo']);
    }
}
