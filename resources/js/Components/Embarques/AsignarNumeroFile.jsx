import { useForm } from '@inertiajs/react';
import { useState } from 'react';

/**
 * Nro. de File del embarque (Gerente Operativo). No se genera solo: depende
 * de la fecha de arribo, así que se asigna a mano. El sistema sugiere el
 * siguiente número según el mes del ETA (AAMM + consecutivo).
 */
export default function AsignarNumeroFile({ embarque }) {
    const sinFile = !embarque.numero_file;
    const [editando, setEditando] = useState(sinFile);

    const { data, setData, patch, processing, errors, reset } = useForm({
        numero_file: embarque.numero_file ?? embarque.numero_file_sugerido ?? '',
    });

    const submit = (e) => {
        e.preventDefault();

        patch(route('gerente-operativo.embarques.asignar-numero-file', embarque.id_embarque), {
            preserveScroll: true,
            onSuccess: () => setEditando(false),
        });
    };

    const cancelar = () => {
        reset();
        setEditando(false);
    };

    if (!editando) {
        return (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-sm text-[#042753]">
                    Nro. de File: <span className="font-bold">{embarque.numero_file}</span>
                    {embarque.numero_referencia_cotizacion && (
                        <span className="text-[#A9ABAE]"> · Cotización {embarque.numero_referencia_cotizacion}</span>
                    )}
                </p>
                <button
                    type="button"
                    onClick={() => setEditando(true)}
                    className="text-sm font-medium text-[#71BFA6] hover:underline"
                >
                    Cambiar Nro. de File
                </button>
            </div>
        );
    }

    return (
        <form
            onSubmit={submit}
            className={`mb-4 rounded-lg border px-4 py-3 shadow-sm ${
                sinFile ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-white'
            }`}
        >
            {sinFile && (
                <p className="mb-2 text-sm font-semibold text-amber-800">
                    Este embarque todavía no tiene Nro. de File
                    {embarque.numero_referencia_cotizacion && ` (cotización ${embarque.numero_referencia_cotizacion})`}.
                </p>
            )}
            <div className="flex flex-wrap items-end gap-3">
                <div>
                    <label className="text-xs font-medium text-[#042753]">Nro. de File</label>
                    <input
                        type="text"
                        maxLength={30}
                        className="mt-1 block w-44 rounded-md border-gray-300 text-sm uppercase shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                        value={data.numero_file}
                        onChange={(e) => setData('numero_file', e.target.value)}
                    />
                </div>
                <button
                    type="submit"
                    disabled={processing || !data.numero_file}
                    className="rounded-md bg-[#042753] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                    {sinFile ? 'Asignar' : 'Guardar'}
                </button>
                {!sinFile && (
                    <button type="button" onClick={cancelar} className="text-sm text-[#A9ABAE] hover:underline">
                        Cancelar
                    </button>
                )}
                {embarque.numero_file_sugerido && (
                    <p className="pb-2 text-xs text-[#A9ABAE]">
                        Sugerido según el ETA
                        {embarque.eta ? ` (${embarque.eta})` : ' (sin ETA cargado: se usa el mes actual)'}:{' '}
                        <button
                            type="button"
                            onClick={() => setData('numero_file', embarque.numero_file_sugerido)}
                            className="font-semibold text-[#042753] hover:underline"
                        >
                            {embarque.numero_file_sugerido}
                        </button>
                    </p>
                )}
            </div>
            {errors.numero_file && <p className="mt-1 text-xs text-red-600">{errors.numero_file}</p>}
        </form>
    );
}
