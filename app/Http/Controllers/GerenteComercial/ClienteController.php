<?php

namespace App\Http\Controllers\GerenteComercial;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClienteController extends Controller
{
    public function buscar(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));

        $clientes = Cliente::when($q !== '', fn ($query) => $query->where('razon_social', 'ilike', "%{$q}%"))
            ->orderBy('razon_social')
            ->limit(10)
            ->get(['id_cliente', 'razon_social', 'nit']);

        return response()->json($clientes);
    }
}
