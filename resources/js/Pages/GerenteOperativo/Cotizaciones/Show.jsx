import CotizacionDetalle from '@/Components/Cotizaciones/CotizacionDetalle';
import CotizacionAcciones from '@/Components/Cotizaciones/CotizacionAcciones';
import GerenteOperativoLayout from '@/Layouts/GerenteOperativoLayout';
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
        <GerenteOperativoLayout header={`Cotización ${cotizacion.numero_referencia}`}>
            <Head title={`Cotización ${cotizacion.numero_referencia}`} />

            <CotizacionAcciones
                cotizacion={cotizacion}
                rutaCambiarEstado="gerente-operativo.cotizaciones.cambiar-estado"
                rutaConvertir="gerente-operativo.cotizaciones.convertir"
                rutaVerEmbarque="gerente-operativo.embarques.show"
                rutaPdf="gerente-operativo.cotizaciones.pdf"
                proveedoresAgenteOrigen={proveedoresAgenteOrigen}
                proveedoresTransporte={proveedoresTransporte}
            />

            <CotizacionDetalle
                cotizacion={cotizacion}
                contenedores={contenedores}
                detalle={detalle}
                total={total}
                rutaCrearTerrestre="gerente-operativo.cotizaciones.create"
            />
        </GerenteOperativoLayout>
    );
}
