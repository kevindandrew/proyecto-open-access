<?php

namespace App\Http\Controllers\GerenteOperativo;

use App\Http\Controllers\Controller;
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
use Illuminate\Validation\Validator;
use Inertia\Inertia;
use Inertia\Response;

class PersonalController extends Controller
{
    public function index(): Response
    {
        $empleados = Empleado::with(['rol', 'user'])
            ->orderBy('nombre_completo')
            ->get()
            ->map(fn (Empleado $empleado) => [
                'id_empleado' => $empleado->id_empleado,
                'nombre_completo' => $empleado->nombre_completo,
                'rol' => $empleado->rol?->nombre_rol,
                'email' => $empleado->email,
                'telefono' => $empleado->telefono,
                'especialidad_operativa' => $empleado->especialidad_operativa,
                'activo' => $empleado->activo,
                'username' => $empleado->user?->username,
            ]);

        return Inertia::render('GerenteOperativo/Personal/Index', [
            'empleados' => $empleados,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('GerenteOperativo/Personal/Form', [
            'empleado' => null,
            'roles' => $this->roles(),
            'jefes' => $this->jefesDisponibles(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validado($request);

        $documentoFrenteUrl = $request->hasFile('documento_frente')
            ? CloudinaryUploader::subir($request->file('documento_frente'), 'open-access/empleados/documentos')
            : null;

        $documentoDorsoUrl = ($data['tipo_documento'] ?? null) === 'CI' && $request->hasFile('documento_dorso')
            ? CloudinaryUploader::subir($request->file('documento_dorso'), 'open-access/empleados/documentos')
            : null;

        $credenciales = DB::transaction(function () use ($data, $documentoFrenteUrl, $documentoDorsoUrl) {
            $empleado = Empleado::create([
                'nombre_completo' => $data['nombre_completo'],
                'ci' => $data['ci'],
                'tipo_documento' => $data['tipo_documento'] ?? null,
                'documento_frente_url' => $documentoFrenteUrl,
                'documento_dorso_url' => $documentoDorsoUrl,
                'telefono' => $data['telefono'],
                'email' => $data['email'],
                'id_rol' => $data['id_rol'],
                'especialidad_operativa' => $data['especialidad_operativa'],
                'id_jefe' => $data['id_jefe'],
                'activo' => true,
            ]);

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
            ->route('gerente-operativo.personal.index')
            ->with('success', 'Personal creado correctamente.')
            ->with('credenciales', $credenciales);
    }

    public function edit(Empleado $empleado): Response
    {
        return Inertia::render('GerenteOperativo/Personal/Form', [
            'empleado' => [
                'id_empleado' => $empleado->id_empleado,
                'nombre_completo' => $empleado->nombre_completo,
                'ci' => $empleado->ci,
                'tipo_documento' => $empleado->tipo_documento,
                'documento_frente_url' => $empleado->documento_frente_url,
                'documento_dorso_url' => $empleado->documento_dorso_url,
                'telefono' => $empleado->telefono,
                'email' => $empleado->email,
                'id_rol' => $empleado->id_rol,
                'especialidad_operativa' => $empleado->especialidad_operativa,
                'id_jefe' => $empleado->id_jefe,
                'activo' => $empleado->activo,
                'username' => $empleado->user?->username,
            ],
            'roles' => $this->roles(),
            'jefes' => $this->jefesDisponibles($empleado->id_empleado),
        ]);
    }

    public function update(Request $request, Empleado $empleado): RedirectResponse
    {
        $data = $this->validado($request, $empleado);
        $tipoDocumento = $data['tipo_documento'] ?? null;

        $documentoFrenteUrl = $request->hasFile('documento_frente')
            ? CloudinaryUploader::subir($request->file('documento_frente'), 'open-access/empleados/documentos')
            : $empleado->documento_frente_url;

        $documentoDorsoUrl = match (true) {
            $tipoDocumento !== 'CI' => null,
            $request->hasFile('documento_dorso') => CloudinaryUploader::subir($request->file('documento_dorso'), 'open-access/empleados/documentos'),
            default => $empleado->documento_dorso_url,
        };

        $empleado->update([
            'nombre_completo' => $data['nombre_completo'],
            'ci' => $data['ci'],
            'tipo_documento' => $tipoDocumento,
            'documento_frente_url' => $documentoFrenteUrl,
            'documento_dorso_url' => $documentoDorsoUrl,
            'telefono' => $data['telefono'],
            'email' => $data['email'],
            'id_rol' => $data['id_rol'],
            'especialidad_operativa' => $data['especialidad_operativa'],
            'id_jefe' => $data['id_jefe'],
            'activo' => $request->boolean('activo'),
        ]);

        $empleado->user?->update([
            'name' => $data['nombre_completo'],
            'email' => $data['email'],
        ]);

        return redirect()
            ->route('gerente-operativo.personal.index')
            ->with('success', 'Personal actualizado correctamente.');
    }

    public function destroy(Empleado $empleado): RedirectResponse
    {
        $empleado->update(['activo' => false]);

        return redirect()
            ->route('gerente-operativo.personal.index')
            ->with('success', "{$empleado->nombre_completo} fue desactivado.");
    }

    private function validado(Request $request, ?Empleado $empleado = null): array
    {
        $idRolOperativo = RoleEmpleado::where('nombre_rol', 'Operativo')->value('id_rol');

        $validator = validator($request->all(), [
            'nombre_completo' => ['required', 'string', 'max:150'],
            'ci' => ['nullable', 'string', 'max:20'],
            'tipo_documento' => ['nullable', Rule::in(['CI', 'NIT'])],
            'documento_frente' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'documento_dorso' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'telefono' => ['nullable', 'string', 'max:30'],
            'email' => [
                'required', 'email', 'max:120',
                Rule::unique('empleados', 'email')->ignore($empleado?->id_empleado, 'id_empleado'),
                Rule::unique('users', 'email')->ignore($empleado?->user?->id),
            ],
            'id_rol' => ['required', 'integer', 'exists:roles_empleado,id_rol'],
            'especialidad_operativa' => [
                Rule::requiredIf(fn () => (int) $request->input('id_rol') === $idRolOperativo),
                'nullable',
                Rule::in(['Maritimo', 'Aereo', 'Terrestre']),
            ],
            'id_jefe' => ['nullable', 'integer', 'exists:empleados,id_empleado'],
        ])->after(function (Validator $validator) use ($request, $empleado) {
            if ($request->input('tipo_documento') !== 'CI') {
                return;
            }

            $tendraFrente = $request->hasFile('documento_frente') || (bool) $empleado?->documento_frente_url;
            $tendraDorso = $request->hasFile('documento_dorso') || (bool) $empleado?->documento_dorso_url;

            if ($tendraFrente xor $tendraDorso) {
                $campoFaltante = $tendraFrente ? 'documento_dorso' : 'documento_frente';
                $validator->errors()->add($campoFaltante, 'Para un CI hace falta la foto de ambos lados (frente y dorso).');
            }
        });

        $data = $validator->validate();

        if ((int) $data['id_rol'] !== $idRolOperativo) {
            $data['especialidad_operativa'] = null;
        }

        return $data;
    }

    private function roles()
    {
        return RoleEmpleado::orderBy('nombre_rol')->get(['id_rol', 'nombre_rol']);
    }

    private function jefesDisponibles(?int $exceptoId = null)
    {
        return Empleado::where('activo', true)
            ->when($exceptoId, fn ($query, $id) => $query->where('id_empleado', '!=', $id))
            ->orderBy('nombre_completo')
            ->get(['id_empleado', 'nombre_completo']);
    }
}
