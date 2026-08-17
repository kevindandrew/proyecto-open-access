import GerenteOperativoLayout from '@/Layouts/GerenteOperativoLayout';
import { MONEDAS } from '@/constants/monedas';
import { bloquearNotacionCientifica } from '@/utils/inputNumerico';
import { Head, useForm } from '@inertiajs/react';
import { useMemo } from 'react';

const TIPO_PUERTO_ORIGEN_POR_MODO = {
    Maritimo: 'Puerto',
    Aereo: 'Aeropuerto',
    Terrestre: 'Frontera',
};

const TIPO_PUERTO_DESTINO_POR_MODO = {
    Maritimo: 'Puerto',
    Aereo: 'Aeropuerto',
};

const CONCEPTOS_SUGERIDOS = [
    'THC Origen',
    'Documentación / Trámites',
    'Handling / Almacenaje',
    'Consolidación (LCL)',
];

export default function FormAgente({ tarifaAgente, agentes, puertos }) {
    const isEditing = Boolean(tarifaAgente);

    const { data, setData, post, put, processing, errors } = useForm({
        id_proveedor: tarifaAgente?.id_proveedor ?? '',
        modo: tarifaAgente?.modo ?? 'Maritimo',
        id_origen: tarifaAgente?.id_origen ?? '',
        id_destino: tarifaAgente?.id_destino ?? '',
        observaciones: tarifaAgente?.observaciones ?? '',
        fecha_inicio_vigencia: tarifaAgente?.fecha_inicio_vigencia ?? '',
        fecha_fin_vigencia: tarifaAgente?.fecha_fin_vigencia ?? '',
        costos: tarifaAgente?.costos?.length
            ? tarifaAgente.costos
            : [{ concepto: '', costo: '', moneda: 'USD' }],
    });

    const puertosOrigenFiltrados = useMemo(() => {
        const tipoRequerido = TIPO_PUERTO_ORIGEN_POR_MODO[data.modo];

        if (!tipoRequerido) {
            return puertos;
        }

        return puertos.filter(
            (puerto) => puerto.tipo === tipoRequerido || puerto.codigo === data.id_origen,
        );
    }, [puertos, data.modo, data.id_origen]);

    const puertosDestinoFiltrados = useMemo(() => {
        const tipoRequerido = TIPO_PUERTO_DESTINO_POR_MODO[data.modo];

        if (!tipoRequerido) {
            return puertos;
        }

        return puertos.filter(
            (puerto) => puerto.tipo === tipoRequerido || puerto.codigo === data.id_destino,
        );
    }, [puertos, data.modo, data.id_destino]);

    const submit = (e) => {
        e.preventDefault();

        if (isEditing) {
            put(route('gerente-operativo.tarifas-agente.update', tarifaAgente.id_tarifa_agente));
        } else {
            post(route('gerente-operativo.tarifas-agente.store'));
        }
    };

    const agregarCosto = () => {
        setData('costos', [...data.costos, { concepto: '', costo: '', moneda: 'USD' }]);
    };

    const quitarCosto = (index) => {
        setData('costos', data.costos.filter((_, i) => i !== index));
    };

    const actualizarCosto = (index, campo, valor) => {
        const copia = [...data.costos];
        copia[index] = { ...copia[index], [campo]: valor };
        setData('costos', copia);
    };

    const inputClass =
        'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]';
    const labelClass = 'text-sm font-medium text-[#042753]';

    return (
        <GerenteOperativoLayout
            header={isEditing ? 'Editar Tarifa de Agente' : 'Nueva Tarifa de Agente'}
        >
            <Head title={isEditing ? 'Editar Tarifa de Agente' : 'Nueva Tarifa de Agente'} />

            <form
                onSubmit={submit}
                className="max-w-3xl space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className={labelClass}>Agente</label>
                        <select
                            className={inputClass}
                            value={data.id_proveedor}
                            onChange={(e) => setData('id_proveedor', e.target.value)}
                        >
                            <option value="">Selecciona un agente</option>
                            {agentes.map((a) => (
                                <option key={a.id_proveedor} value={a.id_proveedor}>
                                    {a.nombre}
                                </option>
                            ))}
                        </select>
                        {errors.id_proveedor && (
                            <p className="mt-1 text-sm text-red-600">{errors.id_proveedor}</p>
                        )}
                        {agentes.length === 0 && (
                            <p className="mt-1 text-xs text-[#A9ABAE]">
                                Todavía no hay proveedores de tipo Agente de Origen. Cargá uno
                                en Configuración → Proveedores.
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
                            <p className="mt-1 text-sm text-red-600">{errors.modo}</p>
                        )}
                    </div>

                    <div>
                        <label className={labelClass}>Origen</label>
                        <select
                            className={inputClass}
                            value={data.id_origen}
                            onChange={(e) => setData('id_origen', e.target.value)}
                        >
                            <option value="">—</option>
                            {puertosOrigenFiltrados.map((p) => (
                                <option key={p.codigo} value={p.codigo}>
                                    {p.codigo} — {p.nombre}
                                </option>
                            ))}
                        </select>
                        {errors.id_origen && (
                            <p className="mt-1 text-sm text-red-600">{errors.id_origen}</p>
                        )}
                    </div>

                    <div>
                        <label className={labelClass}>Destino</label>
                        <select
                            className={inputClass}
                            value={data.id_destino}
                            onChange={(e) => setData('id_destino', e.target.value)}
                        >
                            <option value="">—</option>
                            {puertosDestinoFiltrados.map((p) => (
                                <option key={p.codigo} value={p.codigo}>
                                    {p.codigo} — {p.nombre}
                                </option>
                            ))}
                        </select>
                        {errors.id_destino && (
                            <p className="mt-1 text-sm text-red-600">{errors.id_destino}</p>
                        )}
                    </div>
                </div>

                <div>
                    <datalist id="conceptos-agente-sugeridos">
                        {CONCEPTOS_SUGERIDOS.map((concepto) => (
                            <option key={concepto} value={concepto} />
                        ))}
                    </datalist>
                    <div className="mb-1 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-[#042753]">
                            Conceptos y Costos
                        </h3>
                        <button
                            type="button"
                            onClick={agregarCosto}
                            className="text-sm font-medium text-[#71BFA6] hover:underline"
                        >
                            + Agregar concepto
                        </button>
                    </div>
                    <p className="mb-2 text-xs text-[#A9ABAE]">
                        Ej. THC Origen, Documentación / Trámites, Handling / Almacenaje,
                        Consolidación (LCL) — o escribí el que corresponda.
                    </p>
                    <div className="space-y-2">
                        {data.costos.map((costo, index) => (
                            <div key={index}>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        list="conceptos-agente-sugeridos"
                                        placeholder="Ej. THC Origen"
                                        className={inputClass}
                                        value={costo.concepto}
                                        onChange={(e) =>
                                            actualizarCosto(index, 'concepto', e.target.value)
                                        }
                                    />
                                    <input
                                        type="number"
                                        step="0.01"
                                        onKeyDown={bloquearNotacionCientifica}
                                        placeholder="Costo"
                                        className={`${inputClass} max-w-[140px]`}
                                        value={costo.costo}
                                        onChange={(e) =>
                                            actualizarCosto(index, 'costo', e.target.value)
                                        }
                                    />
                                    <select
                                        className={`${inputClass} max-w-[110px]`}
                                        value={costo.moneda}
                                        onChange={(e) =>
                                            actualizarCosto(index, 'moneda', e.target.value)
                                        }
                                    >
                                        {MONEDAS.map((m) => (
                                            <option key={m.valor} value={m.valor}>
                                                {m.valor}
                                            </option>
                                        ))}
                                    </select>
                                    {data.costos.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => quitarCosto(index)}
                                            className="text-red-600 hover:underline"
                                        >
                                            Quitar
                                        </button>
                                    )}
                                </div>
                                {errors[`costos.${index}.concepto`] && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors[`costos.${index}.concepto`]}
                                    </p>
                                )}
                                {errors[`costos.${index}.costo`] && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors[`costos.${index}.costo`]}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2">
                    <div>
                        <label className={labelClass}>Inicio de Vigencia</label>
                        <input
                            type="date"
                            className={inputClass}
                            value={data.fecha_inicio_vigencia}
                            onChange={(e) => setData('fecha_inicio_vigencia', e.target.value)}
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
                            onChange={(e) => setData('fecha_fin_vigencia', e.target.value)}
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
                        placeholder="Ej. Incluye handling en destino"
                        className={inputClass}
                        value={data.observaciones}
                        onChange={(e) => setData('observaciones', e.target.value)}
                    />
                    {errors.observaciones && (
                        <p className="mt-1 text-sm text-red-600">{errors.observaciones}</p>
                    )}
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-md bg-[#71BFA6] px-4 py-2 text-sm font-semibold text-[#042753] hover:opacity-90 disabled:opacity-50"
                    >
                        {isEditing ? 'Guardar Cambios' : 'Crear Tarifa de Agente'}
                    </button>
                </div>
            </form>
        </GerenteOperativoLayout>
    );
}
