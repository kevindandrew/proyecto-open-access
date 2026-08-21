import AyudaTermino from '@/Components/AyudaTermino';
import { INCOTERMS_INFO, TIPO_CONTENEDOR_INFO } from '@/constants/glosario';
import { MONEDAS } from '@/constants/monedas';
import { bloquearNotacionCientifica } from '@/utils/inputNumerico';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';

const PASOS = ['Cliente', 'Ruta y Transporte', 'Carga', 'Costos y Resumen'];
const INCOTERMS = ['FOB', 'EXW', 'CIF', 'CFR', 'DDP'];

const TIPO_PUERTO_POR_MODO = {
    Maritimo: 'Puerto',
    Aereo: 'Aeropuerto',
    Terrestre: 'Frontera',
};

// El Destino se filtra igual que el Origen para Marítimo/Aéreo, porque el tramo
// internacional siempre termina en un puerto/aeropuerto real (nunca llega
// directo a La Paz). Terrestre no tiene entrada acá a propósito: ese es el
// único tramo que sí termina en el destino final real, de cualquier tipo.
const TIPO_PUERTO_DESTINO_POR_MODO = {
    Maritimo: 'Puerto',
    Aereo: 'Aeropuerto',
};

const TIPOS_EMBARQUE = [
    { valor: 'IMPO', etiqueta: 'Importación' },
    { valor: 'EXPO', etiqueta: 'Exportación' },
    { valor: 'DOM', etiqueta: 'Doméstico' },
];

function fechaValidezPorDefecto() {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 15);
    return fecha.toISOString().slice(0, 10);
}

const inputClass =
    'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]';
const labelClass = 'text-sm font-medium text-[#042753]';

