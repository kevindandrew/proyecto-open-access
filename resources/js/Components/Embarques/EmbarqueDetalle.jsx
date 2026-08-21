import ContenedorFila from '@/Components/Embarques/ContenedorFila';
import CostoFila from '@/Components/Embarques/CostoFila';
import HouseFila from '@/Components/Embarques/HouseFila';
import ModoTransporteBadge from '@/Components/ModoTransporteBadge';
import { ESTADO_LABELS } from '@/constants/estados';

const TIPO_EMBARQUE_LABELS = {
    IMPO: 'Importación',
    EXPO: 'Exportación',
    DOM: 'Doméstico',
};

function Campo({ label, value }) {
    return (
        <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#A9ABAE]">
                {label}
            </p>
            <p className="text-sm text-[#042753]">{value ?? '—'}</p>
        </div>
    );
}

function Contenedores({ contenedores, onEliminar, rutaActualizar }) {
    if (contenedores.length === 0) {
        return (
            <p className="text-sm text-[#A9ABAE]">
                Sin contenedores registrados para este embarque.
            </p>
        );
    }

    return (
        <div className="space-y-3">
            {contenedores.map((contenedor, index) => (
                <ContenedorFila
                    key={contenedor.id_item ?? index}
                    contenedor={contenedor}
                    rutaActualizar={rutaActualizar}
                    onEliminar={onEliminar}
                />
            ))}
        </div>
    );
}

