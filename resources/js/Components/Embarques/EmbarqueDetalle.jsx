import { ESTADO_LABELS } from '@/constants/estados';
import { Link, useForm } from '@inertiajs/react';

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

function CambiarEstado({ embarque }) {
    const { data, setData, patch, processing, errors, reset } = useForm({
        comentario: '',
    });

    const submit = (e) => {
        e.preventDefault();

        patch(
            route('gerente-operativo.embarques.cambiar-estado', embarque.id_embarque),
            { onSuccess: () => reset('comentario') },
        );
    };

    if (!embarque.siguiente_estado) {
        return (
            <p className="text-sm text-[#A9ABAE]">
                Este embarque ya está{' '}
                <span className="font-semibold text-[#042753]">Cerrado</span>,
                no tiene un siguiente estado.
            </p>
        );
    }

    return (
        <form onSubmit={submit} className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
                <span className="rounded bg-gray-100 px-2 py-1 font-medium text-[#042753]">
                    {ESTADO_LABELS[embarque.estado_embarque] ??
                        embarque.estado_embarque}
                </span>
                <span className="text-[#A9ABAE]">→</span>
                <span className="rounded bg-[#71BFA6]/20 px-2 py-1 font-medium text-[#042753]">
                    {ESTADO_LABELS[embarque.siguiente_estado] ??
                        embarque.siguiente_estado}
                </span>
            </div>

            <div>
                <label className="text-sm font-medium text-[#042753]">
                    Comentario (opcional)
                </label>
                <textarea
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                    value={data.comentario}
                    onChange={(e) => setData('comentario', e.target.value)}
                />
                {errors.comentario && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.comentario}
                    </p>
                )}
            </div>

            <button
                type="submit"
                disabled={processing}
                className="rounded-md bg-[#71BFA6] px-4 py-2 text-sm font-semibold text-[#042753] hover:opacity-90 disabled:opacity-50"
            >
                Confirmar cambio a &quot;
                {ESTADO_LABELS[embarque.siguiente_estado] ??
                    embarque.siguiente_estado}
                &quot;
            </button>
        </form>
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
 * Shared read-only embarque detail content, reused by both the Gerente
 * Operativo and Comercial role pages (each wraps it in its own Layout).
 * `puedeGestionar` gates the state-change form and the Liquidación de
 * Destino link, which only Gerente Operativo is allowed to use.
 */
export default function EmbarqueDetalle({ embarque, seguimientos, puedeGestionar }) {
    return (
        <>
            {puedeGestionar && (
                <div className="mb-4 flex justify-end">
                    <Link
                        href={route(
                            'gerente-operativo.embarques.gastos.index',
                            embarque.id_embarque,
                        )}
                        className="rounded-md bg-[#71BFA6] px-4 py-2 text-sm font-semibold text-[#042753] hover:opacity-90"
                    >
                        Liquidación de Destino
                    </Link>
                </div>
            )}

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

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {puedeGestionar && (
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-sm font-semibold text-[#042753]">
                            Cambiar Estado
                        </h3>
                        <CambiarEstado embarque={embarque} />
                    </div>
                )}

                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-[#042753]">
                        Historial de Seguimiento
                    </h3>
                    <HistorialSeguimiento seguimientos={seguimientos} />
                </div>
            </div>
        </>
    );
}
