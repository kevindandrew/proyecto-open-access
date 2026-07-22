import CotizacionDetalle from '@/Components/Cotizaciones/CotizacionDetalle';
import CotizacionAcciones from '@/Components/Cotizaciones/CotizacionAcciones';
import ComercialLayout from '@/Layouts/ComercialLayout';
import { Head } from '@inertiajs/react';

export default function Show({
    cotizacion,
    contenedores,
    detalle,
    total,
    proveedoresAgenteOrigen,
    proveedoresTransporte,
}) {
    return (
        <ComercialLayout header={`Cotización ${cotizacion.numero_referencia}`}>
            <Head title={`Cotización ${cotizacion.numero_referencia}`} />

            <CotizacionAcciones
                cotizacion={cotizacion}
                rutaCambiarEstado="comercial.cotizaciones.cambiar-estado"
                rutaConvertir="comercial.cotizaciones.convertir"
                rutaVerEmbarque="comercial.embarques.show"
                proveedoresAgenteOrigen={proveedoresAgenteOrigen}
                proveedoresTransporte={proveedoresTransporte}
            />

            <CotizacionDetalle
                cotizacion={cotizacion}
                contenedores={contenedores}
                detalle={detalle}
                total={total}
            />
        </ComercialLayout>
    );
}
