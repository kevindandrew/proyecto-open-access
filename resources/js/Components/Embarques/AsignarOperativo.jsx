import { useForm } from '@inertiajs/react';
import { useState } from 'react';

/**
 * Assign/reassign the operativo responsible for an embarque. Gerente
 * Operativo-only — the select only ever lists operativos matching the
 * embarque's own modo_transporte (enforced again server-side).
 */
export default function AsignarOperativo({ embarque, operativosDisponibles }) {
    const [mostrarSelector, setMostrarSelector] = useState(!embarque.operativo);

    const { data, setData, patch, processing, errors, reset } = useForm({
        id_operativo: '',
    });

    const submit = (e) => {
        e.preventDefault();

        patch(
            route('gerente-operativo.embarques.asignar-operativo', embarque.id_embarque),
            {
                onSuccess: () => {
                    reset('id_operativo');
                    setMostrarSelector(false);
                },
            },
        );
    };

    if (!mostrarSelector) {
        return (
            <div className="flex items-center justify-between">
                <p className="text-sm text-[#042753]">
                    <span className="font-semibold">{embarque.operativo}</span>
                </p>
                <button
                    type="button"
                    onClick={() => setMostrarSelector(true)}
                    className="text-sm font-medium text-[#71BFA6] hover:underline"
                >
                    Reasignar
                </button>
            </div>
        );
    }

    if (operativosDisponibles.length === 0) {
        return (
            <p className="text-sm text-[#A9ABAE]">
                No hay operativos con especialidad{' '}
                <span className="font-semibold text-[#042753]">
                    {embarque.modo_transporte}
                </span>{' '}
                registrados todavía.
            </p>
        );
    }

    return (
        <form onSubmit={submit} className="space-y-3">
            {!embarque.operativo && (
                <p className="text-sm text-[#A9ABAE]">
                    Sin operativo asignado.
                </p>
            )}

            <div>
                <select
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                    value={data.id_operativo}
                    onChange={(e) => setData('id_operativo', e.target.value)}
                >
                    <option value="">Selecciona un operativo</option>
                    {operativosDisponibles.map((operativo) => (
                        <option
                            key={operativo.id_empleado}
                            value={operativo.id_empleado}
                        >
                            {operativo.nombre_completo}
                        </option>
                    ))}
                </select>
                {errors.id_operativo && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.id_operativo}
                    </p>
                )}
            </div>

            <div className="flex items-center gap-3">
                <button
                    type="submit"
                    disabled={processing || !data.id_operativo}
                    className="rounded-md bg-[#71BFA6] px-4 py-2 text-sm font-semibold text-[#042753] hover:opacity-90 disabled:opacity-50"
                >
                    {embarque.operativo ? 'Confirmar Reasignación' : 'Asignar Operativo'}
                </button>
                {embarque.operativo && (
                    <button
                        type="button"
                        onClick={() => setMostrarSelector(false)}
                        className="text-sm text-[#A9ABAE] hover:underline"
                    >
                        Cancelar
                    </button>
                )}
            </div>
        </form>
    );
}
