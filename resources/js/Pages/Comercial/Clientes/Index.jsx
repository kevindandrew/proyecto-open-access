import ComercialLayout from '@/Layouts/ComercialLayout';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';

function NuevoClienteModal({ open, onClose, ciudades }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        razon_social: '',
        nit: '',
        id_ciudad: '',
        direccion: '',
        persona_contacto: '',
        telefono1: '',
        celular_whatsapp: '',
        email: '',
        correo_factura: '',
        condicion_pago: 'Al contado',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('comercial.clientes.store'), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const inputClass =
        'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]';
    const labelClass = 'text-sm font-medium text-[#042753]';

    return (
        <Dialog open={open} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                <DialogPanel className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
                    <DialogTitle className="text-lg font-semibold text-[#042753]">
                        Nuevo Cliente
                    </DialogTitle>

                    <form onSubmit={submit} className="mt-4 space-y-3">
                        <div>
                            <label htmlFor="razon_social" className={labelClass}>
                                Razón Social
                            </label>
                            <input
                                id="razon_social"
                                type="text"
                                className={inputClass}
                                value={data.razon_social}
                                onChange={(e) =>
                                    setData('razon_social', e.target.value)
                                }
                            />
                            {errors.razon_social && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.razon_social}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="nit" className={labelClass}>
                                    NIT
                                </label>
                                <input
                                    id="nit"
                                    type="text"
                                    className={inputClass}
                                    value={data.nit}
                                    onChange={(e) =>
                                        setData('nit', e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <label htmlFor="id_ciudad" className={labelClass}>
                                    Ciudad
                                </label>
                                <select
                                    id="id_ciudad"
                                    className={inputClass}
                                    value={data.id_ciudad}
                                    onChange={(e) =>
                                        setData('id_ciudad', e.target.value)
                                    }
                                >
                                    <option value="">—</option>
                                    {ciudades.map((ciudad) => (
                                        <option
                                            key={ciudad.cod_ciudad}
                                            value={ciudad.cod_ciudad}
                                        >
                                            {ciudad.nombre_ciudad}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="direccion" className={labelClass}>
                                Dirección
                            </label>
                            <input
                                id="direccion"
                                type="text"
                                className={inputClass}
                                value={data.direccion}
                                onChange={(e) =>
                                    setData('direccion', e.target.value)
                                }
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="persona_contacto"
                                className={labelClass}
                            >
                                Persona de Contacto
                            </label>
                            <input
                                id="persona_contacto"
                                type="text"
                                className={inputClass}
                                value={data.persona_contacto}
                                onChange={(e) =>
                                    setData(
                                        'persona_contacto',
                                        e.target.value,
                                    )
                                }
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label
                                    htmlFor="telefono1"
                                    className={labelClass}
                                >
                                    Teléfono
                                </label>
                                <input
                                    id="telefono1"
                                    type="text"
                                    className={inputClass}
                                    value={data.telefono1}
                                    onChange={(e) =>
                                        setData(
                                            'telefono1',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="celular_whatsapp"
                                    className={labelClass}
                                >
                                    Celular / WhatsApp
                                </label>
                                <input
                                    id="celular_whatsapp"
                                    type="text"
                                    className={inputClass}
                                    value={data.celular_whatsapp}
                                    onChange={(e) =>
                                        setData(
                                            'celular_whatsapp',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="email" className={labelClass}>
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    className={inputClass}
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="correo_factura"
                                    className={labelClass}
                                >
                                    Correo Factura
                                </label>
                                <input
                                    id="correo_factura"
                                    type="email"
                                    className={inputClass}
                                    value={data.correo_factura}
                                    onChange={(e) =>
                                        setData(
                                            'correo_factura',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="condicion_pago"
                                className={labelClass}
                            >
                                Condición de Pago
                            </label>
                            <input
                                id="condicion_pago"
                                type="text"
                                className={inputClass}
                                value={data.condicion_pago}
                                onChange={(e) =>
                                    setData(
                                        'condicion_pago',
                                        e.target.value,
                                    )
                                }
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-[#042753] hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-md bg-[#71BFA6] px-4 py-2 text-sm font-semibold text-[#042753] hover:opacity-90 disabled:opacity-50"
                            >
                                Guardar Cliente
                            </button>
                        </div>
                    </form>
                </DialogPanel>
            </div>
        </Dialog>
    );
}

export default function Index({ clientes, ciudades }) {
    const [busqueda, setBusqueda] = useState('');
    const [modalAbierto, setModalAbierto] = useState(false);

    const clientesFiltrados = useMemo(
        () =>
            clientes.filter((cliente) =>
                cliente.razon_social
                    .toLowerCase()
                    .includes(busqueda.toLowerCase()),
            ),
        [clientes, busqueda],
    );

    return (
        <ComercialLayout header="Clientes">
            <Head title="Clientes" />

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <input
                    id="buscar_cliente"
                    type="text"
                    placeholder="Buscar por razón social..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full max-w-sm rounded-md border-gray-300 shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                />
                <button
                    onClick={() => setModalAbierto(true)}
                    className="rounded-md bg-[#71BFA6] px-4 py-2 text-sm font-semibold text-[#042753] hover:opacity-90"
                >
                    + Nuevo Cliente
                </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">
                                Razón Social
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">
                                Ciudad
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">
                                Condición de Pago
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">
                                Última Cotización
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {clientesFiltrados.map((cliente) => (
                            <tr key={cliente.id_cliente}>
                                <td className="px-4 py-3 font-medium text-[#042753]">
                                    {cliente.razon_social}
                                </td>
                                <td className="px-4 py-3">
                                    {cliente.ciudad ?? '—'}
                                </td>
                                <td className="px-4 py-3">
                                    {cliente.condicion_pago}
                                </td>
                                <td className="px-4 py-3">
                                    {cliente.ultima_cotizacion ?? '—'}
                                </td>
                            </tr>
                        ))}

                        {clientesFiltrados.length === 0 && (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="px-4 py-6 text-center text-[#A9ABAE]"
                                >
                                    No se encontraron clientes.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <NuevoClienteModal
                open={modalAbierto}
                onClose={() => setModalAbierto(false)}
                ciudades={ciudades}
            />
        </ComercialLayout>
    );
}
