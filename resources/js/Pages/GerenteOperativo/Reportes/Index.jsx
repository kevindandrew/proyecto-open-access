import GerenteOperativoLayout from '@/Layouts/GerenteOperativoLayout';
import PageHeader from '@/Components/PageHeader';
import { IconoReportesNav } from '@/Components/NavIcons';
import { Head } from '@inertiajs/react';

const MODO_HEX = {
    Maritimo: '#042753',
    Aereo: '#71BFA6',
    Terrestre: '#A9ABAE',
};

const MODO_LABEL = {
    Maritimo: 'Marítimo',
    Aereo: 'Aéreo',
    Terrestre: 'Terrestre',
};

const ESTADO_TARIFA_HEX = {
    Activo: '#16a34a',
    'Por Vencer': '#d97706',
    Vencida: '#6b7280',
};

const ROL_HEX = {
    'Gerente Comercial': '#2563eb',
    Comercial: '#71BFA6',
    'Gerente Operativo': '#042753',
    Operativo: '#A9ABAE',
};

const formatoMoneda = new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
});

function CardReporte({ titulo, subtitulo, children }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
            <h3 className="text-sm font-semibold text-[#042753]">{titulo}</h3>
            {subtitulo && <p className="mb-4 text-xs text-[#A9ABAE]">{subtitulo}</p>}
            {!subtitulo && <div className="mb-4" />}
            {children}
        </div>
    );
}

