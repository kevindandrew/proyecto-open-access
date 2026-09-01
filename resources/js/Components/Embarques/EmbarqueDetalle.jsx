import ContenedorFila from '@/Components/Embarques/ContenedorFila';
import CostoFila from '@/Components/Embarques/CostoFila';
import EstadoEmbarqueBadge from '@/Components/Embarques/EstadoEmbarqueBadge';
import HouseFila from '@/Components/Embarques/HouseFila';
import SeccionCard, { EstadoVacio } from '@/Components/Embarques/SeccionCard';
import {
    IconoCarga,
    IconoConsignatario,
    IconoContenedores,
    IconoCostos,
    IconoDocumento,
    IconoHistorial,
    IconoTransporte,
} from '@/Components/Embarques/SeccionIcons';
import ModoTransporteBadge from '@/Components/ModoTransporteBadge';
import { Fragment } from 'react';

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

function GrupoCampos({ titulo, children }) {
    return (
        <div className="border-t border-gray-100 pt-4 first:border-t-0 first:pt-0">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#71BFA6]">
                {titulo}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {children}
            </div>
        </div>
    );
}

function Contenedores({ contenedores, onEliminar, rutaActualizar }) {
    if (contenedores.length === 0) {
        return <EstadoVacio icon={IconoContenedores} mensaje="Sin contenedores registrados para este embarque." />;
    }

    return (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
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

function Houses({
    houses,
    onEliminar,
    rutaActualizar,
    rutaPdf,
    contenedoresDisponibles = [],
    clientes = [],
}) {
    if (houses.length === 0) {
        return (
            <EstadoVacio
                icon={IconoDocumento}
                mensaje="Todavía no hay houses (HBL/HAWB) registrados para este embarque."
            />
        );
    }

    return (
        <div className="space-y-4">
            {houses.map((house) => (
                <HouseFila
                    key={house.id_hbl}
                    house={house}
                    contenedoresDisponibles={contenedoresDisponibles}
                    clientes={clientes}
                    rutaActualizar={rutaActualizar}
                    rutaPdf={rutaPdf}
                    onEliminar={onEliminar}
                />
            ))}
        </div>
    );
}

function CostosCompraVenta({ costos, totalesPorMoneda = {}, onEliminar, rutaActualizar, proveedores = [] }) {
    const monedasPresentes = Object.keys(totalesPorMoneda);

    if (costos.length === 0) {
        return (
            <EstadoVacio
                icon={IconoCostos}
                mensaje="Todavía no hay costos de compra/venta cargados para este embarque."
            />
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
                    {monedasPresentes.map((moneda, index) => {
                        const { compra, venta } = totalesPorMoneda[moneda];
                        const profit = (parseFloat(venta || 0) - parseFloat(compra || 0)).toFixed(2);

                        return (
                            <Fragment key={moneda}>
                                <tr
                                    className={index === 0 ? 'border-t-2 border-gray-200' : 'border-t border-gray-200'}
                                >
                                    <td colSpan={2} className="px-3 py-2 text-right font-semibold text-[#042753]">
                                        Totales ({moneda})
                                    </td>
                                    <td className="px-3 py-2 text-right font-medium text-[#042753]">
                                        {compra}
                                    </td>
                                    <td className="px-3 py-2 text-right font-medium text-[#042753]">
                                        {venta}
                                    </td>
                                    <td></td>
                                    {(rutaActualizar || onEliminar) && <td></td>}
                                </tr>
                                <tr>
                                    <td
                                        colSpan={(rutaActualizar || onEliminar) ? 5 : 4}
                                        className="px-3 py-2 text-right font-semibold text-[#042753]"
                                    >
                                        Profit ({moneda})
                                    </td>
                                    <td className="px-3 py-2 text-lg font-bold text-[#71BFA6]">
                                        {profit}
                                    </td>
                                </tr>
                            </Fragment>
                        );
                    })}
                </tfoot>
            </table>
        </div>
    );
}

function HistorialSeguimiento({ seguimientos }) {
    if (seguimientos.length === 0) {
        return <EstadoVacio icon={IconoHistorial} mensaje="Todavía no hay registros de seguimiento." />;
    }

    return (
        <ul className="space-y-5">
            {seguimientos.map((seguimiento) => (
                <li key={seguimiento.id_seguimiento} className="relative pl-6">
                    <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-[#71BFA6] ring-4 ring-[#71BFA6]/20" />
                    <div className="flex flex-wrap items-baseline gap-x-2">
                        <EstadoEmbarqueBadge estado={seguimiento.estado} />
                        <span className="text-xs text-[#A9ABAE]">{seguimiento.fecha}</span>
                    </div>
                    {seguimiento.comentario && (
                        <p className="mt-1.5 text-sm text-[#042753]">
                            {seguimiento.comentario}
                        </p>
                    )}
                    <p className="mt-1 text-xs text-[#A9ABAE]">
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
    totalesPorMoneda = {},
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
    clientesHouse = [],
    onEliminarContenedor = null,
    rutaActualizarContenedor = null,
    accionesPrincipal = null,
}) {
    const hayContenedoresVencidos = embarque.contenedores_vencidos && embarque.contenedores_vencidos.length > 0;

    return (
        <>
            {(embarque.eta_por_vencer || hayContenedoresVencidos) && (
                <div className="mb-6 flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 shadow-sm">
                    <span className="text-lg leading-none text-amber-500">⚠</span>
                    <div className="space-y-1">
                        {embarque.eta_por_vencer && (
                            <p className="text-sm font-medium text-amber-800">
                                La ETA ({embarque.eta}) está por vencer o ya venció y el embarque todavía no está Entregado/Cerrado.
                            </p>
                        )}
                        {hayContenedoresVencidos && (
                            <p className="text-sm font-medium text-amber-800">
                                Contenedor(es) con plazo de devolución vencido: {embarque.contenedores_vencidos.join(', ')}.
                            </p>
                        )}
                    </div>
                </div>
            )}

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 bg-[#042753] px-6 py-5">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-white/60">
                            Embarque
                        </p>
                        <h2 className="text-2xl font-bold text-white">{embarque.numero_file}</h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <ModoTransporteBadge modo={embarque.modo_transporte} />
                            <EstadoEmbarqueBadge estado={embarque.estado_embarque} />
                        </div>
                        {accionesPrincipal}
                    </div>
                </div>

                <div className="space-y-4 p-6">
                    <GrupoCampos titulo="General">
                        <Campo label="Código de Cotización" value={embarque.numero_referencia_cotizacion} />
                        <Campo label="Oficina de Venta" value={embarque.oficina_venta} />
                        <Campo label="Oficina Operacional" value={embarque.oficina_operacional} />
                        <Campo
                            label="Tipo de Embarque"
                            value={TIPO_EMBARQUE_LABELS[embarque.tipo_embarque] ?? embarque.tipo_embarque}
                        />
                    </GrupoCampos>

                    <GrupoCampos titulo="Personas">
                        <Campo label="Cliente" value={embarque.cliente} />
                        <Campo label="Comercial" value={embarque.comercial} />
                        <Campo label="Operativo" value={embarque.operativo} />
                        <Campo label="Agente de Origen" value={embarque.agente_origen} />
                        <Campo label="Naviera / Aerolínea" value={embarque.naviera_aerolinea} />
                    </GrupoCampos>

                    <GrupoCampos titulo="Ruta y Carga">
                        {embarque.tipo_servicio && (
                            <Campo label="Tipo de Carga" value={embarque.tipo_servicio} />
                        )}
                        <Campo label="POL" value={embarque.pol} />
                        <Campo label="POD" value={embarque.pod} />
                        <Campo label="Destino Final" value={embarque.destino_final} />
                        {embarque.peso_kg && <Campo label="Peso (kg)" value={embarque.peso_kg} />}
                        {embarque.volumen_cbm && (
                            <Campo label="Volumen (cbm)" value={embarque.volumen_cbm} />
                        )}
                    </GrupoCampos>

                    <GrupoCampos titulo="Transporte y Fechas">
                        <Campo label="MBL" value={embarque.mbl} />
                        <Campo label="ETD" value={embarque.etd} />
                        <Campo label="ETA" value={embarque.eta} />
                        <Campo label="Nave" value={embarque.nave} />
                        <Campo label="Viaje" value={embarque.viaje} />
                        <Campo label="Pago Master" value={embarque.pago_master} />
                    </GrupoCampos>
                </div>
            </div>

            <SeccionCard icon={IconoConsignatario} title="Consignatario">
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
            </SeccionCard>

            {accionesTransporte && (
                <SeccionCard
                    icon={IconoTransporte}
                    title="Datos de Transporte"
                    subtitle="MBL, ETD/ETA, Nave/Viaje, Pago Master"
                >
                    {accionesTransporte}
                </SeccionCard>
            )}

            {(embarque.modo_transporte === 'Aereo' || embarque.tipo_servicio === 'LCL') && (
                <SeccionCard icon={IconoCarga} title="Información de Carga">
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
                </SeccionCard>
            )}

            {embarque.modo_transporte === 'Terrestre' && (
                <SeccionCard icon={IconoTransporte} title="Instrucciones para Planificación Terrestre">
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
                </SeccionCard>
            )}

            <SeccionCard
                icon={IconoContenedores}
                title="Contenedores"
                subtitle={contenedores.length > 0 ? `${contenedores.length} registrado(s)` : undefined}
            >
                <Contenedores
                    contenedores={contenedores}
                    onEliminar={onEliminarContenedor}
                    rutaActualizar={rutaActualizarContenedor}
                />
                {accionesContenedores}
            </SeccionCard>

            <SeccionCard
                icon={IconoDocumento}
                title="Houses (HBL/HAWB)"
                subtitle={houses.length > 0 ? `${houses.length} registrado(s)` : undefined}
            >
                <Houses
                    houses={houses}
                    onEliminar={onEliminarHouse}
                    rutaActualizar={rutaActualizarHouse}
                    rutaPdf={rutaPdfHouse}
                    contenedoresDisponibles={contenedores}
                    clientes={clientesHouse}
                />
                {accionesHouses}
            </SeccionCard>

            <SeccionCard icon={IconoCostos} title="Costos (Compra / Venta)">
                <CostosCompraVenta
                    costos={costos}
                    totalesPorMoneda={totalesPorMoneda}
                    onEliminar={onEliminarCosto}
                    rutaActualizar={rutaActualizarCosto}
                    proveedores={proveedores}
                />
                {accionesCostos}
            </SeccionCard>

            <SeccionCard icon={IconoHistorial} title="Historial de Seguimiento">
                <HistorialSeguimiento seguimientos={seguimientos} />
            </SeccionCard>
        </>
    );
}
