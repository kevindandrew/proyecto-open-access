import { IconoEditar } from '@/Components/ActionIcons';
import { TIPOS_CONTENEDOR } from '@/constants/tiposContenedor';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';

const inputClass =
    'mt-1 block rounded-md border-gray-300 text-sm shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]';
const labelClass = 'text-xs font-medium text-[#042753]';

export default function ContenedorFila({ contenedor, rutaActualizar, onEliminar }) {
    const [editando, setEditando] = useState(false);

    const { data, setData, patch, processing, errors, reset } = useForm({
        tipo_contenedor: contenedor.tipo_contenedor ?? '',
        numero_contenedor: contenedor.numero_contenedor ?? '',
        numero_sello: contenedor.numero_sello ?? '',
        peso_kg: contenedor.peso_kg ?? '',
        volumen_cbm: contenedor.volumen_cbm ?? '',
        descripcion_mercancia: contenedor.descripcion_mercancia ?? '',
        fecha_devolucion: contenedor.fecha_devolucion ?? '',
    });

    const guardar = (e) => {
        e.preventDefault();

        patch(route(rutaActualizar, contenedor.id_item), {
            onSuccess: () => setEditando(false),
        });
    };

    const cancelar = () => {
        reset();
        setEditando(false);
    };

    if (editando) {
        return (
            <form
                onSubmit={guardar}
                className="rounded-md border border-[#71BFA6] bg-white p-3"
            >
                <datalist id="tipos-contenedor-embarque-editar">
                    {TIPOS_CONTENEDOR.map((tipo) => (
                        <option key={tipo} value={tipo} />
                    ))}
                </datalist>

                <div className="flex flex-wrap items-end gap-3">
                    <div>
                        <label className={labelClass}>Tipo de Contenedor</label>
                        <input
                            type="text"
                            list="tipos-contenedor-embarque-editar"
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
                        <label className={labelClass}>Número Contenedor</label>
                        <input
                            type="text"
                            placeholder="Ej. MSCU1234567"
                            className={inputClass}
                            value={data.numero_contenedor}
                            onChange={(e) => setData('numero_contenedor', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Número Sello</label>
                        <input
                            type="text"
                            placeholder="Ej. SL123456"
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
                </div>
            </form>
        );
    }

    return (
        <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#042753]">
                    {contenedor.numero_contenedor ?? 'Sin número'}
                </p>
                <div className="flex items-center gap-3">
                    <span className="rounded bg-gray-200 px-2 py-0.5 text-xs text-[#042753]">
                        {contenedor.cantidad && contenedor.cantidad !== 1 ? `${contenedor.cantidad}x ` : ''}
                        {contenedor.tipo_contenedor ?? '—'}
                    </span>
                    {rutaActualizar && (
                        <button
                            type="button"
                            onClick={() => setEditando(true)}
                            title="Editar contenedor"
                            className="text-[#042753] hover:text-[#71BFA6]"
                        >
                            <IconoEditar className="h-4 w-4" />
                        </button>
                    )}
                    {onEliminar && (
                        <button
                            type="button"
                            onClick={() => onEliminar(contenedor)}
                            className="text-xs text-red-600 hover:underline"
                        >
                            Quitar
                        </button>
                    )}
                </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-[#A9ABAE] sm:grid-cols-3">
                <span>Sello: {contenedor.numero_sello ?? '—'}</span>
                <span>Peso: {contenedor.peso_kg ?? '—'} kg</span>
                <span>Vol: {contenedor.volumen_cbm ?? '—'} cbm</span>
                <span>Fecha Dev: {contenedor.fecha_devolucion ?? '—'}</span>
            </div>
            {contenedor.descripcion_mercancia && (
                <p className="mt-2 text-xs text-[#042753]">
                    {contenedor.descripcion_mercancia}
                </p>
            )}
        </div>
    );
}