function ProgresoWizard({ paso }) {
    return (
        <div className="mb-6 flex items-center">
            {PASOS.map((label, index) => {
                const numero = index + 1;
                const activo = numero <= paso;

                return (
                    <div key={label} className="flex flex-1 items-center">
                        <div className="flex flex-col items-center">
                            <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                                    activo
                                        ? 'bg-[#71BFA6] text-[#042753]'
                                        : 'bg-gray-200 text-[#A9ABAE]'
                                }`}
                            >
                                {numero}
                            </div>
                            <p
                                className={`mt-1 text-xs ${
                                    activo
                                        ? 'font-medium text-[#042753]'
                                        : 'text-[#A9ABAE]'
                                }`}
                            >
                                {label}
                            </p>
                        </div>
                        {index < PASOS.length - 1 && (
                            <div
                                className={`mx-2 h-0.5 flex-1 ${
                                    numero < paso ? 'bg-[#71BFA6]' : 'bg-gray-200'
                                }`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function CampoError({ mensaje }) {
    return mensaje ? (
        <p className="mt-1 text-sm text-red-600">{mensaje}</p>
    ) : null;
}

function PasoCliente({ data, setData, errors, clearErrors, rutaBuscarCliente }) {
    const [busqueda, setBusqueda] = useState(data.cliente_nombre ?? '');
    const [resultados, setResultados] = useState([]);
    const [buscando, setBuscando] = useState(false);

    useEffect(() => {
        if (data.id_cliente) {
            setResultados([]);
            return;
        }

        setBuscando(true);
        const timeout = setTimeout(() => {
            axios
                .get(route(rutaBuscarCliente), {
                    params: { q: busqueda },
                })
                .then((response) => setResultados(response.data))
                .finally(() => setBuscando(false));
        }, 300);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [busqueda, data.id_cliente]);

    const seleccionar = (cliente) => {
        setData({
            ...data,
            id_cliente: cliente.id_cliente,
            cliente_nombre: cliente.razon_social,
        });
        clearErrors('id_cliente');
        setBusqueda(cliente.razon_social);
        setResultados([]);
    };

    const limpiar = () => {
        setData({ ...data, id_cliente: '', cliente_nombre: '' });
        setBusqueda('');
    };

    return (
        <div>
            <label className={labelClass}>Cliente</label>
            <div className="relative mt-1">
                <input
                    type="text"
                    placeholder="Elegí de la lista o escribí para filtrar..."
                    className={inputClass}
                    value={busqueda}
                    disabled={Boolean(data.id_cliente)}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
                {resultados.length > 0 && (
                    <ul className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
                        {resultados.map((cliente) => (
                            <li key={cliente.id_cliente}>
                                <button
                                    type="button"
                                    onClick={() => seleccionar(cliente)}
                                    className="block w-full px-3 py-2 text-left text-sm hover:bg-[#71BFA6]/10"
                                >
                                    {cliente.razon_social}
                                    {cliente.nit && (
                                        <span className="ml-2 text-xs text-[#A9ABAE]">
                                            NIT: {cliente.nit}
                                        </span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {buscando && (
                <p className="mt-1 text-xs text-[#A9ABAE]">Buscando...</p>
            )}
            {data.id_cliente && (
                <button
                    type="button"
                    onClick={limpiar}
                    className="mt-2 text-xs text-[#042753] underline"
                >
                    Cambiar cliente
                </button>
            )}
            <CampoError mensaje={errors.id_cliente} />
        </div>
    );
}

function PasoRuta({
    data,
    setData,
    errors,
    clearErrors,
    puertos,
}) {
    // El Origen (POL) se filtra por el tipo que corresponde al modo (Puerto/
    // Aeropuerto/Frontera) — importa por dónde sale la carga. Si el origen ya
    // viene precargado (ej. continuación de una cotización marítima hacia un
    // tramo terrestre) se mantiene visible aunque su tipo no coincida con el
    // del modo actual.
    const puertosOrigenFiltrados = useMemo(() => {
        const tipoRequerido = TIPO_PUERTO_POR_MODO[data.modo_transporte];

        if (!tipoRequerido) {
            return puertos;
        }

        return puertos.filter(
            (puerto) => puerto.tipo === tipoRequerido || puerto.codigo === data.id_pol,
        );
    }, [puertos, data.modo_transporte, data.id_pol]);

    // El Destino (POD) se filtra igual para Marítimo/Aéreo — el tramo
    // internacional siempre termina en un puerto/aeropuerto real, nunca llega
    // directo al destino final (La Paz). Para Terrestre no se filtra: ese es el
    // tramo que sí llega al destino final real, que puede ser cualquier tipo.
    const puertosDestinoFiltrados = useMemo(() => {
        const tipoRequerido = TIPO_PUERTO_DESTINO_POR_MODO[data.modo_transporte];

        if (!tipoRequerido) {
            return puertos;
        }

        return puertos.filter(
            (puerto) => puerto.tipo === tipoRequerido || puerto.codigo === data.id_pod,
        );
    }, [puertos, data.modo_transporte, data.id_pod]);

    return (
        <div className="space-y-4">
            <div>
                <label className={labelClass}>Modo de Transporte</label>
                <select
                    className={inputClass}
                    value={data.modo_transporte}
                    onChange={(e) => {
                        setData({
                            ...data,
                            modo_transporte: e.target.value,
                            tipo_servicio:
                                e.target.value === 'Maritimo' || e.target.value === 'Terrestre'
                                    ? data.tipo_servicio
                                    : '',
                            id_pol: '',
                            id_pod: '',
                            id_naviera_aerolinea: '',
                        });
                        clearErrors('modo_transporte', 'id_pol', 'id_pod', 'id_naviera_aerolinea');
                    }}
                >
                    <option value="Maritimo">Marítimo</option>
                    <option value="Aereo">Aéreo</option>
                    <option value="Terrestre">Terrestre</option>
                </select>
                <CampoError mensaje={errors.modo_transporte} />
            </div>

            <div>
                <label className={labelClass}>Tipo de Embarque</label>
                <select
                    className={inputClass}
                    value={data.tipo_embarque}
                    onChange={(e) => {
                        setData({ ...data, tipo_embarque: e.target.value });
                        clearErrors('tipo_embarque');
                    }}
                >
                    <option value="">Selecciona un tipo</option>
                    {TIPOS_EMBARQUE.map((tipo) => (
                        <option key={tipo.valor} value={tipo.valor}>
                            {tipo.etiqueta}
                        </option>
                    ))}
                </select>
                <CampoError mensaje={errors.tipo_embarque} />
            </div>

            {(data.modo_transporte === 'Maritimo' || data.modo_transporte === 'Terrestre') && (
                <div>
                    <label className={labelClass}>Tipo de Servicio</label>
                    <select
                        className={inputClass}
                        value={data.tipo_servicio}
                        onChange={(e) => {
                            setData({
                                ...data,
                                tipo_servicio: e.target.value,
                            });
                            clearErrors('tipo_servicio');
                        }}
                    >
                        <option value="">Selecciona FCL o LCL</option>
                        <option value="FCL">FCL — contenedor completo</option>
                        <option value="LCL">LCL — carga consolidada (por m³)</option>
                    </select>
                    <CampoError mensaje={errors.tipo_servicio} />
                </div>
            )}

            <div>
                <label className={labelClass}>Incoterm</label>
                <select
                    className={inputClass}
                    value={data.incoterm}
                    onChange={(e) => {
                        setData({ ...data, incoterm: e.target.value });
                        clearErrors('incoterm');
                    }}
                >
                    <option value="">—</option>
                    {INCOTERMS.map((incoterm) => (
                        <option key={incoterm} value={incoterm}>
                            {incoterm} ({INCOTERMS_INFO[incoterm].nombre})
                        </option>
                    ))}
                </select>
                <AyudaTermino info={INCOTERMS_INFO[data.incoterm]} />
                <CampoError mensaje={errors.incoterm} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>
                        Puerto/Aeropuerto de Origen (POL)
                    </label>
                    <select
                        className={inputClass}
                        value={data.id_pol}
                        onChange={(e) => {
                            setData({ ...data, id_pol: e.target.value });
                            clearErrors('id_pol');
                        }}
                    >
                        <option value="">—</option>
                        {puertosOrigenFiltrados.map((puerto) => (
                            <option key={puerto.codigo} value={puerto.codigo}>
                                {puerto.codigo} — {puerto.nombre}
                            </option>
                        ))}
                    </select>
                    <CampoError mensaje={errors.id_pol} />
                </div>

                <div>
                    <label className={labelClass}>
                        Puerto/Aeropuerto de Destino (POD)
                    </label>
                    <select
                        className={inputClass}
                        value={data.id_pod}
                        onChange={(e) => {
                            setData({ ...data, id_pod: e.target.value });
                            clearErrors('id_pod');
                        }}
                    >
                        <option value="">—</option>
                        {puertosDestinoFiltrados.map((puerto) => (
                            <option key={puerto.codigo} value={puerto.codigo}>
                                {puerto.codigo} — {puerto.nombre}
                            </option>
                        ))}
                    </select>
                    <CampoError mensaje={errors.id_pod} />
                </div>
            </div>

            <p className="text-xs text-[#A9ABAE]">
                El Agente de Origen y la Naviera / Aerolínea / Transportista se definen
                solos en el paso de Costos, según las tarifas que elijas usar — no hace
                falta elegirlos acá.
            </p>
        </div>
    );
}

function BotonSolicitarTarifa({ data, rutaSolicitarTarifa }) {
    const [enviando, setEnviando] = useState(false);
    const [enviado, setEnviado] = useState(false);

    if (!rutaSolicitarTarifa) {
        return null;
    }

    const solicitar = () => {
        setEnviando(true);
        axios
            .post(route(rutaSolicitarTarifa), {
                id_cliente: data.id_cliente || undefined,
                modo_transporte: data.modo_transporte,
                tipo_servicio: data.tipo_servicio || undefined,
                id_pol: data.id_pol || undefined,
                id_pod: data.id_pod || undefined,
            })
            .then(() => setEnviado(true))
            .finally(() => setEnviando(false));
    };

    if (enviado) {
        return (
            <p className="text-sm font-medium text-[#71BFA6]">
                ✓ Se envió la solicitud a Gerente Operativo.
            </p>
        );
    }

    return (
        <button
            type="button"
            onClick={solicitar}
            disabled={enviando}
            className="rounded-md bg-[#042753] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
            {enviando ? 'Enviando...' : 'Solicitar Tarifa a Gerente Operativo'}
        </button>
    );
}

function PasoCarga({
    data,
    setData,
    errors,
    clearErrors,
    tiposContenedorDisponibles,
    cargandoTarifas,
    consultadoTarifas,
    rutaSolicitarTarifa,
    onReintentarTarifas,
}) {
    const esFCL = data.tipo_servicio === 'FCL';
    const hayTiposDisponibles = tiposContenedorDisponibles.length > 0;

    const agregarContenedor = () => {
        setData({
            ...data,
            contenedores: [
                ...data.contenedores,
                {
                    id: crypto.randomUUID(),
                    tipo_contenedor: tiposContenedorDisponibles[0] ?? '',
                    cantidad: 1,
                },
            ],
        });
    };

    const quitarContenedor = (index) => {
        setData({
            ...data,
            contenedores: data.contenedores.filter((_, i) => i !== index),
        });
    };

    const actualizarContenedor = (index, campo, valor) => {
        const copia = [...data.contenedores];
        copia[index] = { ...copia[index], [campo]: valor };
        setData({ ...data, contenedores: copia });
        clearErrors(`contenedores.${index}.${campo}`);
    };

    return (
        <div className="space-y-4">
            {esFCL ? (
                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <label className={labelClass}>Contenedores</label>
                        {hayTiposDisponibles && (
                            <button
                                type="button"
                                onClick={agregarContenedor}
                                className="text-sm font-medium text-[#71BFA6] hover:underline"
                            >
                                + Agregar línea
                            </button>
                        )}
                    </div>

                    {cargandoTarifas && (
                        <p className="text-sm text-[#A9ABAE]">
                            Buscando tipos de contenedor disponibles para esta ruta...
                        </p>
                    )}

                    {!cargandoTarifas && consultadoTarifas && !hayTiposDisponibles && (
                        <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                            <p className="mb-3 text-sm text-amber-800">
                                Gerente Operativo todavía no cargó ninguna tarifa FCL
                                para esta ruta, así que no hay tipos de contenedor para
                                elegir. Esto se vuelve a revisar solo cada 20 segundos —
                                no hace falta recargar la página.
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                                <BotonSolicitarTarifa
                                    data={data}
                                    rutaSolicitarTarifa={rutaSolicitarTarifa}
                                />
                                {onReintentarTarifas && (
                                    <button
                                        type="button"
                                        onClick={onReintentarTarifas}
                                        className="rounded-md border border-[#042753] px-3 py-1.5 text-xs font-semibold text-[#042753] hover:bg-[#042753]/5"
                                    >
                                        Buscar de nuevo ahora
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {hayTiposDisponibles && (
                        <>
                            <p className="mb-2 text-xs text-[#A9ABAE]">
                                Tipos de contenedor cargados por Gerente Operativo para
                                esta ruta.
                            </p>

                            <div className="space-y-2">
                                {data.contenedores.map((contenedor, index) => (
                                    <div key={contenedor.id ?? index}>
                                        <div className="flex items-center gap-2">
                                            <select
                                                className={inputClass}
                                                value={contenedor.tipo_contenedor}
                                                onChange={(e) =>
                                                    actualizarContenedor(
                                                        index,
                                                        'tipo_contenedor',
                                                        e.target.value,
                                                    )
                                                }
                                            >
                                                {tiposContenedorDisponibles.map((tipo) => (
                                                    <option
                                                        key={tipo}
                                                        value={tipo}
                                                        title={TIPO_CONTENEDOR_INFO[tipo]?.explicacion}
                                                    >
                                                        {tipo}
                                                        {TIPO_CONTENEDOR_INFO[tipo] &&
                                                            ` (${TIPO_CONTENEDOR_INFO[tipo].nombre})`}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                min="1"
                                                step="1"
                                                onKeyDown={bloquearNotacionCientifica}
                                                placeholder="Cantidad"
                                                className={`${inputClass} max-w-[120px]`}
                                                value={contenedor.cantidad}
                                                onChange={(e) =>
                                                    actualizarContenedor(
                                                        index,
                                                        'cantidad',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    quitarContenedor(index)
                                                }
                                                className="text-red-600 hover:underline"
                                            >
                                                Quitar
                                            </button>
                                        </div>
                                        <CampoError
                                            mensaje={
                                                errors[
                                                    `contenedores.${index}.tipo_contenedor`
                                                ] ??
                                                errors[
                                                    `contenedores.${index}.cantidad`
                                                ]
                                            }
                                        />
                                    </div>
                                ))}

                                {data.contenedores.length === 0 && (
                                    <p className="text-sm text-[#A9ABAE]">
                                        Agrega al menos una línea de contenedor.
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Peso (kg)</label>
                        <input
                            type="number"
                            step="0.01"
                            onKeyDown={bloquearNotacionCientifica}
                            className={inputClass}
                            value={data.peso_kg}
                            onChange={(e) => {
                                setData({
                                    ...data,
                                    peso_kg: e.target.value,
                                });
                                clearErrors('peso_kg');
                            }}
                        />
                        <CampoError mensaje={errors.peso_kg} />
                    </div>
                    <div>
                        <label className={labelClass}>Volumen (cbm)</label>
                        <input
                            type="number"
                            step="0.001"
                            onKeyDown={bloquearNotacionCientifica}
                            className={inputClass}
                            value={data.volumen_cbm}
                            onChange={(e) => {
                                setData({
                                    ...data,
                                    volumen_cbm: e.target.value,
                                });
                                clearErrors('volumen_cbm');
                            }}
                        />
                        <CampoError mensaje={errors.volumen_cbm} />
                    </div>
                </div>
            )}

            <label className="flex items-center gap-2 text-sm text-[#042753]">
                <input
                    type="checkbox"
                    checked={data.mercancia_peligrosa}
                    onChange={(e) =>
                        setData({
                            ...data,
                            mercancia_peligrosa: e.target.checked,
                        })
                    }
                    className="rounded border-gray-300 text-[#71BFA6] focus:ring-[#71BFA6]"
                />
                Mercancía peligrosa
            </label>
        </div>
    );
}

function resumenMontoTarifa(tarifa) {
    if (tarifa.costo_base) {
        return `${tarifa.costo_base} ${tarifa.moneda}/kg`;
    }

    if (tarifa.costos?.length > 0) {
        return tarifa.costos
            .map((costo) =>
                costo.tipo_servicio === 'FCL'
                    ? `${costo.tipo_contenedor}: ${costo.costo} ${costo.moneda}`
                    : `${costo.costo} ${costo.moneda}/m³`,
            )
            .join(' · ');
    }

    return null;
}

function TarifasDisponibles({
    data,
    onAplicar,
    tarifas,
    cargando,
    consultado,
    permiteTarifaInexistente,
    rutaSolicitarTarifa,
    onReintentar,
}) {
    if (!data.id_pol || !data.id_pod) {
        return null;
    }

    return (
        <div className="mb-6 rounded-lg border border-[#71BFA6]/40 bg-[#71BFA6]/5 p-4">
            <h3 className="text-sm font-semibold text-[#042753]">
                Tarifas disponibles para esta ruta
            </h3>
            <p className="mb-3 text-xs text-[#A9ABAE]">
                Cargadas por Gerente Operativo — usá una para completar los
                costos automáticamente.
            </p>

            {cargando && (
                <p className="text-sm text-[#A9ABAE]">
                    Buscando tarifas vigentes...
                </p>
            )}

            {!cargando && consultado && tarifas.length === 0 && (
                <div className="space-y-3">
                    <p className="text-sm text-[#A9ABAE]">
                        No hay ninguna tarifa cargada para esta ruta.{' '}
                        {permiteTarifaInexistente
                            ? 'Podés completar los costos manualmente abajo — como Gerente Comercial, se avisará a Gerente Operativo para que la cargue.'
                            : 'No vas a poder crear esta cotización hasta que Gerente Operativo cargue una tarifa para esta ruta.'}{' '}
                        Esto se vuelve a revisar solo cada 20 segundos — no hace falta
                        recargar la página.
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                        <BotonSolicitarTarifa
                            data={data}
                            rutaSolicitarTarifa={rutaSolicitarTarifa}
                        />
                        {onReintentar && (
                            <button
                                type="button"
                                onClick={onReintentar}
                                className="rounded-md border border-[#042753] px-3 py-1.5 text-xs font-semibold text-[#042753] hover:bg-[#042753]/5"
                            >
                                Buscar de nuevo ahora
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="space-y-2">
                {tarifas.map((tarifa) => (
                    <div
                        key={tarifa.id_tarifa}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-gray-200 bg-white px-3 py-2"
                    >
                        <div>
                            <p className="text-sm font-medium text-[#042753]">
                                {tarifa.carrier}
                                {tarifa.tipo_servicio && ` · ${tarifa.tipo_servicio}`}
                            </p>
                            {resumenMontoTarifa(tarifa) && (
                                <p className="text-sm font-semibold text-[#042753]">
                                    {resumenMontoTarifa(tarifa)}
                                </p>
                            )}
                            <p className="text-xs text-[#A9ABAE]">
                                Vigente hasta {tarifa.fecha_fin_vigencia}
                                {tarifa.cargos_adicionales.length > 0 &&
                                    ` · +${tarifa.cargos_adicionales.length} cargo(s) adicional(es)`}
                            </p>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-2">
                            {tarifa.estado === 'Vencida' && (
                                <span className="rounded px-2 py-1 text-xs font-semibold bg-red-100 text-red-700">
                                    Vencida
                                </span>
                            )}
                            {tarifa.estado === 'Por Vencer' && (
                                <span className="rounded px-2 py-1 text-xs font-semibold bg-amber-100 text-amber-700">
                                    Por Vencer
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={() => onAplicar(tarifa)}
                                disabled={tarifa.estado === 'Vencida'}
                                className="rounded-md bg-[#71BFA6] px-3 py-1.5 text-xs font-semibold text-[#042753] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Usar esta tarifa
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function CostosExtraOpcionales({ data, setData, conceptosCostoExtra }) {
    const [idConcepto, setIdConcepto] = useState('');
    const [monto, setMonto] = useState('');
    const [moneda, setMoneda] = useState('USD');

    if (!conceptosCostoExtra || conceptosCostoExtra.length === 0) {
        return null;
    }

    const agregar = () => {
        const concepto = conceptosCostoExtra.find(
            (c) => String(c.id_concepto) === String(idConcepto),
        );

        if (!concepto || !monto) {
            return;
        }

        setData({
            ...data,
            detalle: [
                ...data.detalle,
                {
                    descripcion: concepto.nombre,
                    tipo_tarifa_unidad: 'Flat',
                    costo_unitario: monto,
                    base_calculo: 1,
                    moneda,
                    comision_openaccess: '',
                },
            ],
        });
        setIdConcepto('');
        setMonto('');
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <label className={labelClass}>Costos Extras Opcionales</label>
            <p className="mb-2 text-xs text-[#A9ABAE]">
                Cargos adicionales elegidos de una lista predefinida (mantenida por Gerente
                Operativo). Vos ingresás el monto.
            </p>
            <div className="flex flex-wrap items-center gap-2">
                <select
                    className="rounded-md border-gray-300 text-sm"
                    value={idConcepto}
                    onChange={(e) => setIdConcepto(e.target.value)}
                >
                    <option value="">Selecciona un concepto</option>
                    {conceptosCostoExtra.map((c) => (
                        <option key={c.id_concepto} value={c.id_concepto}>
                            {c.nombre}
                        </option>
                    ))}
                </select>
                <input
                    type="number"
                    step="0.01"
                    onKeyDown={bloquearNotacionCientifica}
                    placeholder="Monto"
                    className="w-28 rounded-md border-gray-300 text-sm"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                />
                <select
                    className="w-24 rounded-md border-gray-300 text-sm"
                    value={moneda}
                    onChange={(e) => setMoneda(e.target.value)}
                >
                    {MONEDAS.map((m) => (
                        <option key={m.valor} value={m.valor}>
                            {m.valor}
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    onClick={agregar}
                    disabled={!idConcepto || !monto}
                    className="rounded-md bg-[#71BFA6] px-3 py-1.5 text-xs font-semibold text-[#042753] hover:opacity-90 disabled:opacity-50"
                >
                    + Agregar
                </button>
            </div>
        </div>
    );
}

function PasoCostos({
    data,
    setData,
    errors,
    clearErrors,
    tarifasRuta,
    cargandoTarifas,
    consultadoTarifas,
    tarifasAgenteRuta,
    cargandoTarifasAgente,
    conceptosCostoExtra,
    permiteTarifaInexistente,
    rutaSolicitarTarifa,
    onReintentarTarifas,
}) {
    const aplicarTarifaAgente = (tarifaAgente) => {
        if (tarifaAgente.estado === 'Vencida') {
            return;
        }

        const lineasNuevas = tarifaAgente.costos.map((costo) => ({
            descripcion: costo.concepto,
            tipo_tarifa_unidad: 'Flat',
            costo_unitario: costo.costo,
            base_calculo: 1,
            moneda: costo.moneda,
            bloqueada: true,
            comision_openaccess: '',
        }));

        if (lineasNuevas.length === 0) {
            return;
        }

        setData({
            ...data,
            detalle: [
                ...data.detalle.filter((linea) => linea.descripcion || linea.costo_unitario),
                ...lineasNuevas,
            ],
            id_agente_origen: tarifaAgente.id_proveedor ?? data.id_agente_origen,
        });
        clearErrors('detalle', 'id_agente_origen');
    };


    const aplicarTarifa = (tarifa) => {
        if (tarifa.estado === 'Vencida') {
            return;
        }

        const lineasNuevas = [];

        if (data.tipo_servicio === 'FCL' && data.contenedores.length > 0) {
            data.contenedores.forEach((contenedor) => {
                const costoFila = tarifa.costos.find(
                    (c) =>
                        c.tipo_servicio === 'FCL' &&
                        c.tipo_contenedor === contenedor.tipo_contenedor,
                );

                if (costoFila) {
                    lineasNuevas.push({
                        descripcion: `Flete - ${contenedor.tipo_contenedor}`,
                        tipo_tarifa_unidad: 'Per Container',
                        costo_unitario: costoFila.costo,
                        base_calculo: contenedor.cantidad,
                        moneda: costoFila.moneda,
                        bloqueada: true,
                        vinculo: { tipo: 'contenedor', contenedorId: contenedor.id },
                        comision_openaccess: '',
                    });
                }
            });

            if (tarifa.costo_tramite) {
                lineasNuevas.push({
                    descripcion: 'Trámite',
                    tipo_tarifa_unidad: 'Flat',
                    costo_unitario: tarifa.costo_tramite,
                    base_calculo: 1,
                    moneda: tarifa.moneda_tramite,
                    bloqueada: true,
                    comision_openaccess: '',
                });
            }
        } else if (data.tipo_servicio === 'LCL') {
            tarifa.costos
                .filter((c) => c.tipo_servicio === 'LCL')
                .forEach((costoFila, index) => {
                    lineasNuevas.push({
                        descripcion:
                            index === 0
                                ? 'Flete - Carga Consolidada (LCL)'
                                : `Flete LCL (línea ${index + 1})`,
                        tipo_tarifa_unidad: 'Per CBM',
                        costo_unitario: costoFila.costo,
                        base_calculo: data.volumen_cbm || 1,
                        moneda: costoFila.moneda,
                        bloqueada: true,
                        vinculo: { tipo: 'volumen_cbm' },
                        comision_openaccess: '',
                    });
                });
        } else if (tarifa.costo_base) {
            lineasNuevas.push({
                descripcion: 'Flete',
                tipo_tarifa_unidad: 'Per Kg',
                costo_unitario: tarifa.costo_base,
                base_calculo: data.peso_kg || 1,
                moneda: tarifa.moneda,
                bloqueada: true,
                vinculo: { tipo: 'peso_kg' },
                comision_openaccess: '',
            });
        }

        tarifa.cargos_adicionales.forEach((cargo) => {
            lineasNuevas.push({
                descripcion: cargo.concepto,
                tipo_tarifa_unidad: 'Flat',
                costo_unitario: cargo.monto,
                base_calculo: 1,
                moneda: cargo.moneda,
                bloqueada: true,
                comision_openaccess: '',
            });
        });

        if (lineasNuevas.length === 0) {
            return;
        }

        setData({
            ...data,
            detalle: [
                ...data.detalle.filter(
                    (linea) => linea.descripcion || linea.costo_unitario,
                ),
                ...lineasNuevas,
            ],
            fecha_validez: tarifa.fecha_fin_vigencia || data.fecha_validez,
            dias_transito:
                tarifa.dias_transito !== null && tarifa.dias_transito !== undefined
                    ? tarifa.dias_transito
                    : data.dias_transito,
            id_naviera_aerolinea: tarifa.id_proveedor ?? data.id_naviera_aerolinea,
        });
        clearErrors('detalle', 'fecha_validez', 'dias_transito', 'id_naviera_aerolinea');
    };

    const agregarLinea = () => {
        setData({
            ...data,
            detalle: [
                ...data.detalle,
                {
                    descripcion: '',
                    tipo_tarifa_unidad: '',
                    costo_unitario: '',
                    base_calculo: 1,
                    moneda: 'USD',
                    comision_openaccess: '',
                },
            ],
        });
    };

    const quitarLinea = (index) => {
        setData({
            ...data,
            detalle: data.detalle.filter((_, i) => i !== index),
        });
    };

    const actualizarLinea = (index, campo, valor) => {
        const copia = [...data.detalle];
        copia[index] = { ...copia[index], [campo]: valor };
        setData({ ...data, detalle: copia });
        clearErrors(`detalle.${index}.${campo}`, 'detalle');
    };

    // Para líneas generadas desde una tarifa, la Base Cálculo no es una copia
    // aparte: se lee y se escribe directo sobre el dato de origen (contenedor,
    // volumen o peso), así el paso 3 y esta tabla nunca quedan desincronizados.
    const valorBaseCalculo = (linea) => {
        if (!linea.vinculo) return linea.base_calculo;

        if (linea.vinculo.tipo === 'contenedor') {
            const contenedor = data.contenedores.find(
                (c) => c.id === linea.vinculo.contenedorId,
            );
            return contenedor ? contenedor.cantidad : linea.base_calculo;
        }

        return data[linea.vinculo.tipo] ?? linea.base_calculo;
    };

    const actualizarBaseCalculoVinculada = (linea, valor) => {
        if (linea.vinculo.tipo === 'contenedor') {
            setData({
                ...data,
                contenedores: data.contenedores.map((c) =>
                    c.id === linea.vinculo.contenedorId
                        ? { ...c, cantidad: valor }
                        : c,
                ),
            });
            return;
        }

        setData({ ...data, [linea.vinculo.tipo]: valor });
    };

    const costoTotal = (linea) => {
        const unitario = parseFloat(linea.costo_unitario) || 0;
        const base = parseFloat(valorBaseCalculo(linea)) || 0;
        return (unitario * base).toFixed(2);
    };

    const totalGeneral = data.detalle
        .reduce((acc, linea) => acc + parseFloat(costoTotal(linea)), 0)
        .toFixed(2);

    const totalComision = data.detalle
        .reduce((acc, linea) => acc + (parseFloat(linea.comision_openaccess) || 0), 0)
        .toFixed(2);

    const totalConComision = (parseFloat(totalGeneral) + parseFloat(totalComision)).toFixed(2);

    return (
        <div className="space-y-4">
            <TarifasDisponibles
                data={data}
                onAplicar={aplicarTarifa}
                tarifas={tarifasRuta}
                cargando={cargandoTarifas}
                consultado={consultadoTarifas}
                permiteTarifaInexistente={permiteTarifaInexistente}
                rutaSolicitarTarifa={rutaSolicitarTarifa}
                onReintentar={onReintentarTarifas}
            />

            {errors.tarifa && (
                <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errors.tarifa}
                </div>
            )}

            {data.id_naviera_aerolinea && (
                <p className="text-sm text-[#042753]">
                    Naviera / Aerolínea / Transportista:{' '}
                    <span className="font-semibold">
                        {tarifasRuta.find((t) => t.id_proveedor === data.id_naviera_aerolinea)
                            ?.carrier ?? '—'}
                    </span>
                    <span className="ml-1 text-xs text-[#A9ABAE]">
                        (según la tarifa usada)
                    </span>
                </p>
            )}
            <CampoError mensaje={errors.id_naviera_aerolinea} />

            {data.id_pol && data.id_pod && (
                <div className="mb-6 rounded-lg border border-[#71BFA6]/40 bg-[#71BFA6]/5 p-4">
                    <h3 className="text-sm font-semibold text-[#042753]">
                        Tarifas de Agente disponibles para esta ruta
                    </h3>
                    <p className="mb-3 text-xs text-[#A9ABAE]">
                        Conceptos que cobra el agente de origen — opcional, usalas solo si
                        corresponde para este embarque.
                    </p>

                    {cargandoTarifasAgente && (
                        <p className="text-sm text-[#A9ABAE]">Buscando tarifas de agente...</p>
                    )}

                    {!cargandoTarifasAgente && tarifasAgenteRuta.length === 0 && (
                        <p className="text-sm text-[#A9ABAE]">
                            No hay tarifas de agente cargadas para esta ruta.
                        </p>
                    )}

                    <div className="space-y-2">
                        {tarifasAgenteRuta.map((tarifaAgente) => (
                            <div
                                key={tarifaAgente.id_tarifa_agente}
                                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-gray-200 bg-white px-3 py-2"
                            >
                                <div>
                                    <p className="text-sm font-medium text-[#042753]">
                                        {tarifaAgente.agente}
                                    </p>
                                    <p className="text-sm font-semibold text-[#042753]">
                                        {tarifaAgente.costos
                                            .map((c) => `${c.concepto}: ${c.costo} ${c.moneda}`)
                                            .join(' · ')}
                                    </p>
                                    <p className="text-xs text-[#A9ABAE]">
                                        Vigente hasta {tarifaAgente.fecha_fin_vigencia}
                                    </p>
                                </div>
                                <div className="flex flex-shrink-0 items-center gap-2">
                                    {tarifaAgente.estado === 'Vencida' && (
                                        <span className="rounded px-2 py-1 text-xs font-semibold bg-red-100 text-red-700">
                                            Vencida
                                        </span>
                                    )}
                                    {tarifaAgente.estado === 'Por Vencer' && (
                                        <span className="rounded px-2 py-1 text-xs font-semibold bg-amber-100 text-amber-700">
                                            Por Vencer
                                        </span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => aplicarTarifaAgente(tarifaAgente)}
                                        disabled={tarifaAgente.estado === 'Vencida'}
                                        className="rounded-md bg-[#71BFA6] px-3 py-1.5 text-xs font-semibold text-[#042753] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Usar esta tarifa
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {data.id_agente_origen && (
                <p className="text-sm text-[#042753]">
                    Agente de Origen:{' '}
                    <span className="font-semibold">
                        {tarifasAgenteRuta.find((t) => t.id_proveedor === data.id_agente_origen)
                            ?.agente ?? '—'}
                    </span>
                    <span className="ml-1 text-xs text-[#A9ABAE]">
                        (según la tarifa usada)
                    </span>
                </p>
            )}
            <CampoError mensaje={errors.id_agente_origen} />

            <div>
                <div className="mb-2 flex items-center justify-between">
                    <label className={labelClass}>
                        Líneas de Costo (Cotización Detalle)
                    </label>
                    <button
                        type="button"
                        onClick={agregarLinea}
                        className="text-sm font-medium text-[#71BFA6] hover:underline"
                    >
                        + Agregar línea
                    </button>
                </div>

                <div className="overflow-x-auto rounded-md border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left font-semibold text-[#042753]">
                                    Descripción
                                </th>
                                <th className="px-3 py-2 text-left font-semibold text-[#042753]">
                                    Unidad de Tarifa
                                </th>
                                <th className="px-3 py-2 text-right font-semibold text-[#042753]">
                                    Costo Unit.
                                </th>
                                <th className="px-3 py-2 text-right font-semibold text-[#042753]">
                                    Base Cálculo
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
                                <th className="px-3 py-2"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.detalle.map((linea, index) => {
                                const bloqueada = Boolean(linea.bloqueada);
                                const inputBloqueadoClass =
                                    'w-full min-w-[160px] rounded-md border-gray-200 bg-gray-100 text-sm text-[#042753]';

                                return (
                                <tr key={index} className="align-top">
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-1">
                                            {bloqueada && (
                                                <span
                                                    title="Cargado desde una tarifa oficial — no editable"
                                                    className="text-xs text-[#A9ABAE]"
                                                >
                                                    🔒
                                                </span>
                                            )}
                                            <input
                                                type="text"
                                                placeholder="Ej. Ocean Freight"
                                                readOnly={bloqueada}
                                                className={
                                                    bloqueada
                                                        ? inputBloqueadoClass
                                                        : 'w-full min-w-[160px] rounded-md border-gray-300 text-sm'
                                                }
                                                value={linea.descripcion}
                                                onChange={(e) =>
                                                    actualizarLinea(
                                                        index,
                                                        'descripcion',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <CampoError
                                            mensaje={
                                                errors[
                                                    `detalle.${index}.descripcion`
                                                ]
                                            }
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <input
                                            type="text"
                                            placeholder="Per Container"
                                            readOnly={bloqueada}
                                            className={
                                                bloqueada
                                                    ? inputBloqueadoClass
                                                    : 'w-full min-w-[140px] rounded-md border-gray-300 text-sm'
                                            }
                                            value={linea.tipo_tarifa_unidad}
                                            onChange={(e) =>
                                                actualizarLinea(
                                                    index,
                                                    'tipo_tarifa_unidad',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <CampoError
                                            mensaje={
                                                errors[
                                                    `detalle.${index}.tipo_tarifa_unidad`
                                                ]
                                            }
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <input
                                            type="number"
                                            step="0.01"
                                            onKeyDown={bloquearNotacionCientifica}
                                            readOnly={bloqueada}
                                            className={
                                                bloqueada
                                                    ? `${inputBloqueadoClass} w-28 text-right`
                                                    : 'w-28 rounded-md border-gray-300 text-right text-sm'
                                            }
                                            value={linea.costo_unitario}
                                            onChange={(e) =>
                                                actualizarLinea(
                                                    index,
                                                    'costo_unitario',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <CampoError
                                            mensaje={
                                                errors[
                                                    `detalle.${index}.costo_unitario`
                                                ]
                                            }
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <input
                                            type="number"
                                            step={
                                                linea.vinculo?.tipo === 'contenedor'
                                                    ? '1'
                                                    : '0.001'
                                            }
                                            min={
                                                linea.vinculo?.tipo === 'contenedor'
                                                    ? '1'
                                                    : undefined
                                            }
                                            onKeyDown={bloquearNotacionCientifica}
                                            title={
                                                linea.vinculo
                                                    ? 'Sincronizado con el paso 3 (Carga)'
                                                    : undefined
                                            }
                                            className="w-24 rounded-md border-gray-300 text-right text-sm"
                                            value={valorBaseCalculo(linea)}
                                            onChange={(e) =>
                                                linea.vinculo
                                                    ? actualizarBaseCalculoVinculada(
                                                          linea,
                                                          e.target.value,
                                                      )
                                                    : actualizarLinea(
                                                          index,
                                                          'base_calculo',
                                                          e.target.value,
                                                      )
                                            }
                                        />
                                        <CampoError
                                            mensaje={
                                                errors[
                                                    `detalle.${index}.base_calculo`
                                                ]
                                            }
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <select
                                            disabled={bloqueada}
                                            className={
                                                bloqueada
                                                    ? 'w-28 rounded-md border-gray-200 bg-gray-100 text-sm text-[#042753]'
                                                    : 'w-28 rounded-md border-gray-300 text-sm'
                                            }
                                            value={linea.moneda}
                                            onChange={(e) =>
                                                actualizarLinea(
                                                    index,
                                                    'moneda',
                                                    e.target.value,
                                                )
                                            }
                                        >
                                            {MONEDAS.map((m) => (
                                                <option key={m.valor} value={m.valor}>
                                                    {m.valor}
                                                </option>
                                            ))}
                                        </select>
                                        <CampoError
                                            mensaje={
                                                errors[
                                                    `detalle.${index}.moneda`
                                                ]
                                            }
                                        />
                                    </td>
                                    <td className="px-3 py-2 text-right font-medium text-[#042753]">
                                        {costoTotal(linea)}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        {linea.descripcion.startsWith('Flete') ? (
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                onKeyDown={bloquearNotacionCientifica}
                                                placeholder="0.00"
                                                className="w-24 rounded-md border-gray-300 text-right text-sm"
                                                value={linea.comision_openaccess}
                                                onChange={(e) =>
                                                    actualizarLinea(
                                                        index,
                                                        'comision_openaccess',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        ) : (
                                            <span className="text-[#A9ABAE]">—</span>
                                        )}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                quitarLinea(index)
                                            }
                                            className="text-red-600 hover:underline"
                                        >
                                            Quitar
                                        </button>
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-gray-200">
                                <td
                                    colSpan={5}
                                    className="px-3 py-2 text-right font-semibold text-[#042753]"
                                >
                                    Total General
                                </td>
                                <td className="px-3 py-2 text-right text-lg font-bold text-[#71BFA6]">
                                    {totalGeneral}
                                </td>
                                <td></td>
                                <td></td>
                            </tr>
                            {parseFloat(totalComision) > 0 && (
                                <>
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-3 py-2 text-right text-sm font-medium text-[#042753]"
                                        >
                                            Comisión OpenAccess{' '}
                                            <span className="text-xs text-[#A9ABAE]">
                                                (uso interno — el cliente no la ve)
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-right text-sm font-medium text-[#042753]">
                                            {totalComision} USD
                                        </td>
                                        <td></td>
                                    </tr>
                                    <tr className="border-t border-gray-200">
                                        <td
                                            colSpan={6}
                                            className="px-3 py-2 text-right font-semibold text-[#042753]"
                                        >
                                            Total con Comisión
                                        </td>
                                        <td className="px-3 py-2 text-right text-lg font-bold text-[#042753]">
                                            {totalConComision}
                                        </td>
                                        <td></td>
                                    </tr>
                                </>
                            )}
                        </tfoot>
                    </table>
                </div>
                <p className="mt-2 text-xs text-[#A9ABAE]">
                    La columna "Comisión (USD)" solo aparece en las líneas de Flete —
                    es de uso interno, siempre en dólares, y nunca aparece en la
                    cotización ni en el PDF que se le envía al cliente (se suma al
                    flete de esa misma línea sin mostrarse por separado).
                </p>
                <CampoError mensaje={errors.detalle} />
            </div>

            <CostosExtraOpcionales
                data={data}
                setData={setData}
                conceptosCostoExtra={conceptosCostoExtra}
            />

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Fecha de Validez</label>
                    <input
                        type="date"
                        readOnly
                        className="mt-1 block w-full rounded-md border-gray-200 bg-gray-100 text-sm text-[#042753] shadow-sm"
                        value={data.fecha_validez}
                    />
                    <p className="mt-1 text-xs text-[#A9ABAE]">
                        🔒 Se toma de la vigencia de la tarifa aplicada — no es editable.
                    </p>
                    <CampoError mensaje={errors.fecha_validez} />
                </div>
                <div>
                    <label className={labelClass}>Días de Tránsito</label>
                    <input
                        type="number"
                        min="0"
                        step="1"
                        onKeyDown={bloquearNotacionCientifica}
                        className={inputClass}
                        value={data.dias_transito}
                        onChange={(e) => {
                            setData({
                                ...data,
                                dias_transito: e.target.value,
                            });
                            clearErrors('dias_transito');
                        }}
                    />
                    <CampoError mensaje={errors.dias_transito} />
                </div>
            </div>
        </div>
    );
}

export default function NuevaCotizacionWizard({
    puertos,
    rutaBuscarCliente,
    rutaTarifasDisponibles,
    rutaTarifasAgenteDisponibles,
    rutaSolicitarTarifa,
    rutaStore,
    conceptosCostoExtra = [],
    permiteTarifaInexistente = false,
    origen = null,
}) {
    const [paso, setPaso] = useState(origen ? 2 : 1);

    const { data, setData, post, transform, processing, errors, clearErrors } = useForm({
        id_cotizacion_origen: origen?.id_cotizacion_origen ?? null,
        id_cliente: origen?.id_cliente ?? '',
        cliente_nombre: origen?.cliente_nombre ?? '',
        modo_transporte: origen ? 'Terrestre' : 'Maritimo',
        tipo_embarque: '',
        id_agente_origen: '',
        id_naviera_aerolinea: '',
        tipo_servicio: '',
        incoterm: '',
        id_pol: origen?.id_pol ?? '',
        id_pod: '',
        contenedores: [],
        peso_kg: '',
        volumen_cbm: '',
        mercancia_peligrosa: false,
        fecha_validez: fechaValidezPorDefecto(),
        dias_transito: '',
        detalle: [
            {
                descripcion: '',
                tipo_tarifa_unidad: '',
                costo_unitario: '',
                base_calculo: 1,
                moneda: 'USD',
                comision_openaccess: '',
            },
        ],
    });

    const [tarifasRuta, setTarifasRuta] = useState([]);
    const [cargandoTarifas, setCargandoTarifas] = useState(false);
    const [consultadoTarifas, setConsultadoTarifas] = useState(false);

    const buscarTarifasRuta = useCallback(() => {
        if (!data.id_pol || !data.id_pod) {
            setTarifasRuta([]);
            setConsultadoTarifas(false);
            return;
        }

        setCargandoTarifas(true);

        axios
            .get(route(rutaTarifasDisponibles), {
                params: {
                    modo_transporte: data.modo_transporte,
                    id_pol: data.id_pol,
                    id_pod: data.id_pod,
                    tipo_servicio: data.tipo_servicio || undefined,
                },
            })
            .then((response) => setTarifasRuta(response.data))
            .finally(() => {
                setCargandoTarifas(false);
                setConsultadoTarifas(true);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.modo_transporte, data.id_pol, data.id_pod, data.tipo_servicio]);

    useEffect(() => {
        setConsultadoTarifas(false);
        buscarTarifasRuta();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.modo_transporte, data.id_pol, data.id_pod, data.tipo_servicio]);

    // Si ya se buscó y no apareció ninguna tarifa, se reintenta solo cada 20s —
    // así, cuando Gerente Operativo la carga, aparece sin que el Comercial
    // tenga que recargar la página (y perder todo el progreso del wizard).
    useEffect(() => {
        if (!data.id_pol || !data.id_pod || !consultadoTarifas || tarifasRuta.length > 0) {
            return;
        }

        const intervalo = setInterval(buscarTarifasRuta, 20000);
        return () => clearInterval(intervalo);
    }, [data.id_pol, data.id_pod, consultadoTarifas, tarifasRuta.length, buscarTarifasRuta]);

    const [tarifasAgenteRuta, setTarifasAgenteRuta] = useState([]);
    const [cargandoTarifasAgente, setCargandoTarifasAgente] = useState(false);

    useEffect(() => {
        if (!data.id_pol || !data.id_pod || !rutaTarifasAgenteDisponibles) {
            setTarifasAgenteRuta([]);
            return;
        }

        setCargandoTarifasAgente(true);

        axios
            .get(route(rutaTarifasAgenteDisponibles), {
                params: {
                    modo_transporte: data.modo_transporte,
                    id_pol: data.id_pol,
                    id_pod: data.id_pod,
                },
            })
            .then((response) => setTarifasAgenteRuta(response.data))
            .finally(() => setCargandoTarifasAgente(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.modo_transporte, data.id_pol, data.id_pod]);

    const tiposContenedorDisponibles = useMemo(() => {
        const tipos = new Set();
        tarifasRuta.forEach((tarifa) => {
            tarifa.costos.forEach((costo) => {
                if (costo.tipo_servicio === 'FCL') {
                    tipos.add(costo.tipo_contenedor);
                }
            });
        });
        return Array.from(tipos);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tarifasRuta]);

    useEffect(() => {
        const claves = Object.keys(errors);
        if (claves.length === 0) return;

        const perteneceAPaso = (clave, numeroPaso) => {
            if (numeroPaso === 1) return clave === 'id_cliente';
            if (numeroPaso === 2) {
                return [
                    'modo_transporte',
                    'tipo_embarque',
                    'tipo_servicio',
                    'incoterm',
                    'id_pol',
                    'id_pod',
                ].includes(clave);
            }
            if (numeroPaso === 3) {
                return (
                    clave.startsWith('contenedores.') ||
                    clave === 'peso_kg' ||
                    clave === 'volumen_cbm'
                );
            }
            if (numeroPaso === 4) {
                return (
                    clave.startsWith('detalle') ||
                    clave === 'fecha_validez' ||
                    clave === 'dias_transito' ||
                    clave === 'tarifa' ||
                    clave === 'id_naviera_aerolinea' ||
                    clave === 'id_agente_origen'
                );
            }
            return false;
        };

        const primerPasoConError = [1, 2, 3, 4].find((numeroPaso) =>
            claves.some((clave) => perteneceAPaso(clave, numeroPaso)),
        );

        if (primerPasoConError) {
            setPaso(primerPasoConError);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [errors]);

    const puedeAvanzar = () => {
        if (paso === 1) return Boolean(data.id_cliente);
        if (paso === 2) return Boolean(data.modo_transporte) && Boolean(data.tipo_embarque);
        if (paso === 3)
            return data.tipo_servicio === 'FCL'
                ? data.contenedores.length > 0
                : true;

        return true;
    };

    const confirmar = () => {
        // Las líneas de detalle vinculadas a un contenedor/volumen/peso muestran
        // su Base Cálculo en vivo (ver valorBaseCalculo en PasoCostos), pero el
        // dato guardado en detalle puede haber quedado desactualizado si se editó
        // el origen después de aplicar la tarifa. Se resuelve acá, justo antes de enviar.
        transform((formData) => ({
            ...formData,
            detalle: formData.detalle.map((linea) => {
                if (!linea.vinculo) return linea;

                let baseCalculo = linea.base_calculo;
                if (linea.vinculo.tipo === 'contenedor') {
                    const contenedor = formData.contenedores.find(
                        (c) => c.id === linea.vinculo.contenedorId,
                    );
                    baseCalculo = contenedor ? contenedor.cantidad : linea.base_calculo;
                } else {
                    baseCalculo = formData[linea.vinculo.tipo] ?? linea.base_calculo;
                }

                return { ...linea, base_calculo: baseCalculo };
            }),
        }));

        post(route(rutaStore));
    };

    return (
        <div className="mx-auto max-w-4xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <ProgresoWizard paso={paso} />

            {origen && (
                <div className="mb-4 rounded-md bg-[#71BFA6]/10 px-4 py-3 text-sm text-[#042753]">
                    Creando cotización terrestre a partir de la cotización{' '}
                    {origen.modo_transporte_origen === 'Aereo' ? 'aérea' : 'marítima'}{' '}
                    <strong>#{origen.id_cotizacion_origen}</strong>. El cliente y el
                    puerto de origen ya vienen completados.
                </div>
            )}

            {Object.keys(errors).filter((clave) => clave !== 'tarifa').length > 0 && (
                <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
                    Revisa los datos ingresados, hay errores de validación
                    marcados debajo de cada campo.
                </div>
            )}

            <div>
                {paso === 1 && (
                    <PasoCliente
                        data={data}
                        setData={setData}
                        errors={errors}
                        clearErrors={clearErrors}
                        rutaBuscarCliente={rutaBuscarCliente}
                    />
                )}
                {paso === 2 && (
                    <PasoRuta
                        data={data}
                        setData={setData}
                        errors={errors}
                        clearErrors={clearErrors}
                        puertos={puertos}
                    />
                )}
                {paso === 3 && (
                    <PasoCarga
                        data={data}
                        setData={setData}
                        errors={errors}
                        clearErrors={clearErrors}
                        tiposContenedorDisponibles={tiposContenedorDisponibles}
                        cargandoTarifas={cargandoTarifas}
                        consultadoTarifas={consultadoTarifas}
                        rutaSolicitarTarifa={rutaSolicitarTarifa}
                        onReintentarTarifas={buscarTarifasRuta}
                    />
                )}
                {paso === 4 && (
                    <PasoCostos
                        data={data}
                        setData={setData}
                        errors={errors}
                        clearErrors={clearErrors}
                        tarifasRuta={tarifasRuta}
                        cargandoTarifas={cargandoTarifas}
                        consultadoTarifas={consultadoTarifas}
                        tarifasAgenteRuta={tarifasAgenteRuta}
                        cargandoTarifasAgente={cargandoTarifasAgente}
                        conceptosCostoExtra={conceptosCostoExtra}
                        permiteTarifaInexistente={permiteTarifaInexistente}
                        rutaSolicitarTarifa={rutaSolicitarTarifa}
                        onReintentarTarifas={buscarTarifasRuta}
                    />
                )}

                <div className="mt-6 flex justify-between border-t border-gray-100 pt-4">
                    <button
                        type="button"
                        disabled={paso === 1}
                        onClick={() => setPaso((p) => p - 1)}
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-[#042753] hover:bg-gray-50 disabled:opacity-40"
                    >
                        Atrás
                    </button>

                    {paso < 4 ? (
                        <button
                            type="button"
                            disabled={!puedeAvanzar()}
                            onClick={() => setPaso((p) => p + 1)}
                            className="rounded-md bg-[#71BFA6] px-4 py-2 text-sm font-semibold text-[#042753] hover:opacity-90 disabled:opacity-50"
                        >
                            Continuar
                        </button>
                    ) : (
                        <button
                            type="button"
                            disabled={processing}
                            onClick={confirmar}
                            className="rounded-md bg-[#042753] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                        >
                            Confirmar Cotización
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
