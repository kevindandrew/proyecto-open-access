<?php

namespace App\Http\Controllers\GerenteComercial;

use App\Http\Controllers\Controller;
use App\Models\DocumentoEmpleado;
use App\Models\Empleado;
use App\Models\RoleEmpleado;
use App\Models\User;
use App\Support\CloudinaryUploader;
use App\Support\GeneradorUsername;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PersonalController extends Controller
{
    public function index(): Response
    {
        $empleados = Empleado::with(['user'])
            ->whereHas('rol', fn ($query) => $query->where('nombre_rol', 'Comercial'))
            ->orderBy('nombre_completo')
            ->get()
            ->map(fn (Empleado $empleado) => [
                'id_empleado' => $empleado->id_empleado,
                'nombre_completo' => $empleado->nombre_completo,
                'email' => $empleado->email,
                'telefono' => $empleado->telefono,
                'activo' => $empleado->activo,
                'username' => $empleado->user?->username,
            ]);

        return Inertia::render('GerenteComercial/Personal/Index', [
            'empleados' => $empleados,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('GerenteComercial/Personal/Form', [
            'empleado' => null,
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
                        ? CloudinaryUploader::subir($request->file("documentos.{$index}.frente"), 'open-access/empleados/documentos')
                        : null,
                    'dorso_url' => $documento['tipo_documento'] === 'CI' && $request->hasFile("documentos.{$index}.dorso")
                        ? CloudinaryUploader::subir($request->file("documentos.{$index}.dorso"), 'open-access/empleados/documentos')
                        : null,
                ];
            });

        $credenciales = DB::transaction(function () use ($data, $documentosParaCrear) {
            $empleado = Empleado::create([
                'nombre_completo' => $data['nombre_completo'],
                'ci' => $data['ci'],
                'fecha_nacimiento' => $data['fecha_nacimiento'],
                'fecha_ingreso' => $data['fecha_ingreso'],
                'telefono' => $data['telefono'],
                'email' => $data['email'],
                'id_rol' => $this->idRolComercial(),
                'activo' => true,
            ]);

            foreach ($documentosParaCrear as $documento) {
                $empleado->documentos()->create($documento);
            }

            $username = GeneradorUsername::generar($empleado->nombre_completo);
            $password = Str::password(10, symbols: false);

            User::create([
                'name' => $empleado->nombre_completo,
                'username' => $username,
                'email' => $data['email'],
                'password' => bcrypt($password),
                'empleado_id' => $empleado->id_empleado,
                'email_verified_at' => now(),
            ]);

            return ['username' => $username, 'password' => $password];
        });

        return redirect()
            ->route('gerente-comercial.personal.index')
            ->with('success', 'Comercial creado correctamente.')
            ->with('credenciales', $credenciales);
    }

    public function edit(Empleado $empleado): Response
    {
        $this->autorizar($empleado);
        $empleado->loadMissing('documentos');

        return Inertia::render('GerenteComercial/Personal/Form', [
            'empleado' => [
                'id_empleado' => $empleado->id_empleado,
                'nombre_completo' => $empleado->nombre_completo,
                'ci' => $empleado->ci,
                'fecha_nacimiento' => $empleado->fecha_nacimiento?->toDateString(),
                'fecha_ingreso' => $empleado->fecha_ingreso?->toDateString(),
                'telefono' => $empleado->telefono,
                'email' => $empleado->email,
                'activo' => $empleado->activo,
                'username' => $empleado->user?->username,
                'documentos' => $empleado->documentos->map(fn (DocumentoEmpleado $documento) => [
                    'id_documento' => $documento->id_documento,
                    'tipo_documento' => $documento->tipo_documento,
                    'frente_url' => $documento->frente_url,
                    'dorso_url' => $documento->dorso_url,
                ]),
            ],
        ]);
    }

    public function update(Request $request, Empleado $empleado): RedirectResponse
    {
        $this->autorizar($empleado);
        $data = $this->validado($request, $empleado);

        $documentosResueltos = collect($data['documentos'] ?? [])
            ->values()
            ->map(function (array $documento, int $index) use ($request, $empleado) {
                $existente = ! empty($documento['id_documento'])
                    ? $empleado->documentos->firstWhere('id_documento', (int) $documento['id_documento'])
                    : null;

                $frenteUrl = $request->hasFile("documentos.{$index}.frente")
                    ? CloudinaryUploader::subir($request->file("documentos.{$index}.frente"), 'open-access/empleados/documentos')
                    : $existente?->frente_url;

                $dorsoUrl = match (true) {
                    $documento['tipo_documento'] !== 'CI' => null,
                    $request->hasFile("documentos.{$index}.dorso") => CloudinaryUploader::subir($request->file("documentos.{$index}.dorso"), 'open-access/empleados/documentos'),
                    default => $existente?->dorso_url,
                };

                return [
                    'id_documento' => $existente?->id_documento,
                    'tipo_documento' => $documento['tipo_documento'],
                    'frente_url' => $frenteUrl,
                    'dorso_url' => $dorsoUrl,
                ];
            });

        DB::transaction(function () use ($request, $data, $empleado, $documentosResueltos) {
            $empleado->update([
                'nombre_completo' => $data['nombre_completo'],
                'ci' => $data['ci'],
                'fecha_nacimiento' => $data['fecha_nacimiento'],
                'fecha_ingreso' => $data['fecha_ingreso'],
                'telefono' => $data['telefono'],
                'email' => $data['email'],
                'activo' => $request->boolean('activo'),
            ]);

            $empleado->user?->update([
                'name' => $data['nombre_completo'],
                'email' => $data['email'],
            ]);

            if (! empty($data['documentos_eliminados'])) {
                $empleado->documentos()->whereIn('id_documento', $data['documentos_eliminados'])->delete();
            }

            foreach ($documentosResueltos as $documento) {
                if ($documento['id_documento']) {
                    $empleado->documentos()
                        ->where('id_documento', $documento['id_documento'])
                        ->update([
                            'tipo_documento' => $documento['tipo_documento'],
                            'frente_url' => $documento['frente_url'],
                            'dorso_url' => $documento['dorso_url'],
                        ]);
                } else {
                    $empleado->documentos()->create([
                        'tipo_documento' => $documento['tipo_documento'],
                        'frente_url' => $documento['frente_url'],
                        'dorso_url' => $documento['dorso_url'],
                    ]);
                }
            }
        });

        return redirect()
            ->route('gerente-comercial.personal.index')
            ->with('success', 'Comercial actualizado correctamente.');
    }

    public function destroy(Empleado $empleado): RedirectResponse
    {
        $this->autorizar($empleado);

        $empleado->update(['activo' => false]);

        return redirect()
            ->route('gerente-comercial.personal.index')
            ->with('success', "{$empleado->nombre_completo} fue desactivado.");
    }

    private function autorizar(Empleado $empleado): void
    {
        abort_unless($empleado->rol?->nombre_rol === 'Comercial', 403);
    }

    private function idRolComercial(): int
    {
        return RoleEmpleado::where('nombre_rol', 'Comercial')->value('id_rol');
    }

    private function validado(Request $request, ?Empleado $empleado = null): array
    {
        $empleado?->loadMissing('documentos');

        $validator = validator($request->all(), [
            'nombre_completo' => ['required', 'string', 'max:150'],
            'ci' => ['nullable', 'string', 'max:20'],
            'fecha_nacimiento' => ['nullable', 'date', 'before:today'],
            'fecha_ingreso' => ['nullable', 'date'],
            'documentos' => ['nullable', 'array'],
            'documentos.*.id_documento' => ['nullable', 'integer'],
            'documentos.*.tipo_documento' => ['required', 'string', 'max:50'],
            'documentos.*.frente' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'documentos.*.dorso' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'documentos_eliminados' => ['nullable', 'array'],
            'documentos_eliminados.*' => ['integer'],
            'telefono' => ['nullable', 'string', 'max:30'],
            'email' => [
                'required', 'email', 'max:120',
                Rule::unique('empleados', 'email')->ignore($empleado?->id_empleado, 'id_empleado'),
                Rule::unique('users', 'email')->ignore($empleado?->user?->id),
            ],
        ])->after(function ($validator) use ($request, $empleado) {
            foreach ($request->input('documentos', []) as $index => $documento) {
                $tipo = $documento['tipo_documento'] ?? null;
                $idDocumento = $documento['id_documento'] ?? null;
                $existente = $idDocumento && $empleado
                    ? $empleado->documentos->firstWhere('id_documento', (int) $idDocumento)
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
