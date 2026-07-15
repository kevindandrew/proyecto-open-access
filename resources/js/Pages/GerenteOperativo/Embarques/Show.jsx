import EmbarqueDetalle from '@/Components/Embarques/EmbarqueDetalle';
import GerenteOperativoLayout from '@/Layouts/GerenteOperativoLayout';
import { Head } from '@inertiajs/react';

export default function Show({ embarque, seguimientos }) {
    return (
        <GerenteOperativoLayout header={`Embarque ${embarque.numero_file}`}>
            <Head title={`Embarque ${embarque.numero_file}`} />

            <EmbarqueDetalle
                embarque={embarque}
                seguimientos={seguimientos}
                puedeGestionar
            />
        </GerenteOperativoLayout>
    );
}
