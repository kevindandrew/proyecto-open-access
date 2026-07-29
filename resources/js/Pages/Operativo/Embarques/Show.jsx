import ActualizarTransporte from '@/Components/Embarques/ActualizarTransporte';
import AgregarContenedor from '@/Components/Embarques/AgregarContenedor';
import CambiarEstado from '@/Components/Embarques/CambiarEstado';
import EmbarqueDetalle from '@/Components/Embarques/EmbarqueDetalle';
import InformacionCarga from '@/Components/Embarques/InformacionCarga';
import InstruccionesTerrestre from '@/Components/Embarques/InstruccionesTerrestre';
import OperativoLayout from '@/Layouts/OperativoLayout';
import { Head, router } from '@inertiajs/react';

export default function Show({
    embarque,
    contenedores,
    seguimientos,
    houses,
    costos,
    totalCompra,
    totalVenta,
}) {
    const eliminarContenedor = (contenedor) => {
        if (window.confirm('¿Quitar este contenedor?')) {
            router.delete(route('operativo.contenedores.destroy', contenedor.id_item));
        }
    };

    return (
        <OperativoLayout header={`Embarque ${embarque.numero_file}`}>
            <Head title={`Embarque ${embarque.numero_file}`} />

            <EmbarqueDetalle
                embarque={embarque}
                contenedores={contenedores}
                seguimientos={seguimientos}
                houses={houses}
                costos={costos}
                totalCompra={totalCompra}
                totalVenta={totalVenta}
                onEliminarContenedor={eliminarContenedor}
                accionesContenedores={
                    <AgregarContenedor
                        embarque={embarque}
                        rutaStore="operativo.embarques.contenedores.store"
                    />
                }
                accionesTransporte={
                    <ActualizarTransporte
                        embarque={embarque}
                        rutaActualizar="operativo.embarques.actualizar-transporte"
                    />
                }
                accionesInstruccionesTerrestre={
                    <InstruccionesTerrestre
                        embarque={embarque}
                        rutaActualizar="operativo.embarques.actualizar-instrucciones-terrestre"
                    />
                }
                accionesInformacionCarga={
                    <InformacionCarga
                        embarque={embarque}
                        rutaActualizar="operativo.embarques.actualizar-informacion-carga"
                    />
                }
            />

            <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold text-[#042753]">
                    Cambiar Estado
                </h3>
                <CambiarEstado
                    embarque={embarque}
                    rutaEstado="operativo.embarques.cambiar-estado"
                />
            </div>
        </OperativoLayout>
    );
}
