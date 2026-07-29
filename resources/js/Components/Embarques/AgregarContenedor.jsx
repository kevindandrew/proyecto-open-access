import { TIPOS_CONTENEDOR } from '@/constants/tiposContenedor';
import { useForm } from '@inertiajs/react';

export default function AgregarContenedor({ embarque, rutaStore }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        tipo_contenedor: '',
        cantidad: 1,
        numero_contenedor: '',
        numero_sello: '',
        peso_kg: '',
        volumen_cbm: '',
        descripcion_mercancia: '',
        fecha_devolucion: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route(rutaStore, embarque.id_embarque), {
            onSuccess: () => reset(),
        });
    };

    const inputClass =
        'mt-1 block rounded-md border-gray-300 text-sm shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]';
    const labelClass = 'text-xs font-medium text-[#042753]';

    return (
        <form onSubmit={submit} className="mt-4 space-y-3 border-t border-gray-100 pt-4">
            <datalist id="tipos-contenedor-embarque">
                {TIPOS_CONTENEDOR.map((tipo) => (
                    <option key={tipo} value={tipo} />
                ))}
            </datalist>

            <div className="flex flex-wrap items-end gap-3">
                <div>
                    <label className={labelClass}>Tipo de Contenedor</label>
                    <input
                        type="text"
                        list="tipos-contenedor-embarque"
                        placeholder="Ej. 20 DRY"
                        className={inputClass}
                        value={data.tipo_contenedor}
                        onChange={(e) => setData('tipo_contenedor', e.target.value)}
                    />
                    {errors.tipo_contenedor && (
                        <p className="mt-1 text-xs text-red-600">{errors.tipo_contenedor}</p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>Cantidad</label>
                    <input
                        type="number"
                        min="1"
                        className={`${inputClass} w-20`}
                        value={data.cantidad}
                        onChange={(e) => setData('cantidad', e.target.value)}
                    />
                    {errors.cantidad && (
                        <p className="mt-1 text-xs text-red-600">{errors.cantidad}</p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>Número Contenedor</label>
                    <input
                        type="text"
                        className={inputClass}
                        value={data.numero_contenedor}
                        onChange={(e) => setData('numero_contenedor', e.target.value)}
                    />
                </div>

                <div>
                    <label className={labelClass}>Número Sello</label>
                    <input
                        type="text"
                        className={inputClass}
                        value={data.numero_sello}
                        onChange={(e) => setData('numero_sello', e.target.value)}
                    />
                </div>

                <div>
                    <label className={labelClass}>Peso (kg)</label>
                    <input
                        type="number"
                        step="0.01"
                        className={`${inputClass} w-24`}
                        value={data.peso_kg}
                        onChange={(e) => setData('peso_kg', e.target.value)}
                    />
                </div>

                <div>
                    <label className={labelClass}>Volumen (cbm)</label>
                    <input
                        type="number"
                        step="0.001"
                        className={`${inputClass} w-24`}
                        value={data.volumen_cbm}
                        onChange={(e) => setData('volumen_cbm', e.target.value)}
                    />
                </div>

                <div>
                    <label className={labelClass}>Fecha de Devolución</label>
                    <input
                        type="date"
                        className={inputClass}
                        value={data.fecha_devolucion}
                        onChange={(e) => setData('fecha_devolucion', e.target.value)}
                    />
                </div>

                <div className="w-full">
                    <label className={labelClass}>Descripción de Mercancía</label>
                    <input
                        type="text"
                        placeholder="Ej. Adult Face Mask CVC, 60% Cotton, Invoice KZM-GDR44"
                        className={`${inputClass} w-full`}
                        value={data.descripcion_mercancia}
                        onChange={(e) => setData('descripcion_mercancia', e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-md bg-[#71BFA6] px-4 py-2 text-sm font-semibold text-[#042753] hover:opacity-90 disabled:opacity-50"
                >
                    + Agregar Contenedor
                </button>
            </div>
        </form>
    );
}
