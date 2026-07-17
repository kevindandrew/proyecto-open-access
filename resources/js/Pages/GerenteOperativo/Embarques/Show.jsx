import AsignarOperativo from '@/Components/Embarques/AsignarOperativo';
import CambiarEstado from '@/Components/Embarques/CambiarEstado';
import EmbarqueDetalle from '@/Components/Embarques/EmbarqueDetalle';
import GerenteOperativoLayout from '@/Layouts/GerenteOperativoLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({
    embarque,
    contenedores,
    seguimientos,
    operativosDisponibles,
}) {
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
