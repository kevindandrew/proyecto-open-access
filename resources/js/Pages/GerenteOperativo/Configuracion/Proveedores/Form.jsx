import GerenteOperativoLayout from '@/Layouts/GerenteOperativoLayout';
import { Head, useForm } from '@inertiajs/react';

const TIPO_LABEL = {
    Naviera: 'Naviera',
    Aerolinea: 'Aerolínea',
    Transportista: 'Transportista',
    Agente_Origen: 'Agente de Origen',
};

const inputClass =
    'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]';
const labelClass = 'text-sm font-medium text-[#042753]';

export default function Form({ proveedor, tipos }) {
    const esEdicion = Boolean(proveedor);

    const { data, setData, post, put, processing, errors } = useForm({
        tipo: proveedor?.tipo ?? tipos[0],
        nombre: proveedor?.nombre ?? '',
        nombre_fantasia: proveedor?.nombre_fantasia ?? '',
        codigo_interno: proveedor?.codigo_interno ?? '',
        contacto: proveedor?.contacto ?? '',
        direccion1: proveedor?.direccion1 ?? '',
        ciudad: proveedor?.ciudad ?? '',
        pais: proveedor?.pais ?? '',
        telefono: proveedor?.telefono ?? '',
        celular: proveedor?.celular ?? '',
        nit: proveedor?.nit ?? '',
        email: proveedor?.email ?? '',
        activo: proveedor?.activo ?? true,
    });

    const submit = (e) => {
        e.preventDefault();

        if (esEdicion) {
            put(route('gerente-operativo.configuracion.proveedores.update', proveedor.id_proveedor));
        } else {
            post(route('gerente-operativo.configuracion.proveedores.store'));
        }
    };

    return (
        <GerenteOperativoLayout header={esEdicion ? 'Editar Proveedor' : 'Nuevo Proveedor'}>
            <Head title={esEdicion ? 'Editar Proveedor' : 'Nuevo Proveedor'} />

            <form
                onSubmit={submit}
                className="max-w-2xl space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
                <div className="grid grid-cols-2 gap-4">
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
                    <div>
                        <label className={labelClass}>Tipo</label>
                        <select
                            className={inputClass}
                            value={data.tipo}
                            onChange={(e) => setData('tipo', e.target.value)}
                        >
                            {tipos.map((tipo) => (
                                <option key={tipo} value={tipo}>
                                    {TIPO_LABEL[tipo] ?? tipo}
                                </option>
                            ))}
                        </select>
                        {errors.tipo && <p className="mt-1 text-sm text-red-600">{errors.tipo}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Nombre de Fantasía</label>
                        <input
                            type="text"
                            className={inputClass}
                            value={data.nombre_fantasia}
                            onChange={(e) => setData('nombre_fantasia', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Código Interno</label>
                        <input
                            type="text"
                            placeholder="Ej. MSC"
                            className={inputClass}
                            value={data.codigo_interno}
                            onChange={(e) => setData('codigo_interno', e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Persona de Contacto</label>
                    <input
                        type="text"
                        className={inputClass}
                        value={data.contacto}
                        onChange={(e) => setData('contacto', e.target.value)}
                    />
                </div>

                <div>
                    <label className={labelClass}>Dirección</label>
                    <input
                        type="text"
                        className={inputClass}
                        value={data.direccion1}
                        onChange={(e) => setData('direccion1', e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Ciudad</label>
                        <input
                            type="text"
                            className={inputClass}
                            value={data.ciudad}
                            onChange={(e) => setData('ciudad', e.target.value)}
                        />
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

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Teléfono</label>
                        <input
                            type="text"
                            className={inputClass}
                            value={data.telefono}
                            onChange={(e) => setData('telefono', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Celular</label>
                        <input
                            type="text"
                            className={inputClass}
                            value={data.celular}
                            onChange={(e) => setData('celular', e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>NIT</label>
                        <input
                            type="text"
                            className={inputClass}
                            value={data.nit}
                            onChange={(e) => setData('nit', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Email</label>
                        <input
                            type="email"
                            className={inputClass}
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
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
                        Activo (desmarcá para dejar de ofrecerlo al cargar tarifas nuevas)
                    </label>
                )}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-md bg-[#71BFA6] px-4 py-2 text-sm font-semibold text-[#042753] hover:opacity-90 disabled:opacity-50"
                    >
                        {esEdicion ? 'Guardar Cambios' : 'Crear Proveedor'}
                    </button>
                </div>
            </form>
        </GerenteOperativoLayout>
    );
}
