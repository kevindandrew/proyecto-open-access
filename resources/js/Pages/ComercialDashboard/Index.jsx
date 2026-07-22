import ModoTransporteBadge from '@/Components/ModoTransporteBadge';
import { COTIZACION_ESTADO_STYLES } from '@/constants/cotizacionEstados';
import ComercialLayout from '@/Layouts/ComercialLayout';
import { Head, Link, router } from '@inertiajs/react';

function StatCard({ label, value, accent = false }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-[#A9ABAE]">
                {label}
            </p>
            <p
                className={`mt-2 text-3xl font-bold ${
                    accent ? 'text-[#71BFA6]' : 'text-[#042753]'
                }`}
            >
                {value}
            </p>
        </div>
    );
}

export default function Index({ contadores, ultimasCotizaciones }) {
    return (
        <ComercialLayout header="Dashboard">
            <Head title="Dashboard Comercial" />

            <div className="mb-4 flex justify-end">
                <Link
                    href={route('comercial.cotizaciones.create')}
                    className="rounded-md bg-[#71BFA6] px-4 py-2 text-sm font-semibold text-[#042753] hover:opacity-90"
                >
                    + Nueva Cotización
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Cotizaciones Activas"
                    value={contadores.cotizacionesActivas}
                    accent
                />
                <StatCard
                    label="Aceptadas Este Mes"
                    value={contadores.aceptadasEsteMes}
                />
                <StatCard
                    label="Embarques Activos"
                    value={contadores.embarquesActivos}
                />
                <StatCard
                    label="Cotizaciones por Vencer"
                    value={contadores.porVencer}
                />
            </div>

            <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">
                                Referencia
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">
                                Cliente
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">
                                Modo
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">
                                Vigencia
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">
                                Estado
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {ultimasCotizaciones.map((cotizacion) => (
                            <tr
                                key={cotizacion.id_cotizacion}
                                onClick={() =>
                                    router.visit(
                                        route(
                                            'comercial.cotizaciones.show',
                                            cotizacion.id_cotizacion,
                                        ),
                                    )
                                }
                                className="cursor-pointer hover:bg-[#71BFA6]/10"
                            >
                                <td className="px-4 py-3 font-medium text-[#042753]">
                                    {cotizacion.numero_referencia}
                                </td>
                                <td className="px-4 py-3">
                                    {cotizacion.cliente}
                                </td>
                                <td className="px-4 py-3">
                                    <ModoTransporteBadge modo={cotizacion.modo_transporte} />
                                </td>
                                <td className="px-4 py-3">
                                    {cotizacion.fecha_validez}
                                </td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`rounded px-2 py-1 text-xs font-medium ${
                                            COTIZACION_ESTADO_STYLES[
                                                cotizacion.estado
                                            ] ?? 'bg-gray-100 text-gray-700'
                                        }`}
                                    >
                                        {cotizacion.estado}
                                    </span>
                                </td>
                            </tr>
                        ))}

                        {ultimasCotizaciones.length === 0 && (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="px-4 py-6 text-center text-[#A9ABAE]"
                                >
                                    Todavía no tienes cotizaciones.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </ComercialLayout>
    );
}
