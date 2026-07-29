import ComercialLayout from '@/Layouts/ComercialLayout';
import NuevaCotizacionWizard from '@/Components/Cotizaciones/NuevaCotizacionWizard';
import { Head } from '@inertiajs/react';

export default function Nueva({
    puertos,
    conceptosCostoExtra,
    origen,
    proveedoresAgenteOrigen,
}) {
    return (
        <ComercialLayout header="Nueva Cotización">
            <Head title="Nueva Cotización" />

            <NuevaCotizacionWizard
                puertos={puertos}
                conceptosCostoExtra={conceptosCostoExtra}
                origen={origen}
                proveedoresAgenteOrigen={proveedoresAgenteOrigen}
                rutaBuscarCliente="comercial.clientes.buscar"
                rutaTarifasDisponibles="comercial.cotizaciones.tarifas-disponibles"
                rutaSolicitarTarifa="comercial.cotizaciones.solicitar-tarifa"
                rutaStore="comercial.cotizaciones.store"
            />
        </ComercialLayout>
    );
}
