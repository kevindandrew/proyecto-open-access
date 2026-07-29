import { useForm } from '@inertiajs/react';

export default function AgregarHouse({ embarque, rutaStore }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        condicion_pago: '',
        fecha_emision: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route(rutaStore, embarque.id_embarque), {
            onSuccess: () => reset(),
        });
    };

    return (
        <form onSubmit={submit} className="mt-4 flex flex-wrap items-end gap-3 border-t border-gray-100 pt-4">
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
        </form>
    );
}
