<?php

namespace App\Http\Controllers\Comercial;

use App\Http\Controllers\Controller;
use App\Models\Ciudad;
use App\Models\Cliente;
use App\Support\CloudinaryUploader;
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

        $clientes = Cliente::with('ciudad')
            ->where('id_comercial', $idComercial)
            ->withMax('cotizaciones as ultima_cotizacion', 'fecha_emision')
            ->orderBy('razon_social')
            ->get()
            ->map(fn (Cliente $cliente) => [
                'id_cliente' => $cliente->id_cliente,
                'razon_social' => $cliente->razon_social,
                'ciudad' => $cliente->ciudad?->nombre_ciudad,
                'condicion_pago' => $cliente->condicion_pago,
                'ultima_cotizacion' => $cliente->ultima_cotizacion,
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

        $validator = validator($request->all(), [
            'razon_social' => ['required', 'string', 'max:200'],
            'nit' => ['nullable', 'string', 'max:30'],
            'documentos' => ['nullable', 'array'],
            'documentos.*.tipo_documento' => ['required', 'string', 'max:50'],
            'documentos.*.frente' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'documentos.*.dorso' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'id_ciudad' => ['nullable', 'string', 'exists:ciudades,cod_ciudad'],
            'direccion' => ['nullable', 'string'],
            'persona_contacto' => ['nullable', 'string', 'max:150'],
            'telefono1' => ['nullable', 'string', 'max:30'],
            'celular_whatsapp' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:120'],
            'correo_factura' => ['nullable', 'email', 'max:120'],
            'condicion_pago' => ['nullable', 'string', 'max:50'],
        ])->after(function (Validator $validator) use ($request) {
            foreach ($request->input('documentos', []) as $index => $documento) {
                $tipo = $documento['tipo_documento'] ?? null;
                $tieneFrente = $request->hasFile("documentos.{$index}.frente");

                if (! $tieneFrente) {
                    $validator->errors()->add("documentos.{$index}.frente", 'Hace falta subir el archivo de este documento.');

                    continue;
                }

                if ($tipo === 'CI' && ! $request->hasFile("documentos.{$index}.dorso")) {
                    $validator->errors()->add("documentos.{$index}.dorso", 'Para un CI hace falta la foto de ambos lados (frente y dorso).');
                }
            }
        });

        $data = $validator->validate();

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

        unset($data['documentos']);

        DB::transaction(function () use ($data, $idComercial, $documentosParaCrear) {
            $cliente = Cliente::create([...$data, 'id_comercial' => $idComercial]);

            foreach ($documentosParaCrear as $documento) {
                $cliente->documentos()->create($documento);
            }
        });

        return redirect()
            ->route('comercial.clientes.index')
            ->with('success', 'Cliente creado correctamente.');
    }
}
