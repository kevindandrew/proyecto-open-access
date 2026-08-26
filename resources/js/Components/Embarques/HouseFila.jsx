import { IconoEditar } from '@/Components/ActionIcons';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';

const TIPOS_PDF_HOUSE = [
    { valor: 'dam', etiqueta: 'HBL DAM' },
    { valor: 'copia', etiqueta: 'HBL Copia' },
    { valor: 'original', etiqueta: 'HBL Original' },
    { valor: 'certificado_flete', etiqueta: 'Certificado de Flete' },
];

function etiquetaContenedor(contenedor) {
    return contenedor.numero_contenedor || contenedor.tipo_contenedor || `Contenedor #${contenedor.id_item}`;
}

export default function HouseFila({
    house,
    contenedoresDisponibles,
    clientes = [],
    rutaActualizar,
    rutaPdf,
    onEliminar,
    colSpan,
}) {
    const [editando, setEditando] = useState(false);
    const congelado = Boolean(house.congelado_en);

    const { data, setData, patch, processing, errors, reset, transform } = useForm({
        id_cliente: house.id_cliente ?? '',
        condicion_pago: house.condicion_pago ?? '',
        fecha_emision: house.fecha_emision ?? '',
        contenedores: (house.contenedores ?? []).map((c) => c.id_item),
        // Un house puede tener varios contenedores (hijos a, b, c...) — cada
        // uno con su propia descripción/peso/volumen, editables desde acá
        // mismo en vez de tener que ir uno por uno a la lista plana.
        contenedores_campos: contenedoresDisponibles.reduce((acc, c) => {
            acc[c.id_item] = {
                descripcion_mercancia: c.descripcion_mercancia ?? '',
                peso_kg: c.peso_kg ?? '',
                volumen_cbm: c.volumen_cbm ?? '',
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

    if (editando) {
        return (
            <tr>
                <td colSpan={colSpan} className="px-3 py-3">
                    <form
                        onSubmit={guardar}
                        className="space-y-3 rounded-md border border-[#71BFA6] bg-white p-3"
                    >
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
                                <p className="mt-1 text-xs text-[#A9ABAE]">
                                    Define quién aparece como consignatario en el HBL de este house.
                                </p>
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
                                <div className="mt-1 space-y-2">
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
                                                className="rounded-md border border-gray-200 p-2"
                                            >
                                                <label className="flex items-center gap-1.5 text-xs font-medium text-[#042753]">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-gray-300 text-[#71BFA6] focus:ring-[#71BFA6]"
                                                        checked={marcado}
                                                        onChange={() => toggleContenedor(contenedor.id_item)}
                                                    />
                                                    {etiquetaContenedor(contenedor)}
                                                </label>

                                                {marcado && (
                                                    <div className="mt-2 flex flex-wrap items-end gap-2 pl-5">
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
                                                        <div className="min-w-[220px] flex-1">
                                                            <label className="text-xs text-[#A9ABAE]">
                                                                Descripción de Mercancía
                                                            </label>
                                                            <input
                                                                type="text"
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
                </td>
            </tr>
        );
    }

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

    return (
        <tr>
            <td className="px-3 py-2 font-medium text-[#042753]">
                {house.numero_hbl}
                {congelado && (
                    <span title="Congelado — HBL Original ya emitido" className="ml-1">
                        🔒
                    </span>
                )}
            </td>
            <td className="px-3 py-2 text-[#042753]">
                {house.contenedores && house.contenedores.length > 0
                    ? house.contenedores.map(etiquetaContenedor).join(', ')
                    : '—'}
            </td>
            <td className="px-3 py-2 text-[#042753]">{house.cliente ?? '—'}</td>
            <td className="px-3 py-2">{house.condicion_pago ?? '—'}</td>
            <td className="px-3 py-2">{house.fecha_emision ?? '—'}</td>
            {(rutaActualizar || rutaPdf || onEliminar) && (
                <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-3">
                        {rutaPdf && (
                            <select
                                className="rounded-md border-gray-300 text-xs text-[#042753] shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                value=""
                                onChange={(e) => {
                                    const tipo = e.target.value;
                                    if (tipo) {
                                        window.open(
                                            `${route(rutaPdf, house.id_hbl)}?tipo=${tipo}`,
                                            '_blank',
                                        );
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
                        {rutaActualizar && (
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
                                className="text-red-600 hover:underline"
                            >
                                Quitar
                            </button>
                        )}
                    </div>
                </td>
            )}
        </tr>
    );
}
