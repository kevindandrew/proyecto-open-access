import CampoDocumento from '@/Components/CampoDocumento';
import GerenteOperativoLayout from '@/Layouts/GerenteOperativoLayout';
import { Head, useForm } from '@inertiajs/react';

const inputClass =
    'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]';
const labelClass = 'text-sm font-medium text-[#042753]';

function CampoError({ mensaje }) {
    return mensaje ? <p className="mt-1 text-sm text-red-600">{mensaje}</p> : null;
}

export default function Form({ cliente, ciudades, comerciales }) {
    const esEdicion = Boolean(cliente);

    const { data, setData, post, put, processing, errors } = useForm({
        razon_social: cliente?.razon_social ?? '',
        nit: cliente?.nit ?? '',
        tipo_documento: cliente?.tipo_documento ?? '',
        documento_frente: null,
        documento_dorso: null,
        id_ciudad: cliente?.id_ciudad ?? '',
        direccion: cliente?.direccion ?? '',
        persona_contacto: cliente?.persona_contacto ?? '',
        telefono1: cliente?.telefono1 ?? '',
        celular_whatsapp: cliente?.celular_whatsapp ?? '',
        email: cliente?.email ?? '',
        correo_factura: cliente?.correo_factura ?? '',
        condicion_pago: cliente?.condicion_pago ?? 'Al contado',
        otro: cliente?.otro ?? '',
        id_comercial: cliente?.id_comercial ?? '',
        activo: cliente?.activo ?? true,
    });

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
            put(route('gerente-operativo.clientes.update', cliente.id_cliente));
        } else {
            post(route('gerente-operativo.clientes.store'));
        }
    };

    return (
        <GerenteOperativoLayout header={esEdicion ? 'Editar Cliente' : 'Nuevo Cliente'}>
            <Head title={esEdicion ? 'Editar Cliente' : 'Nuevo Cliente'} />

            <form
                onSubmit={submit}
                encType="multipart/form-data"
                className="max-w-2xl space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
                <div>
                    <label className={labelClass}>Razón Social</label>
                    <input
                        type="text"
                        placeholder="Ej. Textiles La Paz Ltda."
                        className={inputClass}
                        value={data.razon_social}
                        onChange={(e) => setData('razon_social', e.target.value)}
                    />
                    <CampoError mensaje={errors.razon_social} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>NIT</label>
                        <input
                            type="text"
                            placeholder="Ej. 1023456011"
                            className={inputClass}
                            value={data.nit}
                            onChange={(e) => setData('nit', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Ciudad</label>
                        <select
                            className={inputClass}
                            value={data.id_ciudad}
                            onChange={(e) => setData('id_ciudad', e.target.value)}
                        >
                            <option value="">—</option>
                            {ciudades.map((ciudad) => (
                                <option key={ciudad.cod_ciudad} value={ciudad.cod_ciudad}>
                                    {ciudad.nombre_ciudad}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <label className={labelClass}>Documento de Identidad (opcional)</label>
                    <p className="mb-2 text-xs text-[#A9ABAE]">
                        Se puede completar ahora o más adelante editando este registro.
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
                                urlActual={cliente?.documento_frente_url}
                                error={errors.documento_frente}
                            />
                            <CampoDocumento
                                label="Foto del CI (Dorso)"
                                value={data.documento_dorso}
                                onChange={(archivo) => setData('documento_dorso', archivo)}
                                urlActual={cliente?.documento_dorso_url}
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
                                urlActual={cliente?.documento_frente_url}
                                error={errors.documento_frente}
                            />
                        </div>
                    )}
                </div>

                <div>
                    <label className={labelClass}>Dirección</label>
                    <input
                        type="text"
                        placeholder="Ej. Av. Arce #123, Zona Sur"
                        className={inputClass}
                        value={data.direccion}
                        onChange={(e) => setData('direccion', e.target.value)}
                    />
                </div>

                <div>
                    <label className={labelClass}>Persona de Contacto</label>
                    <input
                        type="text"
                        placeholder="Ej. Juan Pérez"
                        className={inputClass}
                        value={data.persona_contacto}
                        onChange={(e) => setData('persona_contacto', e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Teléfono</label>
                        <input
                            type="text"
                            placeholder="Ej. 22123456"
                            className={inputClass}
                            value={data.telefono1}
                            onChange={(e) => setData('telefono1', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Celular / WhatsApp</label>
                        <input
                            type="text"
                            placeholder="Ej. 71234567"
                            className={inputClass}
                            value={data.celular_whatsapp}
                            onChange={(e) => setData('celular_whatsapp', e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Email</label>
                        <input
                            type="email"
                            placeholder="Ej. contacto@cliente.com"
                            className={inputClass}
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <CampoError mensaje={errors.email} />
                    </div>
                    <div>
                        <label className={labelClass}>Correo Factura</label>
                        <input
                            type="email"
                            placeholder="Ej. facturacion@cliente.com"
                            className={inputClass}
                            value={data.correo_factura}
                            onChange={(e) => setData('correo_factura', e.target.value)}
                        />
                        <CampoError mensaje={errors.correo_factura} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Condición de Pago</label>
                        <input
                            type="text"
                            placeholder="Ej. Contado, Crédito 30 días"
                            className={inputClass}
                            value={data.condicion_pago}
                            onChange={(e) => setData('condicion_pago', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Comercial Asignado</label>
                        <select
                            className={inputClass}
                            value={data.id_comercial}
                            onChange={(e) => setData('id_comercial', e.target.value)}
                        >
                            <option value="">Selecciona un comercial</option>
                            {comerciales.map((comercial) => (
                                <option key={comercial.id_empleado} value={comercial.id_empleado}>
                                    {comercial.nombre_completo}
                                </option>
                            ))}
                        </select>
                        <CampoError mensaje={errors.id_comercial} />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Otro</label>
                    <textarea
                        rows={2}
                        placeholder="Notas adicionales sobre este cliente..."
                        className={inputClass}
                        value={data.otro}
                        onChange={(e) => setData('otro', e.target.value)}
                    />
                </div>

                {esEdicion && (
                    <label className="flex items-center gap-2 text-sm text-[#042753]">
                        <input
                            type="checkbox"
                            checked={data.activo}
                            onChange={(e) => setData('activo', e.target.checked)}
                            className="rounded border-gray-300 text-[#71BFA6] focus:ring-[#71BFA6]"
                        />
                        Activo (desmarcá para desactivarlo sin borrar su historial)
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
                              : 'Crear Cliente'}
                    </button>
                </div>
            </form>
        </GerenteOperativoLayout>
    );
}
