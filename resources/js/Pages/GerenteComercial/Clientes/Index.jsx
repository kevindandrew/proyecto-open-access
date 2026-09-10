import GerenteComercialLayout from '@/Layouts/GerenteComercialLayout';
import PageHeader from '@/Components/PageHeader';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { IconoClientes } from '@/Components/NavIcons';
import {
    BotonIcono,
    IconoAgregar,
    IconoAlerta,
    IconoEditar,
    IconoEliminar,
    IconoReasignar,
} from '@/Components/ActionIcons';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

function ModalReasignarComercial({ cliente, show, onClose, comerciales = [] }) {
    const { data, setData, patch, processing, errors, reset } = useForm({
        id_comercial: '',
    });

    useEffect(() => {
        if (cliente) {
            setData('id_comercial', cliente.id_comercial ?? '');
        }
    }, [cliente, show]);

    if (!cliente) return null;

    const submit = (e) => {
        e.preventDefault();
        patch(route('gerente-comercial.clientes.reasignar', cliente.id_cliente), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <form onSubmit={submit} className="p-6">
                <h2 className="text-lg font-bold text-[#042753]">Reasignar Comercial</h2>
                <p className="mt-2 text-sm text-gray-600">
                    Cliente: <strong className="text-[#042753]">{cliente.razon_social}</strong>
                </p>
                <p className="text-xs text-gray-400">
                    Comercial actual: {cliente.comercial ?? 'Sin asignar'}
                </p>

                {cliente.sin_seguimiento && (
                    <p className="mt-3 flex items-start gap-1.5 rounded-md bg-amber-50 px-2.5 py-1.5 text-xs text-amber-700">
                        <IconoAlerta className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                        Este cliente no tiene cotizaciones en los últimos 6 meses (o nunca tuvo una).
                    </p>
                )}

                <div className="mt-4">
                    <InputLabel htmlFor="nuevo_comercial" value="Nuevo Comercial" />
                    <select
                        id="nuevo_comercial"
                        className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-[#042753] focus:ring-[#042753]"
                        value={data.id_comercial}
                        onChange={(e) => setData('id_comercial', e.target.value)}
                    >
                        <option value="">Selecciona comercial</option>
                        {comerciales.map((com) => (
                            <option key={com.id_empleado} value={com.id_empleado}>
                                {com.nombre_completo}
                            </option>
                        ))}
                    </select>
                    <InputError message={errors.id_comercial} className="mt-1" />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton type="button" onClick={onClose}>
                        Cancelar
                    </SecondaryButton>
                    <PrimaryButton
                        disabled={
                            processing ||
                            !data.id_comercial ||
                            String(data.id_comercial) === String(cliente.id_comercial ?? '')
                        }
                    >
                        Reasignar
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}

function getIniciales(nombre) {
    if (!nombre) return 'CL';
    return nombre
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export default function Index({ clientes = [], comerciales = [] }) {
    const [busqueda, setBusqueda] = useState('');
    const [clienteReasignar, setClienteReasignar] = useState(null);

    const clientesFiltrados = useMemo(() => {
        const q = busqueda.toLowerCase();

        return clientes.filter(
            (cliente) =>
                cliente.razon_social?.toLowerCase().includes(q) ||
                cliente.nit?.toLowerCase().includes(q) ||
                cliente.comercial?.toLowerCase().includes(q),
        );
    }, [clientes, busqueda]);

    const eliminar = (cliente) => {
        if (confirm(`¿Desactivar a ${cliente.razon_social}?`)) {
            router.delete(route('gerente-comercial.clientes.destroy', cliente.id_cliente));
        }
    };

    return (
        <GerenteComercialLayout header="Clientes">
            <Head title="Clientes" />

            <PageHeader
                icon={IconoClientes}
                title="Clientes"
                subtitle="Todos los clientes del sistema — creá nuevos y asignalos o reasignalos a un comercial"
            >
                <Link
                    href={route('gerente-comercial.clientes.create')}
                    className="flex items-center gap-1.5 rounded-md bg-[#71BFA6] px-4 py-2 text-sm font-semibold text-[#042753] transition hover:opacity-90 hover:shadow-md active:scale-[0.98]"
                >
                    <IconoAgregar className="h-4 w-4" />
                    Nuevo Cliente
                </Link>
            </PageHeader>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Buscar por razón social, NIT o comercial..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full max-w-md rounded-md border-gray-300 text-sm shadow-sm focus:border-[#042753] focus:ring-[#042753]"
                />
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Cliente</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Ciudad</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Comercial</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Última Cotización</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Estado</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {clientesFiltrados.map((cliente) => (
                            <tr
                                key={cliente.id_cliente}
                                className={`transition-colors hover:bg-gray-50 ${
                                    cliente.activo ? '' : 'opacity-60'
                                }`}
                            >
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-[#042753]">
                                            {getIniciales(cliente.razon_social)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-[#042753]">{cliente.razon_social}</p>
                                            <p className="text-xs text-[#A9ABAE]">{cliente.nit ?? '—'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-[#042753]">{cliente.ciudad ?? '—'}</td>
                                <td className="px-4 py-3">
                                    <p className="text-[#042753]">{cliente.comercial ?? 'Sin asignar'}</p>
                                    {cliente.fue_reasignado && (
                                        <span
                                            className="mt-1 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600"
                                            title={`Reasignado el ${cliente.reasignado_en}`}
                                        >
                                            <IconoReasignar className="h-3 w-3" />
                                            Reasignado
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {cliente.ultima_cotizacion ? (
                                        <span className="text-[#042753]">{cliente.ultima_cotizacion}</span>
                                    ) : (
                                        <span className="italic text-[#A9ABAE]">Sin cotizaciones</span>
                                    )}
                                    {cliente.sin_seguimiento && (
                                        <span className="mt-1 flex w-fit items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                            <IconoAlerta className="h-3 w-3" />
                                            Sin seguimiento
                                        </span>
                                    )}
                                </td>
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
                                            as="link"
                                            variante="editar"
                                            titulo="Editar"
                                            href={route('gerente-comercial.clientes.edit', cliente.id_cliente)}
                                        >
                                            <IconoEditar className="h-[18px] w-[18px]" />
                                        </BotonIcono>
                                        {cliente.activo && (
                                            <BotonIcono
                                                variante="reasignar"
                                                titulo="Reasignar comercial"
                                                onClick={() => setClienteReasignar(cliente)}
                                            >
                                                <IconoReasignar className="h-[18px] w-[18px]" />
                                            </BotonIcono>
                                        )}
                                        {cliente.activo && (
                                            <BotonIcono
                                                variante="eliminar"
                                                titulo="Desactivar"
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

            <ModalReasignarComercial
                cliente={clienteReasignar}
                show={Boolean(clienteReasignar)}
                onClose={() => setClienteReasignar(null)}
                comerciales={comerciales}
            />
        </GerenteComercialLayout>
    );
}
