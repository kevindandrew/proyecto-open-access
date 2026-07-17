import { ESTADO_LABELS } from '@/constants/estados';
import GerenteOperativoLayout from '@/Layouts/GerenteOperativoLayout';
import PageHeader from '@/Components/PageHeader';
import { IconoEmbarquesNav } from '@/Components/NavIcons';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ embarques, filtros, operativos, modos, estados }) {
    const aplicarFiltro = (campo, valor) => {
        router.get(
            route('gerente-operativo.embarques.index'),
            { ...filtros, [campo]: valor || undefined },
            { preserveState: true, replace: true },
        );
    };

    const selectClass =
        'rounded-md border-gray-300 text-sm shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]';

    return (
        <GerenteOperativoLayout header="Embarques">
            <Head title="Embarques" />

            <PageHeader
                icon={IconoEmbarquesNav}
                title="Embarques"
                subtitle="Seguimiento de embarques en curso y su estado actual"
            />

            <div className="mb-4 flex flex-wrap gap-3">
                <select
                    className={selectClass}
                    value={filtros.id_operativo ?? ''}
                    onChange={(e) =>
                        aplicarFiltro('id_operativo', e.target.value)
                    }
                >
                    <option value="">Todos los operativos</option>
                    {operativos.map((op) => (
                        <option key={op.id_empleado} value={op.id_empleado}>
                            {op.nombre_completo}
                        </option>
                    ))}
                </select>

                <select
                    className={selectClass}
                    value={filtros.modo_transporte ?? ''}
                    onChange={(e) =>
                        aplicarFiltro('modo_transporte', e.target.value)
                    }
                >
                    <option value="">Todos los modos</option>
                    {modos.map((modo) => (
                        <option key={modo} value={modo}>
                            {modo}
                        </option>
                    ))}
                </select>

                <select
                    className={selectClass}
                    value={filtros.estado_embarque ?? ''}
                    onChange={(e) =>
                        aplicarFiltro('estado_embarque', e.target.value)
                    }
                >
                    <option value="">Todos los estados</option>
                    {estados.map((estado) => (
                        <option key={estado} value={estado}>
                            {ESTADO_LABELS[estado] ?? estado}
                        </option>
                    ))}
                </select>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">
                                Nro. File
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">
                                Cliente
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">
                                Operativo
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">
                                Modo
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">
                                ETA
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">
                                Estado
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {embarques.map((embarque) => (
                            <tr
                                key={embarque.id_embarque}
                                onClick={() =>
                                    router.visit(
                                        route(
                                            'gerente-operativo.embarques.show',
                                            embarque.id_embarque,
                                        ),
                                    )
                                }
                                className="cursor-pointer transition-colors hover:bg-[#71BFA6]/10"
                            >
                                <td className="px-4 py-3 font-medium text-[#042753]">
                                    {embarque.numero_file}
                                </td>
                                <td className="px-4 py-3">
                                    {embarque.cliente}
                                </td>
                                <td className="px-4 py-3">
                                    {embarque.operativo ?? (
                                        <span className="rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
                                            Sin asignar
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {embarque.modo_transporte}
                                </td>
                                <td className="px-4 py-3">
                                    {embarque.eta ?? '—'}
                                </td>
                                <td className="px-4 py-3">
                                    {ESTADO_LABELS[embarque.estado_embarque] ??
                                        embarque.estado_embarque}
                                </td>
                            </tr>
                        ))}

                        {embarques.length === 0 && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-4 py-6 text-center text-[#A9ABAE]"
                                >
                                    No hay embarques que coincidan con los
                                    filtros.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </GerenteOperativoLayout>
    );
}
