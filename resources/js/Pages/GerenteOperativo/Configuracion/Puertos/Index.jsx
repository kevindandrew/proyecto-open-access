import GerenteOperativoLayout from '@/Layouts/GerenteOperativoLayout';
import PageHeader from '@/Components/PageHeader';
import ConfiguracionTabs from '@/Components/Configuracion/ConfiguracionTabs';
import { IconoConfiguracionNav } from '@/Components/NavIcons';
import { BotonIcono, IconoAgregar, IconoEditar, IconoEliminar } from '@/Components/ActionIcons';
import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const TIPO_ESTILOS = {
    Puerto: 'bg-[#042753]/10 text-[#042753]',
    Aeropuerto: 'bg-[#71BFA6]/20 text-[#042753]',
    Frontera: 'bg-gray-100 text-gray-700',
};

export default function Index({ puertos }) {
    const [busqueda, setBusqueda] = useState('');

    const filtrados = useMemo(
        () =>
            puertos.filter(
                (p) =>
                    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                    p.codigo.toLowerCase().includes(busqueda.toLowerCase()),
            ),
        [puertos, busqueda],
    );

    const eliminar = (puerto) => {
        if (
            !confirm(
                `¿Desactivar ${puerto.nombre}? Ya no va a aparecer disponible para cargar tarifas o cotizaciones nuevas, pero los registros existentes se conservan.`,
            )
        ) {
            return;
        }

        router.delete(route('gerente-operativo.configuracion.puertos.destroy', puerto.codigo));
    };

    return (
        <GerenteOperativoLayout header="Configuración">
            <Head title="Puertos y Aeropuertos" />

            <PageHeader
                icon={IconoConfiguracionNav}
                title="Configuración"
                subtitle="Proveedores, puertos y aeropuertos disponibles para cargar tarifas"
            >
                <Link
                    href={route('gerente-operativo.configuracion.puertos.create')}
                    className="flex items-center gap-1.5 rounded-md bg-[#71BFA6] px-4 py-2 text-sm font-semibold text-[#042753] transition hover:opacity-90 hover:shadow-md active:scale-[0.98]"
                >
                    <IconoAgregar className="h-4 w-4" />
                    Nuevo Puerto/Aeropuerto
                </Link>
            </PageHeader>

            <ConfiguracionTabs activo="gerente-operativo.configuracion.puertos.index" />

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Buscar por código o nombre..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full max-w-sm rounded-md border-gray-300 shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                />
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Código</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Nombre</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Tipo</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">País</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Estado</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtrados.map((puerto) => (
                            <tr
                                key={puerto.codigo}
                                className={`transition-colors hover:bg-gray-50 ${puerto.activo ? '' : 'opacity-60'}`}
                            >
                                <td className="px-4 py-3 font-mono text-xs font-medium text-[#042753]">
                                    {puerto.codigo}
                                </td>
                                <td className="px-4 py-3 text-[#042753]">{puerto.nombre}</td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`rounded px-2 py-1 text-xs font-medium ${
                                            TIPO_ESTILOS[puerto.tipo] ?? 'bg-gray-100 text-gray-700'
                                        }`}
                                    >
                                        {puerto.tipo}
                                    </span>
                                </td>
                                <td className="px-4 py-3">{puerto.pais ?? '—'}</td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`rounded px-2 py-1 text-xs font-medium ${
                                            puerto.activo
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-200 text-gray-600'
                                        }`}
                                    >
                                        {puerto.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-1">
                                        <BotonIcono
                                            as="link"
                                            variante="editar"
                                            titulo="Editar"
                                            href={route('gerente-operativo.configuracion.puertos.edit', puerto.codigo)}
                                        >
                                            <IconoEditar className="h-[18px] w-[18px]" />
                                        </BotonIcono>
                                        {puerto.activo && (
                                            <BotonIcono
                                                variante="eliminar"
                                                titulo="Desactivar"
                                                onClick={() => eliminar(puerto)}
                                            >
                                                <IconoEliminar className="h-[18px] w-[18px]" />
                                            </BotonIcono>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {filtrados.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-6 text-center text-[#A9ABAE]">
                                    No se encontraron puertos o aeropuertos.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </GerenteOperativoLayout>
    );
}
