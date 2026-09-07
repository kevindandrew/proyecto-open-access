import { useForm } from '@inertiajs/react';

export default function Consignatario({ embarque, rutaActualizar }) {
    const { data, setData, patch, processing, errors } = useForm({
        shipper_nombre: embarque.shipper_nombre ?? '',
        shipper_direccion: embarque.shipper_direccion ?? '',
        consignatario_nombre: embarque.consignatario_nombre ?? '',
        consignatario_nit: embarque.consignatario_nit ?? '',
        consignatario_direccion: embarque.consignatario_direccion ?? '',
        consignatario_celular: embarque.consignatario_celular ?? '',
        consignatario_correo: embarque.consignatario_correo ?? '',
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
                        <input
                            type="text"
                            placeholder="Dirección del exportador"
                            className={inputClass}
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
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="sm:col-span-2 lg:col-span-1">
                    <label className={labelClass}>Nombre</label>
                    <input
                        type="text"
                        placeholder="Ej. Juan Pérez"
                        className={inputClass}
                        value={data.consignatario_nombre}
                        onChange={(e) => setData('consignatario_nombre', e.target.value)}
                    />
                    {errors.consignatario_nombre && (
                        <p className="mt-1 text-xs text-red-600">{errors.consignatario_nombre}</p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>NIT</label>
                    <input
                        type="text"
                        placeholder="Ej. 1023456011"
                        className={inputClass}
                        value={data.consignatario_nit}
                        onChange={(e) => setData('consignatario_nit', e.target.value)}
                    />
                    {errors.consignatario_nit && (
                        <p className="mt-1 text-xs text-red-600">{errors.consignatario_nit}</p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>Celular</label>
                    <input
                        type="text"
                        placeholder="Ej. 71234567"
                        className={inputClass}
                        value={data.consignatario_celular}
                        onChange={(e) => setData('consignatario_celular', e.target.value)}
                    />
                    {errors.consignatario_celular && (
                        <p className="mt-1 text-xs text-red-600">{errors.consignatario_celular}</p>
                    )}
                </div>

                <div className="sm:col-span-2 lg:col-span-2">
                    <label className={labelClass}>Dirección</label>
                    <input
                        type="text"
                        placeholder="Ej. Av. Arce #123, Zona Sur"
                        className={inputClass}
                        value={data.consignatario_direccion}
                        onChange={(e) => setData('consignatario_direccion', e.target.value)}
                    />
                    {errors.consignatario_direccion && (
                        <p className="mt-1 text-xs text-red-600">{errors.consignatario_direccion}</p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>Correo</label>
                    <input
                        type="email"
                        placeholder="Ej. contacto@cliente.com"
                        className={inputClass}
                        value={data.consignatario_correo}
                        onChange={(e) => setData('consignatario_correo', e.target.value)}
                    />
                    {errors.consignatario_correo && (
                        <p className="mt-1 text-xs text-red-600">{errors.consignatario_correo}</p>
                    )}
                </div>
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
