<?php

namespace App\Http\Controllers\Comercial;

use App\Http\Controllers\Controller;
use App\Models\Embarque;
use App\Models\EmbarqueContenedor;
use App\Models\EmbarqueCosto;
use App\Models\HouseBl;
use App\Models\SeguimientoEmbarque;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class EmbarqueController extends Controller
{
    public function index(Request $request): Response
    {
        $idComercial = Auth::user()->empleado->id_empleado;

        $embarques = Embarque::with('cliente')
            ->where('id_comercial', $idComercial)
            ->orderByDesc('id_embarque')
            ->get()
            ->map(fn (Embarque $embarque) => [
                'id_embarque' => $embarque->id_embarque,
                'numero_file' => $embarque->numero_file,
                'cliente' => $embarque->cliente?->razon_social,
                'modo_transporte' => $embarque->modo_transporte,
                'estado_embarque' => $embarque->estado_embarque,
                'eta' => $embarque->eta?->toDateString(),
            ]);

        return Inertia::render('Comercial/Embarques/Index', [
            'embarques' => $embarques,
        ]);
    }

    public function show(Embarque $embarque): Response
    {
        $idComercial = Auth::user()->empleado->id_empleado;

        abort_unless($embarque->id_comercial === $idComercial, 403);

        $embarque->load([
            'cotizacion', 'cliente', 'comercial', 'operativo', 'agenteOrigen', 'navieraAerolinea', 'pol', 'pod',
            'contenedores',
            'houseBls' => fn ($query) => $query->orderBy('id_hbl'),
            'costos' => fn ($query) => $query->with('proveedor')->orderBy('id_costo'),
            'seguimientos' => fn ($query) => $query->orderByDesc('fecha')->with('empleadoResponsable'),
        ]);

        return Inertia::render('Comercial/Embarques/Show', [
            'embarque' => [
                'id_embarque' => $embarque->id_embarque,
                'numero_file' => $embarque->numero_file,
                'numero_referencia_cotizacion' => $embarque->cotizacion?->numero_referencia,
                'cliente' => $embarque->cliente?->razon_social,
                'consignatario' => $embarque->consignatario,
                'comercial' => $embarque->comercial?->nombre_completo,
                'operativo' => $embarque->operativo?->nombre_completo,
                'agente_origen' => $embarque->agenteOrigen?->nombre,
                'naviera_aerolinea' => $embarque->navieraAerolinea?->nombre,
                'modo_transporte' => $embarque->modo_transporte,
                'tipo_servicio' => $embarque->tipo_servicio,
                'tipo_embarque' => $embarque->tipo_embarque,
                'oficina_venta' => $embarque->oficina_venta,
                'oficina_operacional' => $embarque->oficina_operacional,
                'mbl' => $embarque->mbl,
                'pol' => $embarque->pol?->nombre,
                'pod' => $embarque->pod?->nombre,
                'destino_final' => $embarque->destino_final,
                'peso_kg' => $embarque->peso_kg,
                'volumen_cbm' => $embarque->volumen_cbm,
                'nro_piezas' => $embarque->nro_piezas,
                'unidad_piezas' => $embarque->unidad_piezas,
                'peso_bruto' => $embarque->peso_bruto,
                'peso_cobrable' => $embarque->peso_cobrable,
                'naturaleza_mercancia' => $embarque->naturaleza_mercancia,
                'etd' => $embarque->etd?->toDateString(),
                'eta' => $embarque->eta?->toDateString(),
                'nave' => $embarque->nave,
                'viaje' => $embarque->viaje,
                'pago_master' => $embarque->pago_master,
                'sobrefacturado' => $embarque->sobrefacturado,
                'importe_sobrefacturado' => $embarque->importe_sobrefacturado,
                'flete_menor' => $embarque->flete_menor,
                'porcentaje_reparto' => $embarque->porcentaje_reparto,
                'recinto_aduanero' => $embarque->recinto_aduanero,
                'tramite_aduanero' => $embarque->tramite_aduanero,
                'instruccion_tramite_puerto' => $embarque->instruccion_tramite_puerto,
                'pagos_liberacion' => $embarque->pagos_liberacion,
                'estado_embarque' => $embarque->estado_embarque,
                'siguiente_estado' => null,
            ],
            'contenedores' => $embarque->contenedores->map(fn (EmbarqueContenedor $contenedor) => [
                'id_item' => $contenedor->id_item,
                'tipo_contenedor' => $contenedor->tipo_contenedor,
                'cantidad' => $contenedor->cantidad,
                'numero_contenedor' => $contenedor->numero_contenedor,
                'numero_sello' => $contenedor->numero_sello,
                'peso_kg' => $contenedor->peso_kg,
                'volumen_cbm' => $contenedor->volumen_cbm,
                'descripcion_mercancia' => $contenedor->descripcion_mercancia,
                'fecha_devolucion' => $contenedor->fecha_devolucion?->toDateString(),
            ]),
            'seguimientos' => $embarque->seguimientos->map(fn (SeguimientoEmbarque $seguimiento) => [
                'id_seguimiento' => $seguimiento->id_seguimiento,
                'fecha' => $seguimiento->fecha->format('Y-m-d H:i'),
                'estado' => $seguimiento->estado,
                'comentario' => $seguimiento->comentario,
                'empleado' => $seguimiento->empleadoResponsable?->nombre_completo,
            ]),
            'houses' => $embarque->houseBls->map(fn (HouseBl $house) => [
                'id_hbl' => $house->id_hbl,
                'numero_hbl' => $house->numero_hbl,
                'condicion_pago' => $house->condicion_pago,
                'fecha_emision' => $house->fecha_emision?->toDateString(),
            ]),
            'costos' => $embarque->costos->map(fn (EmbarqueCosto $costo) => [
                'id_costo' => $costo->id_costo,
                'concepto' => $costo->concepto,
                'proveedor' => $costo->proveedor?->nombre,
                'costo_compra' => $costo->costo_compra,
                'costo_venta' => $costo->costo_venta,
                'moneda' => $costo->moneda,
            ]),
            'totalCompra' => $embarque->costos->sum('costo_compra'),
            'totalVenta' => $embarque->costos->sum('costo_venta'),
        ]);
    }
}
