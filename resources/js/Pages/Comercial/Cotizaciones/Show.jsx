import { COTIZACION_ESTADO_STYLES } from '@/constants/cotizacionEstados';
import ComercialLayout from '@/Layouts/ComercialLayout';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

function Campo({ label, value }) {
    return (
        <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#A9ABAE]">
                {label}
            </p>
            <p className="text-sm text-[#042753]">{value ?? '—'}</p>
        </div>
    );
}

function ConvertirEnEmbarqueModal({
    open,
    onClose,
    cotizacion,
    proveedoresAgenteOrigen,
    proveedoresTransporte,
}) {
    const { data, setData, post, processing, errors } = useForm({
        consignatario: '',
        id_agente_origen: '',
        id_naviera_aerolinea: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(
            route('comercial.cotizaciones.convertir', cotizacion.id_cotizacion),
        );
    };

    const inputClass =
        'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]';
    const labelClass = 'text-sm font-medium text-[#042753]';

    return (
        <Dialog open={open} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                <DialogPanel className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                    <DialogTitle className="text-lg font-semibold text-[#042753]">
                        Convertir en Embarque
                    </DialogTitle>

                    <form onSubmit={submit} className="mt-4 space-y-3">
                        <div>
                            <label className={labelClass}>
                                Consignatario (si es distinto al cliente)
                            </label>
                            <input
                                type="text"
                                className={inputClass}
                                value={data.consignatario}
                                onChange={(e) =>
                                    setData(
                                        'consignatario',
                                        e.target.value,
                                    )
                                }
                            />
                        </div>

                        <div>
                            <label className={labelClass}>
                                Agente de Origen
                            </label>
                            <select
                                className={inputClass}
                                value={data.id_agente_origen}
                                onChange={(e) =>
                                    setData(
                                        'id_agente_origen',
                                        e.target.value,
                                    )
                                }
                            >
                                <option value="">—</option>
                                {proveedoresAgenteOrigen.map((proveedor) => (
                                    <option
                                        key={proveedor.id_proveedor}
                                        value={proveedor.id_proveedor}
                                    >
                                        {proveedor.nombre}
                                    </option>
                                ))}
                            </select>
                            {errors.id_agente_origen && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.id_agente_origen}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className={labelClass}>
                                Naviera / Aerolínea / Transportista
                            </label>
                            <select
                                className={inputClass}
                                value={data.id_naviera_aerolinea}
                                onChange={(e) =>
                                    setData(
                                        'id_naviera_aerolinea',
                                        e.target.value,
                                    )
                                }
                            >
                                <option value="">—</option>
                                {proveedoresTransporte.map((proveedor) => (
                                    <option
                                        key={proveedor.id_proveedor}
                                        value={proveedor.id_proveedor}
                                    >
                                        {proveedor.nombre}
                                    </option>
                                ))}
                            </select>
                            {errors.id_naviera_aerolinea && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.id_naviera_aerolinea}
                                </p>
                            )}
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
                                className="rounded-md bg-[#042753] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                            >
                                Crear Embarque
                            </button>
                        </div>
                    </form>
                </DialogPanel>
            </div>
        </Dialog>
    );
}

