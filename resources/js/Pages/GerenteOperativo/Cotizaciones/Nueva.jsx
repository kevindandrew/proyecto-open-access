import GerenteOperativoLayout from '@/Layouts/GerenteOperativoLayout';
import NuevaCotizacionWizard from '@/Components/Cotizaciones/NuevaCotizacionWizard';
import { Head } from '@inertiajs/react';

export default function Nueva({
    puertos,
    conceptosCostoExtra,
    origen,
    proveedoresAgenteOrigen,
}) {
    return (
        <GerenteOperativoLayout header="Nueva Cotización">
            <Head title="Nueva Cotización" />

            <NuevaCotizacionWizard
                puertos={puertos}
                conceptosCostoExtra={conceptosCostoExtra}
                origen={origen}
                proveedoresAgenteOrigen={proveedoresAgenteOrigen}
                rutaBuscarCliente="gerente-operativo.clientes.buscar"
                rutaTarifasDisponibles="gerente-operativo.cotizaciones.tarifas-disponibles"
                rutaSolicitarTarifa="gerente-operativo.cotizaciones.solicitar-tarifa"
                rutaStore="gerente-operativo.cotizaciones.store"
            />
        </GerenteOperativoLayout>
    );
}
