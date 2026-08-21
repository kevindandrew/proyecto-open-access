import { useForm } from '@inertiajs/react';

function etiquetaContenedor(contenedor) {
    return contenedor.numero_contenedor || contenedor.tipo_contenedor || `Contenedor #${contenedor.id_item}`;
}

export default function AgregarHouse({ embarque, rutaStore, contenedoresDisponibles = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        condicion_pago: '',
        fecha_emision: '',
        contenedores: [],
    });

    const toggleContenedor = (idItem) => {
        setData(
            'contenedores',
            data.contenedores.includes(idItem)
                ? data.contenedores.filter((id) => id !== idItem)
                : [...data.contenedores, idItem],
        );
    };

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

                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-md bg-[#71BFA6] px-4 py-2 text-sm font-semibold text-[#042753] hover:opacity-90 disabled:opacity-50"
                >
                    + Agregar House
                </button>
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
                {errors.contenedores && (
                    <p className="mt-1 text-xs text-red-600">{errors.contenedores}</p>
                )}
            </div>
        </form>
    );
}
