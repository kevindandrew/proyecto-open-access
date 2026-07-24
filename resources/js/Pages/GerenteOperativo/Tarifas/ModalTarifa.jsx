import React, { useState, useEffect, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { IconoAgregar, IconoEliminar } from "@/Components/ActionIcons";

const MONEDAS = [
    { valor: "USD", etiqueta: "USD ($)" },
    { valor: "EUR", etiqueta: "EUR (€)" },
    { valor: "BOB", etiqueta: "BOB (Bs)" },
];

const TIPOS_CONTENEDOR = [
    { valor: "20' ST", etiqueta: "20' Standard" },
    { valor: "40' ST", etiqueta: "40' Standard" },
    { valor: "40' HC", etiqueta: "40' High Cube" },
    { valor: "20' RF", etiqueta: "20' Reefer" },
    { valor: "40' RF", etiqueta: "40' Reefer" },
];

export default function ModalTarifa({
    isOpen = false,
    onClose = () => {},
    tarifa = null,
    proveedores = [],
    ubicaciones = [],
    onSave = () => {},
}) {
    const isEditing = Boolean(tarifa);

    const [form, setForm] = useState({
        categoria_proveedor: "Carrier",
        id_proveedor: "",
        modo: "Maritimo",
        id_origen: "",
        id_destino: "",
        tipo_servicio: "FCL",
        dias_transito: "",
        moneda: "USD",
        contenedores: [{ tipo: "20' ST", costo: "", moneda: "USD" }],
        recargos: [],
        costo_kilo: "",
        costo_cbm: "",
        costo_tramite: "",
        peso_permitido: "",
        observaciones: "",
        valido_desde: "",
        valido_hasta: "",
    });

    useEffect(() => {
        if (tarifa) {
            setForm({
                ...tarifa,
                categoria_proveedor: tarifa.categoria_proveedor || "Carrier",
                id_proveedor: tarifa.id_proveedor || "",
                modo: tarifa.modo || "Maritimo",
                id_origen: tarifa.id_origen || "",
                id_destino: tarifa.id_destino || "",
                tipo_servicio: tarifa.tipo_servicio || "FCL",
                dias_transito: tarifa.dias_transito || "",
                moneda: tarifa.moneda || "USD",
                contenedores:
                    Array.isArray(tarifa.contenedores) &&
                    tarifa.contenedores.length > 0
                        ? tarifa.contenedores
                        : [
                              {
                                  tipo: "20' ST",
                                  costo: tarifa.tarifa_base || "",
                                  moneda: tarifa.moneda || "USD",
                              },
                          ],
                recargos: Array.isArray(tarifa.recargos) ? tarifa.recargos : [],
                costo_kilo: tarifa.costo_kilo || "",
                costo_cbm: tarifa.costo_cbm || "",
                costo_tramite: tarifa.costo_tramite || "",
                peso_permitido: tarifa.peso_permitido || "",
                observaciones: tarifa.observaciones || "",
                valido_desde: tarifa.valido_desde || "",
                valido_hasta: tarifa.valido_hasta || "",
            });
        } else {
            setForm({
                categoria_proveedor: "Carrier",
                id_proveedor: "",
                modo: "Maritimo",
                id_origen: "",
                id_destino: "",
                tipo_servicio: "FCL",
                dias_transito: "",
                moneda: "USD",
                contenedores: [{ tipo: "20' ST", costo: "", moneda: "USD" }],
                recargos: [],
                costo_kilo: "",
                costo_cbm: "",
                costo_tramite: "",
                peso_permitido: "",
                observaciones: "",
                valido_desde: "",
                valido_hasta: "",
            });
        }
    }, [tarifa, isOpen]);

    // Filtrar Proveedores con protección contra null/undefined
    const proveedoresFiltrados = useMemo(() => {
        const lista = Array.isArray(proveedores) ? proveedores : [];
        return lista.filter((p) => {
            if (!p) return false;
            if (form.categoria_proveedor === "Carrier") {
                return [
                    "Naviera",
                    "Aerolínea",
                    "Transportista",
                    "Carrier",
                ].includes(p.tipo);
            }
            return ["Agente", "Forwarder", "Agente de Carga"].includes(p.tipo);
        });
    }, [proveedores, form.categoria_proveedor]);

    // Filtrar Ubicaciones por modo de transporte
    const ubicacionesFiltradas = useMemo(() => {
        const lista = Array.isArray(ubicaciones) ? ubicaciones : [];
        return lista.filter((u) => {
            if (!u) return false;
            if (form.modo === "Maritimo") return u.tipo === "Puerto";
            if (form.modo === "Aereo") return u.tipo === "Aeropuerto";
            if (form.modo === "Terrestre")
                return (
                    u.tipo === "Frontera" ||
                    u.tipo === "Puerto" ||
                    u.tipo === "Terminal"
                );
            return true;
        });
    }, [ubicaciones, form.modo]);

    // Funciones para Manejo de Contenedores
    const agregarContenedor = () => {
        setForm((prev) => ({
            ...prev,
            contenedores: [
                ...(prev.contenedores || []),
                { tipo: "40' HC", costo: "", moneda: prev.moneda || "USD" },
            ],
        }));
    };

    const actualizarContenedor = (index, campo, valor) => {
        setForm((prev) => {
            const copia = [...(prev.contenedores || [])];
            if (copia[index]) {
                copia[index][campo] = valor;
            }
            return { ...prev, contenedores: copia };
        });
    };

    const eliminarContenedor = (index) => {
        setForm((prev) => ({
            ...prev,
            contenedores: (prev.contenedores || []).filter(
                (_, i) => i !== index,
            ),
        }));
    };

    // Funciones para Manejo de Recargos Adicionales
    const agregarRecargo = () => {
        setForm((prev) => ({
            ...prev,
            recargos: [
                ...(prev.recargos || []),
                {
                    concepto: "",
                    monto: "",
                    moneda: prev.moneda || "USD",
                    tipo: "por_contenedor",
                },
            ],
        }));
    };

    const actualizarRecargo = (index, campo, valor) => {
        setForm((prev) => {
            const copia = [...(prev.recargos || [])];
            if (copia[index]) {
                copia[index][campo] = valor;
            }
            return { ...prev, recargos: copia };
        });
    };

    const eliminarRecargo = (index) => {
        setForm((prev) => ({
            ...prev,
            recargos: (prev.recargos || []).filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
    };

    const inputClass =
        "mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]";
    const labelClass =
        "text-xs font-semibold text-[#042753] uppercase tracking-wider";

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-white p-6 shadow-xl transition-all">
                                <Dialog.Title
                                    as="h3"
                                    className="mb-4 border-b pb-3 text-lg font-bold text-[#042753]"
                                >
                                    {isEditing
                                        ? "Editar Tarifa"
                                        : "Nueva Tarifa"}
                                </Dialog.Title>

                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-4"
                                >
                                    {/* SELECCIÓN PROVEEDOR */}
                                    <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-3 sm:grid-cols-3">
                                        <div>
                                            <label className={labelClass}>
                                                Tipo Proveedor
                                            </label>
                                            <select
                                                className={inputClass}
                                                value={form.categoria_proveedor}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        categoria_proveedor:
                                                            e.target.value,
                                                        id_proveedor: "",
                                                    })
                                                }
                                            >
                                                <option value="Carrier">
                                                    Carrier (Naviera/Aerolínea)
                                                </option>
                                                <option value="Agente">
                                                    Agente de Carga
                                                </option>
                                            </select>
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className={labelClass}>
                                                Proveedor (
                                                {form.categoria_proveedor})
                                            </label>
                                            <select
                                                required
                                                className={inputClass}
                                                value={form.id_proveedor}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        id_proveedor:
                                                            e.target.value,
                                                    })
                                                }
                                            >
                                                <option value="">
                                                    Seleccionar Proveedor...
                                                </option>
                                                {(
                                                    proveedoresFiltrados || []
                                                ).map((p) => (
                                                    <option
                                                        key={
                                                            p.id ||
                                                            p.id_proveedor
                                                        }
                                                        value={
                                                            p.id ||
                                                            p.id_proveedor
                                                        }
                                                    >
                                                        {p.nombre} ({p.tipo})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* MODO Y SERVICIO */}
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className={labelClass}>
                                                Modo de Transporte
                                            </label>
                                            <select
                                                className={inputClass}
                                                value={form.modo}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        modo: e.target.value,
                                                        id_origen: "",
                                                        id_destino: "",
                                                    })
                                                }
                                            >
                                                <option value="Maritimo">
                                                    Marítimo
                                                </option>
                                                <option value="Aereo">
                                                    Aéreo
                                                </option>
                                                <option value="Terrestre">
                                                    Terrestre
                                                </option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className={labelClass}>
                                                Tipo de Servicio
                                            </label>
                                            <select
                                                className={inputClass}
                                                value={form.tipo_servicio}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        tipo_servicio:
                                                            e.target.value,
                                                    })
                                                }
                                            >
                                                <option value="FCL">
                                                    FCL (Contenedor Completo)
                                                </option>
                                                <option value="LCL">
                                                    LCL (Carga Consolidada)
                                                </option>
                                                <option value="Ambos">
                                                    Ambos (FCL & LCL)
                                                </option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* ORIGEN Y DESTINO DINÁMICOS */}
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className={labelClass}>
                                                Origen ({form.modo})
                                            </label>
                                            <select
                                                required
                                                className={inputClass}
                                                value={form.id_origen}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        id_origen:
                                                            e.target.value,
                                                    })
                                                }
                                            >
                                                <option value="">
                                                    Seleccionar Origen...
                                                </option>
                                                {(
                                                    ubicacionesFiltradas || []
                                                ).map((u) => (
                                                    <option
                                                        key={
                                                            u.id ||
                                                            u.id_ubicacion
                                                        }
                                                        value={
                                                            u.id ||
                                                            u.id_ubicacion
                                                        }
                                                    >
                                                        {u.codigo
                                                            ? `[${u.codigo}] `
                                                            : ""}
                                                        {u.nombre} - ({u.pais})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className={labelClass}>
                                                Destino ({form.modo})
                                            </label>
                                            <select
                                                required
                                                className={inputClass}
                                                value={form.id_destino}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        id_destino:
                                                            e.target.value,
                                                    })
                                                }
                                            >
                                                <option value="">
                                                    Seleccionar Destino...
                                                </option>
                                                {(
                                                    ubicacionesFiltradas || []
                                                ).map((u) => (
                                                    <option
                                                        key={
                                                            u.id ||
                                                            u.id_ubicacion
                                                        }
                                                        value={
                                                            u.id ||
                                                            u.id_ubicacion
                                                        }
                                                    >
                                                        {u.codigo
                                                            ? `[${u.codigo}] `
                                                            : ""}
                                                        {u.nombre} - ({u.pais})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* TRÁNSITO Y TRÁMITE */}
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                        <div>
                                            <label className={labelClass}>
                                                Días de Tránsito
                                            </label>
                                            <input
                                                type="number"
                                                placeholder="Ej. 35"
                                                className={inputClass}
                                                value={form.dias_transito}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        dias_transito:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </div>

                                        {form.modo === "Terrestre" &&
                                            (form.tipo_servicio === "FCL" ||
                                                form.tipo_servicio ===
                                                    "Ambos") && (
                                                <div>
                                                    <label
                                                        className={labelClass}
                                                    >
                                                        Costo Trámite
                                                    </label>
                                                    <input
                                                        type="number"
                                                        placeholder="Monto Trámite"
                                                        className={inputClass}
                                                        value={
                                                            form.costo_tramite
                                                        }
                                                        onChange={(e) =>
                                                            setForm({
                                                                ...form,
                                                                costo_tramite:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                    />
                                                </div>
                                            )}

                                        {form.modo === "Terrestre" && (
                                            <div>
                                                <label className={labelClass}>
                                                    Peso Permitido (Kg)
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Ej. 22,000 kg"
                                                    className={inputClass}
                                                    value={form.peso_permitido}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            peso_permitido:
                                                                e.target.value,
                                                        })
                                                    }
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* TARIFAS AÉREAS POR KILO */}
                                    {form.modo === "Aereo" && (
                                        <div className="grid grid-cols-2 gap-4 border-t pt-3">
                                            <div>
                                                <label className={labelClass}>
                                                    Costo por Kilo
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    className={inputClass}
                                                    value={form.costo_kilo}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            costo_kilo:
                                                                e.target.value,
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <label className={labelClass}>
                                                    Moneda
                                                </label>
                                                <select
                                                    className={inputClass}
                                                    value={form.moneda}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            moneda: e.target
                                                                .value,
                                                        })
                                                    }
                                                >
                                                    {MONEDAS.map((m) => (
                                                        <option
                                                            key={m.valor}
                                                            value={m.valor}
                                                        >
                                                            {m.etiqueta}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {/* CONTENEDORES Y PRECIOS BASE */}
                                    {(form.tipo_servicio === "FCL" ||
                                        form.tipo_servicio === "Ambos") &&
                                        form.modo !== "Aereo" && (
                                            <div className="space-y-3 border-t pt-3">
                                                <div className="flex items-center justify-between">
                                                    <label
                                                        className={labelClass}
                                                    >
                                                        Contenedores & Tarifas
                                                        Base
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={
                                                            agregarContenedor
                                                        }
                                                        className="inline-flex items-center gap-1 rounded-md bg-[#042753] px-3 py-1.5 text-xs font-bold text-white transition hover:opacity-90"
                                                    >
                                                        <IconoAgregar className="h-3 w-3" />
                                                        Contenedor
                                                    </button>
                                                </div>

                                                <div className="max-h-36 space-y-2 overflow-y-auto pr-1">
                                                    {(
                                                        form.contenedores || []
                                                    ).map((cont, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 p-2"
                                                        >
                                                            <select
                                                                className="w-1/3 rounded-md border-gray-300 text-xs"
                                                                value={
                                                                    cont.tipo
                                                                }
                                                                onChange={(e) =>
                                                                    actualizarContenedor(
                                                                        idx,
                                                                        "tipo",
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            >
                                                                {TIPOS_CONTENEDOR.map(
                                                                    (t) => (
                                                                        <option
                                                                            key={
                                                                                t.valor
                                                                            }
                                                                            value={
                                                                                t.valor
                                                                            }
                                                                        >
                                                                            {
                                                                                t.etiqueta
                                                                            }
                                                                        </option>
                                                                    ),
                                                                )}
                                                            </select>

                                                            <input
                                                                type="number"
                                                                placeholder="Monto Tarifa"
                                                                className="w-1/3 rounded-md border-gray-300 text-xs"
                                                                value={
                                                                    cont.costo
                                                                }
                                                                onChange={(e) =>
                                                                    actualizarContenedor(
                                                                        idx,
                                                                        "costo",
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />

                                                            <select
                                                                className="w-1/4 rounded-md border-gray-300 text-xs"
                                                                value={
                                                                    cont.moneda
                                                                }
                                                                onChange={(e) =>
                                                                    actualizarContenedor(
                                                                        idx,
                                                                        "moneda",
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            >
                                                                {MONEDAS.map(
                                                                    (m) => (
                                                                        <option
                                                                            key={
                                                                                m.valor
                                                                            }
                                                                            value={
                                                                                m.valor
                                                                            }
                                                                        >
                                                                            {
                                                                                m.valor
                                                                            }
                                                                        </option>
                                                                    ),
                                                                )}
                                                            </select>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    eliminarContenedor(
                                                                        idx,
                                                                    )
                                                                }
                                                                className="p-1 text-red-500 transition hover:text-red-700"
                                                                title="Eliminar contenedor"
                                                            >
                                                                <IconoEliminar className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                    {/* RECARGOS ADICIONALES (THC, Box Fee, MBL, Doc, etc.) */}
                                    <div className="space-y-3 border-t pt-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className={labelClass}>
                                                    Recargos Adicionales
                                                </label>
                                                <p className="text-[11px] text-gray-500">
                                                    Conceptos adicionales (THC,
                                                    Box Fee, MBL Release, etc.).
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={agregarRecargo}
                                                className="inline-flex items-center gap-1 rounded-md border border-[#042753] px-2.5 py-1 text-xs font-bold text-[#042753] transition hover:bg-gray-100"
                                            >
                                                <IconoAgregar className="h-3 w-3" />
                                                Recargo
                                            </button>
                                        </div>

                                        <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
                                            {(form.recargos || []).map(
                                                (rec, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 p-2 text-xs"
                                                    >
                                                        <input
                                                            type="text"
                                                            placeholder="Concepto (Ej. THC, Box Fee)"
                                                            className="w-1/3 rounded-md border-gray-300 text-xs"
                                                            value={rec.concepto}
                                                            onChange={(e) =>
                                                                actualizarRecargo(
                                                                    idx,
                                                                    "concepto",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />

                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            placeholder="Monto"
                                                            className="w-1/4 rounded-md border-gray-300 text-xs"
                                                            value={rec.monto}
                                                            onChange={(e) =>
                                                                actualizarRecargo(
                                                                    idx,
                                                                    "monto",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />

                                                        <select
                                                            className="w-1/3 rounded-md border-gray-300 text-xs"
                                                            value={rec.tipo}
                                                            onChange={(e) =>
                                                                actualizarRecargo(
                                                                    idx,
                                                                    "tipo",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        >
                                                            <option value="por_contenedor">
                                                                Por Contenedor
                                                                (/cntr)
                                                            </option>
                                                            <option value="por_embarque">
                                                                Por Embarque
                                                                (/BL)
                                                            </option>
                                                        </select>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                eliminarRecargo(
                                                                    idx,
                                                                )
                                                            }
                                                            className="p-1 text-red-500 transition hover:text-red-700"
                                                        >
                                                            <IconoEliminar className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>

                                    {/* OBSERVACIONES */}
                                    <div className="border-t pt-3">
                                        <label className={labelClass}>
                                            Observaciones / Notas Adicionales
                                        </label>
                                        <textarea
                                            rows="2"
                                            placeholder="Detalles adicionales (ej. variación CBM en LCL, pesos, recargos especiales)..."
                                            className={inputClass}
                                            value={form.observaciones}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    observaciones:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </div>

                                    {/* VIGENCIA */}
                                    <div className="grid grid-cols-2 gap-4 border-t pt-3">
                                        <div>
                                            <label className={labelClass}>
                                                Válido Desde
                                            </label>
                                            <input
                                                type="date"
                                                className={inputClass}
                                                value={form.valido_desde}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        valido_desde:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>
                                                Válido Hasta
                                            </label>
                                            <input
                                                type="date"
                                                className={inputClass}
                                                value={form.valido_hasta}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        valido_hasta:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>

                                    {/* ACCIONES DEL MODAL */}
                                    <div className="flex justify-end gap-3 border-t pt-4">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="rounded-md px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="rounded-md bg-[#042753] px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-[#031d3d]"
                                        >
                                            Guardar Tarifa
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
