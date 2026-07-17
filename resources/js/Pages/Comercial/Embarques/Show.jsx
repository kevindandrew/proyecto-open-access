import EmbarqueDetalle from '@/Components/Embarques/EmbarqueDetalle';
import ComercialLayout from '@/Layouts/ComercialLayout';
import { Head } from '@inertiajs/react';

export default function Show({ embarque, contenedores, seguimientos }) {
    return (
        <ComercialLayout header={`Embarque ${embarque.numero_file}`}>
            <Head title={`Embarque ${embarque.numero_file}`} />

            <EmbarqueDetalle
                embarque={embarque}
                contenedores={contenedores}
                seguimientos={seguimientos}
            />
        </ComercialLayout>
    );
}