export default function Show({
    cotizacion,
    contenedores,
    detalle,
    total,
    proveedoresAgenteOrigen,
    proveedoresTransporte,
}) {
    const [modalAbierto, setModalAbierto] = useState(false);

    const marcarEstado = (estado) => {
        router.patch(
            route('comercial.cotizaciones.cambiar-estado', cotizacion.id_cotizacion),
            { estado },
        );
    };

    return (
        <ComercialLayout header={`Cotización ${cotizacion.numero_referencia}`}>
            <Head title={`Cotización ${cotizacion.numero_referencia}`} />

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <span
                    className={`rounded-lg px-4 py-2 text-lg font-bold ${
                        COTIZACION_ESTADO_STYLES[cotizacion.estado] ??
                        'bg-gray-100 text-gray-700'
                    }`}
                >
                    {cotizacion.estado}
                </span>

                <div className="flex items-center gap-3">
                    {cotizacion.estado === 'Cotizado' && (
                        <>
                            <button
                                onClick={() => marcarEstado('Aceptado')}
                                className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                            >
                                Marcar como Aceptada
                            </button>
                            <button
                                onClick={() => marcarEstado('Rechazado')}
                                className="text-sm font-medium text-red-600 hover:underline"
                            >
                                Marcar como Rechazada
                            </button>
                        </>
                    )}

                    {cotizacion.tiene_embarque ? (
                        <Link
                            href={route(
                                'comercial.embarques.show',
                                cotizacion.embarque_id,
                            )}
                            className="rounded-md bg-[#042753] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                        >
                            Ver Embarque
                        </Link>
                    ) : (
                        <button
                            onClick={() => setModalAbierto(true)}
                            disabled={cotizacion.estado !== 'Aceptado'}
                            className="rounded-md bg-[#042753] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
                        >
                            Convertir en Embarque
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-[#042753]">
                        Cliente y Ruta
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Campo label="Cliente" value={cotizacion.cliente} />
                        <Campo
                            label="Modo de Transporte"
                            value={cotizacion.modo_transporte}
                        />
                        <Campo
                            label="Tipo de Servicio"
                            value={cotizacion.tipo_servicio}
                        />
                        <Campo label="Incoterm" value={cotizacion.incoterm} />
                        <Campo label="POL" value={cotizacion.pol} />
                        <Campo label="POD" value={cotizacion.pod} />
                        <Campo
                            label="Destino Final"
                            value={cotizacion.destino_final}
                        />
                        <Campo
                            label="Fecha de Emisión"
                            value={cotizacion.fecha_emision}
                        />
                        <Campo
                            label="Fecha de Validez"
                            value={cotizacion.fecha_validez}
                        />
                        <Campo
                            label="Días de Tránsito"
                            value={cotizacion.dias_transito}
                        />
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-[#042753]">
                        Carga
                    </h3>
                    {contenedores.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead>
                                <tr>
                                    <th className="px-3 py-2 text-left font-semibold text-[#042753]">
                                        Tipo de Contenedor
                                    </th>
                                    <th className="px-3 py-2 text-left font-semibold text-[#042753]">
                                        Cantidad
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {contenedores.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-3 py-2">
                                            {item.tipo_contenedor}
                                        </td>
                                        <td className="px-3 py-2">
                                            {item.cantidad}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <Campo
                                label="Peso (kg)"
                                value={cotizacion.peso_kg}
                            />
                            <Campo
                                label="Volumen (cbm)"
                                value={cotizacion.volumen_cbm}
                            />
                        </div>
                    )}
                    <p className="mt-3 text-sm text-[#042753]">
                        Mercancía peligrosa:{' '}
                        <span className="font-semibold">
                            {cotizacion.mercancia_peligrosa ? 'Sí' : 'No'}
                        </span>
                    </p>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-[#042753]">
                        Costos
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead>
                                <tr>
                                    <th className="px-3 py-2 text-left font-semibold text-[#042753]">
                                        Descripción
                                    </th>
                                    <th className="px-3 py-2 text-left font-semibold text-[#042753]">
                                        Unidad
                                    </th>
                                    <th className="px-3 py-2 text-right font-semibold text-[#042753]">
                                        Costo Unit.
                                    </th>
                                    <th className="px-3 py-2 text-right font-semibold text-[#042753]">
                                        Base
                                    </th>
                                    <th className="px-3 py-2 text-left font-semibold text-[#042753]">
                                        Moneda
                                    </th>
                                    <th className="px-3 py-2 text-right font-semibold text-[#042753]">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {detalle.map((linea, index) => (
                                    <tr key={index}>
                                        <td className="px-3 py-2">
                                            {linea.descripcion}
                                        </td>
                                        <td className="px-3 py-2">
                                            {linea.tipo_tarifa_unidad}
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            {linea.costo_unitario}
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            {linea.base_calculo}
                                        </td>
                                        <td className="px-3 py-2">
                                            {linea.moneda}
                                        </td>
                                        <td className="px-3 py-2 text-right font-medium text-[#042753]">
                                            {linea.costo_total}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-t-2 border-gray-200">
                                    <td
                                        colSpan={5}
                                        className="px-3 py-2 text-right font-semibold text-[#042753]"
                                    >
                                        Total General
                                    </td>
                                    <td className="px-3 py-2 text-right text-lg font-bold text-[#71BFA6]">
                                        {total}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>

            <ConvertirEnEmbarqueModal
                open={modalAbierto}
                onClose={() => setModalAbierto(false)}
                cotizacion={cotizacion}
                proveedoresAgenteOrigen={proveedoresAgenteOrigen}
                proveedoresTransporte={proveedoresTransporte}
            />
        </ComercialLayout>
    );
}
