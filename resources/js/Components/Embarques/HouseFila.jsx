import { IconoEditar } from '@/Components/ActionIcons';
import { IconoDocumento } from '@/Components/Embarques/SeccionIcons';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';

const TIPOS_PDF_HOUSE = [
    { valor: 'dam', etiqueta: 'HBL DAM' },
    { valor: 'copia', etiqueta: 'HBL Copia' },
    { valor: 'original', etiqueta: 'HBL Original' },
    { valor: 'original_digital', etiqueta: 'HBL Original Digital' },
    { valor: 'certificado_flete', etiqueta: 'Certificado de Flete' },
    { valor: 'certificado_flete_digital', etiqueta: 'Certificado de Flete Digital' },
];

const CONDICION_PAGO_ESTILOS = {
    Prepaid: 'bg-teal-100 text-teal-700',
    Collect: 'bg-amber-100 text-amber-700',
};

function etiquetaContenedor(contenedor) {
    return contenedor.numero_contenedor || contenedor.tipo_contenedor || `Contenedor #${contenedor.id_item}`;
}

function CondicionPagoBadge({ valor }) {
    if (!valor) {
        return <span className="text-xs text-[#A9ABAE]">—</span>;
    }

    return (
        <span
            className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                CONDICION_PAGO_ESTILOS[valor] ?? 'bg-gray-100 text-gray-700'
            }`}
        >
            {valor}
        </span>
    );
}

function ContenedorDeHouse({ contenedor }) {
    return (
        <div className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-white px-2 py-0.5 font-semibold text-[#042753] ring-1 ring-inset ring-gray-200">
                    {contenedor.tipo_contenedor ?? '—'}
                </span>
                {contenedor.numero_contenedor ? (
                    <span className="font-medium text-[#042753]">{contenedor.numero_contenedor}</span>
                ) : (
                    <span className="italic text-[#A9ABAE]">Sin número asignado</span>
                )}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-x-3 text-[#A9ABAE]">
                <span>
                    Peso: <span className="text-[#042753]">{contenedor.peso_kg ?? '—'} kg</span>
                </span>
                <span>
                    Vol: <span className="text-[#042753]">{contenedor.volumen_cbm ?? '—'} cbm</span>
                </span>
            </div>
            {contenedor.descripcion_mercancia && (
                <p className="mt-1.5 whitespace-pre-line border-t border-gray-200 pt-1.5 text-[#042753]">
                    {contenedor.descripcion_mercancia}
                </p>
            )}
        </div>
    );
}

export default function HouseFila({
    house,
    contenedoresDisponibles,
    clientes = [],
    rutaActualizar,
    rutaPdf,
    onEliminar,
}) {
    const [editando, setEditando] = useState(false);
    const congelado = Boolean(house.congelado_en);

    const { data, setData, patch, processing, errors, reset, transform } = useForm({
        id_cliente: house.id_cliente ?? '',
        condicion_pago: house.condicion_pago ?? '',
        flete_valor_texto: house.flete_valor_texto ?? '',
        fecha_emision: house.fecha_emision ?? '',
        contenedores: (house.contenedores ?? []).map((c) => c.id_item),
        // Un house puede tener varios contenedores (hijos a, b, c...) — cada
        // uno con su propia descripción/peso/volumen, editables desde acá
        // mismo en vez de tener que ir uno por uno a la lista plana. Si el
        // contenedor lo comparte otro house (ej. 2500 kg repartidos entre 2
        // consignatarios), la porción de ESTE house vive aparte — se usa si
        // ya está definida; si no, se sugiere el dato del contenedor completo
        // como punto de partida (correcto cuando nadie más lo comparte).
        contenedores_campos: contenedoresDisponibles.reduce((acc, c) => {
            const propio = (house.contenedores ?? []).find((hc) => hc.id_item === c.id_item);
            acc[c.id_item] = {
                descripcion_mercancia: propio?.descripcion_mercancia ?? c.descripcion_mercancia ?? '',
                peso_kg: propio?.peso_kg ?? c.peso_kg ?? '',
                volumen_cbm: propio?.volumen_cbm ?? c.volumen_cbm ?? '',
            };
            return acc;
        }, {}),
    });

    const toggleContenedor = (idItem) => {
        setData(
            'contenedores',
            data.contenedores.includes(idItem)
                ? data.contenedores.filter((id) => id !== idItem)
                : [...data.contenedores, idItem],
        );
    };

    const actualizarCampoContenedor = (idItem, campo, valor) => {
        setData('contenedores_campos', {
            ...data.contenedores_campos,
            [idItem]: { ...data.contenedores_campos[idItem], [campo]: valor },
        });
    };

    transform((formData) => ({
        ...formData,
        contenedores_campos: formData.contenedores.map((idItem) => ({
            id_item: idItem,
            ...(formData.contenedores_campos[idItem] ?? {}),
        })),
    }));

    const guardar = (e) => {
        e.preventDefault();

        patch(route(rutaActualizar, house.id_hbl), {
            onSuccess: () => setEditando(false),
        });
    };

    const cancelar = () => {
        reset();
        setEditando(false);
    };

    const clickEditar = () => {
        if (
            congelado &&
            !window.confirm(
                `El house ${house.numero_hbl} ya tiene su HBL Original emitido y está congelado. ¿Seguro que quieres editarlo igual?`,
            )
        ) {
            return;
        }

        setEditando(true);
    };

    const encabezado = (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/70 px-4 py-3">
            <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#71BFA6]/15 text-[#042753]">
                    <IconoDocumento className="h-4 w-4" />
                </div>
                <div>
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-[#042753]">
                        {house.numero_hbl}
                        {congelado && (
                            <span title="Congelado — HBL Original ya emitido">🔒</span>
                        )}
                    </p>
                    <p className="text-xs text-[#A9ABAE]">
                        {house.cliente ?? 'Consignatario del embarque'}
                        {house.fecha_emision && <> · Emitido {house.fecha_emision}</>}
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <div className="text-right">
                    <CondicionPagoBadge valor={house.condicion_pago} />
                    {house.flete_valor_texto && (
                        <p className="mt-0.5 text-xs text-[#A9ABAE]">{house.flete_valor_texto}</p>
                    )}
                </div>

                {rutaPdf && (
                    <select
                        className="rounded-md border-gray-300 text-xs text-[#042753] shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                        value=""
                        onChange={(e) => {
                            const tipo = e.target.value;
                            if (tipo) {
                                window.open(`${route(rutaPdf, house.id_hbl)}?tipo=${tipo}`, '_blank');
                            }
                            e.target.value = '';
                        }}
                    >
                        <option value="">PDF ▾</option>
                        {TIPOS_PDF_HOUSE.map((tipo) => (
                            <option key={tipo.valor} value={tipo.valor}>
                                {tipo.etiqueta}
                            </option>
                        ))}
                    </select>
                )}
                {rutaActualizar && !editando && (
                    <button
                        type="button"
                        onClick={clickEditar}
                        title="Editar house"
                        className="text-[#042753] hover:text-[#71BFA6]"
                    >
                        <IconoEditar className="h-4 w-4" />
                    </button>
                )}
                {onEliminar && (
                    <button
                        type="button"
                        onClick={() => onEliminar(house)}
                        className="text-xs text-red-600 hover:underline"
                    >
                        Quitar
                    </button>
                )}
            </div>
        </div>
    );

    if (editando) {
        return (
            <div className="overflow-hidden rounded-lg border border-[#71BFA6] bg-white shadow-sm">
                {encabezado}
                <form onSubmit={guardar} className="space-y-4 p-4">
                    <div className="flex flex-wrap items-end gap-3">
                        <div>
                            <label className="text-xs font-medium text-[#042753]">
                                Condición de Pago
                            </label>
                            <select
                                className="mt-1 block rounded-md border-gray-300 text-sm shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                value={data.condicion_pago}
                                onChange={(e) => setData('condicion_pago', e.target.value)}
                            >
                                <option value="">—</option>
                                <option value="Prepaid">Prepaid</option>
                                <option value="Collect">Collect</option>
                            </select>
                            {errors.condicion_pago && (
                                <p className="mt-1 text-xs text-red-600">{errors.condicion_pago}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-medium text-[#042753]">
                                Monto Flete ({data.condicion_pago || 'Prepaid/Collect'})
                            </label>
                            <input
                                type="text"
                                placeholder="Ej. AS AGREED o 37,250.00"
                                className="mt-1 block w-40 rounded-md border-gray-300 text-sm shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                value={data.flete_valor_texto}
                                onChange={(e) => setData('flete_valor_texto', e.target.value)}
                            />
                            <p className="mt-1 text-xs text-[#A9ABAE]">
                                Va en la columna "Freight &amp; Charges" del HBL.
                            </p>
                            {errors.flete_valor_texto && (
                                <p className="mt-1 text-xs text-red-600">{errors.flete_valor_texto}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-medium text-[#042753]">
                                Fecha de Emisión
                            </label>
                            <input
                                type="date"
                                className="mt-1 block rounded-md border-gray-300 text-sm shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                value={data.fecha_emision}
                                onChange={(e) => setData('fecha_emision', e.target.value)}
                            />
                            {errors.fecha_emision && (
                                <p className="mt-1 text-xs text-red-600">{errors.fecha_emision}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-medium text-[#042753]">
                                Cliente / Consignee
                            </label>
                            <select
                                className="mt-1 block min-w-[220px] rounded-md border-gray-300 text-sm shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                value={data.id_cliente}
                                onChange={(e) => setData('id_cliente', e.target.value)}
                            >
                                <option value="">
                                    Usar el consignatario del embarque (por defecto)
                                </option>
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
                    </div>

                    {congelado && (
                        <p className="rounded-md bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                            🔒 Este house ya tiene su HBL Original emitido. La información está
                            congelada — solo Gerente Operativo puede seguir editándola.
                        </p>
                    )}

                    <div>
                        <label className="text-xs font-medium text-[#042753]">
                            Contenedores de este House
                        </label>
                        {contenedoresDisponibles.length === 0 ? (
                            <p className="mt-1 text-xs text-[#A9ABAE]">
                                Todavía no hay contenedores cargados en este embarque.
                            </p>
                        ) : (
                            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {contenedoresDisponibles.map((contenedor) => {
                                    const marcado = data.contenedores.includes(contenedor.id_item);
                                    const campos = data.contenedores_campos[contenedor.id_item] ?? {
                                        descripcion_mercancia: '',
                                        peso_kg: '',
                                        volumen_cbm: '',
                                    };

                                    return (
                                        <div
                                            key={contenedor.id_item}
                                            className={`rounded-md border p-2.5 transition-colors ${
                                                marcado
                                                    ? 'border-[#71BFA6] bg-[#71BFA6]/5'
                                                    : 'border-gray-200'
                                            }`}
                                        >
                                            <label className="flex items-center gap-2 text-xs font-semibold text-[#042753]">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-[#71BFA6] focus:ring-[#71BFA6]"
                                                    checked={marcado}
                                                    onChange={() => toggleContenedor(contenedor.id_item)}
                                                />
                                                <span className="inline-flex items-center rounded-full bg-white px-2 py-0.5 ring-1 ring-inset ring-gray-200">
                                                    {contenedor.tipo_contenedor ?? '—'}
                                                </span>
                                                {etiquetaContenedor(contenedor)}
                                            </label>

                                            {marcado && (
                                                <div className="mt-2.5 space-y-2 pl-6">
                                                    <p className="text-xs text-[#A9ABAE]">
                                                        Contenedor completo: {contenedor.peso_kg ?? '—'} kg ·{' '}
                                                        {contenedor.volumen_cbm ?? '—'} cbm — si lo comparte
                                                        otro house, poné acá solo la porción de este house.
                                                    </p>
                                                    <div className="flex flex-wrap items-end gap-2">
                                                        <div>
                                                            <label className="text-xs text-[#A9ABAE]">
                                                                Peso (kg)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                className="mt-1 block w-24 rounded-md border-gray-300 text-sm shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                                                value={campos.peso_kg}
                                                                onChange={(e) =>
                                                                    actualizarCampoContenedor(
                                                                        contenedor.id_item,
                                                                        'peso_kg',
                                                                        e.target.value,
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-[#A9ABAE]">
                                                                Volumen (cbm)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                step="0.001"
                                                                className="mt-1 block w-24 rounded-md border-gray-300 text-sm shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                                                value={campos.volumen_cbm}
                                                                onChange={(e) =>
                                                                    actualizarCampoContenedor(
                                                                        contenedor.id_item,
                                                                        'volumen_cbm',
                                                                        e.target.value,
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-[#A9ABAE]">
                                                            Descripción de Mercancía
                                                        </label>
                                                        <textarea
                                                            rows={2}
                                                            className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                                            value={campos.descripcion_mercancia}
                                                            onChange={(e) =>
                                                                actualizarCampoContenedor(
                                                                    contenedor.id_item,
                                                                    'descripcion_mercancia',
                                                                    e.target.value,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-md bg-[#71BFA6] px-4 py-2 text-sm font-semibold text-[#042753] hover:opacity-90 disabled:opacity-50"
                        >
                            Guardar
                        </button>
                        <button
                            type="button"
                            onClick={cancelar}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-[#042753] hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
            {encabezado}
            <div className="p-4">
                {house.contenedores && house.contenedores.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {house.contenedores.map((contenedor) => (
                            <ContenedorDeHouse key={contenedor.id_item} contenedor={contenedor} />
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-[#A9ABAE]">
                        Este house todavía no tiene contenedores asignados.
                    </p>
                )}
            </div>
        </div>
    );
}
