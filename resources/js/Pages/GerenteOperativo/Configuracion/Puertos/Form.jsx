import GerenteOperativoLayout from '@/Layouts/GerenteOperativoLayout';
import { Head, useForm } from '@inertiajs/react';

const inputClass =
    'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]';
const disabledInputClass =
    'mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-[#A9ABAE] shadow-sm';
const labelClass = 'text-sm font-medium text-[#042753]';

export default function Form({ puerto, tipos }) {
    const esEdicion = Boolean(puerto);

    const { data, setData, post, put, processing, errors } = useForm({
        codigo: puerto?.codigo ?? '',
        nombre: puerto?.nombre ?? '',
        tipo: puerto?.tipo ?? tipos[0],
        pais: puerto?.pais ?? '',
        activo: puerto?.activo ?? true,
    });

    const submit = (e) => {
        e.preventDefault();

        if (esEdicion) {
            put(route('gerente-operativo.configuracion.puertos.update', puerto.codigo));
        } else {
            post(route('gerente-operativo.configuracion.puertos.store'));
        }
    };

    return (
        <GerenteOperativoLayout header={esEdicion ? 'Editar Puerto/Aeropuerto' : 'Nuevo Puerto/Aeropuerto'}>
            <Head title={esEdicion ? 'Editar Puerto/Aeropuerto' : 'Nuevo Puerto/Aeropuerto'} />

            <form
                onSubmit={submit}
                className="max-w-xl space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
                <div>
                    <label className={labelClass}>Código</label>
                    <input
                        type="text"
                        maxLength={10}
                        placeholder="Ej. ARI"
                        disabled={esEdicion}
                        className={esEdicion ? disabledInputClass : inputClass}
                        value={data.codigo}
                        onChange={(e) => setData('codigo', e.target.value.toUpperCase())}
                    />
                    {esEdicion ? (
                        <p className="mt-1 text-xs text-[#A9ABAE]">
                            El código no se puede cambiar una vez creado — ya puede estar referenciado en tarifas o cotizaciones.
                        </p>
                    ) : (
                        errors.codigo && <p className="mt-1 text-sm text-red-600">{errors.codigo}</p>
                    )}
                </div>

                <div>
                    <label className={labelClass}>Nombre</label>
                    <input
                        type="text"
                        className={inputClass}
                        value={data.nombre}
                        onChange={(e) => setData('nombre', e.target.value)}
                    />
                    {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Tipo</label>
                        <select
                            className={inputClass}
                            value={data.tipo}
                            onChange={(e) => setData('tipo', e.target.value)}
                        >
                            {tipos.map((tipo) => (
                                <option key={tipo} value={tipo}>
                                    {tipo}
                                </option>
                            ))}
                        </select>
                        {errors.tipo && <p className="mt-1 text-sm text-red-600">{errors.tipo}</p>}
                    </div>
                    <div>
                        <label className={labelClass}>País</label>
                        <input
                            type="text"
                            className={inputClass}
                            value={data.pais}
                            onChange={(e) => setData('pais', e.target.value)}
                        />
                    </div>
                </div>

                {esEdicion && (
                    <label className="flex items-center gap-2 text-sm text-[#042753]">
                        <input
                            type="checkbox"
                            checked={data.activo}
                            onChange={(e) => setData('activo', e.target.checked)}
                            className="rounded border-gray-300 text-[#71BFA6] focus:ring-[#71BFA6]"
                        />
                        Activo (desmarcá para dejar de ofrecerlo al cargar tarifas o cotizaciones nuevas)
                    </label>
                )}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-md bg-[#71BFA6] px-4 py-2 text-sm font-semibold text-[#042753] hover:opacity-90 disabled:opacity-50"
                    >
                        {esEdicion ? 'Guardar Cambios' : 'Crear Puerto/Aeropuerto'}
                    </button>
                </div>
            </form>
        </GerenteOperativoLayout>
    );
}
