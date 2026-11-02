<?php

namespace App\Support;

use App\Models\Embarque;
use App\Models\EmbarqueCosto;
use Illuminate\Support\Facades\Auth;

/**
 * "Hoja principal" del file: resumen de una página con los datos del
 * embarque, sus houses, la carga y los costos de compra / venta con el
 * profit — mismo contenido que la hoja que Open Access armaba en Excel.
 */
class HojaPrincipalFilePdfDatos
{
    private const ETIQUETA_FLETE = [
        'Maritimo' => 'Ocean Freight',
        'Aereo' => 'Air Freight',
        'Terrestre' => 'Land Freight',
    ];

    public static function para(Embarque $embarque): array
    {
        $embarque->loadMissing([
            'cliente', 'comercial', 'cotizacion', 'pol', 'pod', 'agenteOrigen', 'navieraAerolinea',
            'contenedores', 'houseBls' => fn ($query) => $query->orderBy('id_hbl'),
            'costos' => fn ($query) => $query->with('proveedor', 'clienteCobro', 'consignatarioCobro')->orderBy('id_costo'),
        ]);

        $costos = $embarque->costos;
        $monedas = $costos->pluck('moneda')->filter()->unique()->values();

        $totales = $monedas->mapWithKeys(fn (string $moneda) => [$moneda => [
            'compra' => (float) $costos->where('moneda', $moneda)->sum('costo_compra'),
            'venta' => (float) $costos->where('moneda', $moneda)->sum('costo_venta'),
        ]])->map(fn (array $t) => [...$t, 'profit' => $t['venta'] - $t['compra']]);

        $condicionesHouse = $embarque->houseBls->pluck('condicion_pago')->filter()->unique()->map(fn ($c) => strtoupper($c));

        return [
            'embarque' => [
                'modo' => mb_strtoupper(['Maritimo' => 'Marítimo', 'Aereo' => 'Aéreo'][$embarque->modo_transporte] ?? $embarque->modo_transporte),
                'tipo_embarque' => $embarque->tipo_embarque,
                'oficina_venta' => $embarque->oficina_venta,
                'oficina_operacional' => $embarque->oficina_operacional,
                'generado_por' => Auth::user()?->name ?? $embarque->comercial?->nombre_completo,
                'file' => $embarque->numero_file,
                'identificador' => $embarque->identificador,
                'cliente' => $embarque->cliente?->razon_social,
                'codigo_cliente' => $embarque->id_cliente ? str_pad((string) $embarque->id_cliente, 2, '0', STR_PAD_LEFT) : null,
                'consignatario' => $embarque->consignatario_nombre,
                'cotizacion' => $embarque->cotizacion?->numero_referencia,
                'mbl' => $embarque->mbl,
                'pol' => $embarque->pol?->nombre,
                'pol_codigo' => $embarque->pol?->codigo,
                'pod' => $embarque->pod?->nombre,
                'pod_codigo' => $embarque->pod?->codigo,
                'destino_final' => $embarque->destino_final,
                'agente' => $embarque->agenteOrigen?->nombre,
                'agente_codigo' => $embarque->agenteOrigen?->codigo_interno,
                'naviera' => $embarque->navieraAerolinea?->nombre,
                'naviera_codigo' => $embarque->navieraAerolinea?->codigo_interno,
                'etd' => $embarque->etd?->format('d/m/Y'),
                'eta' => $embarque->eta?->format('d/m/Y'),
                'tipo_carga' => $embarque->tipo_servicio ?? ($embarque->modo_transporte === 'Aereo' ? 'AÉREO' : null),
                'pago_master' => $embarque->pago_master ? strtoupper($embarque->pago_master) : null,
                'pago_house' => $condicionesHouse->isNotEmpty() ? $condicionesHouse->implode(' / ') : null,
                'volumen' => $embarque->volumen_cbm,
                'peso' => $embarque->peso_kg,
                'nave' => $embarque->nave,
                'viaje' => $embarque->viaje,
                'etiqueta_flete' => self::ETIQUETA_FLETE[$embarque->modo_transporte] ?? 'Freight',
                'condicion_pago' => $embarque->cliente?->condicion_pago,
            ],
            'houses' => $embarque->houseBls->pluck('numero_hbl')->all(),
            'unidades' => self::unidades($embarque),
            'costos' => $costos->map(fn (EmbarqueCosto $costo) => [
                'concepto' => $costo->concepto,
                'pagar_a' => $costo->proveedor?->nombre,
                'compra' => (float) $costo->costo_compra ?: null,
                'venta' => (float) $costo->costo_venta ?: null,
                'cobrar_a' => (float) $costo->costo_venta ? $costo->nombreCobrarA() : null,
                'moneda' => $costo->moneda,
            ])->all(),
            'monedas' => $monedas->all(),
            'totales' => $totales->all(),
        ];
    }

    /**
     * Hasta 3 grupos "cantidad + unidad" (ej. 3 x 40' HC). En aéreo, las
     * piezas del embarque.
     */
    private static function unidades(Embarque $embarque): array
    {
        if ($embarque->contenedores->isNotEmpty()) {
            return $embarque->contenedores
                ->groupBy(fn ($c) => $c->tipo_contenedor ?: '—')
                ->map(fn ($grupo, $tipo) => [
                    'cantidad' => $grupo->sum(fn ($c) => $c->cantidad ?: 1),
                    'unidad' => FormatoContenedor::conPies($tipo),
                ])
                ->values()
                ->take(3)
                ->all();
        }

        return $embarque->nro_piezas
            ? [['cantidad' => $embarque->nro_piezas, 'unidad' => strtoupper((string) $embarque->unidad_piezas)]]
            : [];
    }
}
