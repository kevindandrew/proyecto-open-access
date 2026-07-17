import { COTIZACION_ESTADO_STYLES } from '@/constants/cotizacionEstados';
import CotizacionDetalle from '@/Components/Cotizaciones/CotizacionDetalle';
import GerenteOperativoLayout from '@/Layouts/GerenteOperativoLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ cotizacion, contenedores, detalle, total }) {
    return (
        <GerenteOperativoLayout header={`Cotización ${cotizacion.numero_referencia}`}>
            <Head title={`Cotización ${cotizacion.numero_referencia}`} />

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <span
                    className={`rounded-lg px-4 py-2 text-lg font-bold ${
                        COTIZACION_ESTADO_STYLES[cotizacion.estado] ?? 'bg-gray-100 text-gray-700'
                    }`}
                >
                    {cotizacion.estado}
                </span>

                {cotizacion.tiene_embarque && (
                    <Link
                        href={route('gerente-operativo.embarques.show', cotizacion.embarque_id)}
                        className="rounded-md bg-[#042753] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                    >
                        Ver Embarque
                    </Link>
                )}
            </div>

            <CotizacionDetalle
                cotizacion={cotizacion}
                contenedores={contenedores}
                detalle={detalle}
                total={total}
            />
        </GerenteOperativoLayout>
    );
}
