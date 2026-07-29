import { MONEDAS } from '@/constants/monedas';
import { useForm } from '@inertiajs/react';

export default function AgregarCosto({ embarque, rutaStore, proveedores }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        concepto: '',
        id_proveedor: '',
        costo_compra: '',
        costo_venta: '',
        moneda: 'USD',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route(rutaStore, embarque.id_embarque), {
            onSuccess: () => reset(),
        });
    };

    return (
        <form onSubmit={submit} className="mt-4 space-y-3 border-t border-gray-100 pt-4">
            <div className="flex flex-wrap items-end gap-3">
                <div>
                    <label className="text-xs font-medium text-[#042753]">Concepto</label>
                    <input
                        type="text"
                        placeholder="Ej. Ocean Freight"
                        className="mt-1 block rounded-md border-gray-300 text-sm shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                        value={data.concepto}
                        onChange={(e) => setData('concepto', e.target.value)}
                    />
                    {errors.concepto && (
                        <p className="mt-1 text-xs text-red-600">{errors.concepto}</p>
                    )}
                </div>

                <div>
                    <label className="text-xs font-medium text-[#042753]">Proveedor</label>
                    <select
                        className="mt-1 block rounded-md border-gray-300 text-sm shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                        value={data.id_proveedor}
                        onChange={(e) => setData('id_proveedor', e.target.value)}
                    >
                        <option value="">—</option>
                        {proveedores.map((proveedor) => (
                            <option key={proveedor.id_proveedor} value={proveedor.id_proveedor}>
                                {proveedor.nombre}
                            </option>
                        ))}
                    </select>
                    {errors.id_proveedor && (
                        <p className="mt-1 text-xs text-red-600">{errors.id_proveedor}</p>
                    )}
                </div>

                <div>
                    <label className="text-xs font-medium text-[#042753]">Costo Compra</label>
                    <input
                        type="number"
                        step="0.01"
                        className="mt-1 block w-28 rounded-md border-gray-300 text-sm shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                        value={data.costo_compra}
                        onChange={(e) => setData('costo_compra', e.target.value)}
                    />
                    {errors.costo_compra && (
                        <p className="mt-1 text-xs text-red-600">{errors.costo_compra}</p>
                    )}
                </div>

                <div>
                    <label className="text-xs font-medium text-[#042753]">Costo Venta</label>
                    <input
                        type="number"
                        step="0.01"
                        className="mt-1 block w-28 rounded-md border-gray-300 text-sm shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                        value={data.costo_venta}
                        onChange={(e) => setData('costo_venta', e.target.value)}
                    />
                    {errors.costo_venta && (
                        <p className="mt-1 text-xs text-red-600">{errors.costo_venta}</p>
                    )}
                </div>

                <div>
                    <label className="text-xs font-medium text-[#042753]">Moneda</label>
                    <select
                        className="mt-1 block rounded-md border-gray-300 text-sm shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                        value={data.moneda}
                        onChange={(e) => setData('moneda', e.target.value)}
                    >
                        {MONEDAS.map((m) => (
                            <option key={m.valor} value={m.valor}>
                                {m.valor}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-md bg-[#71BFA6] px-4 py-2 text-sm font-semibold text-[#042753] hover:opacity-90 disabled:opacity-50"
                >
                    + Agregar Costo
                </button>
            </div>
        </form>
    );
}
