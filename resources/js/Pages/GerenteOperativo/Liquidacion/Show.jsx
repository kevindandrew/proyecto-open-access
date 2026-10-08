import SeccionCard, { EstadoVacio } from '@/Components/Embarques/SeccionCard';
import { IconoCostos } from '@/Components/Embarques/SeccionIcons';
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

    const monedasPresentes = Object.keys(totalesPorMoneda);

    return (
        <SeccionCard icon={IconoCostos} title="Gastos de Destino">
            {gastos.length === 0 ? (
                <EstadoVacio
                    icon={IconoCostos}
                    mensaje="Todavía no hay gastos de destino cargados para este embarque."
                />
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead>
                            <tr>
                                <th className="px-3 py-2 text-left font-semibold text-[#042753]">Concepto</th>
                                <th className="px-3 py-2 text-right font-semibold text-[#042753]">Monto</th>
                                <th className="px-3 py-2 text-left font-semibold text-[#042753]">Moneda</th>
                                <th className="px-3 py-2 text-left font-semibold text-[#042753]">Estado</th>
                                <th className="px-3 py-2"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {gastos.map((gasto) => (
                                <tr key={gasto.id_gasto}>
                                    <td className="px-3 py-2">{gasto.concepto}</td>
                                    <td className="px-3 py-2 text-right">{gasto.monto}</td>
                                    <td className="px-3 py-2">{gasto.moneda}</td>
                                    <td className="px-3 py-2">
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
                                    <td className="px-3 py-2 text-right">
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
                        </tbody>
                        <tfoot>
                            {monedasPresentes.map((moneda, index) => (
                                <tr
                                    key={moneda}
                                    className={index === 0 ? 'border-t-2 border-gray-200' : 'border-t border-gray-200'}
                                >
                                    <td className="px-3 py-2 text-right font-semibold text-[#042753]">
                                        Total ({moneda})
                                    </td>
                                    <td className="px-3 py-2 text-right font-medium text-[#042753]">
                                        {totalesPorMoneda[moneda]}
                                    </td>
                                    <td colSpan={3}></td>
                                </tr>
                            ))}
                        </tfoot>
                    </table>
                </div>
            )}

            {!cerrada && (
                <form onSubmit={submit} className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                    <div className="flex flex-wrap items-end gap-3">
                        <div>
                            <label className="text-xs font-medium text-[#042753]">Concepto</label>
                            <select
                                className="mt-1 block rounded-md border-gray-300 text-sm shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                value={data.concepto}
                                onChange={(e) => setData('concepto', e.target.value)}
                            >
                                {CONCEPTOS.map((concepto) => (
                                    <option key={concepto} value={concepto}>
                                        {concepto}
                                    </option>
                                ))}
                            </select>
                            {errors.concepto && <p className="mt-1 text-xs text-red-600">{errors.concepto}</p>}
                        </div>

                        <div>
                            <label className="text-xs font-medium text-[#042753]">Monto</label>
                            <input
                                type="number"
                                step="0.01"
                                className="mt-1 block w-28 rounded-md border-gray-300 text-sm shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                value={data.monto}
                                onChange={(e) => setData('monto', e.target.value)}
                            />
                            {errors.monto && <p className="mt-1 text-xs text-red-600">{errors.monto}</p>}
                        </div>

                        <div>
                            <label className="text-xs font-medium text-[#042753]">Moneda</label>
                            <select
                                className="mt-1 block rounded-md border-gray-300 text-sm shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                value={data.moneda}
                                onChange={(e) => setData('moneda', e.target.value)}
                            >
                                {MONEDAS.map((m) => (
                                    <option key={m.valor} value={m.valor}>
                                        {m.valor}
                                    </option>
                                ))}
                            </select>
                            {errors.moneda && <p className="mt-1 text-xs text-red-600">{errors.moneda}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-md bg-[#71BFA6] px-4 py-2 text-sm font-semibold text-[#042753] hover:opacity-90 disabled:opacity-50"
                        >
                            + Agregar Gasto
                        </button>
                    </div>
                </form>
            )}
        </SeccionCard>
    );
}

function ListaDocumentos({ titulo, documentos, columnaContraparte, vacio, onAbrirPdf }) {
    return (
        <div>
            <h3 className="mb-2 text-sm font-semibold text-[#042753]">{titulo}</h3>
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead>
                        <tr>
                            <th className="px-3 py-2 text-left font-semibold text-[#042753]">N°</th>
                            <th className="px-3 py-2 text-left font-semibold text-[#042753]">Tipo</th>
                            <th className="px-3 py-2 text-left font-semibold text-[#042753]">{columnaContraparte}</th>
                            <th className="px-3 py-2 text-left font-semibold text-[#042753]">Fecha</th>
                            <th className="px-3 py-2 text-right font-semibold text-[#042753]">Monto</th>
                            <th className="px-3 py-2"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {documentos.map((documento) => (
                            <tr key={documento.id_documento}>
                                <td className="px-3 py-2 font-medium text-[#042753]">
                                    {documento.numero_factura ?? documento.numero}
                                    {documento.numero_factura && (
                                        <span className="block text-xs font-normal text-[#A9ABAE]">
                                            Reg. {documento.numero}
                                        </span>
                                    )}
                                </td>
                                <td className="px-3 py-2">
                                    {documento.etiqueta}
                                    {documento.house && (
                                        <span className="block text-xs text-[#A9ABAE]">House {documento.house}</span>
                                    )}
                                    {documento.anulada_por && (
                                        <span className="mt-0.5 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-500">
                                            Anulada por {documento.anulada_por}
                                        </span>
                                    )}
                                </td>
                                <td className="px-3 py-2">{documento.contraparte ?? '—'}</td>
                                <td className="px-3 py-2">{documento.fecha}</td>
                                <td
                                    className={`px-3 py-2 text-right font-medium text-[#042753] ${documento.anulada_por ? 'line-through opacity-50' : ''}`}
                                >
                                    {documento.monto} {documento.moneda}
                                    {documento.moneda_origen && (
                                        <span className="block text-xs font-normal text-[#A9ABAE]">
                                            {documento.monto_origen} {documento.moneda_origen} × T/C {documento.tipo_cambio}
                                        </span>
                                    )}
                                </td>
                                <td className="px-3 py-2 text-right">
                                    {documento.tiene_pdf ? (
                                        <button
                                            onClick={() => onAbrirPdf(documento)}
                                            className="text-sm font-medium text-[#71BFA6] hover:underline"
                                        >
                                            PDF
                                        </button>
                                    ) : (
                                        <span className="text-xs text-[#A9ABAE]">Registrada</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {documentos.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-3 py-6 text-center text-[#A9ABAE]">
                                    {vacio}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function PanelComision({ embarque, comision, cerrada }) {
    const { data, setData, patch, processing, errors } = useForm({
        porcentaje_comision: comision.porcentaje_manual ?? '',
    });

    const vigente = comision.porcentaje_manual ?? comision.porcentaje_categoria;

    const guardar = (e) => {
        e.preventDefault();
        patch(route('gerente-operativo.embarques.liquidacion.comision', embarque.id_embarque), {
            preserveScroll: true,
        });
    };

    return (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div>
                <h3 className="text-sm font-semibold text-[#042753]">Comisión del comercial</h3>
                <p className="mt-1 text-sm text-[#042753]">
                    {comision.comercial ?? 'Sin comercial asignado'}
                    {comision.categoria && (
                        <span className="text-[#A9ABAE]">
                            {' '}
                            · {comision.categoria} ({comision.porcentaje_categoria}%)
                        </span>
                    )}
                </p>
                <p className="mt-1 text-xs text-[#A9ABAE]">
                    % que se usa en el Resultado de Operación:{' '}
                    <span className="font-semibold text-[#042753]">{vigente ?? 0}%</span>
                    {comision.porcentaje_manual != null ? ' (ajustado a mano para este file)' : ' (de la categoría)'}
                </p>
            </div>

            {!cerrada && (
                <form onSubmit={guardar} className="flex items-end gap-2">
                    <div>
                        <label className="text-xs font-medium text-[#042753]">Ajustar % para este file</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            placeholder={comision.porcentaje_categoria ?? '0'}
                            className="mt-1 block w-28 rounded-md border-gray-300 text-sm shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                            value={data.porcentaje_comision}
                            onChange={(e) => setData('porcentaje_comision', e.target.value)}
                        />
                        {errors.porcentaje_comision && (
                            <p className="mt-1 text-xs text-red-600">{errors.porcentaje_comision}</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-md bg-[#71BFA6] px-3 py-2 text-sm font-semibold text-[#042753] hover:opacity-90 disabled:opacity-50"
                    >
                        Guardar
                    </button>
                </form>
            )}
        </div>
    );
}

function PanelDocumentos({ embarque, costos, gastos, documentos, tiposDocumento, alcancesCobro, proveedores, cerrada }) {
    const [seleccion, setSeleccion] = useState(new Set());

    const { data, setData, post, processing, errors, reset, transform } = useForm({
        tipo: '',
        // Cobros: '' = por MBL, o el id_hbl del house.
        id_hbl: '',
        destinatario: 'cliente',
        // Cobros: '' = misma moneda que las líneas elegidas.
        moneda: '',
        // Solo Factura: el N° emitido en el sistema de facturación externo.
        numero_factura: '',
        // Cobros: permite volver a cobrar líneas ya cobradas en otra nota.
        cobro_extra: false,
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

    // Lo que el usuario editó a mano en cada línea seleccionada (descripción,
    // datos del documento del proveedor y monto), por clave de línea.
    const [detalles, setDetalles] = useState({});

    const setDetalle = (clave, campo, valor) => {
        setDetalles((actual) => ({ ...actual, [clave]: { ...actual[clave], [campo]: valor } }));
    };

    const categoria = data.tipo ? tiposDocumento[data.tipo]?.categoria : null;

    const alcanceActual = alcancesCobro.find((alcance) => String(alcance.id_hbl ?? '') === data.id_hbl);
    const destinatarios = alcanceActual?.destinatarios ?? [];

    const cambiarAlcance = (idHbl) => {
        const alcance = alcancesCobro.find((a) => String(a.id_hbl ?? '') === idHbl);
        const claves = (alcance?.destinatarios ?? []).map((d) => d.clave);

        setData((actual) => ({
            ...actual,
            id_hbl: idHbl,
            destinatario: claves.includes(actual.destinatario) ? actual.destinatario : (claves[0] ?? ''),
        }));
    };

    const monedasOrigen = useMemo(() => {
        const monedas = new Set();
        for (const costo of costos) {
            if (seleccion.has(claveLinea('costo', costo.id_costo))) monedas.add(costo.moneda);
        }
        for (const gasto of gastos) {
            if (seleccion.has(claveLinea('gasto', gasto.id_gasto))) monedas.add(gasto.moneda);
        }
        return [...monedas];
    }, [seleccion, costos, gastos]);

    // Los cobros se pueden emitir en otra moneda: los montos de origen se
    // convierten con el T/C (1 moneda de origen = T/C moneda del documento).
    const monedaOrigen = monedasOrigen.length === 1 ? monedasOrigen[0] : null;
    const monedaDocumento = categoria === 'cobro' ? data.moneda || monedaOrigen : monedaOrigen;
    const convierte = categoria === 'cobro' && monedaOrigen && monedaDocumento !== monedaOrigen;
    const factor = convierte ? parseFloat(data.tipo_cambio) || 0 : 1;

    const lineasSeleccionadas = useMemo(() => {
        const resultado = [];

        for (const costo of costos) {
            const clave = claveLinea('costo', costo.id_costo);
            if (seleccion.has(clave)) {
                resultado.push({
                    clave,
                    tipo_origen: 'costo',
                    id_origen: costo.id_costo,
                    moneda: costo.moneda,
                    descripcion: costo.concepto,
                    monto_origen: (categoria === 'cobro' ? costo.costo_venta : costo.costo_compra) ?? '',
                });
            }
        }

        for (const gasto of gastos) {
            const clave = claveLinea('gasto', gasto.id_gasto);
            if (seleccion.has(clave)) {
                resultado.push({
                    clave,
                    tipo_origen: 'gasto',
                    id_origen: gasto.id_gasto,
                    moneda: gasto.moneda,
                    descripcion: gasto.concepto,
                    monto_origen: gasto.monto ?? '',
                });
            }
        }

        return resultado.map((linea) => {
            const convertido =
                linea.monto_origen === '' ? '' : ((parseFloat(linea.monto_origen) || 0) * factor).toFixed(2);

            const conDetalle = {
                tipo_documento: '',
                numero_documento: '',
                fecha_documento: '',
                ...linea,
                monto: convertido,
                cantidad: '1',
                precio_unitario: convertido,
                ...detalles[linea.clave],
            };

            // En cobros el total de la línea es Cant × Unitario.
            if (categoria === 'cobro') {
                conDetalle.monto = (
                    (parseFloat(conDetalle.cantidad) || 0) * (parseFloat(conDetalle.precio_unitario) || 0)
                ).toFixed(2);
            }

            return conDetalle;
        });
    }, [seleccion, costos, gastos, categoria, detalles, factor]);

    const monedasSeleccionadas = monedasOrigen;

    // La Orden de Pago (-) se carga en positivo y el backend la registra en negativo.
    const enNegativo = data.tipo === 'orden_pago_negativa';

    const totalSeleccionado = (
        lineasSeleccionadas.reduce((total, linea) => total + Math.abs(parseFloat(linea.monto) || 0), 0) *
        (enNegativo ? -1 : 1)
    ).toFixed(2);

    const puedeGenerar =
        data.tipo &&
        lineasSeleccionadas.length > 0 &&
        monedasSeleccionadas.length === 1 &&
        (!convierte || factor > 0) &&
        !cerrada;

    const submit = (e) => {
        e.preventDefault();

        transform((formData) => ({
            ...formData,
            id_hbl: formData.id_hbl === '' ? null : formData.id_hbl,
            moneda: formData.moneda || null,
            lineas: lineasSeleccionadas.map(({ clave, moneda, monto_origen, ...linea }) =>
                categoria === 'pago'
                    ? linea
                    : {
                          tipo_origen: linea.tipo_origen,
                          id_origen: linea.id_origen,
                          descripcion: linea.descripcion,
                          cantidad: linea.cantidad,
                          precio_unitario: linea.precio_unitario,
                      },
            ),
        }));

        post(route('gerente-operativo.documentos-liquidacion.store', embarque.id_embarque), {
            onSuccess: () => {
                setSeleccion(new Set());
                setDetalles({});
                reset('tipo', 'observaciones', 'numero_factura', 'cobro_extra');
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
                                onChange={(e) =>
                                    // La Factura se emite en Bs (al T/C del día) aunque se cobre en USD.
                                    setData((actual) => ({
                                        ...actual,
                                        tipo: e.target.value,
                                        moneda: e.target.value === 'factura' ? 'BOB' : actual.moneda,
                                    }))
                                }
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
                            <>
                                {data.tipo === 'factura' && (
                                    <div>
                                        <label className={labelClass}>N° de Factura</label>
                                        <input
                                            type="text"
                                            placeholder="Emitida en el sistema de facturación"
                                            className={inputClass}
                                            value={data.numero_factura}
                                            onChange={(e) => setData('numero_factura', e.target.value)}
                                        />
                                        {errors.numero_factura && (
                                            <p className="mt-1 text-xs text-red-600">{errors.numero_factura}</p>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <label className={labelClass}>Emitir por</label>
                                    <select
                                        className={inputClass}
                                        value={data.id_hbl}
                                        onChange={(e) => cambiarAlcance(e.target.value)}
                                    >
                                        {alcancesCobro.map((alcance) => (
                                            <option key={alcance.id_hbl ?? 'mbl'} value={alcance.id_hbl ?? ''}>
                                                {alcance.etiqueta}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.id_hbl && <p className="mt-1 text-xs text-red-600">{errors.id_hbl}</p>}
                                </div>

                                <div>
                                    <label className={labelClass}>Cobrar a</label>
                                    <select
                                        className={inputClass}
                                        value={data.destinatario}
                                        onChange={(e) => setData('destinatario', e.target.value)}
                                    >
                                        {destinatarios.length === 0 && <option value="">—</option>}
                                        {destinatarios.map((destinatario) => (
                                            <option key={destinatario.clave} value={destinatario.clave}>
                                                {destinatario.etiqueta}: {destinatario.nombre}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.destinatario && (
                                        <p className="mt-1 text-xs text-red-600">{errors.destinatario}</p>
                                    )}
                                </div>

                                <div>
                                    <label className={labelClass}>Moneda del documento</label>
                                    <select
                                        className={inputClass}
                                        value={data.moneda || monedaOrigen || ''}
                                        onChange={(e) => setData('moneda', e.target.value)}
                                    >
                                        {!monedaOrigen && !data.moneda && <option value="">—</option>}
                                        {MONEDAS.map((m) => (
                                            <option key={m.valor} value={m.valor}>
                                                {m.etiqueta}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.moneda && <p className="mt-1 text-xs text-red-600">{errors.moneda}</p>}
                                </div>

                                <label className="flex items-start gap-2 text-sm text-[#042753] md:col-span-3">
                                    <input
                                        type="checkbox"
                                        className="mt-0.5 rounded border-gray-300 text-[#71BFA6] focus:ring-[#71BFA6]"
                                        checked={data.cobro_extra}
                                        onChange={(e) => setData('cobro_extra', e.target.checked)}
                                    />
                                    <span>
                                        Cobro extra
                                        <span className="block text-xs text-[#A9ABAE]">
                                            Permite cobrar líneas que ya se cobraron en otra nota (un extra al
                                            cliente o al agente). Suma como ingreso en el Resultado de Operación.
                                        </span>
                                    </span>
                                </label>
                            </>
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
                            <input
                                type="text"
                                list="condiciones-pago"
                                maxLength={50}
                                className={inputClass}
                                value={data.condicion_pago}
                                onChange={(e) => setData('condicion_pago', e.target.value)}
                            />
                            <datalist id="condiciones-pago">
                                <option value="Al Contado" />
                                <option value="Crédito" />
                                <option value="15 días" />
                                <option value="20 días" />
                                <option value="30 días" />
                            </datalist>
                            {errors.condicion_pago && (
                                <p className="mt-1 text-xs text-red-600">{errors.condicion_pago}</p>
                            )}
                        </div>

                        <div>
                            <label className={labelClass}>
                                {convierte ? `T/C (1 ${monedaOrigen} = ? ${monedaDocumento})` : 'T/C (opcional)'}
                            </label>
                            <input
                                type="number"
                                step="0.0001"
                                required={convierte}
                                className={inputClass}
                                value={data.tipo_cambio}
                                onChange={(e) => setData('tipo_cambio', e.target.value)}
                            />
                            {errors.tipo_cambio && (
                                <p className="mt-1 text-xs text-red-600">{errors.tipo_cambio}</p>
                            )}
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

                        {categoria === 'pago' && lineasSeleccionadas.length > 0 && (
                            <div className="md:col-span-3">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#71BFA6]">
                                    Detalle de la Orden de Pago
                                </p>
                                {enNegativo && (
                                    <p className="mb-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
                                        Cargá los montos en positivo, como figuran en el documento del agente — la
                                        Orden de Pago (-) los registra en negativo.
                                    </p>
                                )}
                                <div className="overflow-x-auto rounded-md border border-gray-100">
                                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                                        <thead>
                                            <tr>
                                                <th className="px-3 py-2 text-left font-semibold text-[#042753]">
                                                    Descripción
                                                </th>
                                                <th className="px-3 py-2 text-left font-semibold text-[#042753]">
                                                    Tipo de Documento
                                                </th>
                                                <th className="px-3 py-2 text-left font-semibold text-[#042753]">
                                                    Moneda
                                                </th>
                                                <th className="px-3 py-2 text-left font-semibold text-[#042753]">
                                                    N° Documento
                                                </th>
                                                <th className="px-3 py-2 text-left font-semibold text-[#042753]">
                                                    Fecha Emisión
                                                </th>
                                                <th className="px-3 py-2 text-right font-semibold text-[#042753]">
                                                    Monto
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {lineasSeleccionadas.map((linea, index) => (
                                                <tr key={linea.clave}>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="text"
                                                            className="block w-full min-w-40 rounded-md border-gray-300 text-sm shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                                            value={linea.descripcion}
                                                            onChange={(e) =>
                                                                setDetalle(linea.clave, 'descripcion', e.target.value)
                                                            }
                                                        />
                                                        {errors[`lineas.${index}.descripcion`] && (
                                                            <p className="mt-1 text-xs text-red-600">
                                                                {errors[`lineas.${index}.descripcion`]}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="text"
                                                            list="tipos-documento-proveedor"
                                                            placeholder="Ej. Debit Note"
                                                            className="block w-full min-w-32 rounded-md border-gray-300 text-sm shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                                            value={linea.tipo_documento}
                                                            onChange={(e) =>
                                                                setDetalle(linea.clave, 'tipo_documento', e.target.value)
                                                            }
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2 text-[#042753]">{linea.moneda}</td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="text"
                                                            className="block w-full min-w-32 rounded-md border-gray-300 text-sm shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                                            value={linea.numero_documento}
                                                            onChange={(e) =>
                                                                setDetalle(linea.clave, 'numero_documento', e.target.value)
                                                            }
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="date"
                                                            className="block rounded-md border-gray-300 text-sm shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                                            value={linea.fecha_documento}
                                                            onChange={(e) =>
                                                                setDetalle(linea.clave, 'fecha_documento', e.target.value)
                                                            }
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            className="ml-auto block w-28 rounded-md border-gray-300 text-right text-sm shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                                            value={linea.monto}
                                                            onChange={(e) =>
                                                                setDetalle(linea.clave, 'monto', e.target.value)
                                                            }
                                                        />
                                                        {errors[`lineas.${index}.monto`] && (
                                                            <p className="mt-1 text-xs text-red-600">
                                                                {errors[`lineas.${index}.monto`]}
                                                            </p>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="border-t-2 border-gray-200">
                                                <td colSpan={5} className="px-3 py-2 text-right font-semibold text-[#042753]">
                                                    Total ({monedasSeleccionadas.join(', ')})
                                                </td>
                                                <td className="px-3 py-2 text-right font-semibold text-[#042753]">
                                                    {totalSeleccionado}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                                <datalist id="tipos-documento-proveedor">
                                    <option value="Credit Note" />
                                    <option value="Debit Note" />
                                    <option value="Factura" />
                                    <option value="Invoice" />
                                    <option value="Nota de Crédito" />
                                    <option value="Nota de Débito" />
                                    <option value="Recibo" />
                                    <option value="Fact. s/der. CF" />
                                </datalist>
                            </div>
                        )}

                        {categoria === 'cobro' && lineasSeleccionadas.length > 0 && (
                            <div className="md:col-span-3">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#71BFA6]">
                                    Detalle de la Nota
                                </p>
                                <div className="overflow-x-auto rounded-md border border-gray-100">
                                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                                        <thead>
                                            <tr>
                                                <th className="px-3 py-2 text-left font-semibold text-[#042753]">
                                                    Cant.
                                                </th>
                                                <th className="px-3 py-2 text-left font-semibold text-[#042753]">
                                                    Descripción
                                                </th>
                                                {convierte && (
                                                    <th className="px-3 py-2 text-right font-semibold text-[#042753]">
                                                        Original ({monedaOrigen})
                                                    </th>
                                                )}
                                                <th className="px-3 py-2 text-right font-semibold text-[#042753]">
                                                    Unitario ({monedaDocumento})
                                                </th>
                                                <th className="px-3 py-2 text-right font-semibold text-[#042753]">
                                                    Total
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {lineasSeleccionadas.map((linea, index) => (
                                                <tr key={linea.clave}>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0.01"
                                                            className="block w-20 rounded-md border-gray-300 text-sm shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                                            value={linea.cantidad}
                                                            onChange={(e) =>
                                                                setDetalle(linea.clave, 'cantidad', e.target.value)
                                                            }
                                                        />
                                                        {errors[`lineas.${index}.cantidad`] && (
                                                            <p className="mt-1 text-xs text-red-600">
                                                                {errors[`lineas.${index}.cantidad`]}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="text"
                                                            className="block w-full min-w-40 rounded-md border-gray-300 text-sm shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                                            value={linea.descripcion}
                                                            onChange={(e) =>
                                                                setDetalle(linea.clave, 'descripcion', e.target.value)
                                                            }
                                                        />
                                                    </td>
                                                    {convierte && (
                                                        <td className="px-3 py-2 text-right text-[#A9ABAE]">
                                                            {linea.monto_origen}
                                                        </td>
                                                    )}
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            className="ml-auto block w-32 rounded-md border-gray-300 text-right text-sm shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                                            value={linea.precio_unitario}
                                                            onChange={(e) =>
                                                                setDetalle(linea.clave, 'precio_unitario', e.target.value)
                                                            }
                                                        />
                                                        {errors[`lineas.${index}.precio_unitario`] && (
                                                            <p className="mt-1 text-xs text-red-600">
                                                                {errors[`lineas.${index}.precio_unitario`]}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 text-right font-medium text-[#042753]">
                                                        {linea.monto}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="border-t-2 border-gray-200">
                                                <td
                                                    colSpan={convierte ? 4 : 3}
                                                    className="px-3 py-2 text-right font-semibold text-[#042753]"
                                                >
                                                    Total ({monedaDocumento})
                                                </td>
                                                <td className="px-3 py-2 text-right font-semibold text-[#042753]">
                                                    {totalSeleccionado}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                                {convierte && !(factor > 0) && (
                                    <p className="mt-2 text-xs text-amber-700">
                                        Ingresá el T/C para convertir los montos a {monedaDocumento}.
                                    </p>
                                )}
                            </div>
                        )}

                        {errors.lineas && (
                            <p className="text-xs text-red-600 md:col-span-3">{errors.lineas}</p>
                        )}

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

            <ListaDocumentos
                titulo="Documentos de Pago"
                documentos={documentosPago}
                columnaContraparte="Pagado a"
                vacio="Sin documentos de pago generados."
                onAbrirPdf={abrirPdf}
            />

            <ListaDocumentos
                titulo="Documentos de Cobro"
                documentos={documentosCobro}
                columnaContraparte="Cobrado a"
                vacio="Sin documentos de cobro generados."
                onAbrirPdf={abrirPdf}
            />
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
    alcancesCobro,
    proveedores,
    comision,
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

            <PanelComision embarque={embarque} comision={comision} cerrada={cerrada} />

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
                alcancesCobro={alcancesCobro}
                proveedores={proveedores}
                cerrada={cerrada}
            />
        </GerenteOperativoLayout>
    );
}
