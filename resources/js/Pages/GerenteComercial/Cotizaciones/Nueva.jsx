import GerenteComercialLayout from '@/Layouts/GerenteComercialLayout';
import NuevaCotizacionWizard from '@/Components/Cotizaciones/NuevaCotizacionWizard';
import { Head } from '@inertiajs/react';

export default function Nueva({
    puertos,
    conceptosCostoExtra,
    origen,
    proveedoresAgenteOrigen,
}) {
    return (
        <GerenteComercialLayout header="Nueva Cotización">
            <Head title="Nueva Cotización" />

            <NuevaCotizacionWizard
                puertos={puertos}
                conceptosCostoExtra={conceptosCostoExtra}
                origen={origen}
                proveedoresAgenteOrigen={proveedoresAgenteOrigen}
                permiteTarifaInexistente
                rutaBuscarCliente="gerente-comercial.clientes.buscar"
                rutaTarifasDisponibles="gerente-comercial.cotizaciones.tarifas-disponibles"
                rutaSolicitarTarifa="gerente-comercial.cotizaciones.solicitar-tarifa"
                rutaStore="gerente-comercial.cotizaciones.store"
            />
        </GerenteComercialLayout>
    );
}
