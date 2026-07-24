import CotizacionDetalle from '@/Components/Cotizaciones/CotizacionDetalle';
import CotizacionAcciones from '@/Components/Cotizaciones/CotizacionAcciones';
import GerenteComercialLayout from '@/Layouts/GerenteComercialLayout';
import { Head } from '@inertiajs/react';

export default function Show({ cotizacion, contenedores, detalle, total }) {
    return (
        <GerenteComercialLayout header={`Cotización ${cotizacion.numero_referencia}`}>
            <Head title={`Cotización ${cotizacion.numero_referencia}`} />

            <CotizacionAcciones
                cotizacion={cotizacion}
                rutaCambiarEstado="gerente-comercial.cotizaciones.cambiar-estado"
                rutaPdf="gerente-comercial.cotizaciones.pdf"
            />

            <CotizacionDetalle
                cotizacion={cotizacion}
                contenedores={contenedores}
                detalle={detalle}
                total={total}
                rutaCrearTerrestre="gerente-comercial.cotizaciones.create"
            />
        </GerenteComercialLayout>
    );
}
