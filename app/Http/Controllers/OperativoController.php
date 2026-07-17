<?php

namespace App\Http\Controllers;

use App\Models\Embarque;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class OperativoController extends Controller
{
    public function dashboard(): Response
    {
        $idOperativo = Auth::user()->empleado->id_empleado;

        $embarques = Embarque::with('cliente')
            ->where('id_operativo', $idOperativo)
            ->where('estado_embarque', '!=', 'Cerrado')
            ->orderBy('eta')
            ->get()
            ->map(fn (Embarque $embarque) => [
                'id_embarque' => $embarque->id_embarque,
                'numero_file' => $embarque->numero_file,
                'cliente' => $embarque->cliente?->razon_social,
                'modo_transporte' => $embarque->modo_transporte,
                'eta' => $embarque->eta?->toDateString(),
                'estado_embarque' => $embarque->estado_embarque,
            ]);

        return Inertia::render('Operativo/Index', [
            'embarques' => $embarques,
        ]);
    }
}
