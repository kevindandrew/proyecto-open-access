import { ESTADO_LABELS } from '@/constants/estados';

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

function Contenedores({ contenedores }) {
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
                <div
                    key={index}
                    className="rounded-md border border-gray-100 bg-gray-50 p-3"
                >
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-[#042753]">
                            {contenedor.numero_contenedor ?? 'Sin número'}
                        </p>
                        <span className="rounded bg-gray-200 px-2 py-0.5 text-xs text-[#042753]">
                            {contenedor.tipo_contenedor ?? '—'}
                        </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-[#A9ABAE] sm:grid-cols-3">
                        <span>Sello: {contenedor.numero_sello ?? '—'}</span>
                        <span>Peso: {contenedor.peso_kg ?? '—'} kg</span>
                        <span>Vol: {contenedor.volumen_cbm ?? '—'} cbm</span>
                    </div>
                </div>
            ))}
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
 * Read-only embarque detail content, shared by Gerente Operativo, Comercial
 * and Operativo. Each role's own page composes whatever action panels
 * (CambiarEstado, AsignarOperativo, Liquidación link) it's allowed to use
 * around this — this component itself never edits anything.
 */
export default function EmbarqueDetalle({ embarque, contenedores, seguimientos }) {
    return (
        <>
            <div className="grid grid-cols-1 gap-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
                <Campo label="Cliente" value={embarque.cliente} />
                <Campo
                    label="Consignatario"
                    value={embarque.consignatario}
                />
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
                    value={embarque.modo_transporte}
                />
                <Campo
                    label="Tipo de Embarque"
                    value={embarque.tipo_embarque}
                />
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
                    Contenedores
                </h3>
                <Contenedores contenedores={contenedores} />
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
