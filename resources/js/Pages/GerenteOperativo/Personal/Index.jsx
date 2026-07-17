import GerenteOperativoLayout from '@/Layouts/GerenteOperativoLayout';
import PageHeader from '@/Components/PageHeader';
import { IconoPersonalNav } from '@/Components/NavIcons';
import { BotonIcono, IconoAgregar, IconoEditar, IconoEliminar } from '@/Components/ActionIcons';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

const ROL_ESTILOS = {
    'Gerente Comercial': 'bg-blue-100 text-blue-700',
    Comercial: 'bg-blue-50 text-blue-600',
    'Gerente Operativo': 'bg-[#71BFA6]/20 text-[#042753]',
    Operativo: 'bg-gray-100 text-gray-700',
};

function CredencialesNuevoPersonal({ credenciales, onCerrar }) {
    const [copiado, setCopiado] = useState(false);

    const copiar = () => {
        navigator.clipboard
            ?.writeText(`Usuario: ${credenciales.username} / Contraseña: ${credenciales.password}`)
            .then(() => {
                setCopiado(true);
                setTimeout(() => setCopiado(false), 2000);
            });
    };

    return (
        <div className="mb-4 rounded-lg border border-[#71BFA6] bg-[#71BFA6]/10 p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold text-[#042753]">
                        Personal creado — comunicá estos datos, no se van a
                        volver a mostrar
                    </p>
                    <p className="mt-2 text-sm text-[#042753]">
                        Usuario:{' '}
                        <span className="font-mono font-semibold">
                            {credenciales.username}
                        </span>
                    </p>
                    <p className="text-sm text-[#042753]">
                        Contraseña temporal:{' '}
                        <span className="font-mono font-semibold">
                            {credenciales.password}
                        </span>
                    </p>
                </div>
                <div className="flex flex-shrink-0 flex-col items-end gap-2">
                    <button
                        onClick={copiar}
                        className="rounded-md bg-[#042753] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                    >
                        {copiado ? 'Copiado' : 'Copiar'}
                    </button>
                    <button
                        onClick={onCerrar}
                        className="text-xs text-[#A9ABAE] hover:underline"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Index({ empleados }) {
    const { flash } = usePage().props;
    const [credenciales, setCredenciales] = useState(flash?.credenciales ?? null);

    const eliminar = (empleado) => {
        if (
            !confirm(
                `¿Desactivar a ${empleado.nombre_completo}? Va a perder acceso al sistema, pero su historial se conserva.`,
            )
        ) {
            return;
        }

        router.delete(route('gerente-operativo.personal.destroy', empleado.id_empleado));
    };

    return (
        <GerenteOperativoLayout header="Personal">
            <Head title="Personal" />

            <PageHeader
                icon={IconoPersonalNav}
                title="Personal"
                subtitle="Todas las personas registradas en el sistema, sin importar su rol"
            >
                <Link
                    href={route('gerente-operativo.personal.create')}
                    className="flex items-center gap-1.5 rounded-md bg-[#71BFA6] px-4 py-2 text-sm font-semibold text-[#042753] transition hover:opacity-90 hover:shadow-md active:scale-[0.98]"
                >
                    <IconoAgregar className="h-4 w-4" />
                    Nuevo Personal
                </Link>
            </PageHeader>

            {credenciales && (
                <CredencialesNuevoPersonal
                    credenciales={credenciales}
                    onCerrar={() => setCredenciales(null)}
                />
            )}

            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">
                                Nombre
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">
                                Rol
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">
                                Contacto
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">
                                Usuario
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">
                                Estado
                            </th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {empleados.map((empleado) => (
                            <tr
                                key={empleado.id_empleado}
                                className={`transition-colors hover:bg-gray-50 ${
                                    empleado.activo ? '' : 'opacity-60'
                                }`}
                            >
                                <td className="px-4 py-3 font-medium text-[#042753]">
                                    {empleado.nombre_completo}
                                </td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`rounded px-2 py-1 text-xs font-medium ${
                                            ROL_ESTILOS[empleado.rol] ??
                                            'bg-gray-100 text-gray-700'
                                        }`}
                                    >
                                        {empleado.rol}
                                        {empleado.especialidad_operativa &&
                                            ` · ${empleado.especialidad_operativa}`}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <p className="text-[#042753]">
                                        {empleado.email ?? '—'}
                                    </p>
                                    <p className="text-xs text-[#A9ABAE]">
                                        {empleado.telefono ?? '—'}
                                    </p>
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-[#042753]">
                                    {empleado.username ?? '—'}
                                </td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`rounded px-2 py-1 text-xs font-medium ${
                                            empleado.activo
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-200 text-gray-600'
                                        }`}
                                    >
                                        {empleado.activo
                                            ? 'Activo'
                                            : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-1">
                                        <BotonIcono
                                            as="link"
                                            variante="editar"
                                            titulo="Editar"
                                            href={route(
                                                'gerente-operativo.personal.edit',
                                                empleado.id_empleado,
                                            )}
                                        >
                                            <IconoEditar className="h-[18px] w-[18px]" />
                                        </BotonIcono>
                                        {empleado.activo && (
                                            <BotonIcono
                                                variante="eliminar"
                                                titulo="Eliminar"
                                                onClick={() => eliminar(empleado)}
                                            >
                                                <IconoEliminar className="h-[18px] w-[18px]" />
                                            </BotonIcono>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {empleados.length === 0 && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-4 py-6 text-center text-[#A9ABAE]"
                                >
                                    No hay personal registrado todavía.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </GerenteOperativoLayout>
    );
}
