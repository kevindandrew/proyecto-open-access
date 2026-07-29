import { useForm } from '@inertiajs/react';

const UNIDADES_PIEZAS = ['CTNS', 'PLTS', 'BULTOS', 'CAJAS', 'BOLSAS'];

export default function InformacionCarga({ embarque, rutaActualizar }) {
    const { data, setData, patch, processing, errors } = useForm({
        nro_piezas: embarque.nro_piezas ?? '',
        unidad_piezas: embarque.unidad_piezas ?? '',
        peso_bruto: embarque.peso_bruto ?? '',
        peso_cobrable: embarque.peso_cobrable ?? '',
        naturaleza_mercancia: embarque.naturaleza_mercancia ?? '',
    });

    const submit = (e) => {
        e.preventDefault();

        patch(route(rutaActualizar, embarque.id_embarque));
    };

    const inputClass =
        'mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]';
    const labelClass = 'text-xs font-medium text-[#042753]';

    return (
        <form onSubmit={submit} className="space-y-4">
            <datalist id="unidades-piezas">
                {UNIDADES_PIEZAS.map((unidad) => (
                    <option key={unidad} value={unidad} />
                ))}
            </datalist>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                    <label className={labelClass}>Nro. de Piezas</label>
                    <input
                        type="number"
                        min="0"
                        className={inputClass}
                        value={data.nro_piezas}
                        onChange={(e) => setData('nro_piezas', e.target.value)}
                    />
                    {errors.nro_piezas && (
                        <p className="mt-1 text-xs text-red-600">{errors.nro_piezas}</p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>Unidad</label>
                    <input
                        type="text"
                        list="unidades-piezas"
                        placeholder="Ej. CTNS"
                        className={inputClass}
                        value={data.unidad_piezas}
                        onChange={(e) => setData('unidad_piezas', e.target.value)}
                    />
                    {errors.unidad_piezas && (
                        <p className="mt-1 text-xs text-red-600">{errors.unidad_piezas}</p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>Peso Bruto (Gross Weight)</label>
                    <input
                        type="number"
                        step="0.01"
                        className={inputClass}
                        value={data.peso_bruto}
                        onChange={(e) => setData('peso_bruto', e.target.value)}
                    />
                    {errors.peso_bruto && (
                        <p className="mt-1 text-xs text-red-600">{errors.peso_bruto}</p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>Peso Cobrable (Chargeable Weight)</label>
                    <input
                        type="number"
                        step="0.01"
                        className={inputClass}
                        value={data.peso_cobrable}
                        onChange={(e) => setData('peso_cobrable', e.target.value)}
                    />
                    {errors.peso_cobrable && (
                        <p className="mt-1 text-xs text-red-600">{errors.peso_cobrable}</p>
                    )}
                </div>
            </div>

            <div>
                <label className={labelClass}>
                    Naturaleza y Cantidad de la Mercancía
                </label>
                <textarea
                    rows={3}
                    placeholder="Ej. Adult Face Mask CVC, 60% Cotton, Invoice KZM-GDR44"
                    className={inputClass}
                    value={data.naturaleza_mercancia}
                    onChange={(e) => setData('naturaleza_mercancia', e.target.value)}
                />
                {errors.naturaleza_mercancia && (
                    <p className="mt-1 text-xs text-red-600">{errors.naturaleza_mercancia}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={processing}
                className="rounded-md bg-[#71BFA6] px-4 py-2 text-sm font-semibold text-[#042753] hover:opacity-90 disabled:opacity-50"
            >
                Guardar Información de Carga
            </button>
        </form>
    );
}
