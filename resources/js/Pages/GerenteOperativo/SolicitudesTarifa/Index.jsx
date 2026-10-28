import GerenteOperativoLayout from '@/Layouts/GerenteOperativoLayout';
import ModoTransporteBadge from '@/Components/ModoTransporteBadge';
import PageHeader from '@/Components/PageHeader';
import { IconoSolicitudesNav } from '@/Components/NavIcons';
import { Head, Link, router } from '@inertiajs/react';
import { Fragment, useState } from 'react';

const numero = (valor, decimales = 2) =>
    Number(valor ?? 0).toLocaleString('es-BO', { maximumFractionDigits: decimales });

// Detalle de la carga que mandó el Comercial — lo que Operaciones usa para
// pedir la tarifa afuera. Aéreo: bultos en cm y peso tasable (IATA L x A x A
// / 6000). LCL: bultos en metros y carga a cobrar (Ton/CBM, mínimo 1).
function DetalleCarga({ detalle }) {
    const { bultos = [], resumen = {} } = detalle;
    const esLcl = detalle.tipo === 'lcl';
    const unidad = esLcl ? 'm' : 'cm';

    return (
        <div className="space-y-3">
            {detalle.mercancia_peligrosa && (
                <p className="inline-block rounded bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
                    ⚠ Mercancía peligrosa
                </p>
            )}

            <div className="overflow-x-auto rounded-md border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-xs">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-2 text-left font-semibold text-[#042753]">Bulto</th>
                            <th className="px-3 py-2 text-right font-semibold text-[#042753]">Cantidad</th>
                            <th className="px-3 py-2 text-right font-semibold text-[#042753]">Largo ({unidad})</th>
                            <th className="px-3 py-2 text-right font-semibold text-[#042753]">Ancho ({unidad})</th>
                            <th className="px-3 py-2 text-right font-semibold text-[#042753]">Alto ({unidad})</th>
                            <th className="px-3 py-2 text-right font-semibold text-[#042753]">Peso Real Total (kg)</th>
                            <th className="px-3 py-2 text-right font-semibold text-[#042753]">
                                Volumen ({esLcl ? 'cbm' : 'cm³'})
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {bultos.map((bulto, index) => (
                            <tr key={index}>
                                <td className="px-3 py-2 text-[#042753]">{bulto.descripcion}</td>
                                <td className="px-3 py-2 text-right">{bulto.cantidad}</td>
                                <td className="px-3 py-2 text-right">{numero(bulto.largo)}</td>
                                <td className="px-3 py-2 text-right">{numero(bulto.ancho)}</td>
                                <td className="px-3 py-2 text-right">
                                    {numero(bulto.alto)}
                                    {bulto.no_apilable && (
                                        <span className="block text-[10px] font-semibold text-amber-700">
                                            No apilable
                                        </span>
                                    )}
                                </td>
                                <td className="px-3 py-2 text-right">{numero(bulto.peso_real_kg)}</td>
                                <td className="px-3 py-2 text-right">
                                    {esLcl ? numero(bulto.volumen_total_m3, 3) : numero(bulto.volumen_total_cm3, 0)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {esLcl ? (
                <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
                    <div>
                        <p className="text-xs text-[#A9ABAE]">Bultos</p>
                        <p className="font-semibold text-[#042753]">{resumen.cantidad_bultos}</p>
                    </div>
                    <div>
                        <p className="text-xs text-[#A9ABAE]">Peso Bruto</p>
                        <p className="font-semibold text-[#042753]">{numero(resumen.peso_real_kg)} kg</p>
                    </div>
                    <div>
                        <p className="text-xs text-[#A9ABAE]">Peso en Toneladas</p>
                        <p className="font-semibold text-[#042753]">{numero(resumen.toneladas, 3)} ton</p>
                    </div>
                    <div>
                        <p className="text-xs text-[#A9ABAE]">Volumen Total</p>
                        <p className="font-semibold text-[#042753]">{numero(resumen.volumen_total_m3, 3)} cbm</p>
                    </div>
                    <div>
                        <p className="text-xs text-[#A9ABAE]">Carga a Cobrar (W/M)</p>
                        <p className="font-bold text-[#71BFA6]">
                            {numero(resumen.carga_a_cobrar, 3)} {resumen.cobra_por}
                        </p>
                    </div>
                </div>
            ) : (
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
                <div>
                    <p className="text-xs text-[#A9ABAE]">Bultos</p>
                    <p className="font-semibold text-[#042753]">{resumen.cantidad_bultos}</p>
                </div>
                <div>
                    <p className="text-xs text-[#A9ABAE]">Peso Real (báscula)</p>
                    <p className="font-semibold text-[#042753]">{numero(resumen.peso_real_kg)} kg</p>
                </div>
                <div>
                    <p className="text-xs text-[#A9ABAE]">Volumen Total</p>
                    <p className="font-semibold text-[#042753]">{numero(resumen.volumen_total_cm3, 0)} cm³</p>
                    <p className="text-xs text-[#A9ABAE]">{numero(resumen.volumen_total_m3, 3)} cbm</p>
                </div>
                <div>
                    <p className="text-xs text-[#A9ABAE]">Peso Volumétrico</p>
                    <p className="font-semibold text-[#042753]">{numero(resumen.peso_volumetrico_kg)} kg</p>
                </div>
                <div>
                    <p className="text-xs text-[#A9ABAE]">Peso Tasable (Chargeable)</p>
                    <p className="font-bold text-[#71BFA6]">{numero(resumen.peso_tasable_kg)} kg</p>
                </div>
            </div>
            )}
        </div>
    );
}

const FILTROS = ['Pendientes', 'Todas'];

export default function Index({ solicitudes }) {
    const [filtro, setFiltro] = useState('Pendientes');
    const [abierta, setAbierta] = useState(null);

    const visibles = filtro === 'Pendientes'
        ? solicitudes.filter((s) => s.estado === 'Pendiente')
        : solicitudes;

    const atender = (solicitud) => {
        router.patch(route('gerente-operativo.solicitudes-tarifa.atender', solicitud.id_solicitud));
    };

    return (
        <GerenteOperativoLayout header="Solicitudes de Tarifa">
            <Head title="Solicitudes de Tarifa" />

            <PageHeader
                icon={IconoSolicitudesNav}
                title="Solicitudes de Tarifa"
                subtitle="Rutas que el equipo comercial necesita cotizar y para las que todavía no hay una tarifa cargada"
            />

            <div className="mb-4 inline-flex rounded-lg bg-gray-100 p-1">
                {FILTROS.map((f) => (
                    <button
                        key={f}
                        type="button"
                        onClick={() => setFiltro(f)}
                        className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition ${
                            filtro === f
                                ? 'bg-white text-[#042753] shadow-sm'
                                : 'text-[#A9ABAE] hover:text-[#042753]'
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Cliente</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Comercial</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Modo</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Servicio</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Ruta</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Solicitada</th>
                            <th className="px-4 py-3 text-center font-semibold text-[#042753]">Estado</th>
                            <th className="px-4 py-3 text-right font-semibold text-[#042753]">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {visibles.map((s) => (
                            <Fragment key={s.id_solicitud}>
                            <tr className="transition-colors hover:bg-gray-50">
                                <td className="px-4 py-3 text-[#042753]">{s.cliente ?? '—'}</td>
                                <td className="px-4 py-3">{s.comercial ?? '—'}</td>
                                <td className="px-4 py-3">
                                    <ModoTransporteBadge modo={s.modo_transporte} />
                                </td>
                                <td className="px-4 py-3">
                                    {s.tipo_servicio ?? '—'}
                                    {s.detalle_carga?.resumen && (
                                        <span className="block text-xs font-semibold text-[#71BFA6]">
                                            {s.detalle_carga.tipo === 'lcl'
                                                ? `Cobra ${numero(s.detalle_carga.resumen.carga_a_cobrar, 3)} ${s.detalle_carga.resumen.cobra_por}`
                                                : `Tasable ${numero(s.detalle_carga.resumen.peso_tasable_kg)} kg`}
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3">{s.pol ?? '—'} → {s.pod ?? '—'}</td>
                                <td className="px-4 py-3 text-[#A9ABAE]">{s.creado_en}</td>
                                <td className="px-4 py-3 text-center">
                                    <span
                                        className={`rounded px-2 py-1 text-xs font-medium ${
                                            s.estado === 'Pendiente'
                                                ? 'bg-amber-100 text-amber-700'
                                                : 'bg-emerald-50 text-emerald-600'
                                        }`}
                                    >
                                        {s.estado}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        {s.detalle_carga && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setAbierta(abierta === s.id_solicitud ? null : s.id_solicitud)
                                                }
                                                className="text-xs font-semibold text-[#042753] hover:underline"
                                            >
                                                {abierta === s.id_solicitud ? 'Ocultar carga' : 'Ver carga'}
                                            </button>
                                        )}
                                        <Link
                                            href={route('gerente-operativo.tarifas.create', {
                                                modo: s.modo_transporte,
                                                id_pol: s.id_pol,
                                                id_pod: s.id_pod,
                                                tipo_servicio: s.tipo_servicio,
                                                cliente: s.cliente,
                                                comercial: s.comercial,
                                            })}
                                            className="text-xs font-semibold text-[#042753] hover:underline"
                                        >
                                            Cargar Tarifa
                                        </Link>
                                        {s.estado === 'Pendiente' && (
                                            <button
                                                type="button"
                                                onClick={() => atender(s)}
                                                className="text-xs font-semibold text-[#71BFA6] hover:underline"
                                            >
                                                Marcar Atendida
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                            {abierta === s.id_solicitud && s.detalle_carga && (
                                <tr className="bg-gray-50/70">
                                    <td colSpan={8} className="px-4 py-4">
                                        <DetalleCarga detalle={s.detalle_carga} />
                                    </td>
                                </tr>
                            )}
                            </Fragment>
                        ))}

                        {visibles.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-4 py-6 text-center text-[#A9ABAE]">
                                    {filtro === 'Pendientes'
                                        ? 'No hay solicitudes de tarifa pendientes.'
                                        : 'Todavía no se registró ninguna solicitud de tarifa.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </GerenteOperativoLayout>
    );
}
