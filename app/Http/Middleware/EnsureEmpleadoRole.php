<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureEmpleadoRole
{
    /**
     * Restrict access to users whose linked Empleado has the given rol_empleado
     * and is active. Anyone else is redirected back with a flashed error instead
     * of being allowed through.
     */
    public function handle(Request $request, Closure $next, string $rol): Response
    {
        $empleado = $request->user()?->empleado;

        if (! $empleado || ! $empleado->activo || $empleado->rol?->nombre_rol !== $rol) {
            return redirect()->route('dashboard')
                ->with('error', "No tienes permiso para acceder a la sección de {$rol}.");
        }

        return $next($request);
    }
}
