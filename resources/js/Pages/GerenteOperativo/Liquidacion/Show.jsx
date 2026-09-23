import GerenteOperativoLayout from '@/Layouts/GerenteOperativoLayout';
import { MONEDAS } from '@/constants/monedas';
import { Head, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const CONCEPTOS = ['Arancel', 'Impuesto', 'Tasa', 'Otro'];

const inputClass =
    'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]';
const labelClass = 'text-sm font-medium text-[#042753]';

function claveLinea(tipoOrigen, idOrigen) {
    return `${tipoOrigen}-${idOrigen}`;
}

function PanelGastos({ embarque, gastos, totalesPorMoneda, cerrada }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        concepto: 'Arancel',
        monto: '',
        moneda: 'USD',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('gerente-operativo.embarques.gastos.store', embarque.id_embarque), {
            onSuccess: () => reset('monto'),
        });
    };

    const marcarPagado = (gasto) => {
        router.patch(route('gerente-operativo.gastos.pagar', gasto.id_gasto));
    };

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-[#042753]">Concepto</th>
                                <th className="px-4 py-3 text-right font-semibold text-[#042753]">Monto</th>
                                <th className="px-4 py-3 text-left font-semibold text-[#042753]">Estado</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {gastos.map((gasto) => (
                                <tr key={gasto.id_gasto}>
                                    <td className="px-4 py-3">{gasto.concepto}</td>
                                    <td className="px-4 py-3 text-right">
                                        {gasto.moneda} {gasto.monto}
                                    </td>
                                    <td className="px-4 py-3">
                                        {gasto.pagado ? (
                                            <span className="rounded bg-[#71BFA6]/20 px-2 py-0.5 text-xs font-medium text-[#042753]">
                                                Pagado {gasto.fecha_pago}
                                            </span>
                                        ) : (
                                            <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                                                Pendiente
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {!gasto.pagado && !cerrada && (
                                            <button
                                                onClick={() => marcarPagado(gasto)}
                                                className="text-sm font-medium text-[#71BFA6] hover:underline"
                                            >
                                                Marcar como pagado
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {gastos.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-6 text-center text-[#A9ABAE]">
                                        Sin gastos de destino cargados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-gray-200">
                                <td className="px-4 py-3 font-semibold text-[#042753]">Total</td>
                                <td className="px-4 py-3 text-right font-semibold text-[#042753]">
                                    {Object.entries(totalesPorMoneda).length === 0
                                        ? '—'
                                        : Object.entries(totalesPorMoneda).map(([moneda, monto]) => (
                                              <div key={moneda}>
                                                  {monto} {moneda}
                                              </div>
                                          ))}
                                </td>
                                <td colSpan={2}></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {!cerrada && (
                <div>
                    <form
                        onSubmit={submit}
                        className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                    >
                        <h3 className="text-sm font-semibold text-[#042753]">Agregar Gasto</h3>

                        <div>
                            <label className={labelClass}>Concepto</label>
                            <select
                                className={inputClass}
                                value={data.concepto}
                                onChange={(e) => setData('concepto', e.target.value)}
                            >
                                {CONCEPTOS.map((concepto) => (
                                    <option key={concepto} value={concepto}>
                                        {concepto}
                                    </option>
                                ))}
                            </select>
                            {errors.concepto && <p className="mt-1 text-sm text-red-600">{errors.concepto}</p>}
                        </div>

                        <div>
                            <label className={labelClass}>Monto</label>
                            <input
                                type="number"
                                step="0.01"
                                className={inputClass}
                                value={data.monto}
                                onChange={(e) => setData('monto', e.target.value)}
                            />
                            {errors.monto && <p className="mt-1 text-sm text-red-600">{errors.monto}</p>}
                        </div>

                        <div>
                            <label className={labelClass}>Moneda</label>
                            <select
                                className={inputClass}
                                value={data.moneda}
                                onChange={(e) => setData('moneda', e.target.value)}
                            >
                                {MONEDAS.map((m) => (
                                    <option key={m.valor} value={m.valor}>
                                        {m.etiqueta}
                                    </option>
                                ))}
                            </select>
                            {errors.moneda && <p className="mt-1 text-sm text-red-600">{errors.moneda}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-md bg-[#71BFA6] px-4 py-2 text-sm font-semibold text-[#042753] hover:opacity-90 disabled:opacity-50"
                        >
                            Agregar
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

function PanelDocumentos({ embarque, costos, gastos, documentos, tiposDocumento, clientes, proveedores, cerrada }) {
    const [seleccion, setSeleccion] = useState(new Set());

    const { data, setData, post, processing, errors, reset, transform } = useForm({
        tipo: '',
        id_cliente: embarque.id_cliente ?? '',
        id_proveedor: '',
        condicion_pago: 'Al Contado',
        tipo_cambio: '',
        observaciones: '',
    });

    const toggleLinea = (tipoOrigen, idOrigen) => {
        const clave = claveLinea(tipoOrigen, idOrigen);
        setSeleccion((actual) => {
            const nuevo = new Set(actual);
            if (nuevo.has(clave)) {
                nuevo.delete(clave);
            } else {
                nuevo.add(clave);
            }
            return nuevo;
        });
    };

    const lineasSeleccionadas = useMemo(() => {
        const resultado = [];

        for (const costo of costos) {
            if (seleccion.has(claveLinea('costo', costo.id_costo))) {
                resultado.push({ tipo_origen: 'costo', id_origen: costo.id_costo, moneda: costo.moneda });
            }
        }

        for (const gasto of gastos) {
            if (seleccion.has(claveLinea('gasto', gasto.id_gasto))) {
                resultado.push({ tipo_origen: 'gasto', id_origen: gasto.id_gasto, moneda: gasto.moneda });
            }
        }

        return resultado;
    }, [seleccion, costos, gastos]);

    const monedasSeleccionadas = useMemo(
        () => [...new Set(lineasSeleccionadas.map((l) => l.moneda))],
        [lineasSeleccionadas],
    );

    const categoria = data.tipo ? tiposDocumento[data.tipo]?.categoria : null;

    const puedeGenerar =
        data.tipo && lineasSeleccionadas.length > 0 && monedasSeleccionadas.length === 1 && !cerrada;

    const submit = (e) => {
        e.preventDefault();

        transform((formData) => ({
            ...formData,
            lineas: lineasSeleccionadas.map(({ tipo_origen, id_origen }) => ({ tipo_origen, id_origen })),
        }));

        post(route('gerente-operativo.documentos-liquidacion.store', embarque.id_embarque), {
            onSuccess: () => {
                setSeleccion(new Set());
                reset('tipo', 'observaciones');
            },
        });
    };

    const abrirPdf = (documento) => {
        window.open(route('gerente-operativo.documentos-liquidacion.pdf', documento.id_documento), '_blank');
    };

    const documentosCobro = documentos.filter((d) => d.categoria === 'cobro');
    const documentosPago = documentos.filter((d) => d.categoria === 'pago');

    return (
        <div className="mt-8 space-y-6">
            {!cerrada && (
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <h3 className="text-sm font-semibold text-[#042753]">Generar Documento de Liquidación</h3>
                    <p className="mt-1 text-xs text-[#A9ABAE]">
                        Elegí las líneas de Costos y/o Gastos que van en el documento (todas de la misma
                        moneda), y qué tipo de documento generar.
                    </p>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="rounded-md border border-gray-100 p-3">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#71BFA6]">
                                Costos (Compra/Venta)
                            </p>
                            {costos.length === 0 && (
                                <p className="text-xs text-[#A9ABAE]">Sin costos cargados en este embarque.</p>
                            )}
                            <div className="space-y-1.5">
                                {costos.map((costo) => (
                                    <label
                                        key={costo.id_costo}
                                        className="flex items-center gap-2 text-xs text-[#042753]"
                                    >
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-[#71BFA6] focus:ring-[#71BFA6]"
                                            checked={seleccion.has(claveLinea('costo', costo.id_costo))}
                                            onChange={() => toggleLinea('costo', costo.id_costo)}
                                        />
                                        <span>
                                            {costo.concepto} — Compra {costo.costo_compra ?? '—'} / Venta{' '}
                                            {costo.costo_venta ?? '—'} {costo.moneda}
                                            {costo.proveedor ? ` (${costo.proveedor})` : ''}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-md border border-gray-100 p-3">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#71BFA6]">
                                Gastos de Destino
                            </p>
                            {gastos.length === 0 && (
                                <p className="text-xs text-[#A9ABAE]">Sin gastos de destino cargados.</p>
                            )}
                            <div className="space-y-1.5">
                                {gastos.map((gasto) => (
                                    <label
                                        key={gasto.id_gasto}
                                        className="flex items-center gap-2 text-xs text-[#042753]"
                                    >
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-[#71BFA6] focus:ring-[#71BFA6]"
                                            checked={seleccion.has(claveLinea('gasto', gasto.id_gasto))}
                                            onChange={() => toggleLinea('gasto', gasto.id_gasto)}
                                        />
                                        <span>
                                            {gasto.concepto} — {gasto.monto} {gasto.moneda}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {monedasSeleccionadas.length > 1 && (
                        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
                            No se puede generar un documento mezclando líneas de distinta moneda (
                            {monedasSeleccionadas.join(', ')}).
                        </p>
                    )}

                    <form onSubmit={submit} className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div>
                            <label className={labelClass}>Tipo de Documento</label>
                            <select
                                className={inputClass}
                                value={data.tipo}
                                onChange={(e) => setData('tipo', e.target.value)}
                            >
                                <option value="">—</option>
                                <optgroup label="Cobro">
                                    {Object.entries(tiposDocumento)
                                        .filter(([, info]) => info.categoria === 'cobro')
                                        .map(([valor, info]) => (
                                            <option key={valor} value={valor}>
                                                {info.etiqueta}
                                            </option>
                                        ))}
                                </optgroup>
                                <optgroup label="Pago">
                                    {Object.entries(tiposDocumento)
                                        .filter(([, info]) => info.categoria === 'pago')
                                        .map(([valor, info]) => (
                                            <option key={valor} value={valor}>
                                                {info.etiqueta}
                                            </option>
                                        ))}
                                </optgroup>
                            </select>
                            {errors.tipo && <p className="mt-1 text-xs text-red-600">{errors.tipo}</p>}
                        </div>

                        {categoria === 'cobro' && (
                            <div>
                                <label className={labelClass}>Cobrar a (Cliente)</label>
                                <select
                                    className={inputClass}
                                    value={data.id_cliente}
                                    onChange={(e) => setData('id_cliente', e.target.value)}
                                >
                                    <option value="">Selecciona un cliente</option>
                                    {clientes.map((cliente) => (
                                        <option key={cliente.id_cliente} value={cliente.id_cliente}>
                                            {cliente.razon_social}
                                        </option>
                                    ))}
                                </select>
                                {errors.id_cliente && (
                                    <p className="mt-1 text-xs text-red-600">{errors.id_cliente}</p>
                                )}
                            </div>
                        )}

                        {categoria === 'pago' && (
                            <div>
                                <label className={labelClass}>Pagar a (Proveedor)</label>
                                <select
                                    className={inputClass}
                                    value={data.id_proveedor}
                                    onChange={(e) => setData('id_proveedor', e.target.value)}
                                >
                                    <option value="">Selecciona un proveedor</option>
                                    {proveedores.map((proveedor) => (
                                        <option key={proveedor.id_proveedor} value={proveedor.id_proveedor}>
                                            {proveedor.nombre}
                                        </option>
                                    ))}
                                </select>
                                {errors.id_proveedor && (
                                    <p className="mt-1 text-xs text-red-600">{errors.id_proveedor}</p>
                                )}
                            </div>
                        )}

                        <div>
                            <label className={labelClass}>Condición de Pago</label>
                            <select
                                className={inputClass}
                                value={data.condicion_pago}
                                onChange={(e) => setData('condicion_pago', e.target.value)}
                            >
                                <option value="Al Contado">Al Contado</option>
                                <option value="Crédito">Crédito</option>
                            </select>
                        </div>

                        <div>
                            <label className={labelClass}>T/C (opcional)</label>
                            <input
                                type="number"
                                step="0.0001"
                                className={inputClass}
                                value={data.tipo_cambio}
                                onChange={(e) => setData('tipo_cambio', e.target.value)}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelClass}>Observaciones (opcional)</label>
                            <input
                                type="text"
                                className={inputClass}
                                value={data.observaciones}
                                onChange={(e) => setData('observaciones', e.target.value)}
                            />
                        </div>

                        <div className="flex items-end md:col-span-3">
                            <button
                                type="submit"
                                disabled={!puedeGenerar || processing}
                                className="rounded-md bg-[#71BFA6] px-4 py-2 text-sm font-semibold text-[#042753] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Generar Documento
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                    <h3 className="mb-2 text-sm font-semibold text-[#042753]">Documentos de Cobro</h3>
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <tbody className="divide-y divide-gray-100">
                                {documentosCobro.map((documento) => (
                                    <tr key={documento.id_documento}>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-[#042753]">{documento.etiqueta}</p>
                                            <p className="text-xs text-[#A9ABAE]">
                                                {documento.numero} · {documento.contraparte ?? '—'} ·{' '}
                                                {documento.fecha}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-[#042753]">
                                            {documento.monto} {documento.moneda}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => abrirPdf(documento)}
                                                className="text-sm font-medium text-[#71BFA6] hover:underline"
                                            >
                                                PDF
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {documentosCobro.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-6 text-center text-[#A9ABAE]">
                                            Sin documentos de cobro generados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div>
                    <h3 className="mb-2 text-sm font-semibold text-[#042753]">Documentos de Pago</h3>
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <tbody className="divide-y divide-gray-100">
                                {documentosPago.map((documento) => (
                                    <tr key={documento.id_documento}>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-[#042753]">{documento.etiqueta}</p>
                                            <p className="text-xs text-[#A9ABAE]">
                                                {documento.numero} · {documento.contraparte ?? '—'} ·{' '}
                                                {documento.fecha}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-[#042753]">
                                            {documento.monto} {documento.moneda}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => abrirPdf(documento)}
                                                className="text-sm font-medium text-[#71BFA6] hover:underline"
                                            >
                                                PDF
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {documentosPago.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-6 text-center text-[#A9ABAE]">
                                            Sin documentos de pago generados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Show({
    embarque,
    gastos,
    totalesPorMoneda,
    costos,
    documentos,
    tiposDocumento,
    clientes,
    proveedores,
}) {
    const cerrada = Boolean(embarque.liquidacion_cerrada_en);

    const rutaResultadoOperacion = route('gerente-operativo.embarques.liquidacion.cerrar', embarque.id_embarque);

    const cerrarLiquidacion = () => {
        if (
            !confirm(
                'Esto va a cerrar la liquidación de este embarque: ya no se van a poder agregar ni editar Costos, Gastos de Destino, ni generar nuevos documentos. ¿Confirmás que querés generar el Resultado de Operación y cerrar?',
            )
        ) {
            return;
        }

        window.open(rutaResultadoOperacion, '_blank');
        router.reload({ only: ['embarque'] });
    };

    const verResultadoOperacion = () => {
        window.open(rutaResultadoOperacion, '_blank');
    };

    return (
        <GerenteOperativoLayout header={`Liquidación de Destino — ${embarque.numero_file}`}>
            <Head title={`Liquidación — ${embarque.numero_file}`} />

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-[#A9ABAE]">
                    Cliente: <span className="text-[#042753]">{embarque.cliente}</span>
                </p>

                {cerrada ? (
                    <button
                        onClick={verResultadoOperacion}
                        className="rounded-md border border-[#042753] px-4 py-2 text-sm font-semibold text-[#042753] hover:bg-[#042753]/5"
                    >
                        Ver Resultado de Operación (PDF)
                    </button>
                ) : (
                    <button
                        onClick={cerrarLiquidacion}
                        className="rounded-md bg-[#042753] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                    >
                        Cerrar Liquidación y Generar Resultado de Operación
                    </button>
                )}
            </div>

            {cerrada && (
                <div className="mb-6 rounded-md bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                    🔒 Liquidación cerrada el {embarque.liquidacion_cerrada_en} — Costos, Gastos de Destino y
                    la generación de nuevos documentos quedan bloqueados para este file.
                </div>
            )}

            <PanelGastos
                embarque={embarque}
                gastos={gastos}
                totalesPorMoneda={totalesPorMoneda}
                cerrada={cerrada}
            />

            <PanelDocumentos
                embarque={embarque}
                costos={costos}
                gastos={gastos}
                documentos={documentos}
                tiposDocumento={tiposDocumento}
                clientes={clientes}
                proveedores={proveedores}
                cerrada={cerrada}
            />
        </GerenteOperativoLayout>
    );
}
