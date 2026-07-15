<?php

namespace App\Support;

use App\Models\User;

class RoleRedirector
{
    private const ROUTE_BY_ROL = [
        'Gerente Comercial' => 'gerente-comercial.dashboard',
        'Comercial' => 'comercial.dashboard',
        'Gerente Operativo' => 'gerente-operativo.dashboard',
        'Operativo' => 'operativo.dashboard',
    ];

    /**
     * Route name for the dashboard matching the user's empleado role,
     * falling back to the generic Breeze dashboard when there's no
     * linked empleado or its role isn't mapped.
     */
    public static function routeFor(?User $user): string
    {
        $rol = $user?->empleado?->rol?->nombre_rol;

        return self::ROUTE_BY_ROL[$rol] ?? 'dashboard';
    }
}