function Donut({ datos, colores, etiquetas, labelKey, valueKey }) {
    const total = datos.reduce((acc, item) => acc + item[valueKey], 0);
    const radio = 60;
    const circunferencia = 2 * Math.PI * radio;
    let acumulado = 0;

    if (total === 0) {
        return <p className="text-sm text-[#A9ABAE]">Todavía no hay datos para mostrar.</p>;
    }

    return (
        <div className="flex flex-col items-center gap-6 sm:flex-row">
            <svg viewBox="0 0 140 140" className="h-40 w-40 flex-shrink-0 -rotate-90">
                <circle cx="70" cy="70" r={radio} fill="none" stroke="#eef0ee" strokeWidth="18" />
                {datos
                    .filter((item) => item[valueKey] > 0)
                    .map((item) => {
                        const porcion = item[valueKey] / total;
                        const largo = porcion * circunferencia;
                        const offset = -acumulado;
                        acumulado += largo;

                        return (
                            <circle
                                key={item[labelKey]}
                                cx="70"
                                cy="70"
                                r={radio}
                                fill="none"
                                stroke={colores[item[labelKey]] ?? '#A9ABAE'}
                                strokeWidth="18"
                                strokeDasharray={`${largo} ${circunferencia - largo}`}
                                strokeDashoffset={offset}
                                strokeLinecap="round"
                            >
                                <title>
                                    {(etiquetas?.[item[labelKey]] ?? item[labelKey])}: {item[valueKey]}
                                </title>
                            </circle>
                        );
                    })}
            </svg>

            <ul className="space-y-2">
                {datos.map((item) => (
                    <li key={item[labelKey]} className="flex items-center gap-2 text-sm">
                        <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: colores[item[labelKey]] ?? '#A9ABAE' }}
                        />
                        <span className="text-[#042753]">{etiquetas?.[item[labelKey]] ?? item[labelKey]}</span>
                        <span className="font-semibold text-[#042753]">{item[valueKey]}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function BarrasHorizontales({ datos, labelKey, valueKey, color, formato, vacioTexto }) {
    if (datos.length === 0) {
        return <p className="text-sm text-[#A9ABAE]">{vacioTexto}</p>;
    }

    const maximo = Math.max(...datos.map((item) => Number(item[valueKey])), 1);

    return (
        <ol className="space-y-3">
            {datos.map((item, index) => (
                <li key={index}>
                    <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                        <span className="truncate text-[#042753]">
                            <span className="mr-2 text-[#A9ABAE]">{index + 1}.</span>
                            {item[labelKey]}
                        </span>
                        <span className="flex-shrink-0 font-semibold text-[#042753]">
                            {formato ? formato(item[valueKey]) : item[valueKey]}
                        </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100">
                        <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                                width: `${(Number(item[valueKey]) / maximo) * 100}%`,
                                backgroundColor: color ?? '#042753',
                            }}
                        />
                    </div>
                </li>
            ))}
        </ol>
    );
}

function BarrasTendencia({ datos, labelKey, valueKey, color, formato, vacioTexto }) {
    if (datos.length === 0) {
        return <p className="text-sm text-[#A9ABAE]">{vacioTexto}</p>;
    }

    const maximo = Math.max(...datos.map((item) => Number(item[valueKey])), 1);

    return (
        <div className="flex h-48 items-end gap-4 px-2">
            {datos.map((item, index) => (
                <div key={index} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-xs font-semibold text-[#042753]">
                        {formato ? formato(item[valueKey]) : item[valueKey]}
                    </span>
                    <div
                        className="w-full max-w-[48px] rounded-t-md transition-all duration-500"
                        style={{
                            height: `${Math.max((Number(item[valueKey]) / maximo) * 100, 4)}%`,
                            backgroundColor: color ?? '#042753',
                        }}
                    />
                    <span className="text-xs text-[#A9ABAE]">{item[labelKey]}</span>
                </div>
            ))}
        </div>
    );
}

export default function Index({
    embarquesPorModo,
    tarifasPorEstado,
    personalPorRol,
    topClientes,
    cotizacionesPorMes,
    profitPorMes,
}) {
    return (
        <GerenteOperativoLayout header="Reportes">
            <Head title="Reportes" />

            <PageHeader
                icon={IconoReportesNav}
                title="Reportes"
                subtitle="Visualiza el desempeño de toda la operación en un solo lugar"
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <CardReporte titulo="Embarques por Modo de Transporte">
                    <Donut datos={embarquesPorModo} colores={MODO_HEX} etiquetas={MODO_LABEL} labelKey="modo" valueKey="total" />
                </CardReporte>

                <CardReporte titulo="Tarifas por Estado">
                    <Donut datos={tarifasPorEstado} colores={ESTADO_TARIFA_HEX} labelKey="estado" valueKey="total" />
                </CardReporte>

                <CardReporte titulo="Personal Activo por Rol">
                    <BarrasHorizontales
                        datos={personalPorRol}
                        labelKey="rol"
                        valueKey="total"
                        color="#042753"
                        vacioTexto="Todavía no hay personal activo registrado."
                    />
                </CardReporte>

                <CardReporte titulo="Top Clientes por Facturación" subtitulo="Según costos de venta cargados en sus embarques">
                    <BarrasHorizontales
                        datos={topClientes}
                        labelKey="razon_social"
                        valueKey="total"
                        color="#71BFA6"
                        formato={(valor) => formatoMoneda.format(valor)}
                        vacioTexto="Todavía no hay costos de embarque cargados para calcular facturación."
                    />
                </CardReporte>

                <CardReporte titulo="Cotizaciones por Mes" subtitulo="Cantidad de cotizaciones emitidas">
                    <BarrasTendencia
                        datos={cotizacionesPorMes}
                        labelKey="mes"
                        valueKey="total"
                        color="#71BFA6"
                        vacioTexto="Todavía no hay cotizaciones registradas."
                    />
                </CardReporte>

                <CardReporte titulo="Profit Mensual" subtitulo="Costo de venta menos costo de compra, por mes">
                    <BarrasTendencia
                        datos={profitPorMes}
                        labelKey="mes"
                        valueKey="profit"
                        color="#042753"
                        formato={(valor) => formatoMoneda.format(valor)}
                        vacioTexto="Todavía no hay costos de embarque cargados para calcular profit."
                    />
                </CardReporte>
            </div>
        </GerenteOperativoLayout>
    );
}
