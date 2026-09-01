import { IconoEditar } from '@/Components/ActionIcons';
import { MONEDAS } from '@/constants/monedas';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function CostoFila({ costo, proveedores, rutaActualizar, onEliminar, colSpan }) {
    const [editando, setEditando] = useState(false);

    const { data, setData, patch, processing, errors, reset } = useForm({
        concepto: costo.concepto ?? '',
        id_proveedor: costo.id_proveedor ?? '',
        costo_compra: costo.costo_compra ?? '',
        costo_venta: costo.costo_venta ?? '',
        moneda: costo.moneda ?? 'USD',
    });

    const guardar = (e) => {
        e.preventDefault();

        patch(route(rutaActualizar, costo.id_costo), {
            onSuccess: () => setEditando(false),
        });
    };

    const cancelar = () => {
        reset();
        setEditando(false);
    };

    if (editando) {
        return (
            <tr>
                <td colSpan={colSpan} className="px-3 py-3">
                    <form
                        onSubmit={guardar}
                        className="flex flex-wrap items-end gap-3 rounded-md border border-[#71BFA6] bg-white p-3"
                    >
                        <div>
                            <label className="text-xs font-medium text-[#042753]">Concepto</label>
                            <input
                                type="text"
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

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-md bg-[#71BFA6] px-4 py-2 text-sm font-semibold text-[#042753] hover:opacity-90 disabled:opacity-50"
                            >
                                Guardar
                            </button>
                            <button
                                type="button"
                                onClick={cancelar}
                                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-[#042753] hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </td>
            </tr>
        );
    }

    return (
        <tr className="transition-colors hover:bg-gray-50">
            <td className="px-3 py-2">{costo.concepto}</td>
            <td className="px-3 py-2">{costo.proveedor ?? '—'}</td>
            <td className="px-3 py-2 text-right">{costo.costo_compra ?? '—'}</td>
            <td className="px-3 py-2 text-right">{costo.costo_venta ?? '—'}</td>
            <td className="px-3 py-2">{costo.moneda}</td>
            {(rutaActualizar || onEliminar) && (
                <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-3">
                        {rutaActualizar && (
                            <button
                                type="button"
                                onClick={() => setEditando(true)}
                                title="Editar costo"
                                className="text-[#042753] hover:text-[#71BFA6]"
                            >
                                <IconoEditar className="h-4 w-4" />
                            </button>
                        )}
                        {onEliminar && (
                            <button
                                type="button"
                                onClick={() => onEliminar(costo)}
                                className="text-red-600 hover:underline"
                            >
                                Quitar
                            </button>
                        )}
                    </div>
                </td>
            )}
        </tr>
    );
}
