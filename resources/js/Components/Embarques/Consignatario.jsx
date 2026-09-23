import { useForm } from '@inertiajs/react';

export default function Consignatario({ embarque, rutaActualizar, consignatariosCliente = [] }) {
    const { data, setData, patch, processing, errors } = useForm({
        shipper_nombre: embarque.shipper_nombre ?? '',
        shipper_direccion: embarque.shipper_direccion ?? '',
        id_consignatario: embarque.id_consignatario ?? '',
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
            <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#71BFA6]">
                    Shipper / Embarcador
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className={labelClass}>Nombre</label>
                        <input
                            type="text"
                            placeholder="Ej. Henan Huangneng Machinery Co., Ltd"
                            className={inputClass}
                            value={data.shipper_nombre}
                            onChange={(e) => setData('shipper_nombre', e.target.value)}
                        />
                        {errors.shipper_nombre && (
                            <p className="mt-1 text-xs text-red-600">{errors.shipper_nombre}</p>
                        )}
                    </div>
                    <div>
                        <label className={labelClass}>Dirección</label>
                        <textarea
                            rows={3}
                            placeholder="Dirección del exportador — usá Enter para agregar más líneas (calle, ciudad, país...)"
                            className={`${inputClass} whitespace-pre-line`}
                            value={data.shipper_direccion}
                            onChange={(e) => setData('shipper_direccion', e.target.value)}
                        />
                        {errors.shipper_direccion && (
                            <p className="mt-1 text-xs text-red-600">{errors.shipper_direccion}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#71BFA6]">
                    Consignatario
                </p>
                <div>
                    <label className={labelClass}>Consignatario del cliente</label>
                    <select
                        className={inputClass}
                        value={data.id_consignatario}
                        onChange={(e) => setData('id_consignatario', e.target.value)}
                    >
                        <option value="">—</option>
                        {consignatariosCliente.map((consignatario) => (
                            <option key={consignatario.id_consignatario} value={consignatario.id_consignatario}>
                                {consignatario.nombre}
                                {consignatario.nit ? ` — NIT: ${consignatario.nit}` : ''}
                            </option>
                        ))}
                    </select>
                    {errors.id_consignatario && (
                        <p className="mt-1 text-xs text-red-600">{errors.id_consignatario}</p>
                    )}
                    <p className="mt-1 text-xs text-[#A9ABAE]">
                        {consignatariosCliente.length === 0
                            ? 'Este cliente todavía no tiene consignatarios cargados — agregalos desde Clientes.'
                            : 'Para editar el nombre, NIT, dirección u otros datos de un consignatario, hacelo desde la sección Clientes.'}
                    </p>
                </div>
            </div>

            <button
                type="submit"
                disabled={processing}
                className="rounded-md bg-[#71BFA6] px-4 py-2 text-sm font-semibold text-[#042753] hover:opacity-90 disabled:opacity-50"
            >
                Guardar Consignatario
            </button>
        </form>
    );
}
