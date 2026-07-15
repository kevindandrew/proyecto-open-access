import GerenteOperativoLayout from '@/Layouts/GerenteOperativoLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ tarifas }) {
    const eliminar = (tarifa) => {
        if (!confirm(`¿Eliminar la tarifa de ${tarifa.proveedor}?`)) {
            return;
        }

        router.delete(route('gerente-operativo.tarifas.destroy', tarifa.id_tarifa));
    };

    return (
        <GerenteOperativoLayout header="Tarifas">
            <Head title="Tarifas" />

            <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-[#A9ABAE]">
                    Tarifario de navieras, aerolíneas y transportistas.
                </p>
                <Link
                    href={route('gerente-operativo.tarifas.create')}
                    className="rounded-md bg-[#71BFA6] px-4 py-2 text-sm font-semibold text-[#042753] hover:opacity-90"
                >
                    + Nueva Tarifa
                </Link>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">
                                Proveedor
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">
                                Modo
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">
                                Ruta
                            </th>
                            <th className="px-4 py-3 text-right font-semibold text-[#042753]">
                                20'
                            </th>
                            <th className="px-4 py-3 text-right font-semibold text-[#042753]">
                                40'
                            </th>
                            <th className="px-4 py-3 text-right font-semibold text-[#042753]">
                                40' HC
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">
                                Vigencia
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">
                                Tipo
                            </th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {tarifas.map((tarifa) => (
                            <tr
                                key={tarifa.id_tarifa}
                                className={tarifa.por_vencer ? 'bg-red-50' : ''}
                            >
                                <td className="px-4 py-3 font-medium text-[#042753]">
                                    {tarifa.proveedor}
                                </td>
                                <td className="px-4 py-3">{tarifa.modo}</td>
                                <td className="px-4 py-3">
                                    {tarifa.origen ?? '—'} → {tarifa.destino ?? '—'}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {tarifa.costo_20 ?? '—'}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {tarifa.costo_40 ?? '—'}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {tarifa.costo_40hc ?? '—'}
                                </td>
                                <td
                                    className={`px-4 py-3 ${
                                        tarifa.por_vencer
                                            ? 'font-semibold text-red-600'
                                            : ''
                                    }`}
                                >
                                    {tarifa.fecha_fin_vigencia}
                                    {tarifa.por_vencer && (
                                        <span className="ml-2 rounded bg-red-100 px-2 py-0.5 text-xs">
                                            Por vencer
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3">{tarifa.tipo_tarifa}</td>
                                <td className="space-x-3 px-4 py-3 text-right">
                                    <Link
                                        href={route(
                                            'gerente-operativo.tarifas.edit',
                                            tarifa.id_tarifa,
                                        )}
                                        className="text-[#042753] hover:underline"
                                    >
                                        Editar
                                    </Link>
                                    <button
                                        onClick={() => eliminar(tarifa)}
                                        className="text-red-600 hover:underline"
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {tarifas.length === 0 && (
                            <tr>
                                <td
                                    colSpan={9}
                                    className="px-4 py-6 text-center text-[#A9ABAE]"
                                >
                                    No hay tarifas cargadas.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </GerenteOperativoLayout>
    );
}
