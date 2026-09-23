<?php

namespace App\Http\Controllers\Comercial;

use App\Http\Controllers\Controller;
use App\Models\Ciudad;
use App\Models\Cliente;
use App\Support\CloudinaryUploader;
use App\Support\ConsignatariosSincronizador;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Validator;
use Inertia\Inertia;
use Inertia\Response;

class ClienteController extends Controller
{
    public function index(): Response
    {
        $idComercial = Auth::user()->empleado->id_empleado;

        $clientes = Cliente::with(['ciudad', 'documentos', 'consignatarios'])
            ->where('id_comercial', $idComercial)
            ->withMax('cotizaciones as ultima_cotizacion', 'fecha_emision')
            ->orderBy('razon_social')
            ->get()
            ->map(fn (Cliente $cliente) => [
                'id_cliente' => $cliente->id_cliente,
                'razon_social' => $cliente->razon_social,
                'nit' => $cliente->nit,
                'ciudad' => $cliente->ciudad?->nombre_ciudad,
                'id_ciudad' => $cliente->id_ciudad,
                'direccion' => $cliente->direccion,
                'persona_contacto' => $cliente->persona_contacto,
                'telefono1' => $cliente->telefono1,
                'celular_whatsapp' => $cliente->celular_whatsapp,
                'email' => $cliente->email,
                'correo_factura' => $cliente->correo_factura,
                'condicion_pago' => $cliente->condicion_pago,
                'ultima_cotizacion' => $cliente->ultima_cotizacion,
                'documentos' => $cliente->documentos->map(fn ($documento) => [
                    'id_documento' => $documento->id_documento,
                    'tipo_documento' => $documento->tipo_documento,
                    'frente_url' => $documento->frente_url,
                    'dorso_url' => $documento->dorso_url,
                ]),
                'consignatarios' => $cliente->consignatarios->map(fn ($consignatario) => [
                    'id_consignatario' => $consignatario->id_consignatario,
                    'nombre' => $consignatario->nombre,
                    'nit' => $consignatario->nit,
                    'direccion' => $consignatario->direccion,
                    'celular' => $consignatario->celular,
                    'correo' => $consignatario->correo,
                ]),
            ]);

        return Inertia::render('Comercial/Clientes/Index', [
            'clientes' => $clientes,
            'ciudades' => Ciudad::orderBy('nombre_ciudad')->get(['cod_ciudad', 'nombre_ciudad']),
        ]);
    }

    public function buscar(Request $request): JsonResponse
    {
        $idComercial = Auth::user()->empleado->id_empleado;
        $q = trim((string) $request->query('q', ''));

        $clientes = Cliente::where('id_comercial', $idComercial)
            ->when($q !== '', fn ($query) => $query->where('razon_social', 'ilike', "%{$q}%"))
            ->orderBy('razon_social')
            ->limit(50)
            ->get(['id_cliente', 'razon_social', 'nit']);

        return response()->json($clientes);
    }

    public function store(Request $request): RedirectResponse
    {
        $idComercial = Auth::user()->empleado->id_empleado;
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

        $consignatarios = $data['consignatarios'] ?? [];
        unset($data['documentos'], $data['documentos_eliminados'], $data['consignatarios'], $data['consignatarios_eliminados']);

        DB::transaction(function () use ($data, $idComercial, $documentosParaCrear, $consignatarios) {
            $cliente = Cliente::create([...$data, 'id_comercial' => $idComercial]);

            foreach ($documentosParaCrear as $documento) {
                $cliente->documentos()->create($documento);
            }

            ConsignatariosSincronizador::sincronizar($cliente, $consignatarios);
        });

        return redirect()
            ->route('comercial.clientes.index')
            ->with('success', 'Cliente creado correctamente.');
    }

    public function update(Request $request, Cliente $cliente): RedirectResponse
    {
        $this->autorizar($cliente);
        $cliente->loadMissing(['documentos', 'consignatarios']);
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
        $consignatarios = $data['consignatarios'] ?? [];
        $consignatariosEliminados = $data['consignatarios_eliminados'] ?? [];
        unset($data['documentos'], $data['documentos_eliminados'], $data['consignatarios'], $data['consignatarios_eliminados']);

        DB::transaction(function () use ($data, $cliente, $documentosResueltos, $documentosEliminados, $consignatarios, $consignatariosEliminados) {
            $cliente->update($data);

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

            ConsignatariosSincronizador::sincronizar($cliente, $consignatarios, $consignatariosEliminados);
        });

        return redirect()
            ->route('comercial.clientes.index')
            ->with('success', 'Cliente actualizado correctamente.');
    }

    private function autorizar(Cliente $cliente): void
    {
        abort_unless($cliente->id_comercial === Auth::user()->empleado->id_empleado, 403);
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
            'id_ciudad' => ['nullable', 'string', 'exists:ciudades,cod_ciudad'],
            'direccion' => ['nullable', 'string'],
            'persona_contacto' => ['nullable', 'string', 'max:150'],
            'telefono1' => ['nullable', 'string', 'max:30'],
            'celular_whatsapp' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:120'],
            'correo_factura' => ['nullable', 'email', 'max:120'],
            'condicion_pago' => ['nullable', 'string', 'max:50'],
            'consignatarios' => ['nullable', 'array'],
            'consignatarios.*.id_consignatario' => ['nullable', 'integer'],
            'consignatarios.*.nombre' => ['nullable', 'string', 'max:150'],
            'consignatarios.*.nit' => ['nullable', 'string', 'max:30'],
            'consignatarios.*.direccion' => ['nullable', 'string'],
            'consignatarios.*.celular' => ['nullable', 'string', 'max:30'],
            'consignatarios.*.correo' => ['nullable', 'email', 'max:120'],
            'consignatarios_eliminados' => ['nullable', 'array'],
            'consignatarios_eliminados.*' => ['integer'],
        ])->after(function (Validator $validator) use ($request, $cliente) {
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

        return $validator->validate();
    }
}
