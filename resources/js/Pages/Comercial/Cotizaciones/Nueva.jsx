import ComercialLayout from '@/Layouts/ComercialLayout';
import NuevaCotizacionWizard from '@/Components/Cotizaciones/NuevaCotizacionWizard';
import { Head } from '@inertiajs/react';

export default function Nueva({ puertos }) {
    return (
        <ComercialLayout header="Nueva Cotización">
            <Head title="Nueva Cotización" />

            <NuevaCotizacionWizard
                puertos={puertos}
                rutaBuscarCliente="comercial.clientes.buscar"
                rutaTarifasDisponibles="comercial.cotizaciones.tarifas-disponibles"
                rutaStore="comercial.cotizaciones.store"
            />
        </ComercialLayout>
    );
}
