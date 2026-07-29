import AsignarOperativo from '@/Components/Embarques/AsignarOperativo';
import ActualizarTransporte from '@/Components/Embarques/ActualizarTransporte';
import AgregarContenedor from '@/Components/Embarques/AgregarContenedor';
import AgregarCosto from '@/Components/Embarques/AgregarCosto';
import AgregarHouse from '@/Components/Embarques/AgregarHouse';
import CambiarEstado from '@/Components/Embarques/CambiarEstado';
import InformacionCarga from '@/Components/Embarques/InformacionCarga';
import InstruccionesTerrestre from '@/Components/Embarques/InstruccionesTerrestre';
import EmbarqueDetalle from '@/Components/Embarques/EmbarqueDetalle';
import GerenteOperativoLayout from '@/Layouts/GerenteOperativoLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Show({
    embarque,
    contenedores,
    seguimientos,
    houses,
    costos,
    totalCompra,
    totalVenta,
    proveedores,
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

            <div className="mb-4 flex justify-end">
                <Link
                    href={route(
                        'gerente-operativo.embarques.gastos.index',
                        embarque.id_embarque,
                    )}
                    className="rounded-md bg-[#71BFA6] px-4 py-2 text-sm font-semibold text-[#042753] hover:opacity-90"
                >
                    Liquidación de Destino
                </Link>
            </div>

            <EmbarqueDetalle
                embarque={embarque}
                contenedores={contenedores}
                seguimientos={seguimientos}
                houses={houses}
                costos={costos}
                totalCompra={totalCompra}
                totalVenta={totalVenta}
                onEliminarHouse={eliminarHouse}
                onEliminarCosto={eliminarCosto}
                onEliminarContenedor={eliminarContenedor}
                accionesHouses={
                    <AgregarHouse
                        embarque={embarque}
                        rutaStore="gerente-operativo.embarques.houses.store"
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

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-[#042753]">
                        Operativo Asignado
                    </h3>
                    <AsignarOperativo
                        embarque={embarque}
                        operativosDisponibles={operativosDisponibles}
                    />
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-[#042753]">
                        Cambiar Estado
                    </h3>
                    <CambiarEstado
                        embarque={embarque}
                        rutaEstado="gerente-operativo.embarques.cambiar-estado"
                    />
                </div>
            </div>
        </GerenteOperativoLayout>
    );
}
