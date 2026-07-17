import ModoTransporteIcon from '@/Components/ModoTransporteIcon';
import { ESTADO_LABELS } from '@/constants/estados';
import OperativoLayout from '@/Layouts/OperativoLayout';
import { Head, Link } from '@inertiajs/react';

function esUrgente(eta) {
    if (!eta) return false;

    const limite = new Date();
    limite.setHours(0, 0, 0, 0);
    limite.setDate(limite.getDate() + 2);

    return new Date(eta) <= limite;
}

function TarjetaEmbarque({ embarque }) {
    const urgente = esUrgente(embarque.eta);

    return (
        <Link
            href={route('operativo.embarques.show', embarque.id_embarque)}
            className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm active:bg-gray-50"
        >
            <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#042753]/5 text-[#042753]">
                    <ModoTransporteIcon
                        modo={embarque.modo_transporte}
                        className="h-7 w-7"
                    />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-base font-semibold text-[#042753]">
                            {embarque.numero_file}
                        </p>
                        <span className="flex-shrink-0 rounded bg-gray-100 px-2 py-1 text-xs font-medium text-[#042753]">
                            {ESTADO_LABELS[embarque.estado_embarque] ??
                                embarque.estado_embarque}
                        </span>
                    </div>
                    <p className="truncate text-sm text-[#A9ABAE]">
                        {embarque.cliente}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-[#A9ABAE]">ETA</span>
                        <span
                            className={`text-sm font-semibold ${
                                urgente ? 'text-red-600' : 'text-[#042753]'
                            }`}
                        >
                            {embarque.eta ?? 'Sin definir'}
                        </span>
                        {urgente && (
                            <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                                Urgente
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function Index({ embarques }) {
    return (
        <OperativoLayout header="Mis Embarques">
            <Head title="Mis Embarques" />

            <div className="space-y-3">
                {embarques.map((embarque) => (
                    <TarjetaEmbarque
                        key={embarque.id_embarque}
                        embarque={embarque}
                    />
                ))}

                {embarques.length === 0 && (
                    <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-[#A9ABAE]">
                        No tienes embarques activos asignados por ahora.
                    </div>
                )}
            </div>
        </OperativoLayout>
    );
}
