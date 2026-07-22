import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useForm } from '@inertiajs/react';

export default function ConvertirEnEmbarqueModal({
    open,
    onClose,
    cotizacion,
    rutaConvertir,
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

        post(route(rutaConvertir, cotizacion.id_cotizacion));
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
                                    setData('consignatario', e.target.value)
                                }
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Agente de Origen</label>
                            <select
                                className={inputClass}
                                value={data.id_agente_origen}
                                onChange={(e) =>
                                    setData('id_agente_origen', e.target.value)
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
                                    setData('id_naviera_aerolinea', e.target.value)
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
