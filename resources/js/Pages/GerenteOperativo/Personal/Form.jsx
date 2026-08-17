import CampoDocumento from '@/Components/CampoDocumento';
import GerenteOperativoLayout from '@/Layouts/GerenteOperativoLayout';
import { Head, useForm } from '@inertiajs/react';

const inputClass =
    'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]';
const labelClass = 'text-sm font-medium text-[#042753]';

function CampoError({ mensaje }) {
    return mensaje ? <p className="mt-1 text-sm text-red-600">{mensaje}</p> : null;
}

export default function Form({ empleado, roles, jefes }) {
    const esEdicion = Boolean(empleado);

    const { data, setData, post, put, processing, errors } = useForm({
        nombre_completo: empleado?.nombre_completo ?? '',
        ci: empleado?.ci ?? '',
        tipo_documento: empleado?.tipo_documento ?? '',
        documento_frente: null,
        documento_dorso: null,
        telefono: empleado?.telefono ?? '',
        email: empleado?.email ?? '',
        id_rol: empleado?.id_rol ?? '',
        especialidad_operativa: empleado?.especialidad_operativa ?? '',
        id_jefe: empleado?.id_jefe ?? '',
        activo: empleado?.activo ?? true,
    });

    const rolSeleccionado = roles.find(
        (rol) => String(rol.id_rol) === String(data.id_rol),
    );
    const esOperativo = rolSeleccionado?.nombre_rol === 'Operativo';

    const cambiarTipoDocumento = (valor) => {
        setData({
            ...data,
            tipo_documento: valor,
            documento_frente: null,
            documento_dorso: null,
        });
    };

    const submit = (e) => {
        e.preventDefault();

        if (esEdicion) {
            put(route('gerente-operativo.personal.update', empleado.id_empleado));
        } else {
            post(route('gerente-operativo.personal.store'));
        }
    };

    return (
        <GerenteOperativoLayout
            header={esEdicion ? 'Editar Personal' : 'Nuevo Personal'}
        >
            <Head title={esEdicion ? 'Editar Personal' : 'Nuevo Personal'} />

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

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <label className={labelClass}>
                        Documento de Identidad (opcional)
                    </label>
                    <p className="mb-2 text-xs text-[#A9ABAE]">
                        Se puede completar ahora o más adelante editando este
                        registro.
                    </p>
                    <select
                        className={inputClass}
                        value={data.tipo_documento}
                        onChange={(e) => cambiarTipoDocumento(e.target.value)}
                    >
                        <option value="">— No cargar por ahora —</option>
                        <option value="CI">Cédula de Identidad (CI)</option>
                        <option value="NIT">NIT</option>
                    </select>
                    <CampoError mensaje={errors.tipo_documento} />

                    {data.tipo_documento === 'CI' && (
                        <div className="mt-3 grid grid-cols-2 gap-4">
                            <CampoDocumento
                                label="Foto del CI (Frente)"
                                value={data.documento_frente}
                                onChange={(archivo) => setData('documento_frente', archivo)}
                                urlActual={empleado?.documento_frente_url}
                                error={errors.documento_frente}
                            />
                            <CampoDocumento
                                label="Foto del CI (Dorso)"
                                value={data.documento_dorso}
                                onChange={(archivo) => setData('documento_dorso', archivo)}
                                urlActual={empleado?.documento_dorso_url}
                                error={errors.documento_dorso}
                            />
                        </div>
                    )}

                    {data.tipo_documento === 'NIT' && (
                        <div className="mt-3">
                            <CampoDocumento
                                label="Foto del NIT"
                                value={data.documento_frente}
                                onChange={(archivo) => setData('documento_frente', archivo)}
                                urlActual={empleado?.documento_frente_url}
                                error={errors.documento_frente}
                            />
                        </div>
                    )}
                </div>

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

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Rol</label>
                        <select
                            className={inputClass}
                            value={data.id_rol}
                            onChange={(e) =>
                                setData('id_rol', e.target.value)
                            }
                        >
                            <option value="">Selecciona un rol</option>
                            {roles.map((rol) => (
                                <option key={rol.id_rol} value={rol.id_rol}>
                                    {rol.nombre_rol}
                                </option>
                            ))}
                        </select>
                        <CampoError mensaje={errors.id_rol} />
                    </div>

                    {esOperativo && (
                        <div>
                            <label className={labelClass}>
                                Especialidad
                            </label>
                            <select
                                className={inputClass}
                                value={data.especialidad_operativa}
                                onChange={(e) =>
                                    setData(
                                        'especialidad_operativa',
                                        e.target.value,
                                    )
                                }
                            >
                                <option value="">—</option>
                                <option value="Maritimo">Marítimo</option>
                                <option value="Aereo">Aéreo</option>
                                <option value="Terrestre">Terrestre</option>
                            </select>
                            <CampoError mensaje={errors.especialidad_operativa} />
                        </div>
                    )}
                </div>

                <div>
                    <label className={labelClass}>Jefe Directo</label>
                    <select
                        className={inputClass}
                        value={data.id_jefe}
                        onChange={(e) => setData('id_jefe', e.target.value)}
                    >
                        <option value="">—</option>
                        {jefes.map((jefe) => (
                            <option
                                key={jefe.id_empleado}
                                value={jefe.id_empleado}
                            >
                                {jefe.nombre_completo}
                            </option>
                        ))}
                    </select>
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
                              : 'Crear Personal'}
                    </button>
                </div>
            </form>
        </GerenteOperativoLayout>
    );
}
