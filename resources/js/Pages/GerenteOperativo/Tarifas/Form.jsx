import GerenteOperativoLayout from '@/Layouts/GerenteOperativoLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Form({ tarifa, proveedores, puertos }) {
    const isEditing = Boolean(tarifa);

    const { data, setData, post, put, processing, errors } = useForm({
        id_proveedor: tarifa?.id_proveedor ?? '',
        id_origen: tarifa?.id_origen ?? '',
        id_destino: tarifa?.id_destino ?? '',
        modo: tarifa?.modo ?? 'Maritimo',
        tipo_servicio: tarifa?.tipo_servicio ?? '',
        dias_transito: tarifa?.dias_transito ?? '',
        costo_20: tarifa?.costo_20 ?? '',
        costo_40: tarifa?.costo_40 ?? '',
        costo_40hc: tarifa?.costo_40hc ?? '',
        costo_cbm: tarifa?.costo_cbm ?? '',
        costo_base: tarifa?.costo_base ?? '',
        moneda: tarifa?.moneda ?? 'USD',
        tipo_tarifa: tarifa?.tipo_tarifa ?? 'Normal',
        fecha_inicio_vigencia: tarifa?.fecha_inicio_vigencia ?? '',
        fecha_fin_vigencia: tarifa?.fecha_fin_vigencia ?? '',
        cargos_adicionales: tarifa?.cargos_adicionales ?? [],
    });

    const esMaritimo = data.modo === 'Maritimo';
    const esFCL = esMaritimo && data.tipo_servicio === 'FCL';
    const esLCL = esMaritimo && data.tipo_servicio === 'LCL';

    const submit = (e) => {
        e.preventDefault();

        if (isEditing) {
            put(route('gerente-operativo.tarifas.update', tarifa.id_tarifa));
        } else {
            post(route('gerente-operativo.tarifas.store'));
        }
    };

    const agregarCargo = () => {
        setData('cargos_adicionales', [
            ...data.cargos_adicionales,
            { concepto: '', monto: '' },
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
                                    tipo_servicio:
                                        e.target.value === 'Maritimo'
                                            ? data.tipo_servicio
                                            : '',
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
                            {puertos.map((p) => (
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
                            {puertos.map((p) => (
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

                    {esMaritimo && (
                        <div>
                            <label className={labelClass}>Tipo de Servicio</label>
                            <select
                                className={inputClass}
                                value={data.tipo_servicio}
                                onChange={(e) =>
                                    setData('tipo_servicio', e.target.value)
                                }
                            >
                                <option value="">Selecciona FCL o LCL</option>
                                <option value="FCL">FCL — contenedor completo</option>
                                <option value="LCL">LCL — carga consolidada (por m³)</option>
                            </select>
                            {errors.tipo_servicio && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.tipo_servicio}
                                </p>
                            )}
                        </div>
                    )}

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

                    <div>
                        <label className={labelClass}>Moneda</label>
                        <input
                            type="text"
                            className={inputClass}
                            value={data.moneda}
                            onChange={(e) =>
                                setData('moneda', e.target.value)
                            }
                        />
                    </div>

                    {esFCL && (
                        <>
                            <div>
                                <label className={labelClass}>Costo 20' (por contenedor)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className={inputClass}
                                    value={data.costo_20}
                                    onChange={(e) =>
                                        setData('costo_20', e.target.value)
                                    }
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Costo 40' (por contenedor)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className={inputClass}
                                    value={data.costo_40}
                                    onChange={(e) =>
                                        setData('costo_40', e.target.value)
                                    }
                                />
                                {errors.costo_40 && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.costo_40}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Costo 40' HC (por contenedor)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className={inputClass}
                                    value={data.costo_40hc}
                                    onChange={(e) =>
                                        setData('costo_40hc', e.target.value)
                                    }
                                />
                            </div>
                        </>
                    )}

                    {esLCL && (
                        <div>
                            <label className={labelClass}>Costo por m³ (carga consolidada)</label>
                            <input
                                type="number"
                                step="0.01"
                                className={inputClass}
                                value={data.costo_cbm}
                                onChange={(e) =>
                                    setData('costo_cbm', e.target.value)
                                }
                            />
                            {errors.costo_cbm && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.costo_cbm}
                                </p>
                            )}
                        </div>
                    )}

                    {!esMaritimo && (
                        <div>
                            <label className={labelClass}>
                                {data.modo === 'Aereo'
                                    ? 'Tarifa por Kilo (USD/kg)'
                                    : 'Tarifa Plana (por viaje)'}
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
