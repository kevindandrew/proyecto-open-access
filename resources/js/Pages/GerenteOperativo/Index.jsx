import { COTIZACION_ESTADO_HEX } from '@/constants/cotizacionEstados';
import { ESTADO_LABELS } from '@/constants/estados';
import GerenteOperativoLayout from '@/Layouts/GerenteOperativoLayout';
import { Head, Link } from '@inertiajs/react';

const formatoMoneda = new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
});

function IconoPersonas(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
        </svg>
    );
}

function IconoDocumento(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
    );
}

function IconoCheck(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
    );
}

function IconoX(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
    );
}

function IconoCaja(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5 12 3 3.75 7.5m16.5 0-8.25 4.5m8.25-4.5v9l-8.25 4.5m0-9L3.75 7.5m8.25 4.5v9M3.75 7.5v9l8.25 4.5" />
        </svg>
    );
}

function IconoCamion(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h9m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-2.25c0-.51-.343-.94-.8-1.078a13.94 13.94 0 0 0-3.174-.475M15 5.25v10.5M15 5.25H5.625c-.621 0-1.125.504-1.125 1.125v9c0 .621.504 1.125 1.125 1.125H15m0-11.25h2.945c.621 0 1.125.504 1.125 1.125v.75l1.72 2.58a1.125 1.125 0 0 1 .18.617v3.128a1.125 1.125 0 0 1-1.125 1.125H18" />
        </svg>
    );
}

function IconoDolar(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m3-8.25c0-1.036-1.79-1.875-4-1.875s-4 .84-4 1.875 1.79 1.875 4 1.875 4 .84 4 1.875S13.79 15 11.5 15s-4-.84-4-1.875" />
        </svg>
    );
}

