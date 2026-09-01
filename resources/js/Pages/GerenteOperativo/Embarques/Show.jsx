import AsignarOperativo from '@/Components/Embarques/AsignarOperativo';
import ActualizarTransporte from '@/Components/Embarques/ActualizarTransporte';
import AgregarContenedor from '@/Components/Embarques/AgregarContenedor';
import AgregarCosto from '@/Components/Embarques/AgregarCosto';
import AgregarHouse from '@/Components/Embarques/AgregarHouse';
import CambiarEstado from '@/Components/Embarques/CambiarEstado';
import Consignatario from '@/Components/Embarques/Consignatario';
import InformacionCarga from '@/Components/Embarques/InformacionCarga';
import InstruccionesTerrestre from '@/Components/Embarques/InstruccionesTerrestre';
import EmbarqueDetalle from '@/Components/Embarques/EmbarqueDetalle';
import SeccionCard from '@/Components/Embarques/SeccionCard';
import { IconoBandera, IconoConsignatario } from '@/Components/Embarques/SeccionIcons';
import GerenteOperativoLayout from '@/Layouts/GerenteOperativoLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Show({
    embarque,
    contenedores,
    seguimientos,
    houses,
    costos,
    totalesPorMoneda,
    proveedores,
    clientes,
    operativosDisponibles,
}) {
    const eliminarHouse = (house) => {
        if (window.confirm(`¿Quitar el house ${house.numero_hbl}?`)) {
            router.delete(route('gerente-operativo.houses.destroy', house.id_hbl));
        }
    };

    const eliminarCosto = (costo) => {
        if (window.confirm(`¿Quitar el costo "${costo.concepto}"?`)) {
            router.delete(route('gerente-operativo.costos.destroy', costo.id_costo));
        }
    };

    const eliminarContenedor = (contenedor) => {
        if (window.confirm('¿Quitar este contenedor?')) {
            router.delete(route('gerente-operativo.contenedores.destroy', contenedor.id_item));
        }
    };

    return (
        <GerenteOperativoLayout header={`Embarque ${embarque.numero_file}`}>
            <Head title={`Embarque ${embarque.numero_file}`} />

            <EmbarqueDetalle
                embarque={embarque}
                contenedores={contenedores}
                seguimientos={seguimientos}
                houses={houses}
                costos={costos}
                totalesPorMoneda={totalesPorMoneda}
                accionesPrincipal={
                    <Link
                        href={route(
                            'gerente-operativo.embarques.gastos.index',
                            embarque.id_embarque,
                        )}
                        className="rounded-md bg-[#71BFA6] px-3 py-1.5 text-sm font-semibold text-[#042753] hover:opacity-90"
                    >
                        Liquidación de Destino
                    </Link>
                }
                onEliminarHouse={eliminarHouse}
                onEliminarCosto={eliminarCosto}
                onEliminarContenedor={eliminarContenedor}
                rutaActualizarContenedor="gerente-operativo.contenedores.update"
                rutaActualizarHouse="gerente-operativo.houses.update"
                rutaPdfHouse="gerente-operativo.houses.pdf"
                rutaActualizarCosto="gerente-operativo.costos.update"
                proveedores={proveedores}
                clientesHouse={clientes}
                accionesHouses={
                    <AgregarHouse
                        embarque={embarque}
                        rutaStore="gerente-operativo.embarques.houses.store"
                        contenedoresDisponibles={contenedores}
                        clientes={clientes}
                    />
                }
                accionesCostos={
                    <AgregarCosto
                        embarque={embarque}
                        rutaStore="gerente-operativo.embarques.costos.store"
                        proveedores={proveedores}
                    />
                }
                accionesContenedores={
                    <AgregarContenedor
                        embarque={embarque}
                        rutaStore="gerente-operativo.embarques.contenedores.store"
                    />
                }
                accionesConsignatario={
                    <Consignatario
                        embarque={embarque}
                        rutaActualizar="gerente-operativo.embarques.actualizar-consignatario"
                    />
                }
                accionesTransporte={
                    <ActualizarTransporte
                        embarque={embarque}
                        rutaActualizar="gerente-operativo.embarques.actualizar-transporte"
                    />
                }
                accionesInstruccionesTerrestre={
                    <InstruccionesTerrestre
                        embarque={embarque}
                        rutaActualizar="gerente-operativo.embarques.actualizar-instrucciones-terrestre"
                    />
                }
                accionesInformacionCarga={
                    <InformacionCarga
                        embarque={embarque}
                        rutaActualizar="gerente-operativo.embarques.actualizar-informacion-carga"
                    />
                }
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <SeccionCard icon={IconoConsignatario} title="Operativo Asignado">
                    <AsignarOperativo
                        embarque={embarque}
                        operativosDisponibles={operativosDisponibles}
                    />
                </SeccionCard>

                <SeccionCard icon={IconoBandera} title="Cambiar Estado">
                    <CambiarEstado
                        embarque={embarque}
                        rutaEstado="gerente-operativo.embarques.cambiar-estado"
                    />
                </SeccionCard>
            </div>
        </GerenteOperativoLayout>
    );
}
