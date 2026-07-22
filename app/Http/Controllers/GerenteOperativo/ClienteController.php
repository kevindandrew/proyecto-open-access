<?php

namespace App\Http\Controllers\GerenteOperativo;

use App\Http\Controllers\Controller;
use App\Models\Ciudad;
use App\Models\Cliente;
use App\Models\Empleado;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
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
                'ciudad' => $cliente->ciudad?->nombre_ciudad,
                'persona_contacto' => $cliente->persona_contacto,
                'telefono1' => $cliente->telefono1,
                'celular_whatsapp' => $cliente->celular_whatsapp,
                'email' => $cliente->email,
                'condicion_pago' => $cliente->condicion_pago,
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
            ]);

        return Inertia::render('GerenteOperativo/Clientes/Index', [
            'clientes' => $clientes,
            'comerciales' => $this->comerciales(),
        ]);
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
            ->route('gerente-operativo.clientes.index')
            ->with('success', "{$cliente->razon_social} fue reasignado a {$nuevoComercial->nombre_completo}.");
    }

    public function buscar(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));

        $clientes = Cliente::when($q !== '', fn ($query) => $query->where('razon_social', 'ilike', "%{$q}%"))
            ->orderBy('razon_social')
            ->limit(10)
            ->get(['id_cliente', 'razon_social', 'nit']);

        return response()->json($clientes);
    }

    public function create(): Response
    {
        return Inertia::render('GerenteOperativo/Clientes/Form', [
            'cliente' => null,
            'ciudades' => $this->ciudades(),
            'comerciales' => $this->comerciales(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validado($request);

        Cliente::create($data);

        return redirect()
            ->route('gerente-operativo.clientes.index')
            ->with('success', 'Cliente creado correctamente.');
    }

    public function edit(Cliente $cliente): Response
    {
        return Inertia::render('GerenteOperativo/Clientes/Form', [
            'cliente' => [
                'id_cliente' => $cliente->id_cliente,
                'razon_social' => $cliente->razon_social,
                'nit' => $cliente->nit,
                'id_ciudad' => $cliente->id_ciudad,
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
            ],
            'ciudades' => $this->ciudades(),
            'comerciales' => $this->comerciales(),
        ]);
    }

    public function update(Request $request, Cliente $cliente): RedirectResponse
    {
        $data = $this->validado($request, $cliente);

        $cliente->update($data);

        if ($request->boolean('activo')) {
            $cliente->restore();
        } else {
            $cliente->delete();
        }

        return redirect()
            ->route('gerente-operativo.clientes.index')
            ->with('success', 'Cliente actualizado correctamente.');
    }

    public function destroy(Cliente $cliente): RedirectResponse
    {
        $cliente->delete();

        return redirect()
            ->route('gerente-operativo.clientes.index')
            ->with('success', "{$cliente->razon_social} fue desactivado.");
    }

    private function validado(Request $request, ?Cliente $cliente = null): array
    {
        return $request->validate([
            'razon_social' => ['required', 'string', 'max:200'],
            'nit' => ['nullable', 'string', 'max:30'],
            'id_ciudad' => ['nullable', 'string', 'exists:ciudades,cod_ciudad'],
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
        ]);
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
