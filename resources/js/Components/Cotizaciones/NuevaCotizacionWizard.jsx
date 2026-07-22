import AyudaTermino from '@/Components/AyudaTermino';
import { INCOTERMS_INFO, TIPO_CONTENEDOR_INFO } from '@/constants/glosario';
import { MONEDAS } from '@/constants/monedas';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';

const PASOS = ['Cliente', 'Ruta y Transporte', 'Carga', 'Costos y Resumen'];
const INCOTERMS = ['FOB', 'EXW', 'CIF', 'CFR', 'DDP'];
const TIPOS_CONTENEDOR = ['20 DRY', '40 DRY', '40 HC'];

const TIPO_PUERTO_POR_MODO = {
    Maritimo: 'Puerto',
    Aereo: 'Aeropuerto',
};

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
        if (data.id_cliente || busqueda.trim().length < 2) {
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
                    placeholder="Buscar cliente por razón social..."
                    className={inputClass}
                    value={busqueda}
                    disabled={Boolean(data.id_cliente)}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
                {resultados.length > 0 && (
                    <ul className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
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

function PasoRuta({ data, setData, errors, clearErrors, puertos }) {
    const puertosFiltrados = useMemo(() => {
        const tipoRequerido = TIPO_PUERTO_POR_MODO[data.modo_transporte];

        return tipoRequerido
            ? puertos.filter((puerto) => puerto.tipo === tipoRequerido)
            : puertos;
    }, [puertos, data.modo_transporte]);

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
                                e.target.value === 'Maritimo'
                                    ? data.tipo_servicio
                                    : '',
                            id_pol: '',
                            id_pod: '',
                        });
                        clearErrors('modo_transporte', 'id_pol', 'id_pod');
                    }}
                >
                    <option value="Maritimo">Marítimo</option>
                    <option value="Aereo">Aéreo</option>
                    <option value="Terrestre">Terrestre</option>
                </select>
                <CampoError mensaje={errors.modo_transporte} />
            </div>

            {data.modo_transporte === 'Maritimo' && (
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
                        {puertosFiltrados.map((puerto) => (
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
                        {puertosFiltrados.map((puerto) => (
                            <option key={puerto.codigo} value={puerto.codigo}>
                                {puerto.codigo} — {puerto.nombre}
                            </option>
                        ))}
                    </select>
                    <CampoError mensaje={errors.id_pod} />
                </div>
            </div>

            <div>
                <label className={labelClass}>Destino Final</label>
                <input
                    type="text"
                    className={inputClass}
                    value={data.destino_final}
                    onChange={(e) => {
                        setData({
                            ...data,
                            destino_final: e.target.value,
                        });
                        clearErrors('destino_final');
                    }}
                />
                <CampoError mensaje={errors.destino_final} />
            </div>
        </div>
    );
}

function PasoCarga({ data, setData, errors, clearErrors }) {
    const esFCL = data.tipo_servicio === 'FCL';

    const agregarContenedor = () => {
        setData({
            ...data,
            contenedores: [
                ...data.contenedores,
                { tipo_contenedor: '20 DRY', cantidad: 1 },
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
                        <button
                            type="button"
                            onClick={agregarContenedor}
                            className="text-sm font-medium text-[#71BFA6] hover:underline"
                        >
                            + Agregar línea
                        </button>
                    </div>
                    <p className="mb-2 text-xs text-[#A9ABAE]">
                        DRY = contenedor estándar · HC = High Cube (más alto, más volumen)
                    </p>

                    <div className="space-y-2">
                        {data.contenedores.map((contenedor, index) => (
                            <div key={index}>
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
                                        {TIPOS_CONTENEDOR.map((tipo) => (
                                            <option
                                                key={tipo}
                                                value={tipo}
                                                title={TIPO_CONTENEDOR_INFO[tipo].explicacion}
                                            >
                                                {tipo} ({TIPO_CONTENEDOR_INFO[tipo].nombre})
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        min="1"
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
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Peso (kg)</label>
                        <input
                            type="number"
                            step="0.01"
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

const CAMPO_COSTO_POR_CONTENEDOR = {
    '20 DRY': 'costo_20',
    '40 DRY': 'costo_40',
    '40 HC': 'costo_40hc',
};

function TarifasDisponibles({ data, onAplicar, rutaTarifasDisponibles }) {
    const [tarifas, setTarifas] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [consultado, setConsultado] = useState(false);

    useEffect(() => {
        if (!data.id_pol || !data.id_pod) {
            setTarifas([]);
            setConsultado(false);
            return;
        }

        setCargando(true);
        setConsultado(false);

        axios
            .get(route(rutaTarifasDisponibles), {
                params: {
                    modo_transporte: data.modo_transporte,
                    id_pol: data.id_pol,
                    id_pod: data.id_pod,
                    tipo_servicio: data.tipo_servicio || undefined,
                },
            })
            .then((response) => setTarifas(response.data))
            .finally(() => {
                setCargando(false);
                setConsultado(true);
            });
    }, [data.modo_transporte, data.id_pol, data.id_pod, data.tipo_servicio]);

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
                <p className="text-sm text-[#A9ABAE]">
                    No hay tarifas vigentes cargadas para esta ruta. Podés
                    completar los costos manualmente abajo.
                </p>
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
                            <p className="text-xs text-[#A9ABAE]">
                                Vigente hasta {tarifa.fecha_fin_vigencia} ·{' '}
                                {tarifa.moneda}
                                {tarifa.cargos_adicionales.length > 0 &&
                                    ` · +${tarifa.cargos_adicionales.length} cargo(s) adicional(es)`}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => onAplicar(tarifa)}
                            className="flex-shrink-0 rounded-md bg-[#71BFA6] px-3 py-1.5 text-xs font-semibold text-[#042753] hover:opacity-90"
                        >
                            Usar esta tarifa
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function PasoCostos({ data, setData, errors, clearErrors, rutaTarifasDisponibles }) {
    const aplicarTarifa = (tarifa) => {
        const lineasNuevas = [];

        if (data.tipo_servicio === 'FCL' && data.contenedores.length > 0) {
            data.contenedores.forEach((contenedor) => {
                const campo = CAMPO_COSTO_POR_CONTENEDOR[contenedor.tipo_contenedor];
                const costo = campo ? tarifa[campo] : null;

                if (costo) {
                    lineasNuevas.push({
                        descripcion: `Flete - ${contenedor.tipo_contenedor}`,
                        tipo_tarifa_unidad: 'Per Container',
                        costo_unitario: costo,
                        base_calculo: contenedor.cantidad,
                        moneda: tarifa.moneda,
                    });
                }
            });
        } else if (data.tipo_servicio === 'LCL' && tarifa.costo_cbm) {
            lineasNuevas.push({
                descripcion: 'Flete - Carga Consolidada (LCL)',
                tipo_tarifa_unidad: 'Per CBM',
                costo_unitario: tarifa.costo_cbm,
                base_calculo: data.volumen_cbm || 1,
                moneda: tarifa.moneda,
            });
        } else if (tarifa.costo_base) {
            lineasNuevas.push({
                descripcion: 'Flete',
                tipo_tarifa_unidad:
                    data.modo_transporte === 'Aereo' ? 'Per Kg' : 'Flat',
                costo_unitario: tarifa.costo_base,
                base_calculo:
                    data.modo_transporte === 'Aereo'
                        ? data.peso_kg || 1
                        : 1,
                moneda: tarifa.moneda,
            });
        }

        tarifa.cargos_adicionales.forEach((cargo) => {
            lineasNuevas.push({
                descripcion: cargo.concepto,
                tipo_tarifa_unidad: 'Flat',
                costo_unitario: cargo.monto,
                base_calculo: 1,
                moneda: cargo.moneda,
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
        });
        clearErrors('detalle');
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

    const costoTotal = (linea) => {
        const unitario = parseFloat(linea.costo_unitario) || 0;
        const base = parseFloat(linea.base_calculo) || 0;
        return (unitario * base).toFixed(2);
    };

    const totalGeneral = data.detalle
        .reduce((acc, linea) => acc + parseFloat(costoTotal(linea)), 0)
        .toFixed(2);

    return (
        <div className="space-y-4">
            <TarifasDisponibles
                data={data}
                onAplicar={aplicarTarifa}
                rutaTarifasDisponibles={rutaTarifasDisponibles}
            />

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
                                <th className="px-3 py-2"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.detalle.map((linea, index) => (
                                <tr key={index} className="align-top">
                                    <td className="px-3 py-2">
                                        <input
                                            type="text"
                                            placeholder="Ej. Ocean Freight"
                                            className="w-full min-w-[160px] rounded-md border-gray-300 text-sm"
                                            value={linea.descripcion}
                                            onChange={(e) =>
                                                actualizarLinea(
                                                    index,
                                                    'descripcion',
                                                    e.target.value,
                                                )
                                            }
                                        />
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
                                            className="w-full min-w-[140px] rounded-md border-gray-300 text-sm"
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
                                            className="w-28 rounded-md border-gray-300 text-right text-sm"
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
                                            step="0.001"
                                            className="w-24 rounded-md border-gray-300 text-right text-sm"
                                            value={linea.base_calculo}
                                            onChange={(e) =>
                                                actualizarLinea(
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
                                            className="w-28 rounded-md border-gray-300 text-sm"
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
                            ))}
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
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <CampoError mensaje={errors.detalle} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Fecha de Validez</label>
                    <input
                        type="date"
                        className={inputClass}
                        value={data.fecha_validez}
                        onChange={(e) => {
                            setData({
                                ...data,
                                fecha_validez: e.target.value,
                            });
                            clearErrors('fecha_validez');
                        }}
                    />
                    <CampoError mensaje={errors.fecha_validez} />
                </div>
                <div>
                    <label className={labelClass}>Días de Tránsito</label>
                    <input
                        type="number"
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

export default function NuevaCotizacionWizard({ puertos, rutaBuscarCliente, rutaTarifasDisponibles, rutaStore }) {
    const [paso, setPaso] = useState(1);

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        id_cliente: '',
        cliente_nombre: '',
        modo_transporte: 'Maritimo',
        tipo_servicio: '',
        incoterm: '',
        id_pol: '',
        id_pod: '',
        destino_final: '',
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
            },
        ],
    });

    useEffect(() => {
        const claves = Object.keys(errors);
        if (claves.length === 0) return;

        const perteneceAPaso = (clave, numeroPaso) => {
            if (numeroPaso === 1) return clave === 'id_cliente';
            if (numeroPaso === 2) {
                return [
                    'modo_transporte',
                    'tipo_servicio',
                    'incoterm',
                    'id_pol',
                    'id_pod',
                    'destino_final',
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
                    clave === 'dias_transito'
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
        if (paso === 2) return Boolean(data.modo_transporte);
        if (paso === 3)
            return data.tipo_servicio === 'FCL'
                ? data.contenedores.length > 0
                : true;

        return true;
    };

    const confirmar = () => {
        post(route(rutaStore));
    };

    return (
        <div className="mx-auto max-w-4xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <ProgresoWizard paso={paso} />

            {Object.keys(errors).length > 0 && (
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
                    />
                )}
                {paso === 4 && (
                    <PasoCostos
                        data={data}
                        setData={setData}
                        errors={errors}
                        clearErrors={clearErrors}
                        rutaTarifasDisponibles={rutaTarifasDisponibles}
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
