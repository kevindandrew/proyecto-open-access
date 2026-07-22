import { COTIZACION_ESTADO_STYLES } from '@/constants/cotizacionEstados';
import GerenteOperativoLayout from '@/Layouts/GerenteOperativoLayout';
import ModoTransporteBadge from '@/Components/ModoTransporteBadge';
import PageHeader from '@/Components/PageHeader';
import { IconoCotizacionesNav } from '@/Components/NavIcons';
import { BotonIcono, IconoAgregar, IconoVer } from '@/Components/ActionIcons';
import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const ESTADOS = ['Todas', 'Cotizado', 'Aceptado', 'Rechazado', 'Vencido'];

function formatoMonto(valor) {
    if (valor === null || valor === undefined || valor === '') {
        return '—';
    }

    return Number(valor).toLocaleString('es-BO', { maximumFractionDigits: 2 });
}

export default function Index({ cotizaciones }) {
    const [estado, setEstado] = useState('Todas');
    const [busqueda, setBusqueda] = useState('');

    const porEstado = useMemo(
        () => (estado === 'Todas' ? cotizaciones : cotizaciones.filter((c) => c.estado === estado)),
        [cotizaciones, estado],
    );

    const filtradas = useMemo(() => {
        const termino = busqueda.trim().toLowerCase();

        if (!termino) {
            return porEstado;
        }

        return porEstado.filter((c) =>
            [c.numero_referencia, c.cliente, c.comercial]
                .filter(Boolean)
                .some((campo) => campo.toLowerCase().includes(termino)),
        );
    }, [porEstado, busqueda]);

    const conteos = useMemo(() => {
        const mapa = { Todas: cotizaciones.length };
        for (const e of ESTADOS.slice(1)) {
            mapa[e] = cotizaciones.filter((c) => c.estado === e).length;
        }
        return mapa;
    }, [cotizaciones]);

    return (
        <GerenteOperativoLayout header="Cotizaciones">
            <Head title="Cotizaciones" />

            <PageHeader
                icon={IconoCotizacionesNav}
                title="Cotizaciones"
                subtitle="Todas las cotizaciones generadas por el equipo comercial"
            >
                <Link
                    href={route('gerente-operativo.cotizaciones.create')}
                    className="flex items-center gap-1.5 rounded-md bg-[#042753] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 hover:shadow-md active:scale-[0.98]"
                >
                    <IconoAgregar className="h-4 w-4" />
                    Nueva Cotización
                </Link>
            </PageHeader>

            <div className="mb-4 inline-flex flex-wrap gap-1 rounded-lg bg-gray-100 p-1">
                {ESTADOS.map((e) => (
                    <button
                        key={e}
                        type="button"
                        onClick={() => setEstado(e)}
                        className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition ${
                            estado === e
                                ? 'bg-white text-[#042753] shadow-sm'
                                : 'text-[#A9ABAE] hover:text-[#042753]'
                        }`}
                    >
                        {e} <span className="text-xs">({conteos[e] ?? 0})</span>
                    </button>
                ))}
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Buscar por referencia, cliente o comercial..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full max-w-sm rounded-md border-gray-300 shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                />
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Referencia</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Cliente</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Comercial</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Modo</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Ruta</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Emisión</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Validez</th>
                            <th className="px-4 py-3 text-right font-semibold text-[#042753]">Total</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Estado</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtradas.map((c) => (
                            <tr key={c.id_cotizacion} className="transition-colors hover:bg-gray-50">
                                <td className="px-4 py-3 font-mono text-xs font-medium text-[#042753]">
                                    {c.numero_referencia}
                                </td>
                                <td className="px-4 py-3 text-[#042753]">{c.cliente}</td>
                                <td className="px-4 py-3">{c.comercial ?? '—'}</td>
                                <td className="px-4 py-3">
                                    <ModoTransporteBadge modo={c.modo_transporte} />
                                </td>
                                <td className="px-4 py-3">
                                    {c.pol ?? '—'} → {c.pod ?? '—'}
                                </td>
                                <td className="px-4 py-3 text-[#A9ABAE]">{c.fecha_emision}</td>
                                <td className="px-4 py-3 text-[#A9ABAE]">{c.fecha_validez}</td>
                                <td className="px-4 py-3 text-right font-semibold text-[#042753]">
                                    {formatoMonto(c.total)}
                                </td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`rounded px-2 py-1 text-xs font-medium ${
                                            COTIZACION_ESTADO_STYLES[c.estado] ?? 'bg-gray-100 text-gray-700'
                                        }`}
                                    >
                                        {c.estado}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <BotonIcono
                                        as="link"
                                        variante="ver"
                                        titulo="Ver detalle"
                                        href={route('gerente-operativo.cotizaciones.show', c.id_cotizacion)}
                                    >
                                        <IconoVer className="h-[18px] w-[18px]" />
                                    </BotonIcono>
                                </td>
                            </tr>
                        ))}

                        {filtradas.length === 0 && (
                            <tr>
                                <td colSpan={10} className="px-4 py-6 text-center text-[#A9ABAE]">
                                    No hay cotizaciones para este filtro.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </GerenteOperativoLayout>
    );
}
