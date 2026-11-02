import GerenteOperativoLayout from '@/Layouts/GerenteOperativoLayout';
import PageHeader from '@/Components/PageHeader';
import { IconoLlaveNav } from '@/Components/NavIcons';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

const ESTADO_ESTILOS = {
    Atendida: 'bg-emerald-50 text-emerald-600',
    Descartada: 'bg-gray-100 text-gray-500',
};

// La contraseña nueva se muestra una sola vez: después no se puede recuperar.
function ContrasenaGenerada({ credenciales, onCerrar }) {
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
                        Contraseña nueva para {credenciales.nombre} — comunicásela, no se va a volver a mostrar
                    </p>
                    <p className="mt-2 text-sm text-[#042753]">
                        Usuario: <span className="font-mono font-semibold">{credenciales.username}</span>
                    </p>
                    <p className="text-sm text-[#042753]">
                        Contraseña: <span className="font-mono font-semibold">{credenciales.password}</span>
                    </p>
                    <p className="mt-2 text-xs text-[#A9ABAE]">
                        Recomendale que la cambie desde "Perfil" apenas ingrese.
                    </p>
                </div>
                <div className="flex flex-shrink-0 flex-col items-end gap-2">
                    <button
                        onClick={copiar}
                        className="rounded-md bg-[#042753] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                    >
                        {copiado ? 'Copiado' : 'Copiar'}
                    </button>
                    <button onClick={onCerrar} className="text-xs text-[#A9ABAE] hover:underline">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Index({ pendientes, historial }) {
    const { flash } = usePage().props;
    const [credenciales, setCredenciales] = useState(flash?.credenciales ?? null);

    const generar = (solicitud) => {
        if (
            confirm(
                `¿Generar una contraseña nueva para ${solicitud.nombre} (${solicitud.username})? La contraseña actual deja de funcionar.`,
            )
        ) {
            router.post(route('gerente-operativo.restablecimientos.generar', solicitud.id_solicitud), {}, {
                onSuccess: (page) => setCredenciales(page.props.flash?.credenciales ?? null),
            });
        }
    };

    const descartar = (solicitud) => {
        if (confirm(`¿Descartar la solicitud de ${solicitud.nombre}? Su contraseña no se cambia.`)) {
            router.patch(route('gerente-operativo.restablecimientos.descartar', solicitud.id_solicitud));
        }
    };

    return (
        <GerenteOperativoLayout header="Restablecer Contraseñas">
            <Head title="Restablecer Contraseñas" />

            <PageHeader
                icon={IconoLlaveNav}
                title="Restablecer Contraseñas"
                subtitle='Usuarios que tocaron "¿Olvidaste tu contraseña?" en el inicio de sesión'
            />

            {credenciales && <ContrasenaGenerada credenciales={credenciales} onCerrar={() => setCredenciales(null)} />}

            <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Usuario</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Rol</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Solicitada</th>
                            <th className="px-4 py-3 text-right font-semibold text-[#042753]">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {pendientes.map((s) => (
                            <tr key={s.id_solicitud} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <p className="font-medium text-[#042753]">{s.nombre}</p>
                                    <p className="text-xs text-[#A9ABAE]">
                                        {s.username}
                                        {s.email ? ` · ${s.email}` : ''}
                                    </p>
                                    {!s.activo && (
                                        <span className="mt-1 inline-block rounded bg-red-50 px-1.5 py-0.5 text-xs font-medium text-red-600">
                                            Empleado inactivo
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3">{s.rol ?? '—'}</td>
                                <td className="px-4 py-3 text-[#A9ABAE]">{s.solicitada}</td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => descartar(s)}
                                            className="text-xs font-semibold text-[#A9ABAE] hover:underline"
                                        >
                                            Descartar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => generar(s)}
                                            className="rounded-md bg-[#042753] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                                        >
                                            Generar contraseña nueva
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {pendientes.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-4 py-6 text-center text-[#A9ABAE]">
                                    No hay pedidos de restablecimiento pendientes.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {historial.length > 0 && (
                <>
                    <h3 className="mb-2 text-sm font-semibold text-[#042753]">Últimas atendidas</h3>
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <tbody className="divide-y divide-gray-100">
                                {historial.map((s) => (
                                    <tr key={s.id_solicitud}>
                                        <td className="px-4 py-2 text-[#042753]">
                                            {s.nombre} <span className="text-xs text-[#A9ABAE]">({s.username})</span>
                                        </td>
                                        <td className="px-4 py-2 text-xs text-[#A9ABAE]">Pedida {s.solicitada}</td>
                                        <td className="px-4 py-2 text-xs text-[#A9ABAE]">
                                            {s.atendida_en} · {s.atendida_por ?? '—'}
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            <span className={`rounded px-2 py-0.5 text-xs font-medium ${ESTADO_ESTILOS[s.estado] ?? ''}`}>
                                                {s.estado === 'Atendida' ? 'Contraseña generada' : 'Descartada'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </GerenteOperativoLayout>
    );
}
