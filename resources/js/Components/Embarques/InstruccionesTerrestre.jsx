import { useForm } from '@inertiajs/react';

// Estas tres opciones aparecen repetidas entre Trámite Aduanero, Instrucción de
// trámite en puerto y Pagos liberación en la planilla de referencia — comparten
// la misma lista de sugerencias en vez de ser un enum estricto por campo.
const OPCIONES_TRAMITE = [
    'Despacho Full',
    'Desconsolidado en Puerto',
    'Carga IMO',
    'SAMC/ASPB/Gate In',
    'ASPB',
    'SAMC',
    'Anticipado',
    'Sobre Camión',
    'Abreviado',
    'Contenedor a Piso',
];

export default function InstruccionesTerrestre({ embarque, rutaActualizar }) {
    const { data, setData, patch, processing, errors } = useForm({
        sobrefacturado: embarque.sobrefacturado ?? false,
        importe_sobrefacturado: embarque.importe_sobrefacturado ?? '',
        flete_menor: embarque.flete_menor ?? false,
        porcentaje_reparto: embarque.porcentaje_reparto ?? '',
        recinto_aduanero: embarque.recinto_aduanero ?? '',
        tramite_aduanero: embarque.tramite_aduanero ?? '',
        instruccion_tramite_puerto: embarque.instruccion_tramite_puerto ?? '',
        pagos_liberacion: embarque.pagos_liberacion ?? '',
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
            <datalist id="opciones-tramite-terrestre">
                {OPCIONES_TRAMITE.map((opcion) => (
                    <option key={opcion} value={opcion} />
                ))}
            </datalist>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <label className="flex items-center gap-2 text-sm text-[#042753]">
                    <input
                        type="checkbox"
                        checked={data.sobrefacturado}
                        onChange={(e) => setData('sobrefacturado', e.target.checked)}
                        className="rounded border-gray-300 text-[#71BFA6] focus:ring-[#71BFA6]"
                    />
                    Sobrefacturado
                </label>

                {data.sobrefacturado && (
                    <div>
                        <label className={labelClass}>Importe Sobrefacturado (USD)</label>
                        <input
                            type="number"
                            step="0.01"
                            className={inputClass}
                            value={data.importe_sobrefacturado}
                            onChange={(e) => setData('importe_sobrefacturado', e.target.value)}
                        />
                        {errors.importe_sobrefacturado && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.importe_sobrefacturado}
                            </p>
                        )}
                    </div>
                )}

                <label className="flex items-center gap-2 text-sm text-[#042753]">
                    <input
                        type="checkbox"
                        checked={data.flete_menor}
                        onChange={(e) => setData('flete_menor', e.target.checked)}
                        className="rounded border-gray-300 text-[#71BFA6] focus:ring-[#71BFA6]"
                    />
                    Flete Menor
                </label>

                <div>
                    <label className={labelClass}>Porcentajes % (ej. 50/50)</label>
                    <input
                        type="text"
                        placeholder="50/50"
                        className={inputClass}
                        value={data.porcentaje_reparto}
                        onChange={(e) => setData('porcentaje_reparto', e.target.value)}
                    />
                    {errors.porcentaje_reparto && (
                        <p className="mt-1 text-xs text-red-600">{errors.porcentaje_reparto}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label className={labelClass}>Recinto Aduanero</label>
                    <input
                        type="text"
                        placeholder="Ej. Aduana Interior La Paz"
                        className={inputClass}
                        value={data.recinto_aduanero}
                        onChange={(e) => setData('recinto_aduanero', e.target.value)}
                    />
                    {errors.recinto_aduanero && (
                        <p className="mt-1 text-xs text-red-600">{errors.recinto_aduanero}</p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>Trámite Aduanero</label>
                    <input
                        type="text"
                        list="opciones-tramite-terrestre"
                        className={inputClass}
                        value={data.tramite_aduanero}
                        onChange={(e) => setData('tramite_aduanero', e.target.value)}
                    />
                    {errors.tramite_aduanero && (
                        <p className="mt-1 text-xs text-red-600">{errors.tramite_aduanero}</p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>Instrucción de Trámite en Puerto</label>
                    <input
                        type="text"
                        list="opciones-tramite-terrestre"
                        className={inputClass}
                        value={data.instruccion_tramite_puerto}
                        onChange={(e) => setData('instruccion_tramite_puerto', e.target.value)}
                    />
                    {errors.instruccion_tramite_puerto && (
                        <p className="mt-1 text-xs text-red-600">
                            {errors.instruccion_tramite_puerto}
                        </p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>Pagos Liberación</label>
                    <input
                        type="text"
                        list="opciones-tramite-terrestre"
                        className={inputClass}
                        value={data.pagos_liberacion}
                        onChange={(e) => setData('pagos_liberacion', e.target.value)}
                    />
                    {errors.pagos_liberacion && (
                        <p className="mt-1 text-xs text-red-600">{errors.pagos_liberacion}</p>
                    )}
                </div>
            </div>

            <button
                type="submit"
                disabled={processing}
                className="rounded-md bg-[#71BFA6] px-4 py-2 text-sm font-semibold text-[#042753] hover:opacity-90 disabled:opacity-50"
            >
                Guardar Instrucciones
            </button>
        </form>
    );
}
