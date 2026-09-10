import DocumentosMultiples, {
    mapearDocumentosIniciales,
    useDocumentosMultiples,
} from '@/Components/DocumentosMultiples';
import GerenteComercialLayout from '@/Layouts/GerenteComercialLayout';
import { Head, useForm } from '@inertiajs/react';

const inputClass =
    'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]';
const labelClass = 'text-sm font-medium text-[#042753]';

const TIPOS_DOCUMENTO = [
    { valor: 'CI', etiqueta: 'Cédula de Identidad (CI)' },
    { valor: 'NIT', etiqueta: 'NIT' },
];

function CampoError({ mensaje }) {
    return mensaje ? <p className="mt-1 text-sm text-red-600">{mensaje}</p> : null;
}

export default function Form({ empleado }) {
    const esEdicion = Boolean(empleado);

    const { data, setData, post, transform, processing, errors } = useForm({
        nombre_completo: empleado?.nombre_completo ?? '',
        ci: empleado?.ci ?? '',
        fecha_nacimiento: empleado?.fecha_nacimiento ?? '',
        fecha_ingreso: empleado?.fecha_ingreso ?? '',
        documentos: mapearDocumentosIniciales(empleado?.documentos),
        documentos_eliminados: [],
        telefono: empleado?.telefono ?? '',
        email: empleado?.email ?? '',
        activo: empleado?.activo ?? true,
    });

    const documentosHandlers = useDocumentosMultiples(data, setData);

    const submit = (e) => {
        e.preventDefault();

        if (esEdicion) {
            // PHP no parsea cuerpos multipart en peticiones PUT reales, así que
            // hay que mandar un POST con _method=put (spoofing) para que los
            // archivos lleguen — Inertia no hace esta conversión sola.
            transform((data) => ({ ...data, _method: 'put' }));
            post(route('gerente-comercial.personal.update', empleado.id_empleado));
        } else {
            post(route('gerente-comercial.personal.store'));
        }
    };

    return (
        <GerenteComercialLayout
            header={esEdicion ? 'Editar Comercial' : 'Nuevo Comercial'}
        >
            <Head title={esEdicion ? 'Editar Comercial' : 'Nuevo Comercial'} />

            <form
                onSubmit={submit}
                encType="multipart/form-data"
                className="max-w-2xl space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
                {esEdicion && empleado.username && (
                    <p className="text-sm text-[#A9ABAE]">
                        Usuario:{' '}
                        <span className="font-mono text-[#042753]">
                            {empleado.username}
                        </span>
                    </p>
                )}

                <div>
                    <label className={labelClass}>Nombre Completo</label>
                    <input
                        type="text"
                        placeholder="Ej. María Fernanda Rojas"
                        className={inputClass}
                        value={data.nombre_completo}
                        onChange={(e) =>
                            setData('nombre_completo', e.target.value)
                        }
                    />
                    <CampoError mensaje={errors.nombre_completo} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>CI</label>
                        <input
                            type="text"
                            placeholder="Ej. 1234567 LP"
                            className={inputClass}
                            value={data.ci}
                            onChange={(e) => setData('ci', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Teléfono</label>
                        <input
                            type="text"
                            placeholder="Ej. 71234567"
                            className={inputClass}
                            value={data.telefono}
                            onChange={(e) =>
                                setData('telefono', e.target.value)
                            }
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Fecha de Nacimiento</label>
                        <input
                            type="date"
                            className={inputClass}
                            value={data.fecha_nacimiento}
                            onChange={(e) => setData('fecha_nacimiento', e.target.value)}
                        />
                        <CampoError mensaje={errors.fecha_nacimiento} />
                    </div>
                    <div>
                        <label className={labelClass}>Fecha de Ingreso</label>
                        <input
                            type="date"
                            className={inputClass}
                            value={data.fecha_ingreso}
                            onChange={(e) => setData('fecha_ingreso', e.target.value)}
                        />
                        <CampoError mensaje={errors.fecha_ingreso} />
                    </div>
                </div>

                <DocumentosMultiples
                    documentos={data.documentos}
                    tiposDisponibles={TIPOS_DOCUMENTO}
                    agregar={documentosHandlers.agregar}
                    quitar={documentosHandlers.quitar}
                    cambiarTipo={documentosHandlers.cambiarTipo}
                    actualizar={documentosHandlers.actualizar}
                    errores={errors}
                    descripcion="Se pueden cargar varios documentos (CI, NIT, etc.), ahora o más adelante editando este registro."
                />

                <div>
                    <label className={labelClass}>Email</label>
                    <input
                        type="email"
                        placeholder="Ej. maria.rojas@openaccess.bo"
                        className={inputClass}
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <CampoError mensaje={errors.email} />
                    {!esEdicion && (
                        <p className="mt-1 text-xs text-[#A9ABAE]">
                            Se usa para recuperar la contraseña — el ingreso
                            al sistema es con el usuario, no con el email.
                        </p>
                    )}
                </div>

                {esEdicion && (
                    <label className="flex items-center gap-2 text-sm text-[#042753]">
                        <input
                            type="checkbox"
                            checked={data.activo}
                            onChange={(e) =>
                                setData('activo', e.target.checked)
                            }
                            className="rounded border-gray-300 text-[#71BFA6] focus:ring-[#71BFA6]"
                        />
                        Activo (desmarcá para desactivarlo sin borrar su
                        historial)
                    </label>
                )}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-md bg-[#71BFA6] px-4 py-2 text-sm font-semibold text-[#042753] hover:opacity-90 disabled:opacity-50"
                    >
                        {processing
                            ? 'Subiendo...'
                            : esEdicion
                              ? 'Guardar Cambios'
                              : 'Crear Comercial'}
                    </button>
                </div>
            </form>
        </GerenteComercialLayout>
    );
}
