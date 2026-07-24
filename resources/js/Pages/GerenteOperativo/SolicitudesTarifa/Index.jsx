import GerenteOperativoLayout from '@/Layouts/GerenteOperativoLayout';
import ModoTransporteBadge from '@/Components/ModoTransporteBadge';
import PageHeader from '@/Components/PageHeader';
import { IconoSolicitudesNav } from '@/Components/NavIcons';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

const FILTROS = ['Pendientes', 'Todas'];

export default function Index({ solicitudes }) {
    const [filtro, setFiltro] = useState('Pendientes');

    const visibles = filtro === 'Pendientes'
        ? solicitudes.filter((s) => s.estado === 'Pendiente')
        : solicitudes;

    const atender = (solicitud) => {
        router.patch(route('gerente-operativo.solicitudes-tarifa.atender', solicitud.id_solicitud));
    };

    return (
        <GerenteOperativoLayout header="Solicitudes de Tarifa">
            <Head title="Solicitudes de Tarifa" />

            <PageHeader
                icon={IconoSolicitudesNav}
                title="Solicitudes de Tarifa"
                subtitle="Rutas que el equipo comercial necesita cotizar y para las que todavía no hay una tarifa cargada"
            />

            <div className="mb-4 inline-flex rounded-lg bg-gray-100 p-1">
                {FILTROS.map((f) => (
                    <button
                        key={f}
                        type="button"
                        onClick={() => setFiltro(f)}
                        className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition ${
                            filtro === f
                                ? 'bg-white text-[#042753] shadow-sm'
                                : 'text-[#A9ABAE] hover:text-[#042753]'
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Cliente</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Comercial</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Modo</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Servicio</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Ruta</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Solicitada</th>
                            <th className="px-4 py-3 text-center font-semibold text-[#042753]">Estado</th>
                            <th className="px-4 py-3 text-right font-semibold text-[#042753]">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {visibles.map((s) => (
                            <tr key={s.id_solicitud} className="transition-colors hover:bg-gray-50">
                                <td className="px-4 py-3 text-[#042753]">{s.cliente ?? '—'}</td>
                                <td className="px-4 py-3">{s.comercial ?? '—'}</td>
                                <td className="px-4 py-3">
                                    <ModoTransporteBadge modo={s.modo_transporte} />
                                </td>
                                <td className="px-4 py-3">{s.tipo_servicio ?? '—'}</td>
                                <td className="px-4 py-3">{s.pol ?? '—'} → {s.pod ?? '—'}</td>
                                <td className="px-4 py-3 text-[#A9ABAE]">{s.creado_en}</td>
                                <td className="px-4 py-3 text-center">
                                    <span
                                        className={`rounded px-2 py-1 text-xs font-medium ${
                                            s.estado === 'Pendiente'
                                                ? 'bg-amber-100 text-amber-700'
                                                : 'bg-emerald-50 text-emerald-600'
                                        }`}
                                    >
                                        {s.estado}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        <Link
                                            href={route('gerente-operativo.tarifas.create')}
                                            className="text-xs font-semibold text-[#042753] hover:underline"
                                        >
                                            Cargar Tarifa
                                        </Link>
                                        {s.estado === 'Pendiente' && (
                                            <button
                                                type="button"
                                                onClick={() => atender(s)}
                                                className="text-xs font-semibold text-[#71BFA6] hover:underline"
                                            >
                                                Marcar Atendida
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {visibles.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-4 py-6 text-center text-[#A9ABAE]">
                                    {filtro === 'Pendientes'
                                        ? 'No hay solicitudes de tarifa pendientes.'
                                        : 'Todavía no se registró ninguna solicitud de tarifa.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </GerenteOperativoLayout>
    );
}
