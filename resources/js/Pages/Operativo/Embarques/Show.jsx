import ActualizarTransporte from '@/Components/Embarques/ActualizarTransporte';
import AgregarContenedor from '@/Components/Embarques/AgregarContenedor';
import CambiarEstado from '@/Components/Embarques/CambiarEstado';
import Consignatario from '@/Components/Embarques/Consignatario';
import EmbarqueDetalle from '@/Components/Embarques/EmbarqueDetalle';
import InformacionCarga from '@/Components/Embarques/InformacionCarga';
import InstruccionesTerrestre from '@/Components/Embarques/InstruccionesTerrestre';
import SeccionCard from '@/Components/Embarques/SeccionCard';
import { IconoBandera } from '@/Components/Embarques/SeccionIcons';
import OperativoLayout from '@/Layouts/OperativoLayout';
import { Head, router } from '@inertiajs/react';

export default function Show({
    embarque,
    contenedores,
    seguimientos,
    houses,
    costos,
    totalesPorMoneda,
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
                totalesPorMoneda={totalesPorMoneda}
                onEliminarContenedor={eliminarContenedor}
                rutaActualizarContenedor="operativo.contenedores.update"
                rutaPdfHouse="operativo.houses.pdf"
                accionesContenedores={
                    <AgregarContenedor
                        embarque={embarque}
                        rutaStore="operativo.embarques.contenedores.store"
                    />
                }
                accionesConsignatario={
                    <Consignatario
                        embarque={embarque}
                        rutaActualizar="operativo.embarques.actualizar-consignatario"
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

            <SeccionCard icon={IconoBandera} title="Cambiar Estado">
                <CambiarEstado
                    embarque={embarque}
                    rutaEstado="operativo.embarques.cambiar-estado"
                />
            </SeccionCard>
        </OperativoLayout>
    );
}
