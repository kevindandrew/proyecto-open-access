import { COTIZACION_ESTADO_STYLES } from '@/constants/cotizacionEstados';
import ConvertirEnEmbarqueModal from '@/Components/Cotizaciones/ConvertirEnEmbarqueModal';
import MotivoRechazoModal from '@/Components/Cotizaciones/MotivoRechazoModal';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function CotizacionAcciones({
    cotizacion,
    rutaCambiarEstado,
    rutaConvertir,
    rutaVerEmbarque,
    proveedoresAgenteOrigen,
    proveedoresTransporte,
}) {
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modalRechazoAbierto, setModalRechazoAbierto] = useState(false);

    const marcarEstado = (estado) => {
        router.patch(route(rutaCambiarEstado, cotizacion.id_cotizacion), { estado });
    };

    return (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <span
                className={`rounded-lg px-4 py-2 text-lg font-bold ${
                    COTIZACION_ESTADO_STYLES[cotizacion.estado] ?? 'bg-gray-100 text-gray-700'
                }`}
            >
                {cotizacion.estado}
            </span>

            <div className="flex items-center gap-3">
                {cotizacion.estado === 'Cotizado' && (
                    <>
                        <button
                            onClick={() => marcarEstado('Aceptado')}
                            className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                        >
                            Marcar como Aceptada
                        </button>
                        <button
                            onClick={() => setModalRechazoAbierto(true)}
                            className="text-sm font-medium text-red-600 hover:underline"
                        >
                            Marcar como Rechazada
                        </button>
                    </>
                )}

                {cotizacion.tiene_embarque ? (
                    <Link
                        href={route(rutaVerEmbarque, cotizacion.embarque_id)}
                        className="rounded-md bg-[#042753] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                    >
                        Ver Embarque
                    </Link>
                ) : (
                    <button
                        onClick={() => setModalAbierto(true)}
                        disabled={cotizacion.estado !== 'Aceptado'}
                        className="rounded-md bg-[#042753] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
                    >
                        Convertir en Embarque
                    </button>
                )}
            </div>

            <ConvertirEnEmbarqueModal
                open={modalAbierto}
                onClose={() => setModalAbierto(false)}
                cotizacion={cotizacion}
                rutaConvertir={rutaConvertir}
                proveedoresAgenteOrigen={proveedoresAgenteOrigen}
                proveedoresTransporte={proveedoresTransporte}
            />

            <MotivoRechazoModal
                open={modalRechazoAbierto}
                onClose={() => setModalRechazoAbierto(false)}
                cotizacion={cotizacion}
                rutaCambiarEstado={rutaCambiarEstado}
            />
        </div>
    );
}