function Houses({ houses, onEliminar, rutaActualizar, rutaPdf, contenedoresDisponibles = [] }) {
    if (houses.length === 0) {
        return (
            <p className="text-sm text-[#A9ABAE]">
                Todavía no hay houses (HBL/HAWB) registrados para este embarque.
            </p>
        );
    }

    const colSpan = rutaActualizar || rutaPdf || onEliminar ? 5 : 4;

    return (
        <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
                <tr>
                    <th className="px-3 py-2 text-left font-semibold text-[#042753]">
                        Número House
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-[#042753]">
                        Contenedores
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-[#042753]">
                        Condición de Pago
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-[#042753]">
                        Fecha de Emisión
                    </th>
                    {(rutaActualizar || rutaPdf || onEliminar) && <th className="px-3 py-2"></th>}
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {houses.map((house) => (
                    <HouseFila
                        key={house.id_hbl}
                        house={house}
                        contenedoresDisponibles={contenedoresDisponibles}
                        rutaActualizar={rutaActualizar}
                        rutaPdf={rutaPdf}
                        onEliminar={onEliminar}
                        colSpan={colSpan}
                    />
                ))}
            </tbody>
        </table>
    );
}

function CostosCompraVenta({ costos, totalCompra, totalVenta, onEliminar, rutaActualizar, proveedores = [] }) {
    const totalProfit = (parseFloat(totalVenta || 0) - parseFloat(totalCompra || 0)).toFixed(2);

    if (costos.length === 0) {
        return (
            <p className="text-sm text-[#A9ABAE]">
                Todavía no hay costos de compra/venta cargados para este embarque.
            </p>
        );
    }

    const colSpan = rutaActualizar || onEliminar ? 6 : 5;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead>
                    <tr>
                        <th className="px-3 py-2 text-left font-semibold text-[#042753]">
                            Concepto
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-[#042753]">
                            Proveedor
                        </th>
                        <th className="px-3 py-2 text-right font-semibold text-[#042753]">
                            Costo Compra
                        </th>
                        <th className="px-3 py-2 text-right font-semibold text-[#042753]">
                            Costo Venta
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-[#042753]">
                            Moneda
                        </th>
                        {(rutaActualizar || onEliminar) && <th className="px-3 py-2"></th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {costos.map((costo) => (
                        <CostoFila
                            key={costo.id_costo}
                            costo={costo}
                            proveedores={proveedores}
                            rutaActualizar={rutaActualizar}
                            onEliminar={onEliminar}
                            colSpan={colSpan}
                        />
                    ))}
                </tbody>
                <tfoot>
                    <tr className="border-t-2 border-gray-200">
                        <td colSpan={2} className="px-3 py-2 text-right font-semibold text-[#042753]">
                            Totales
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-[#042753]">
                            {totalCompra}
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-[#042753]">
                            {totalVenta}
                        </td>
                        <td></td>
                        {(rutaActualizar || onEliminar) && <td></td>}
                    </tr>
                    <tr>
                        <td colSpan={(rutaActualizar || onEliminar) ? 5 : 4} className="px-3 py-2 text-right font-semibold text-[#042753]">
                            Total Profit
                        </td>
                        <td className="px-3 py-2 text-lg font-bold text-[#71BFA6]">
                            {totalProfit}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}

function HistorialSeguimiento({ seguimientos }) {
    if (seguimientos.length === 0) {
        return (
            <p className="text-sm text-[#A9ABAE]">
                Todavía no hay registros de seguimiento.
            </p>
        );
    }

    return (
        <ul className="space-y-3">
            {seguimientos.map((seguimiento) => (
                <li
                    key={seguimiento.id_seguimiento}
                    className="border-l-2 border-[#71BFA6] py-1 pl-4"
                >
                    <p className="text-sm font-semibold text-[#042753]">
                        {ESTADO_LABELS[seguimiento.estado] ??
                            seguimiento.estado}{' '}
                        <span className="font-normal text-[#A9ABAE]">
                            — {seguimiento.fecha}
                        </span>
                    </p>
                    {seguimiento.comentario && (
                        <p className="text-sm text-[#042753]">
                            {seguimiento.comentario}
                        </p>
                    )}
                    <p className="text-xs text-[#A9ABAE]">
                        {seguimiento.empleado ?? 'Sistema'}
                    </p>
                </li>
            ))}
        </ul>
    );
}

/**
 * Embarque detail content, shared by Gerente Operativo, Comercial and
 * Operativo. Each role's own page composes whatever action panels
 * (CambiarEstado, AsignarOperativo, Liquidación link) it's allowed to use
 * around this. Mutations (delete callbacks, the acciones* form slots) are
 * only ever wired up by the roles authorized to edit — Comercial always
 * renders this read-only by simply not passing them.
 */
export default function EmbarqueDetalle({
    embarque,
    contenedores,
    seguimientos,
    houses = [],
    costos = [],
    totalCompra = 0,
    totalVenta = 0,
    accionesHouses = null,
    accionesCostos = null,
    accionesContenedores = null,
    accionesTransporte = null,
    accionesInstruccionesTerrestre = null,
    accionesInformacionCarga = null,
    accionesConsignatario = null,
    onEliminarHouse = null,
    rutaActualizarHouse = null,
    rutaPdfHouse = null,
    onEliminarCosto = null,
    rutaActualizarCosto = null,
    proveedores = [],
    onEliminarContenedor = null,
    rutaActualizarContenedor = null,
}) {
    const hayContenedoresVencidos = embarque.contenedores_vencidos && embarque.contenedores_vencidos.length > 0;

    return (
        <>
            {(embarque.eta_por_vencer || hayContenedoresVencidos) && (
                <div className="mb-6 space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-4">
                    {embarque.eta_por_vencer && (
                        <p className="text-sm font-medium text-amber-800">
                            ⚠ La ETA ({embarque.eta}) está por vencer o ya venció y el embarque todavía no está Entregado/Cerrado.
                        </p>
                    )}
                    {hayContenedoresVencidos && (
                        <p className="text-sm font-medium text-amber-800">
                            ⚠ Contenedor(es) con plazo de devolución vencido: {embarque.contenedores_vencidos.join(', ')}.
                        </p>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
                <Campo label="Código de Cotización" value={embarque.numero_referencia_cotizacion} />
                <Campo label="Oficina de Venta" value={embarque.oficina_venta} />
                <Campo label="Oficina Operacional" value={embarque.oficina_operacional} />
                <Campo label="Cliente" value={embarque.cliente} />
                <Campo label="Comercial" value={embarque.comercial} />
                <Campo label="Operativo" value={embarque.operativo} />
                <Campo
                    label="Agente de Origen"
                    value={embarque.agente_origen}
                />
                <Campo
                    label="Naviera / Aerolínea"
                    value={embarque.naviera_aerolinea}
                />
                <Campo
                    label="Modo de Transporte"
                    value={<ModoTransporteBadge modo={embarque.modo_transporte} />}
                />
                <Campo
                    label="Tipo de Embarque"
                    value={TIPO_EMBARQUE_LABELS[embarque.tipo_embarque] ?? embarque.tipo_embarque}
                />
                {embarque.tipo_servicio && (
                    <Campo label="Tipo de Carga" value={embarque.tipo_servicio} />
                )}
                {embarque.peso_kg && <Campo label="Peso (kg)" value={embarque.peso_kg} />}
                {embarque.volumen_cbm && (
                    <Campo label="Volumen (cbm)" value={embarque.volumen_cbm} />
                )}
                <Campo label="MBL" value={embarque.mbl} />
                <Campo label="POL" value={embarque.pol} />
                <Campo label="POD" value={embarque.pod} />
                <Campo label="Destino Final" value={embarque.destino_final} />
                <Campo label="ETD" value={embarque.etd} />
                <Campo label="ETA" value={embarque.eta} />
                <Campo label="Nave" value={embarque.nave} />
                <Campo label="Viaje" value={embarque.viaje} />
                <Campo label="Pago Master" value={embarque.pago_master} />
                <Campo
                    label="Estado"
                    value={
                        ESTADO_LABELS[embarque.estado_embarque] ??
                        embarque.estado_embarque
                    }
                />
            </div>

            <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold text-[#042753]">
                    Consignatario
                </h3>
                {accionesConsignatario ?? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Campo label="Nombre" value={embarque.consignatario_nombre} />
                        <Campo label="NIT" value={embarque.consignatario_nit} />
                        <Campo label="Celular" value={embarque.consignatario_celular} />
                        <div className="sm:col-span-2 lg:col-span-2">
                            <Campo label="Dirección" value={embarque.consignatario_direccion} />
                        </div>
                        <Campo label="Correo" value={embarque.consignatario_correo} />
                    </div>
                )}
            </div>

            {accionesTransporte && (
                <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-[#042753]">
                        Datos de Transporte (MBL, ETD/ETA, Nave/Viaje, Pago Master)
                    </h3>
                    {accionesTransporte}
                </div>
            )}

            {(embarque.modo_transporte === 'Aereo' || embarque.tipo_servicio === 'LCL') && (
                <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-[#042753]">
                        Información de Carga
                    </h3>
                    {accionesInformacionCarga ?? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <Campo
                                label="Nro. de Piezas"
                                value={
                                    embarque.nro_piezas
                                        ? `${embarque.nro_piezas} ${embarque.unidad_piezas ?? ''}`.trim()
                                        : null
                                }
                            />
                            <Campo label="Peso Bruto" value={embarque.peso_bruto} />
                            <Campo label="Peso Cobrable" value={embarque.peso_cobrable} />
                            <div className="sm:col-span-2 lg:col-span-4">
                                <Campo
                                    label="Naturaleza y Cantidad de la Mercancía"
                                    value={embarque.naturaleza_mercancia}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {embarque.modo_transporte === 'Terrestre' && (
                <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-[#042753]">
                        Instrucciones para Planificación Terrestre
                    </h3>
                    {accionesInstruccionesTerrestre ?? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <Campo label="Sobrefacturado" value={embarque.sobrefacturado ? 'Sí' : 'No'} />
                            {embarque.sobrefacturado && (
                                <Campo
                                    label="Importe Sobrefacturado (USD)"
                                    value={embarque.importe_sobrefacturado}
                                />
                            )}
                            <Campo label="Flete Menor" value={embarque.flete_menor ? 'Sí' : 'No'} />
                            <Campo label="Porcentajes %" value={embarque.porcentaje_reparto} />
                            <Campo label="Recinto Aduanero" value={embarque.recinto_aduanero} />
                            <Campo label="Trámite Aduanero" value={embarque.tramite_aduanero} />
                            <Campo
                                label="Instrucción de Trámite en Puerto"
                                value={embarque.instruccion_tramite_puerto}
                            />
                            <Campo label="Pagos Liberación" value={embarque.pagos_liberacion} />
                        </div>
                    )}
                </div>
            )}

            <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold text-[#042753]">
                    Contenedores
                </h3>
                <Contenedores
                    contenedores={contenedores}
                    onEliminar={onEliminarContenedor}
                    rutaActualizar={rutaActualizarContenedor}
                />
                {accionesContenedores}
            </div>

            <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold text-[#042753]">
                    Houses (HBL/HAWB)
                </h3>
                <Houses
                    houses={houses}
                    onEliminar={onEliminarHouse}
                    rutaActualizar={rutaActualizarHouse}
                    rutaPdf={rutaPdfHouse}
                    contenedoresDisponibles={contenedores}
                />
                {accionesHouses}
            </div>

            <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold text-[#042753]">
                    Costos (Compra / Venta)
                </h3>
                <CostosCompraVenta
                    costos={costos}
                    totalCompra={totalCompra}
                    totalVenta={totalVenta}
                    onEliminar={onEliminarCosto}
                    rutaActualizar={rutaActualizarCosto}
                    proveedores={proveedores}
                />
                {accionesCostos}
            </div>

            <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold text-[#042753]">
                    Historial de Seguimiento
                </h3>
                <HistorialSeguimiento seguimientos={seguimientos} />
            </div>
        </>
    );
}
