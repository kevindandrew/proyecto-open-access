import CambiarEstado from '@/Components/Embarques/CambiarEstado';
import EmbarqueDetalle from '@/Components/Embarques/EmbarqueDetalle';
import OperativoLayout from '@/Layouts/OperativoLayout';
import { Head } from '@inertiajs/react';

export default function Show({ embarque, contenedores, seguimientos }) {
    return (
        <OperativoLayout header={`Embarque ${embarque.numero_file}`}>
            <Head title={`Embarque ${embarque.numero_file}`} />

            <EmbarqueDetalle
                embarque={embarque}
                contenedores={contenedores}
                seguimientos={seguimientos}
            />

            <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold text-[#042753]">
                    Cambiar Estado
                </h3>
                <CambiarEstado
                    embarque={embarque}
                    rutaEstado="operativo.embarques.cambiar-estado"
                />
            </div>
        </OperativoLayout>
    );
}
