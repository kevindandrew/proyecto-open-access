import AyudaTermino from '@/Components/AyudaTermino';
import { INCOTERMS_INFO, TIPO_SERVICIO_INFO } from '@/constants/glosario';

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

export default function CotizacionDetalle({ cotizacion, contenedores, detalle, total }) {
    return (
        <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold text-[#042753]">
                    Cliente y Ruta
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {cotizacion.comercial && (
                        <Campo label="Comercial" value={cotizacion.comercial} />
                    )}
                    <Campo label="Cliente" value={cotizacion.cliente} />
                    <Campo label="Modo de Transporte" value={cotizacion.modo_transporte} />
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
                    <Campo label="Destino Final" value={cotizacion.destino_final} />
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
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {detalle.map((linea, index) => (
                                <tr key={index}>
                                    <td className="px-3 py-2">{linea.descripcion}</td>
                                    <td className="px-3 py-2">{linea.tipo_tarifa_unidad}</td>
                                    <td className="px-3 py-2 text-right">{linea.costo_unitario}</td>
                                    <td className="px-3 py-2 text-right">{linea.base_calculo}</td>
                                    <td className="px-3 py-2">{linea.moneda}</td>
                                    <td className="px-3 py-2 text-right font-medium text-[#042753]">
                                        {linea.costo_total}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-gray-200">
                                <td colSpan={5} className="px-3 py-2 text-right font-semibold text-[#042753]">
                                    Total General
                                </td>
                                <td className="px-3 py-2 text-right text-lg font-bold text-[#71BFA6]">
                                    {total}
                                </td>
                            </tr>
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
