import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useForm } from '@inertiajs/react';

export default function MotivoRechazoModal({ open, onClose, cotizacion, rutaCambiarEstado }) {
    const { data, setData, patch, processing, reset } = useForm({
        estado: 'Rechazado',
        motivo: '',
    });

    const submit = (e) => {
        e.preventDefault();

        patch(route(rutaCambiarEstado, cotizacion.id_cotizacion), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const cerrar = () => {
        reset();
        onClose();
    };

    return (
        <Dialog open={open} onClose={cerrar} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                <DialogPanel className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                    <DialogTitle className="text-lg font-semibold text-[#042753]">
                        Marcar como Rechazada
                    </DialogTitle>
                    <p className="mt-1 text-sm text-[#A9ABAE]">
                        Contanos por qué (opcional) — ayuda a que el equipo entienda qué pasó con este cliente.
                    </p>

                    <form onSubmit={submit} className="mt-4 space-y-3">
                        <div>
                            <label className="text-sm font-medium text-[#042753]">
                                Motivo del rechazo
                            </label>
                            <textarea
                                rows={4}
                                maxLength={500}
                                placeholder="Ej. El cliente encontró un precio más bajo con otro forwarder..."
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                value={data.motivo}
                                onChange={(e) => setData('motivo', e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={cerrar}
                                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-[#042753] hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                            >
                                Confirmar Rechazo
                            </button>
                        </div>
                    </form>
                </DialogPanel>
            </div>
        </Dialog>
    );
}
