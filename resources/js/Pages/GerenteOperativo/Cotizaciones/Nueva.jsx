import GerenteOperativoLayout from '@/Layouts/GerenteOperativoLayout';
import NuevaCotizacionWizard from '@/Components/Cotizaciones/NuevaCotizacionWizard';
import { Head } from '@inertiajs/react';

export default function Nueva({ puertos }) {
    return (
        <GerenteOperativoLayout header="Nueva Cotización">
            <Head title="Nueva Cotización" />

            <NuevaCotizacionWizard
                puertos={puertos}
                rutaBuscarCliente="gerente-operativo.clientes.buscar"
                rutaTarifasDisponibles="gerente-operativo.cotizaciones.tarifas-disponibles"
                rutaStore="gerente-operativo.cotizaciones.store"
            />
        </GerenteOperativoLayout>
    );
}
