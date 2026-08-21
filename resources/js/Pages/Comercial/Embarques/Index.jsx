import { ESTADO_LABELS } from '@/constants/estados';
import ComercialLayout from '@/Layouts/ComercialLayout';
import ModoTransporteBadge from '@/Components/ModoTransporteBadge';
import { IconoAlerta } from '@/Components/ActionIcons';
import { Head, router } from '@inertiajs/react';

export default function Index({ embarques, filtros, modos, estados }) {
    const aplicarFiltro = (campo, valor) => {
        router.get(
            route('comercial.embarques.index'),
            { ...filtros, [campo]: valor || undefined },
            { preserveState: true, replace: true },
        );
    };

    const selectClass =
        'rounded-md border-gray-300 text-sm shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]';

    return (
        <ComercialLayout header="Mis Embarques">
            <Head title="Mis Embarques" />

            <div className="mb-4 flex flex-wrap gap-3">
                <select
                    className={selectClass}
                    value={filtros.modo_transporte ?? ''}
                    onChange={(e) => aplicarFiltro('modo_transporte', e.target.value)}
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
                    onChange={(e) => aplicarFiltro('estado_embarque', e.target.value)}
                >
                    <option value="">Todos los estados</option>
                    {estados.map((estado) => (
                        <option key={estado} value={estado}>
                            {ESTADO_LABELS[estado] ?? estado}
                        </option>
                    ))}
                </select>

                <label className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-[#042753] shadow-sm">
                    <input
                        type="checkbox"
                        checked={filtros.con_alerta === '1' || filtros.con_alerta === true}
                        onChange={(e) => aplicarFiltro('con_alerta', e.target.checked ? '1' : undefined)}
                        className="rounded border-gray-300 text-[#71BFA6] focus:ring-[#71BFA6]"
                    />
                    Solo con alertas
                </label>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
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
                                Modo
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">
                                ETA
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">
                                Estado
                            </th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {embarques.map((embarque) => (
                            <tr
                                key={embarque.id_embarque}
                                onClick={() =>
                                    router.visit(
                                        route(
                                            'comercial.embarques.show',
                                            embarque.id_embarque,
                                        ),
                                    )
                                }
                                className="cursor-pointer hover:bg-[#71BFA6]/10"
                            >
                                <td className="px-4 py-3 font-medium text-[#042753]">
                                    {embarque.numero_file}
                                </td>
                                <td className="px-4 py-3">
                                    {embarque.cliente}
                                </td>
                                <td className="px-4 py-3">
                                    <ModoTransporteBadge modo={embarque.modo_transporte} />
                                </td>
                                <td className="px-4 py-3">
                                    {embarque.eta ?? '—'}
                                </td>
                                <td className="px-4 py-3">
                                    <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-[#042753]">
                                        {ESTADO_LABELS[embarque.estado_embarque] ??
                                            embarque.estado_embarque}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    {embarque.tiene_alerta && (
                                        <IconoAlerta
                                            className="h-5 w-5 text-amber-600"
                                            title="Este embarque tiene alertas pendientes"
                                        />
                                    )}
                                </td>
                            </tr>
                        ))}

                        {embarques.length === 0 && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-4 py-6 text-center text-[#A9ABAE]"
                                >
                                    Todavía no tienes embarques.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </ComercialLayout>
    );
}
