import GerenteOperativoLayout from '@/Layouts/GerenteOperativoLayout';
import ModoTransporteIcon from '@/Components/ModoTransporteIcon';
import PageHeader from '@/Components/PageHeader';
import { IconoTarifasNav } from '@/Components/NavIcons';
import { BotonIcono, IconoAgregar, IconoAlerta, IconoEditar, IconoEliminar, IconoMas, IconoSubir } from '@/Components/ActionIcons';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const MODOS = [
    { valor: 'Maritimo', etiqueta: 'Marítimo' },
    { valor: 'Aereo', etiqueta: 'Aéreo' },
    { valor: 'Terrestre', etiqueta: 'Terrestre' },
];

const ESTADO_ESTILOS = {
    Activo: 'bg-green-100 text-green-700',
    'Por Vencer': 'bg-amber-100 text-amber-700',
    Vencida: 'bg-amber-50 text-amber-700/80',
};

function formatoMonto(valor) {
    if (valor === null || valor === undefined || valor === '') {
        return '—';
    }

    return Number(valor).toLocaleString('es-BO', { maximumFractionDigits: 2 });
}

export default function Index({ tarifas }) {
    const [modo, setModo] = useState('Maritimo');
    const [busqueda, setBusqueda] = useState('');

    const porModo = useMemo(
        () => tarifas.filter((t) => t.modo === modo),
        [tarifas, modo],
    );

    const filtradas = useMemo(() => {
        const termino = busqueda.trim().toLowerCase();

        if (!termino) {
            return porModo;
        }

        return porModo.filter((t) =>
            [t.carrier, t.origen, t.destino, t.servicio]
                .filter(Boolean)
                .some((campo) => campo.toLowerCase().includes(termino)),
        );
    }, [porModo, busqueda]);

    const porVencerEnTab = porModo.filter((t) => t.estado === 'Por Vencer').length;

    const eliminar = (tarifa) => {
        if (
            !confirm(
                `¿Eliminar la tarifa de ${tarifa.carrier}? Se eliminan todos los tamaños/precios cargados para esa ruta.`,
            )
        ) {
            return;
        }

        router.delete(route('gerente-operativo.tarifas.destroy', tarifa.id_tarifa));
    };

    return (
        <GerenteOperativoLayout header="Tarifas">
            <Head title="Tarifas" />

            <PageHeader
                icon={IconoTarifasNav}
                title="Tarifas"
                subtitle="Administra tarifas de carriers por modo de transporte"
            >
                <button
                    type="button"
                    title="Próximamente"
                    disabled
                    className="flex items-center gap-1.5 rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-[#A9ABAE]"
                >
                    <IconoSubir className="h-4 w-4" />
                    Importar Excel
                </button>
                <Link
                    href={route('gerente-operativo.tarifas.create')}
                    className="flex items-center gap-1.5 rounded-md bg-[#042753] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 hover:shadow-md active:scale-[0.98]"
                >
                    <IconoAgregar className="h-4 w-4" />
                    Agregar Tarifa
                </Link>
            </PageHeader>

            <div className="mb-4 inline-flex rounded-lg bg-gray-100 p-1">
                {MODOS.map((m) => (
                    <button
                        key={m.valor}
                        type="button"
                        onClick={() => setModo(m.valor)}
                        className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-medium transition ${
                            modo === m.valor
                                ? 'bg-white text-[#042753] shadow-sm'
                                : 'text-[#A9ABAE] hover:text-[#042753]'
                        }`}
                    >
                        <ModoTransporteIcon modo={m.valor} className="h-4 w-4" />
                        {m.etiqueta}
                    </button>
                ))}
            </div>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <input
                    type="text"
                    placeholder="Buscar carrier, ruta, servicio..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full max-w-sm rounded-md border-gray-300 shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                />
                <div className="flex items-center gap-2">
                    {porVencerEnTab > 0 && (
                        <span className="flex items-center gap-1.5 rounded-md bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                            <IconoAlerta className="h-4 w-4" />
                            {porVencerEnTab} por vencer
                        </span>
                    )}
                    <Link
                        href={route('gerente-operativo.tarifas.create')}
                        className="flex items-center gap-1.5 rounded-md bg-[#042753] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 hover:shadow-md active:scale-[0.98]"
                    >
                        <IconoAgregar className="h-4 w-4" />
                        Agregar Tarifa
                    </Link>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Carrier</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Origen</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Destino</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Servicio</th>
                            <th className="px-4 py-3 text-right font-semibold text-[#042753]">Tarifa Base</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Moneda</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Tránsito</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Válido desde</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Válido hasta</th>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Estado</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtradas.map((t, index) => (
                            <tr
                                key={`${t.id_tarifa}-${t.servicio}-${index}`}
                                className={`transition-colors hover:bg-gray-50 ${
                                    t.estado === 'Por Vencer' ? 'bg-amber-50/40' : ''
                                }`}
                            >
                                <td className="px-4 py-3 font-medium text-[#042753]">{t.carrier}</td>
                                <td className="px-4 py-3">{t.origen ?? '—'}</td>
                                <td className="px-4 py-3">{t.destino ?? '—'}</td>
                                <td className="px-4 py-3">
                                    <span className="rounded border border-gray-200 px-2 py-1 font-mono text-xs text-[#042753]">
                                        {t.servicio || '—'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right font-semibold text-[#042753]">
                                    {formatoMonto(t.tarifa_base)}
                                </td>
                                <td className="px-4 py-3 text-[#A9ABAE]">{t.moneda}</td>
                                <td className="px-4 py-3">
                                    {t.dias_transito ? `${t.dias_transito}d` : '—'}
                                </td>
                                <td className="px-4 py-3 text-[#A9ABAE]">{t.valido_desde}</td>
                                <td className="px-4 py-3 text-[#A9ABAE]">{t.valido_hasta}</td>
                                <td className="px-4 py-3">
                                    <span className="flex w-fit items-center gap-1.5">
                                        {t.estado === 'Por Vencer' && (
                                            <IconoAlerta className="h-4 w-4 text-amber-600" />
                                        )}
                                        <span
                                            className={`rounded px-2 py-1 text-xs font-medium ${
                                                ESTADO_ESTILOS[t.estado] ?? 'bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            {t.estado}
                                        </span>
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <Menu as="div" className="relative inline-block text-left">
                                        <MenuButton className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#A9ABAE] hover:bg-gray-100 hover:text-[#042753]">
                                            <IconoMas className="h-4 w-4" />
                                        </MenuButton>
                                        <MenuItems className="absolute right-0 z-10 mt-1 w-36 origin-top-right rounded-md border border-gray-200 bg-white py-1 shadow-lg focus:outline-none">
                                            <MenuItem>
                                                <Link
                                                    href={route('gerente-operativo.tarifas.edit', t.id_tarifa)}
                                                    className="flex items-center gap-2 px-3 py-2 text-sm text-[#042753] data-[focus]:bg-gray-50"
                                                >
                                                    <IconoEditar className="h-4 w-4" />
                                                    Editar
                                                </Link>
                                            </MenuItem>
                                            <MenuItem>
                                                <button
                                                    type="button"
                                                    onClick={() => eliminar(t)}
                                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 data-[focus]:bg-red-50"
                                                >
                                                    <IconoEliminar className="h-4 w-4" />
                                                    Eliminar
                                                </button>
                                            </MenuItem>
                                        </MenuItems>
                                    </Menu>
                                </td>
                            </tr>
                        ))}

                        {filtradas.length === 0 && (
                            <tr>
                                <td colSpan={11} className="px-4 py-6 text-center text-[#A9ABAE]">
                                    No hay tarifas cargadas para este modo de transporte.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </GerenteOperativoLayout>
    );
}
