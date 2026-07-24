import GerenteOperativoLayout from '@/Layouts/GerenteOperativoLayout';
import { MONEDAS } from '@/constants/monedas';
import { TIPOS_CONTENEDOR } from '@/constants/tiposContenedor';
import { Head, useForm } from '@inertiajs/react';
import { useMemo } from 'react';

const TIPO_PUERTO_POR_MODO = {
    Maritimo: 'Puerto',
    Aereo: 'Aeropuerto',
};

export default function Form({ tarifa, proveedores, puertos }) {
    const isEditing = Boolean(tarifa);

    const { data, setData, post, put, processing, errors } = useForm({
        id_proveedor: tarifa?.id_proveedor ?? '',
        id_origen: tarifa?.id_origen ?? '',
        id_destino: tarifa?.id_destino ?? '',
        modo: tarifa?.modo ?? 'Maritimo',
        incluye_fcl: tarifa?.incluye_fcl ?? false,
        incluye_lcl: tarifa?.incluye_lcl ?? false,
        dias_transito: tarifa?.dias_transito ?? '',
        costo_base: tarifa?.costo_base ?? '',
        costo_tramite: tarifa?.costo_tramite ?? '',
        moneda_tramite: tarifa?.moneda_tramite ?? 'USD',
        moneda: tarifa?.moneda ?? 'USD',
        tipo_tarifa: tarifa?.tipo_tarifa ?? 'Normal',
        observaciones: tarifa?.observaciones ?? '',
        fecha_inicio_vigencia: tarifa?.fecha_inicio_vigencia ?? '',
        fecha_fin_vigencia: tarifa?.fecha_fin_vigencia ?? '',
        costos_fcl: tarifa?.costos_fcl?.length
            ? tarifa.costos_fcl
            : [{ tipo_contenedor: '20 DRY', costo: '', moneda: 'USD' }],
        costos_lcl: tarifa?.costos_lcl?.length
            ? tarifa.costos_lcl
            : [{ costo: '', moneda: 'USD' }],
        cargos_adicionales: tarifa?.cargos_adicionales ?? [],
    });

    const esMaritimo = data.modo === 'Maritimo';
    const esTerrestre = data.modo === 'Terrestre';
    const esAereo = data.modo === 'Aereo';
    const permiteFclLcl = esMaritimo || esTerrestre;
    const esFclTerrestre = esTerrestre && data.incluye_fcl;

    const puertosFiltrados = useMemo(() => {
        const tipoRequerido = TIPO_PUERTO_POR_MODO[data.modo];

        if (!tipoRequerido) {
            return puertos;
        }

        return puertos.filter(
            (puerto) =>
                puerto.tipo === tipoRequerido ||
                puerto.codigo === data.id_origen ||
                puerto.codigo === data.id_destino,
        );
    }, [puertos, data.modo, data.id_origen, data.id_destino]);

    const submit = (e) => {
        e.preventDefault();

        if (isEditing) {
            put(route('gerente-operativo.tarifas.update', tarifa.id_tarifa));
        } else {
            post(route('gerente-operativo.tarifas.store'));
        }
    };

    const agregarCostoFcl = () => {
        setData('costos_fcl', [
            ...data.costos_fcl,
            { tipo_contenedor: '20 DRY', costo: '', moneda: 'USD' },
        ]);
    };

    const quitarCostoFcl = (index) => {
        setData('costos_fcl', data.costos_fcl.filter((_, i) => i !== index));
    };

    const actualizarCostoFcl = (index, campo, valor) => {
        const copia = [...data.costos_fcl];
        copia[index] = { ...copia[index], [campo]: valor };
        setData('costos_fcl', copia);
    };

    const agregarCostoLcl = () => {
        setData('costos_lcl', [...data.costos_lcl, { costo: '', moneda: 'USD' }]);
    };

    const quitarCostoLcl = (index) => {
        setData('costos_lcl', data.costos_lcl.filter((_, i) => i !== index));
    };

    const actualizarCostoLcl = (index, campo, valor) => {
        const copia = [...data.costos_lcl];
        copia[index] = { ...copia[index], [campo]: valor };
        setData('costos_lcl', copia);
    };

    const agregarCargo = () => {
        setData('cargos_adicionales', [
            ...data.cargos_adicionales,
            { concepto: '', monto: '', moneda: 'USD' },
        ]);
    };

    const quitarCargo = (index) => {
        setData(
            'cargos_adicionales',
            data.cargos_adicionales.filter((_, i) => i !== index),
        );
    };

    const actualizarCargo = (index, campo, valor) => {
        const copia = [...data.cargos_adicionales];
        copia[index] = { ...copia[index], [campo]: valor };
        setData('cargos_adicionales', copia);
    };

    const inputClass =
        'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]';
    const labelClass = 'text-sm font-medium text-[#042753]';

    return (
        <GerenteOperativoLayout
            header={isEditing ? 'Editar Tarifa' : 'Nueva Tarifa'}
        >
            <Head title={isEditing ? 'Editar Tarifa' : 'Nueva Tarifa'} />

            <form
                onSubmit={submit}
                className="max-w-3xl space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className={labelClass}>Proveedor</label>
                        <select
                            className={inputClass}
                            value={data.id_proveedor}
                            onChange={(e) =>
                                setData('id_proveedor', e.target.value)
                            }
                        >
                            <option value="">Selecciona un proveedor</option>
                            {proveedores.map((p) => (
                                <option
                                    key={p.id_proveedor}
                                    value={p.id_proveedor}
                                >
                                    {p.nombre} ({p.tipo})
                                </option>
                            ))}
                        </select>
                        {errors.id_proveedor && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.id_proveedor}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className={labelClass}>Modo</label>
                        <select
                            className={inputClass}
                            value={data.modo}
                            onChange={(e) =>
                                setData({
                                    ...data,
                                    modo: e.target.value,
                                    id_origen: '',
                                    id_destino: '',
                                })
                            }
                        >
                            <option value="Maritimo">Marítimo</option>
                            <option value="Aereo">Aéreo</option>
                            <option value="Terrestre">Terrestre</option>
                        </select>
                        {errors.modo && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.modo}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className={labelClass}>Origen</label>
                        <select
                            className={inputClass}
                            value={data.id_origen}
                            onChange={(e) =>
                                setData('id_origen', e.target.value)
                            }
                        >
                            <option value="">—</option>
                            {puertosFiltrados.map((p) => (
                                <option key={p.codigo} value={p.codigo}>
                                    {p.codigo} — {p.nombre}
                                </option>
                            ))}
                        </select>
                        {errors.id_origen && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.id_origen}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className={labelClass}>Destino</label>
                        <select
                            className={inputClass}
                            value={data.id_destino}
                            onChange={(e) =>
                                setData('id_destino', e.target.value)
                            }
                        >
                            <option value="">—</option>
                            {puertosFiltrados.map((p) => (
                                <option key={p.codigo} value={p.codigo}>
                                    {p.codigo} — {p.nombre}
                                </option>
                            ))}
                        </select>
                        {errors.id_destino && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.id_destino}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className={labelClass}>Tipo de Tarifa</label>
                        <input
                            type="text"
                            className={inputClass}
                            value={data.tipo_tarifa}
                            onChange={(e) =>
                                setData('tipo_tarifa', e.target.value)
                            }
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Días de Tránsito</label>
                        <input
                            type="number"
                            min="0"
                            className={inputClass}
                            value={data.dias_transito}
                            onChange={(e) =>
                                setData('dias_transito', e.target.value)
                            }
                        />
                    </div>

                    {esAereo && (
                        <div>
                            <label className={labelClass}>Moneda</label>
                            <select
                                className={inputClass}
                                value={data.moneda}
                                onChange={(e) =>
                                    setData('moneda', e.target.value)
                                }
                            >
                                {MONEDAS.map((m) => (
                                    <option key={m.valor} value={m.valor}>
                                        {m.etiqueta}
                                    </option>
                                ))}
                            </select>
                            {errors.moneda && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.moneda}
                                </p>
                            )}
                        </div>
                    )}

                    {esAereo && (
                        <div>
                            <label className={labelClass}>
                                Tarifa por Kilo
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                className={inputClass}
                                value={data.costo_base}
                                onChange={(e) =>
                                    setData('costo_base', e.target.value)
                                }
                            />
                            {errors.costo_base && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.costo_base}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {permiteFclLcl && (
                    <div className="space-y-4 border-t border-gray-100 pt-4">
                        <div className="flex flex-wrap gap-6">
                            <label className="flex items-center gap-2 text-sm font-medium text-[#042753]">
                                <input
                                    type="checkbox"
                                    checked={data.incluye_fcl}
                                    onChange={(e) =>
                                        setData('incluye_fcl', e.target.checked)
                                    }
                                    className="rounded border-gray-300 text-[#71BFA6] focus:ring-[#71BFA6]"
                                />
                                Incluye FCL (por contenedor)
                            </label>
                            <label className="flex items-center gap-2 text-sm font-medium text-[#042753]">
                                <input
                                    type="checkbox"
                                    checked={data.incluye_lcl}
                                    onChange={(e) =>
                                        setData('incluye_lcl', e.target.checked)
                                    }
                                    className="rounded border-gray-300 text-[#71BFA6] focus:ring-[#71BFA6]"
                                />
                                Incluye LCL (por m³)
                            </label>
                        </div>
                        {errors.incluye_fcl && (
                            <p className="text-sm text-red-600">
                                {errors.incluye_fcl}
                            </p>
                        )}

                        {data.incluye_fcl && (
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-[#042753]">
                                        Costos por Contenedor (FCL)
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={agregarCostoFcl}
                                        className="text-sm font-medium text-[#71BFA6] hover:underline"
                                    >
                                        + Agregar contenedor
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {data.costos_fcl.map((costo, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2"
                                        >
                                            <select
                                                className={inputClass}
                                                value={costo.tipo_contenedor}
                                                onChange={(e) =>
                                                    actualizarCostoFcl(
                                                        index,
                                                        'tipo_contenedor',
                                                        e.target.value,
                                                    )
                                                }
                                            >
                                                {TIPOS_CONTENEDOR.map((tipo) => (
                                                    <option key={tipo} value={tipo}>
                                                        {tipo}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="Costo"
                                                className={`${inputClass} max-w-[140px]`}
                                                value={costo.costo}
                                                onChange={(e) =>
                                                    actualizarCostoFcl(
                                                        index,
                                                        'costo',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <select
                                                className={`${inputClass} max-w-[110px]`}
                                                value={costo.moneda}
                                                onChange={(e) =>
                                                    actualizarCostoFcl(
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
                                            {data.costos_fcl.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => quitarCostoFcl(index)}
                                                    className="text-red-600 hover:underline"
                                                >
                                                    Quitar
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {errors.costos_fcl && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.costos_fcl}
                                    </p>
                                )}
                            </div>
                        )}

                        {data.incluye_lcl && (
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-[#042753]">
                                        Costos LCL (por m³)
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={agregarCostoLcl}
                                        className="text-sm font-medium text-[#71BFA6] hover:underline"
                                    >
                                        + Agregar línea
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {data.costos_lcl.map((costo, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2"
                                        >
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="Costo por m³"
                                                className={`${inputClass} max-w-[160px]`}
                                                value={costo.costo}
                                                onChange={(e) =>
                                                    actualizarCostoLcl(
                                                        index,
                                                        'costo',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <select
                                                className={`${inputClass} max-w-[110px]`}
                                                value={costo.moneda}
                                                onChange={(e) =>
                                                    actualizarCostoLcl(
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
                                            {data.costos_lcl.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => quitarCostoLcl(index)}
                                                    className="text-red-600 hover:underline"
                                                >
                                                    Quitar
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {errors.costos_lcl && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.costos_lcl}
                                    </p>
                                )}
                            </div>
                        )}

                        {esFclTerrestre && (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className={labelClass}>
                                        Costo de Trámite
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="Ej. 150"
                                        className={inputClass}
                                        value={data.costo_tramite}
                                        onChange={(e) =>
                                            setData('costo_tramite', e.target.value)
                                        }
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>
                                        Moneda del Trámite
                                    </label>
                                    <select
                                        className={inputClass}
                                        value={data.moneda_tramite}
                                        onChange={(e) =>
                                            setData('moneda_tramite', e.target.value)
                                        }
                                    >
                                        {MONEDAS.map((m) => (
                                            <option key={m.valor} value={m.valor}>
                                                {m.etiqueta}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2">
                    <div>
                        <label className={labelClass}>
                            Inicio de Vigencia
                        </label>
                        <input
                            type="date"
                            className={inputClass}
                            value={data.fecha_inicio_vigencia}
                            onChange={(e) =>
                                setData(
                                    'fecha_inicio_vigencia',
                                    e.target.value,
                                )
                            }
                        />
                        {errors.fecha_inicio_vigencia && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.fecha_inicio_vigencia}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className={labelClass}>Fin de Vigencia</label>
                        <input
                            type="date"
                            className={inputClass}
                            value={data.fecha_fin_vigencia}
                            onChange={(e) =>
                                setData('fecha_fin_vigencia', e.target.value)
                            }
                        />
                        {errors.fecha_fin_vigencia && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.fecha_fin_vigencia}
                            </p>
                        )}
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Observaciones</label>
                    <textarea
                        rows={3}
                        placeholder="Ej. Peso permitido: 25000 kg"
                        className={inputClass}
                        value={data.observaciones}
                        onChange={(e) =>
                            setData('observaciones', e.target.value)
                        }
                    />
                    {errors.observaciones && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.observaciones}
                        </p>
                    )}
                </div>

                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-[#042753]">
                            Cargos Adicionales
                        </h3>
                        <button
                            type="button"
                            onClick={agregarCargo}
                            className="text-sm font-medium text-[#71BFA6] hover:underline"
                        >
                            + Agregar cargo
                        </button>
                    </div>

                    <div className="space-y-2">
                        {data.cargos_adicionales.map((cargo, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2"
                            >
                                <input
                                    type="text"
                                    placeholder="Concepto (ej. THC/CNTR)"
                                    className={inputClass}
                                    value={cargo.concepto}
                                    onChange={(e) =>
                                        actualizarCargo(
                                            index,
                                            'concepto',
                                            e.target.value,
                                        )
                                    }
                                />
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="Monto"
                                    className={`${inputClass} max-w-[140px]`}
                                    value={cargo.monto}
                                    onChange={(e) =>
                                        actualizarCargo(
                                            index,
                                            'monto',
                                            e.target.value,
                                        )
                                    }
                                />
                                <select
                                    className={`${inputClass} max-w-[110px]`}
                                    value={cargo.moneda}
                                    onChange={(e) =>
                                        actualizarCargo(
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
                                <button
                                    type="button"
                                    onClick={() => quitarCargo(index)}
                                    className="text-red-600 hover:underline"
                                >
                                    Quitar
                                </button>
                            </div>
                        ))}

                        {data.cargos_adicionales.length === 0 && (
                            <p className="text-sm text-[#A9ABAE]">
                                Sin cargos adicionales.
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-md bg-[#71BFA6] px-4 py-2 text-sm font-semibold text-[#042753] hover:opacity-90 disabled:opacity-50"
                    >
                        {isEditing ? 'Guardar Cambios' : 'Crear Tarifa'}
                    </button>
                </div>
            </form>
        </GerenteOperativoLayout>
    );
}