function StatCard({ label, value, icon: Icon, iconBg, iconColor }) {
    return (
        <div className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-[#A9ABAE]">
                        {label}
                    </p>
                    <p className="mt-2 truncate text-3xl font-bold text-[#042753]">
                        {value}
                    </p>
                </div>
                <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110 ${iconBg}`}
                >
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
            </div>
        </div>
    );
}

function DonutEstadoCotizaciones({ datos }) {
    const total = datos.reduce((acc, item) => acc + item.total, 0);
    const radio = 60;
    const circunferencia = 2 * Math.PI * radio;

    let acumulado = 0;

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
            <h3 className="mb-4 text-sm font-semibold text-[#042753]">
                Estado de Cotizaciones
            </h3>

            {total === 0 ? (
                <p className="text-sm text-[#A9ABAE]">
                    Todavía no hay cotizaciones registradas.
                </p>
            ) : (
                <div className="flex flex-col items-center gap-6 sm:flex-row">
                    <svg
                        viewBox="0 0 140 140"
                        className="h-40 w-40 flex-shrink-0 -rotate-90"
                    >
                        <circle
                            cx="70"
                            cy="70"
                            r={radio}
                            fill="none"
                            stroke="#eef0ee"
                            strokeWidth="18"
                        />
                        {datos
                            .filter((item) => item.total > 0)
                            .map((item) => {
                                const porcion = item.total / total;
                                const largo = porcion * circunferencia;
                                const offset = -acumulado;
                                acumulado += largo;

                                return (
                                    <circle
                                        key={item.estado}
                                        cx="70"
                                        cy="70"
                                        r={radio}
                                        fill="none"
                                        stroke={
                                            COTIZACION_ESTADO_HEX[item.estado]
                                        }
                                        strokeWidth="18"
                                        strokeDasharray={`${largo} ${circunferencia - largo}`}
                                        strokeDashoffset={offset}
                                        strokeLinecap="round"
                                    >
                                        <title>
                                            {item.estado}: {item.total}
                                        </title>
                                    </circle>
                                );
                            })}
                    </svg>

                    <ul className="space-y-2">
                        {datos.map((item) => (
                            <li
                                key={item.estado}
                                className="flex items-center gap-2 text-sm"
                            >
                                <span
                                    className="h-2.5 w-2.5 rounded-full"
                                    style={{
                                        backgroundColor:
                                            COTIZACION_ESTADO_HEX[
                                                item.estado
                                            ],
                                    }}
                                />
                                <span className="text-[#042753]">
                                    {item.estado}
                                </span>
                                <span className="font-semibold text-[#042753]">
                                    {item.total}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

function BarrasEmbarquesPorEstado({ datos }) {
    const maximo = Math.max(...datos.map((item) => item.total), 1);

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
            <h3 className="mb-4 text-sm font-semibold text-[#042753]">
                Embarques por Estado
            </h3>

            <div className="space-y-3">
                {datos.map((item) => (
                    <div key={item.estado}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="text-[#042753]">
                                {ESTADO_LABELS[item.estado] ?? item.estado}
                            </span>
                            <span className="font-semibold text-[#042753]">
                                {item.total}
                            </span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100">
                            <div
                                className="h-2 rounded-full bg-[#71BFA6]"
                                style={{
                                    width: `${(item.total / maximo) * 100}%`,
                                }}
                                title={`${ESTADO_LABELS[item.estado] ?? item.estado}: ${item.total}`}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ActividadReciente({ actividad }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
            <h3 className="mb-4 text-sm font-semibold text-[#042753]">
                Actividad Reciente
            </h3>

            {actividad.length === 0 ? (
                <p className="text-sm text-[#A9ABAE]">
                    Todavía no hay actividad registrada.
                </p>
            ) : (
                <ul className="space-y-4">
                    {actividad.map((item, index) => (
                        <li key={index} className="flex gap-3">
                            <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#71BFA6]" />
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-[#042753]">
                                    {item.titulo}
                                </p>
                                {item.subtitulo && (
                                    <p className="truncate text-xs text-[#A9ABAE]">
                                        {item.subtitulo}
                                    </p>
                                )}
                                <p className="text-xs text-[#A9ABAE]">
                                    {item.fecha}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function TopRutas({ rutas }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
            <h3 className="mb-4 text-sm font-semibold text-[#042753]">
                Top Rutas
            </h3>

            {rutas.length === 0 ? (
                <p className="text-sm text-[#A9ABAE]">
                    Todavía no hay costos de embarque cargados para calcular
                    rutas.
                </p>
            ) : (
                <ol className="space-y-4">
                    {rutas.map((ruta, index) => (
                        <li key={index}>
                            <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                                <span className="truncate text-[#042753]">
                                    <span className="mr-2 text-[#A9ABAE]">
                                        {index + 1}.
                                    </span>
                                    {ruta.ruta}
                                </span>
                                <span className="flex-shrink-0 font-semibold text-[#042753]">
                                    {formatoMoneda.format(ruta.valor)}
                                </span>
                            </div>
                            <div className="h-2 rounded-full bg-gray-100">
                                <div
                                    className="h-2 rounded-full bg-[#042753]"
                                    style={{ width: `${ruta.porcentaje}%` }}
                                />
                            </div>
                            <p className="mt-1 text-xs text-[#A9ABAE]">
                                {ruta.total_embarques} embarque
                                {ruta.total_embarques === 1 ? '' : 's'}
                            </p>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
}

function ProximasLlegadas({ embarques }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#042753]">
                    Próximas Llegadas
                </h3>
                <span className="text-xs text-[#A9ABAE]">
                    ETA de embarques activos
                </span>
            </div>

            {embarques.length === 0 ? (
                <p className="text-sm text-[#A9ABAE]">
                    No hay embarques activos con ETA definida.
                </p>
            ) : (
                <ul className="space-y-3">
                    {embarques.map((embarque) => (
                        <li key={embarque.id_embarque}>
                            <Link
                                href={route(
                                    'gerente-operativo.embarques.show',
                                    embarque.id_embarque,
                                )}
                                className="flex items-center gap-3 rounded-md p-1 transition-colors hover:bg-gray-50"
                            >
                                <div
                                    className={`flex h-10 w-10 flex-shrink-0 flex-col items-center justify-center rounded-lg text-xs font-bold ${
                                        embarque.dias <= 2
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-gray-100 text-[#042753]'
                                    }`}
                                >
                                    <span>{embarque.dias}</span>
                                    <span className="text-[9px] font-normal">
                                        días
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-[#042753]">
                                        {embarque.numero_file}
                                    </p>
                                    <p className="truncate text-xs text-[#A9ABAE]">
                                        {embarque.destino ?? '—'}
                                    </p>
                                </div>
                                <span className="flex-shrink-0 rounded bg-gray-100 px-2 py-1 text-xs font-medium text-[#042753]">
                                    {ESTADO_LABELS[embarque.estado_embarque] ??
                                        embarque.estado_embarque}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default function Index({
    nombre,
    contadores,
    estadoCotizaciones,
    estadoEmbarques,
    actividadReciente,
    topRutas,
    proximasLlegadas,
}) {
    return (
        <GerenteOperativoLayout header="Dashboard">
            <Head title="Dashboard Gerente Operativo" />

            <div className="mb-6">
                <h2 className="text-xl font-bold text-[#042753]">
                    Bienvenido, {nombre}
                </h2>
                <p className="text-sm text-[#A9ABAE]">
                    Gerente Operativo — Resumen ejecutivo de operaciones
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Total Clientes"
                    value={contadores.totalClientes}
                    icon={IconoPersonas}
                    iconBg="bg-gray-100"
                    iconColor="text-[#042753]"
                />
                <StatCard
                    label="Cotizaciones Activas"
                    value={contadores.cotizacionesActivas}
                    icon={IconoDocumento}
                    iconBg="bg-blue-100"
                    iconColor="text-blue-700"
                />
                <StatCard
                    label="Cotizaciones Aceptadas"
                    value={contadores.cotizacionesAceptadas}
                    icon={IconoCheck}
                    iconBg="bg-green-100"
                    iconColor="text-green-700"
                />
                <StatCard
                    label="Cotizaciones Rechazadas"
                    value={contadores.cotizacionesRechazadas}
                    icon={IconoX}
                    iconBg="bg-red-100"
                    iconColor="text-red-700"
                />
                <StatCard
                    label="Embarques en Tránsito"
                    value={contadores.embarquesEnTransito}
                    icon={IconoCaja}
                    iconBg="bg-gray-100"
                    iconColor="text-[#042753]"
                />
                <StatCard
                    label="Embarques Entregados"
                    value={contadores.embarquesEntregados}
                    icon={IconoCamion}
                    iconBg="bg-green-100"
                    iconColor="text-green-700"
                />
                <StatCard
                    label="Profit"
                    value={formatoMoneda.format(contadores.profit)}
                    icon={IconoDolar}
                    iconBg="bg-[#71BFA6]/15"
                    iconColor="text-[#71BFA6]"
                />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <DonutEstadoCotizaciones datos={estadoCotizaciones} />
                <BarrasEmbarquesPorEstado datos={estadoEmbarques} />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ProximasLlegadas embarques={proximasLlegadas} />
                <TopRutas rutas={topRutas} />
            </div>

            <div className="mt-6">
                <ActividadReciente actividad={actividadReciente} />
            </div>
        </GerenteOperativoLayout>
    );
}
