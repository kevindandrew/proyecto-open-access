import { ESTADO_LABELS } from '@/constants/estados';
import { useForm } from '@inertiajs/react';

/**
 * Advance embarque.estado_embarque to the next step in the linear sequence.
 * `rutaEstado` is the named route to PATCH — differs per role (Gerente
 * Operativo and Operativo each have their own `embarques.cambiar-estado`
 * route, scoped by their own middleware/authorization).
 */
export default function CambiarEstado({ embarque, rutaEstado }) {
    const { data, setData, patch, processing, errors, reset } = useForm({
        comentario: '',
    });

    const submit = (e) => {
        e.preventDefault();

        patch(route(rutaEstado, embarque.id_embarque), {
            onSuccess: () => reset('comentario'),
        });
    };

    if (!embarque.siguiente_estado) {
        return (
            <p className="text-sm text-[#A9ABAE]">
                Este embarque ya está{' '}
                <span className="font-semibold text-[#042753]">Cerrado</span>,
                no tiene un siguiente estado.
            </p>
        );
    }

    return (
        <form onSubmit={submit} className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded bg-gray-100 px-2 py-1 font-medium text-[#042753]">
                    {ESTADO_LABELS[embarque.estado_embarque] ??
                        embarque.estado_embarque}
                </span>
                <span className="text-[#A9ABAE]">→</span>
                <span className="rounded bg-[#71BFA6]/20 px-2 py-1 font-medium text-[#042753]">
                    {ESTADO_LABELS[embarque.siguiente_estado] ??
                        embarque.siguiente_estado}
                </span>
            </div>

            <div>
                <label className="text-sm font-medium text-[#042753]">
                    Comentario (opcional)
                </label>
                <textarea
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                    value={data.comentario}
                    onChange={(e) => setData('comentario', e.target.value)}
                />
                {errors.comentario && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.comentario}
                    </p>
                )}
            </div>

            <button
                type="submit"
                disabled={processing}
                className="w-full rounded-md bg-[#71BFA6] px-4 py-3 text-base font-semibold text-[#042753] hover:opacity-90 disabled:opacity-50 sm:w-auto sm:py-2 sm:text-sm"
            >
                Confirmar cambio a &quot;
                {ESTADO_LABELS[embarque.siguiente_estado] ??
                    embarque.siguiente_estado}
                &quot;
            </button>
        </form>
    );
}
