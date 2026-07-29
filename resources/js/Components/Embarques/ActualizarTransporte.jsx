import { useForm } from '@inertiajs/react';

export default function ActualizarTransporte({ embarque, rutaActualizar }) {
    const { data, setData, patch, processing, errors } = useForm({
        mbl: embarque.mbl ?? '',
        etd: embarque.etd ?? '',
        eta: embarque.eta ?? '',
        nave: embarque.nave ?? '',
        viaje: embarque.viaje ?? '',
        pago_master: embarque.pago_master ?? '',
    });

    const submit = (e) => {
        e.preventDefault();

        patch(route(rutaActualizar, embarque.id_embarque));
    };

    const inputClass =
        'mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]';
    const labelClass = 'text-xs font-medium text-[#042753]';

    return (
        <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
                <label className={labelClass}>MBL</label>
                <input
                    type="text"
                    className={inputClass}
                    value={data.mbl}
                    onChange={(e) => setData('mbl', e.target.value)}
                />
                {errors.mbl && <p className="mt-1 text-xs text-red-600">{errors.mbl}</p>}
            </div>

            <div>
                <label className={labelClass}>ETD</label>
                <input
                    type="date"
                    className={inputClass}
                    value={data.etd}
                    onChange={(e) => setData('etd', e.target.value)}
                />
                {errors.etd && <p className="mt-1 text-xs text-red-600">{errors.etd}</p>}
            </div>

            <div>
                <label className={labelClass}>ETA</label>
                <input
                    type="date"
                    className={inputClass}
                    value={data.eta}
                    onChange={(e) => setData('eta', e.target.value)}
                />
                {errors.eta && <p className="mt-1 text-xs text-red-600">{errors.eta}</p>}
            </div>

            <div>
                <label className={labelClass}>Nave</label>
                <input
                    type="text"
                    className={inputClass}
                    value={data.nave}
                    onChange={(e) => setData('nave', e.target.value)}
                />
                {errors.nave && <p className="mt-1 text-xs text-red-600">{errors.nave}</p>}
            </div>

            <div>
                <label className={labelClass}>Viaje</label>
                <input
                    type="text"
                    className={inputClass}
                    value={data.viaje}
                    onChange={(e) => setData('viaje', e.target.value)}
                />
                {errors.viaje && <p className="mt-1 text-xs text-red-600">{errors.viaje}</p>}
            </div>

            <div>
                <label className={labelClass}>Pago Master</label>
                <select
                    className={inputClass}
                    value={data.pago_master}
                    onChange={(e) => setData('pago_master', e.target.value)}
                >
                    <option value="">—</option>
                    <option value="Prepaid">Prepaid</option>
                    <option value="Collect">Collect</option>
                </select>
                {errors.pago_master && (
                    <p className="mt-1 text-xs text-red-600">{errors.pago_master}</p>
                )}
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-md bg-[#71BFA6] px-4 py-2 text-sm font-semibold text-[#042753] hover:opacity-90 disabled:opacity-50"
                >
                    Guardar Datos de Transporte
                </button>
            </div>
        </form>
    );
}
