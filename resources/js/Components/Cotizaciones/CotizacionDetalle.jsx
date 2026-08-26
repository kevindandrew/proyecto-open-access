import AyudaTermino from '@/Components/AyudaTermino';
import { INCOTERMS_INFO, TIPO_SERVICIO_INFO } from '@/constants/glosario';
import { Link } from '@inertiajs/react';

const TIPO_EMBARQUE_LABELS = {
    IMPO: 'Importación',
    EXPO: 'Exportación',
    DOM: 'Doméstico',
};

// La base guardada en la base de datos siempre trae 3 decimales (ej. "3.000"
// para 3 contenedores), lo cual se lee como un número mucho más grande de lo
// que es. Se recorta a la representación mínima (3, 12.5, etc.) solo para
// mostrarla — el dato guardado no cambia.
function formatearBase(valor) {
    const numero = parseFloat(valor);
    return Number.isNaN(numero) ? valor : numero.toString();
}

function Campo({ label, value, info }) {
    return (
        <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#A9ABAE]">
                {label}
            </p>
            <p className="text-sm text-[#042753]">{value ?? '—'}</p>
            {info && <AyudaTermino info={info} />}
        </div>
    );
}

export default function CotizacionDetalle({
    cotizacion,
    contenedores,
    detalle,
    rutaCrearTerrestre,
    rutaVerCotizacion,
}) {
    const comisionOpenaccess = detalle.reduce(
        (acc, linea) => acc + (parseFloat(linea.comision_openaccess) || 0),
        0,
    );

    // Nunca se suma entre monedas distintas — un total por cada moneda que
    // efectivamente aparece en el detalle.
    const totalesPorMoneda = detalle.reduce((acc, linea) => {
        const moneda = linea.moneda || 'USD';
        acc[moneda] = (acc[moneda] || 0) + (parseFloat(linea.costo_total) || 0);
        return acc;
    }, {});
    const monedasPresentes = Object.keys(totalesPorMoneda);

    // La comisión siempre es en USD, así que solo se suma al total en USD.
    const totalConComisionUSD = (totalesPorMoneda.USD || 0) + comisionOpenaccess;

    const puedeCrearTerrestre =
        rutaCrearTerrestre &&
        (cotizacion.modo_transporte === 'Maritimo' || cotizacion.modo_transporte === 'Aereo');

    return (
        <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-[#042753]">
                        Cliente y Ruta
                    </h3>
                    {puedeCrearTerrestre && (
                        <Link
                            href={route(rutaCrearTerrestre, { desde_cotizacion: cotizacion.id_cotizacion })}
                            className="rounded-md bg-[#71BFA6] px-3 py-1.5 text-xs font-semibold text-[#042753] hover:opacity-90"
                        >
                            + Crear Cotización Terrestre desde este{' '}
                            {cotizacion.modo_transporte === 'Aereo' ? 'aeropuerto' : 'puerto'}
                        </Link>
                    )}
                </div>

                {(cotizacion.origen || (cotizacion.continuaciones && cotizacion.continuaciones.length > 0)) && (
                    <div className="mb-4 space-y-1 rounded-md bg-[#042753]/5 px-3 py-2 text-sm text-[#042753]">
                        {cotizacion.origen && (
                            <p>
                                Continuación de la cotización{' '}
                                {rutaVerCotizacion ? (
                                    <Link
                                        href={route(rutaVerCotizacion, cotizacion.origen.id_cotizacion)}
                                        className="font-semibold underline"
                                    >
                                        {cotizacion.origen.numero_referencia}
                                    </Link>
                                ) : (
                                    <span className="font-semibold">{cotizacion.origen.numero_referencia}</span>
                                )}
                            </p>
                        )}
                        {cotizacion.continuaciones && cotizacion.continuaciones.length > 0 && (
                            <p>
                                Tiene continuación terrestre:{' '}
                                {cotizacion.continuaciones.map((c, index) => (
                                    <span key={c.id_cotizacion}>
                                        {index > 0 && ', '}
                                        {rutaVerCotizacion ? (
                                            <Link
                                                href={route(rutaVerCotizacion, c.id_cotizacion)}
                                                className="font-semibold underline"
                                            >
                                                {c.numero_referencia}
                                            </Link>
                                        ) : (
                                            <span className="font-semibold">{c.numero_referencia}</span>
                                        )}
                                    </span>
                                ))}
                            </p>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {cotizacion.comercial && (
                        <Campo label="Comercial" value={cotizacion.comercial} />
                    )}
                    <Campo label="Cliente" value={cotizacion.cliente} />
                    <Campo label="Modo de Transporte" value={cotizacion.modo_transporte} />
                    <Campo
                        label="Tipo de Embarque"
                        value={TIPO_EMBARQUE_LABELS[cotizacion.tipo_embarque] ?? cotizacion.tipo_embarque}
                    />
                    <Campo
                        label="Tipo de Servicio"
                        value={cotizacion.tipo_servicio}
                        info={TIPO_SERVICIO_INFO[cotizacion.tipo_servicio]}
                    />
                    <Campo
                        label="Incoterm"
                        value={cotizacion.incoterm}
                        info={INCOTERMS_INFO[cotizacion.incoterm]}
                    />
                    <Campo label="POL" value={cotizacion.pol} />
                    <Campo label="POD" value={cotizacion.pod} />
                    <Campo label="Agente de Origen" value={cotizacion.agente_origen} />
                    <Campo label="Naviera / Aerolínea" value={cotizacion.naviera_aerolinea} />
                    <Campo label="Fecha de Emisión" value={cotizacion.fecha_emision} />
                    <Campo label="Fecha de Validez" value={cotizacion.fecha_validez} />
                    <Campo label="Días de Tránsito" value={cotizacion.dias_transito} />
                </div>
            </div>

            {cotizacion.estado === 'Rechazado' && cotizacion.motivo_rechazo && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
                    <h3 className="mb-2 text-sm font-semibold text-red-700">
                        Motivo del Rechazo
                    </h3>
                    <p className="whitespace-pre-line text-sm text-red-900">
                        {cotizacion.motivo_rechazo}
                    </p>
                </div>
            )}

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold text-[#042753]">Carga</h3>
                {contenedores.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead>
                            <tr>
                                <th className="px-3 py-2 text-left font-semibold text-[#042753]">
                                    Tipo de Contenedor
                                </th>
                                <th className="px-3 py-2 text-left font-semibold text-[#042753]">
                                    Cantidad
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {contenedores.map((item, index) => (
                                <tr key={index}>
                                    <td className="px-3 py-2">{item.tipo_contenedor}</td>
                                    <td className="px-3 py-2">{item.cantidad}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        <Campo label="Peso (kg)" value={cotizacion.peso_kg} />
                        <Campo label="Volumen (cbm)" value={cotizacion.volumen_cbm} />
                    </div>
                )}
                {contenedores.length > 0 && (
                    <p className="mt-2 text-xs text-[#A9ABAE]">
                        DRY = contenedor estándar · HC = High Cube (más alto, más volumen)
                    </p>
                )}
                <p className="mt-3 text-sm text-[#042753]">
                    Mercancía peligrosa:{' '}
                    <span className="font-semibold">
                        {cotizacion.mercancia_peligrosa ? 'Sí' : 'No'}
                    </span>
                </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold text-[#042753]">Costos</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead>
                            <tr>
                                <th className="px-3 py-2 text-left font-semibold text-[#042753]">
                                    Descripción
                                </th>
                                <th className="px-3 py-2 text-left font-semibold text-[#042753]">
                                    Unidad
                                </th>
                                <th className="px-3 py-2 text-right font-semibold text-[#042753]">
                                    Costo Unit.
                                </th>
                                <th className="px-3 py-2 text-right font-semibold text-[#042753]">
                                    Base
                                </th>
                                <th className="px-3 py-2 text-left font-semibold text-[#042753]">
                                    Moneda
                                </th>
                                <th className="px-3 py-2 text-right font-semibold text-[#042753]">
                                    Total
                                </th>
                                <th className="px-3 py-2 text-right font-semibold text-[#042753]">
                                    Comisión (USD)
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {detalle.map((linea, index) => (
                                <tr key={index}>
                                    <td className="px-3 py-2">
                                        {linea.descripcion}
                                        {linea.observaciones && (
                                            <p className="mt-1 text-xs italic text-amber-700">
                                                ⚠ {linea.observaciones}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-3 py-2">{linea.tipo_tarifa_unidad}</td>
                                    <td className="px-3 py-2 text-right">{linea.costo_unitario}</td>
                                    <td className="px-3 py-2 text-right">{formatearBase(linea.base_calculo)}</td>
                                    <td className="px-3 py-2">{linea.moneda}</td>
                                    <td className="px-3 py-2 text-right font-medium text-[#042753]">
                                        {linea.costo_total}
                                    </td>
                                    <td className="px-3 py-2 text-right text-[#042753]">
                                        {parseFloat(linea.comision_openaccess) > 0
                                            ? parseFloat(linea.comision_openaccess).toFixed(2)
                                            : <span className="text-[#A9ABAE]">—</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            {monedasPresentes.map((moneda, index) => (
                                <tr
                                    key={moneda}
                                    className={index === 0 ? 'border-t-2 border-gray-200' : ''}
                                >
                                    <td colSpan={5} className="px-3 py-2 text-right font-semibold text-[#042753]">
                                        Total General ({moneda})
                                    </td>
                                    <td className="px-3 py-2 text-right text-lg font-bold text-[#71BFA6]">
                                        {totalesPorMoneda[moneda].toFixed(2)}
                                    </td>
                                    <td></td>
                                </tr>
                            ))}
                            {comisionOpenaccess > 0 && (
                                <>
                                    <tr>
                                        <td colSpan={6} className="px-3 py-2 text-right text-sm font-medium text-[#042753]">
                                            Comisión OpenAccess{' '}
                                            <span className="text-xs text-[#A9ABAE]">
                                                (uso interno — el cliente no la ve)
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-right text-sm font-medium text-[#042753]">
                                            {comisionOpenaccess.toFixed(2)} USD
                                        </td>
                                    </tr>
                                    <tr className="border-t border-gray-200">
                                        <td colSpan={5} className="px-3 py-2 text-right font-semibold text-[#042753]">
                                            Total con Comisión (USD)
                                        </td>
                                        <td className="px-3 py-2 text-right text-lg font-bold text-[#042753]">
                                            {totalConComisionUSD.toFixed(2)}
                                        </td>
                                        <td></td>
                                    </tr>
                                </>
                            )}
                        </tfoot>
                    </table>
                </div>
                {detalle.length > 0 && (
                    <p className="mt-2 text-xs text-[#A9ABAE]">
                        Per Container = por contenedor · Per Kg = por kilogramo · Per CBM = por metro cúbico · Flat = tarifa única
                    </p>
                )}
            </div>
        </div>
    );
}
