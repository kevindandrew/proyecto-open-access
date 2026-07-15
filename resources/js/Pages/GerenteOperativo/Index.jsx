import { ESTADO_LABELS } from '@/constants/estados';
import GerenteOperativoLayout from '@/Layouts/GerenteOperativoLayout';
import { Head, Link } from '@inertiajs/react';

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

export default function Index({ contadores, kanban, estados }) {
    return (
        <GerenteOperativoLayout header="Dashboard">
            <Head title="Dashboard Gerente Operativo" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Embarques Activos"
                    value={contadores.embarquesActivos}
                    accent
                />
                <StatCard
                    label="En Aduana Destino"
                    value={contadores.embarquesEnAduana}
                />
                <StatCard
                    label="Tarifas por Vencer"
                    value={contadores.tarifasPorVencer}
                />
                <StatCard
                    label="Gastos Pendientes"
                    value={contadores.gastosPendientes}
                />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-5">
                {estados.map((estado) => (
                    <div
                        key={estado}
                        className="rounded-lg border border-gray-200 bg-white p-3"
                    >
                        <h3 className="mb-3 text-sm font-semibold text-[#042753]">
                            {ESTADO_LABELS[estado] ?? estado}
                            <span className="ml-2 text-xs font-normal text-[#A9ABAE]">
                                ({kanban[estado]?.length ?? 0})
                            </span>
                        </h3>

                        <div className="space-y-2">
                            {(kanban[estado] ?? []).map((embarque) => (
                                <Link
                                    key={embarque.id_embarque}
                                    href={route(
                                        'gerente-operativo.embarques.show',
                                        embarque.id_embarque,
                                    )}
                                    className="block rounded-md border border-gray-100 bg-gray-50 p-3 text-sm hover:border-[#71BFA6] hover:bg-[#71BFA6]/10"
                                >
                                    <p className="font-semibold text-[#042753]">
                                        {embarque.numero_file}
                                    </p>
                                    <p className="text-[#A9ABAE]">
                                        {embarque.cliente}
                                    </p>
                                    <p className="mt-1 text-xs text-[#A9ABAE]">
                                        {embarque.modo_transporte}
                                    </p>
                                </Link>
                            ))}

                            {(kanban[estado] ?? []).length === 0 && (
                                <p className="text-xs text-[#A9ABAE]">
                                    Sin embarques
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </GerenteOperativoLayout>
    );
}
