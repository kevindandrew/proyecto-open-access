import { IconoEditar } from '@/Components/ActionIcons';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';

function etiquetaContenedor(contenedor) {
    return contenedor.numero_contenedor || contenedor.tipo_contenedor || `Contenedor #${contenedor.id_item}`;
}

export default function HouseFila({
    house,
    contenedoresDisponibles,
    rutaActualizar,
    rutaPdf,
    onEliminar,
    colSpan,
}) {
    const [editando, setEditando] = useState(false);

    const { data, setData, patch, processing, errors, reset } = useForm({
        condicion_pago: house.condicion_pago ?? '',
        fecha_emision: house.fecha_emision ?? '',
        contenedores: (house.contenedores ?? []).map((c) => c.id_item),
    });

    const toggleContenedor = (idItem) => {
        setData(
            'contenedores',
            data.contenedores.includes(idItem)
                ? data.contenedores.filter((id) => id !== idItem)
                : [...data.contenedores, idItem],
        );
    };

    const guardar = (e) => {
        e.preventDefault();

        patch(route(rutaActualizar, house.id_hbl), {
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
                        className="space-y-3 rounded-md border border-[#71BFA6] bg-white p-3"
                    >
                        <div className="flex flex-wrap items-end gap-3">
                            <div>
                                <label className="text-xs font-medium text-[#042753]">
                                    Condición de Pago
                                </label>
                                <select
                                    className="mt-1 block rounded-md border-gray-300 text-sm shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                    value={data.condicion_pago}
                                    onChange={(e) => setData('condicion_pago', e.target.value)}
                                >
                                    <option value="">—</option>
                                    <option value="Prepaid">Prepaid</option>
                                    <option value="Collect">Collect</option>
                                </select>
                                {errors.condicion_pago && (
                                    <p className="mt-1 text-xs text-red-600">{errors.condicion_pago}</p>
                                )}
                            </div>

                            <div>
                                <label className="text-xs font-medium text-[#042753]">
                                    Fecha de Emisión
                                </label>
                                <input
                                    type="date"
                                    className="mt-1 block rounded-md border-gray-300 text-sm shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                    value={data.fecha_emision}
                                    onChange={(e) => setData('fecha_emision', e.target.value)}
                                />
                                {errors.fecha_emision && (
                                    <p className="mt-1 text-xs text-red-600">{errors.fecha_emision}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-[#042753]">
                                Contenedores de este House
                            </label>
                            {contenedoresDisponibles.length === 0 ? (
                                <p className="mt-1 text-xs text-[#A9ABAE]">
                                    Todavía no hay contenedores cargados en este embarque.
                                </p>
                            ) : (
                                <div className="mt-1 flex flex-wrap gap-3">
                                    {contenedoresDisponibles.map((contenedor) => (
                                        <label
                                            key={contenedor.id_item}
                                            className="flex items-center gap-1.5 text-xs text-[#042753]"
                                        >
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-[#71BFA6] focus:ring-[#71BFA6]"
                                                checked={data.contenedores.includes(contenedor.id_item)}
                                                onChange={() => toggleContenedor(contenedor.id_item)}
                                            />
                                            {etiquetaContenedor(contenedor)}
                                        </label>
                                    ))}
                                </div>
                            )}
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
        <tr>
            <td className="px-3 py-2 font-medium text-[#042753]">{house.numero_hbl}</td>
            <td className="px-3 py-2 text-[#042753]">
                {house.contenedores && house.contenedores.length > 0
                    ? house.contenedores.map(etiquetaContenedor).join(', ')
                    : '—'}
            </td>
            <td className="px-3 py-2">{house.condicion_pago ?? '—'}</td>
            <td className="px-3 py-2">{house.fecha_emision ?? '—'}</td>
            {(rutaActualizar || rutaPdf || onEliminar) && (
                <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-3">
                        {rutaPdf && (
                            <a
                                href={route(rutaPdf, house.id_hbl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#042753] hover:underline"
                            >
                                PDF
                            </a>
                        )}
                        {rutaActualizar && (
                            <button
                                type="button"
                                onClick={() => setEditando(true)}
                                title="Editar house"
                                className="text-[#042753] hover:text-[#71BFA6]"
                            >
                                <IconoEditar className="h-4 w-4" />
                            </button>
                        )}
                        {onEliminar && (
                            <button
                                type="button"
                                onClick={() => onEliminar(house)}
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
