import GerenteOperativoLayout from '@/Layouts/GerenteOperativoLayout';
import PageHeader from '@/Components/PageHeader';
import { IconoClientes } from '@/Components/NavIcons';
import { BotonIcono, IconoAgregar, IconoEditar, IconoEliminar, IconoVer } from '@/Components/ActionIcons';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

function DetalleCliente({ cliente, onClose }) {
    if (!cliente) {
        return null;
    }

    const campos = [
        ['NIT', cliente.nit],
        ['Ciudad', cliente.ciudad],
        ['Persona de Contacto', cliente.persona_contacto],
        ['Teléfono', cliente.telefono1],
        ['Celular / WhatsApp', cliente.celular_whatsapp],
        ['Email', cliente.email],
        ['Condición de Pago', cliente.condicion_pago],
        ['Comercial Asignado', cliente.comercial],
    ];

    return (
        <Dialog open onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                <DialogPanel className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
                    <DialogTitle className="text-lg font-semibold text-[#042753]">
                        {cliente.razon_social}
                    </DialogTitle>

                    <dl className="mt-4 divide-y divide-gray-100 text-sm">
                        {campos.map(([etiqueta, valor]) => (
                            <div key={etiqueta} className="grid grid-cols-2 gap-2 py-2">
                                <dt className="text-[#A9ABAE]">{etiqueta}</dt>
                                <dd className="text-[#042753]">{valor || '—'}</dd>
                            </div>
                        ))}
                    </dl>

                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={onClose}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-[#042753] hover:bg-gray-50"
                        >
                            Cerrar
                        </button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}

export default function Index({ clientes }) {
    const [busqueda, setBusqueda] = useState('');
    const [clienteVer, setClienteVer] = useState(null);

    const clientesFiltrados = useMemo(
        () =>
            clientes.filter((cliente) =>
                cliente.razon_social.toLowerCase().includes(busqueda.toLowerCase()),
            ),
        [clientes, busqueda],
    );

    const eliminar = (cliente) => {
        if (
            !confirm(
                `¿Desactivar a ${cliente.razon_social}? Ya no aparecerá disponible para nuevas cotizaciones, pero su historial se conserva.`,
            )
        ) {
            return;
        }

        router.delete(route('gerente-operativo.clientes.destroy', cliente.id_cliente));
    };

    return (
        <GerenteOperativoLayout header="Clientes">
            <Head title="Clientes" />

            <PageHeader
                icon={IconoClientes}
                title="Clientes"
                subtitle="Todos los clientes registrados en el sistema, sin importar el comercial"
            >
                <Link
                    href={route('gerente-operativo.clientes.create')}
                    className="flex items-center gap-1.5 rounded-md bg-[#71BFA6] px-4 py-2 text-sm font-semibold text-[#042753] transition hover:opacity-90 hover:shadow-md active:scale-[0.98]"
                >
                    <IconoAgregar className="h-4 w-4" />
                    Nuevo Cliente
                </Link>
            </PageHeader>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Buscar por razón social..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full max-w-sm rounded-md border-gray-300 shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                />
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Razón Social</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Ciudad</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Contacto</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Comercial</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Estado</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {clientesFiltrados.map((cliente) => (
                            <tr
                                key={cliente.id_cliente}
                                className={`transition-colors hover:bg-gray-50 ${cliente.activo ? '' : 'opacity-60'}`}
                            >
                                <td className="px-4 py-3 font-medium text-[#042753]">
                                    {cliente.razon_social}
                                </td>
                                <td className="px-4 py-3">{cliente.ciudad ?? '—'}</td>
                                <td className="px-4 py-3">
                                    <p className="text-[#042753]">{cliente.email ?? '—'}</p>
                                    <p className="text-xs text-[#A9ABAE]">
                                        {cliente.telefono1 ?? cliente.celular_whatsapp ?? '—'}
                                    </p>
                                </td>
                                <td className="px-4 py-3">{cliente.comercial ?? '—'}</td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`rounded px-2 py-1 text-xs font-medium ${
                                            cliente.activo
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-200 text-gray-600'
                                        }`}
                                    >
                                        {cliente.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-1">
                                        <BotonIcono
                                            variante="ver"
                                            titulo="Ver detalle"
                                            onClick={() => setClienteVer(cliente)}
                                        >
                                            <IconoVer className="h-[18px] w-[18px]" />
                                        </BotonIcono>
                                        <BotonIcono
                                            as="link"
                                            variante="editar"
                                            titulo="Editar"
                                            href={route('gerente-operativo.clientes.edit', cliente.id_cliente)}
                                        >
                                            <IconoEditar className="h-[18px] w-[18px]" />
                                        </BotonIcono>
                                        {cliente.activo && (
                                            <BotonIcono
                                                variante="eliminar"
                                                titulo="Eliminar"
                                                onClick={() => eliminar(cliente)}
                                            >
                                                <IconoEliminar className="h-[18px] w-[18px]" />
                                            </BotonIcono>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {clientesFiltrados.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-6 text-center text-[#A9ABAE]">
                                    No se encontraron clientes.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <DetalleCliente cliente={clienteVer} onClose={() => setClienteVer(null)} />
        </GerenteOperativoLayout>
    );
}
