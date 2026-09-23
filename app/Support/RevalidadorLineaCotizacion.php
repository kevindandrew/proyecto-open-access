<?php

namespace App\Support;

use App\Models\Tarifa;
use App\Models\TarifaAgente;
use App\Models\TarifaAgenteCosto;
use App\Models\TarifaCargoAdicional;
use App\Models\TarifaCosto;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

/**
 * Antes de guardar una cotización, recalcula el costo_unitario/moneda de
 * cada línea que provino de una tarifa real (marcada por el wizard con
 * id_tarifa/id_tarifa_costo/etc.) directamente contra la base de datos —
 * nunca se confía en el valor que mandó el navegador. Cubre tanto una
 * manipulación del request como una tarifa que venció entre que el
 * comercial la vio en pantalla y guardó la cotización.
 *
 * Las líneas manuales (sin ninguno de esos ids — costos ad hoc que el
 * comercial tipeó a mano) se devuelven sin tocar.
 */
class RevalidadorLineaCotizacion
{
    public static function revalidar(array $detalle, string $modoTransporte): array
    {
        return array_map(fn (array $linea) => self::revalidarLinea($linea, $modoTransporte), $detalle);
    }

    private static function revalidarLinea(array $linea, string $modoTransporte): array
    {
        if (! self::provieneDeTarifa($linea)) {
            return $linea;
        }

        $valores = self::valoresDesdeBaseDeDatos($linea, $modoTransporte);

        return array_merge($linea, $valores);
    }

    private static function provieneDeTarifa(array $linea): bool
    {
        return ! empty($linea['id_tarifa_costo'])
            || ! empty($linea['id_cargo_adicional'])
            || ! empty($linea['id_tarifa_agente_costo'])
            || (! empty($linea['id_tarifa']) && ! empty($linea['origen_campo']));
    }

    /**
     * @return array{costo_unitario: float, moneda: string}
     */
    private static function valoresDesdeBaseDeDatos(array $linea, string $modoTransporte): array
    {
        if (! empty($linea['id_cargo_adicional'])) {
            $cargo = TarifaCargoAdicional::with('tarifa.proveedor')->find($linea['id_cargo_adicional']);
            self::asegurarTarifaVigente($cargo?->tarifa, $modoTransporte);

            return ['costo_unitario' => (float) $cargo->monto, 'moneda' => $cargo->moneda];
        }

        if (! empty($linea['id_tarifa_costo'])) {
            $costo = TarifaCosto::with('tarifa.proveedor')->find($linea['id_tarifa_costo']);
            self::asegurarTarifaVigente($costo?->tarifa, $modoTransporte);

            return ['costo_unitario' => (float) $costo->costo, 'moneda' => $costo->moneda];
        }

        if (! empty($linea['id_tarifa_agente_costo'])) {
            $costo = TarifaAgenteCosto::with('tarifaAgente.proveedor')->find($linea['id_tarifa_agente_costo']);
            self::asegurarTarifaAgenteVigente($costo?->tarifaAgente, $modoTransporte);

            return ['costo_unitario' => (float) $costo->costo, 'moneda' => $costo->moneda];
        }

        if (($linea['origen_campo'] ?? null) === 'costo_base') {
            $tarifa = Tarifa::with('proveedor')->find($linea['id_tarifa'] ?? null);
            self::asegurarTarifaVigente($tarifa, $modoTransporte);

            return ['costo_unitario' => (float) $tarifa->costo_base, 'moneda' => $tarifa->moneda];
        }

        if (($linea['origen_campo'] ?? null) === 'costo_tramite') {
            $tarifa = Tarifa::with('proveedor')->find($linea['id_tarifa'] ?? null);
            self::asegurarTarifaVigente($tarifa, $modoTransporte);

            return ['costo_unitario' => (float) $tarifa->costo_tramite, 'moneda' => $tarifa->moneda_tramite];
        }

        throw ValidationException::withMessages([
            'detalle' => 'Una de las líneas hace referencia a una tarifa que no se pudo identificar. Volvé a buscar tarifas para esta ruta.',
        ]);
    }

    private static function asegurarTarifaVigente(?Tarifa $tarifa, string $modoTransporte): void
    {
        if (! $tarifa || $tarifa->modo !== $modoTransporte) {
            throw ValidationException::withMessages([
                'detalle' => 'Una de las líneas hace referencia a una tarifa que ya no existe. Volvé a buscar tarifas para esta ruta.',
            ]);
        }

        $hoy = Carbon::today();

        if ($tarifa->fecha_inicio_vigencia->gt($hoy) || $tarifa->fecha_fin_vigencia->lt($hoy)) {
            throw ValidationException::withMessages([
                'detalle' => 'La tarifa usada en una de las líneas ya no está vigente. Volvé a buscar tarifas para esta ruta antes de guardar.',
            ]);
        }

        if (! $tarifa->proveedor?->activo) {
            throw ValidationException::withMessages([
                'detalle' => 'El proveedor de una de las tarifas usadas ya no está activo.',
            ]);
        }
    }

    private static function asegurarTarifaAgenteVigente(?TarifaAgente $tarifa, string $modoTransporte): void
    {
        if (! $tarifa || $tarifa->modo !== $modoTransporte) {
            throw ValidationException::withMessages([
                'detalle' => 'Una de las líneas hace referencia a una tarifa de agente que ya no existe. Volvé a buscar tarifas para esta ruta.',
            ]);
        }

        $hoy = Carbon::today();

        if ($tarifa->fecha_inicio_vigencia->gt($hoy) || $tarifa->fecha_fin_vigencia->lt($hoy)) {
            throw ValidationException::withMessages([
                'detalle' => 'La tarifa de agente usada en una de las líneas ya no está vigente. Volvé a buscar tarifas para esta ruta antes de guardar.',
            ]);
        }

        if (! $tarifa->proveedor?->activo) {
            throw ValidationException::withMessages([
                'detalle' => 'El proveedor de una de las tarifas de agente usadas ya no está activo.',
            ]);
        }
    }
}
