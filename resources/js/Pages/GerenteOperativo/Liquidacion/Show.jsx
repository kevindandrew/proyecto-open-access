import GerenteOperativoLayout from '@/Layouts/GerenteOperativoLayout';
import { Head, router, useForm } from '@inertiajs/react';

const CONCEPTOS = ['Arancel', 'Impuesto', 'Tasa', 'Otro'];

export default function Show({ embarque, gastos, total }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        concepto: 'Arancel',
        monto: '',
        moneda: 'USD',
    });

    const submit = (e) => {
        e.preventDefault();

        post(
            route('gerente-operativo.embarques.gastos.store', embarque.id_embarque),
            { onSuccess: () => reset('monto') },
        );
    };

    const marcarPagado = (gasto) => {
        router.patch(route('gerente-operativo.gastos.pagar', gasto.id_gasto));
    };

    const inputClass =
        'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]';

    return (
        <GerenteOperativoLayout
            header={`Liquidación de Destino — ${embarque.numero_file}`}
        >
            <Head title={`Liquidación — ${embarque.numero_file}`} />

            <p className="mb-4 text-sm text-[#A9ABAE]">
                Cliente: <span className="text-[#042753]">{embarque.cliente}</span>
            </p>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-[#042753]">
                                        Concepto
                                    </th>
                                    <th className="px-4 py-3 text-right font-semibold text-[#042753]">
                                        Monto
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-[#042753]">
                                        Estado
                                    </th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {gastos.map((gasto) => (
                                    <tr key={gasto.id_gasto}>
                                        <td className="px-4 py-3">
                                            {gasto.concepto}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {gasto.moneda} {gasto.monto}
                                        </td>
                                        <td className="px-4 py-3">
                                            {gasto.pagado ? (
                                                <span className="rounded bg-[#71BFA6]/20 px-2 py-0.5 text-xs font-medium text-[#042753]">
                                                    Pagado {gasto.fecha_pago}
                                                </span>
                                            ) : (
                                                <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                                                    Pendiente
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {!gasto.pagado && (
                                                <button
                                                    onClick={() =>
                                                        marcarPagado(gasto)
                                                    }
                                                    className="text-sm font-medium text-[#71BFA6] hover:underline"
                                                >
                                                    Marcar como pagado
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                {gastos.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-4 py-6 text-center text-[#A9ABAE]"
                                        >
                                            Sin gastos de destino cargados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot>
                                <tr className="border-t-2 border-gray-200">
                                    <td className="px-4 py-3 font-semibold text-[#042753]">
                                        Total
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold text-[#042753]">
                                        {total}
                                    </td>
                                    <td colSpan={2}></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <div>
                    <form
                        onSubmit={submit}
                        className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                    >
                        <h3 className="text-sm font-semibold text-[#042753]">
                            Agregar Gasto
                        </h3>

                        <div>
                            <label className="text-sm font-medium text-[#042753]">
                                Concepto
                            </label>
                            <select
                                className={inputClass}
                                value={data.concepto}
                                onChange={(e) =>
                                    setData('concepto', e.target.value)
                                }
                            >
                                {CONCEPTOS.map((concepto) => (
                                    <option key={concepto} value={concepto}>
                                        {concepto}
                                    </option>
                                ))}
                            </select>
                            {errors.concepto && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.concepto}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-[#042753]">
                                Monto
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                className={inputClass}
                                value={data.monto}
                                onChange={(e) =>
                                    setData('monto', e.target.value)
                                }
                            />
                            {errors.monto && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.monto}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-[#042753]">
                                Moneda
                            </label>
                            <input
                                type="text"
                                className={inputClass}
                                value={data.moneda}
                                onChange={(e) =>
                                    setData('moneda', e.target.value)
                                }
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-md bg-[#71BFA6] px-4 py-2 text-sm font-semibold text-[#042753] hover:opacity-90 disabled:opacity-50"
                        >
                            Agregar
                        </button>
                    </form>
                </div>
            </div>
        </GerenteOperativoLayout>
    );
}
