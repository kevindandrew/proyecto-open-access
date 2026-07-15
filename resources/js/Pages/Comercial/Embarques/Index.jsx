import { ESTADO_LABELS } from '@/constants/estados';
import ComercialLayout from '@/Layouts/ComercialLayout';
import { Head, router } from '@inertiajs/react';

export default function Index({ embarques }) {
    return (
        <ComercialLayout header="Mis Embarques">
            <Head title="Mis Embarques" />

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
                                    {embarque.modo_transporte}
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
                            </tr>
                        ))}

                        {embarques.length === 0 && (
                            <tr>
                                <td
                                    colSpan={5}
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
