<?php

namespace App\Http\Controllers\Comercial;

use App\Http\Controllers\Controller;
use App\Models\Ciudad;
use App\Models\Cliente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
            ->limit(10)
            ->get(['id_cliente', 'razon_social', 'nit']);

        return response()->json($clientes);
    }

    public function store(Request $request): RedirectResponse
    {
        $idComercial = Auth::user()->empleado->id_empleado;

        $data = $request->validate([
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
        ]);

        Cliente::create([...$data, 'id_comercial' => $idComercial]);

        return redirect()
            ->route('comercial.clientes.index')
            ->with('success', 'Cliente creado correctamente.');
    }
}
