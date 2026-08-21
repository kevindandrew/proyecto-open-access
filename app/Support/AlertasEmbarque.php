<?php

namespace App\Support;

use App\Models\Embarque;
use App\Models\EmbarqueContenedor;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class AlertasEmbarque
{
    private const DIAS_AVISO_ETA = 3;

    private const ESTADOS_CERRADOS = ['Entregado', 'Cerrado'];

    public static function etaPorVencer(Embarque $embarque): bool
    {
        if (! $embarque->eta || in_array($embarque->estado_embarque, self::ESTADOS_CERRADOS, true)) {
            return false;
        }

        return $embarque->eta->lessThanOrEqualTo(Carbon::today()->addDays(self::DIAS_AVISO_ETA));
    }

    /**
     * Contenedores cuyo plazo de devolución ya pasó. Se asume que si el
     * embarque no está Cerrado, el contenedor probablemente no se devolvió
     * (no existe un check explícito de "ya devuelto").
     */
    public static function contenedoresVencidos(Embarque $embarque): Collection
    {
        if ($embarque->estado_embarque === 'Cerrado') {
            return collect();
        }

        return $embarque->contenedores
            ->filter(fn (EmbarqueContenedor $contenedor) => $contenedor->fecha_devolucion?->isPast());
    }

    public static function tieneAlertas(Embarque $embarque): bool
    {
        return self::etaPorVencer($embarque) || self::contenedoresVencidos($embarque)->isNotEmpty();
    }
}
