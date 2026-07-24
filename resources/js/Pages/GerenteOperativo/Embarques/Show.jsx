// resources/js/Pages/GerenteOperativo/Embarques/Show.jsx
import React, { useState } from "react";
import GerenteOperativoLayout from "@/Layouts/GerenteOperativoLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import AsignarOperativo from "@/Components/Embarques/AsignarOperativo";
import CambiarEstado from "@/Components/Embarques/CambiarEstado";
import ModoTransporteBadge from "@/Components/ModoTransporteBadge";
import HouseHblManager from "./HouseHblManager";
import ContenedorModal from "./ContenedorModal";

export default function Show({
    embarque,
    contenedores = [],
    seguimientos = [],
    operativosDisponibles = [],
}) {
    const isTerrestre = embarque.modo_transporte?.toLowerCase() === "terrestre";

    // Formulario interactivo del Embarque Operativo
    const { data, setData, put, processing } = useForm({
        master_bl_hawb: embarque.master_bl_hawb || embarque.mbl || "",
        etd: embarque.etd || "",
        eta: embarque.eta || "",
        nave: embarque.nave || "",
        viaje: embarque.viaje || "",
        pago_master: embarque.pago_master || "COLLECT",
        pago_house: embarque.pago_house || "COLLECT",
        houses: embarque.houses || [],

        // Campos específicos Terrestre
        es_sobrefacturado: embarque.es_sobrefacturado || "NO",
        monto_sobrefacturado: embarque.monto_sobrefacturado || "",
        flete_menor: embarque.flete_menor || "NO",
        porcentajes_terrestre: embarque.porcentajes_terrestre || "50/50",
        recinto_aduanero: embarque.recinto_aduanero || "",
        tramite_aduanero: embarque.tramite_aduanero || "",
        tramite_puerto: embarque.tramite_puerto || "",
        pagos_liberacion: embarque.pagos_liberacion || "",
    });

    // Estado para controlar el modal de contenedores
    const [modalContenedor, setModalContenedor] = useState(false);
    const [contenedorEditar, setContenedorEditar] = useState(null);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        put(route("gerente-operativo.embarques.update", embarque.id_embarque));
    };

    return (
        <GerenteOperativoLayout header={`FILE: #${embarque.numero_file}`}>
            <Head title={`Embarque ${embarque.numero_file}`} />

            {/* Encabezado Principal */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="text-3xl font-black text-[#042753]">
                        FILE #{embarque.numero_file}
                    </span>
                    <ModoTransporteBadge modo={embarque.modo_transporte} />
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200 uppercase">
                        {embarque.estado_embarque}
                    </span>
                </div>
                <Link
                    href={route("gerente-operativo.embarques.index")}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm"
                >
                    &larr; Volver al Listado
                </Link>
            </div>

            {/* CARD 1: INFORMACIÓN DETALLADA DE LA COTIZACIÓN */}
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between border-b pb-3 mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#042753]">
                        Datos del Embarque (Provenientes de Cotización)
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-gray-400">
                            QUOTE REFERENCE:
                        </span>
                        <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs font-bold text-[#042753] border border-gray-300">
                            {embarque.quote_reference || "—"}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                        <p className="text-gray-500 font-medium">
                            Modo de Transporte
                        </p>
                        <p className="font-semibold text-gray-800">
                            {embarque.modo_transporte || "—"}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-500 font-medium">
                            Tipo de Embarque
                        </p>
                        <p className="font-semibold text-gray-800">
                            {embarque.tipo_embarque || "—"}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-500 font-medium">
                            Oficina de Venta
                        </p>
                        <p className="font-semibold text-gray-800">
                            {embarque.oficina_venta || "—"}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-500 font-medium">
                            Generado por (Comercial)
                        </p>
                        <p className="font-semibold text-gray-800">
                            {embarque.generado_por || "—"}
                        </p>
                    </div>

                    <div>
                        <p className="text-gray-500 font-medium">
                            Oficina Operacional
                        </p>
                        <p className="font-semibold text-gray-800">
                            {embarque.oficina_operacional || "—"}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-500 font-medium">
                            Número de FILE
                        </p>
                        <p className="font-bold font-mono text-[#042753]">
                            {embarque.numero_file || "—"}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-500 font-medium">
                            Cliente / Razón Social
                        </p>
                        <p className="font-bold text-[#042753]">
                            {embarque.cliente || "—"}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-500 font-medium">
                            Consignatario
                        </p>
                        <p className="font-semibold text-gray-800">
                            {embarque.consignatario || "—"}
                        </p>
                    </div>

                    <div>
                        <p className="text-gray-500 font-medium">
                            POL (Puerto Embarque)
                        </p>
                        <p className="font-semibold text-gray-800">
                            {embarque.pol || "—"}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-500 font-medium">
                            POD (Puerto Destino)
                        </p>
                        <p className="font-semibold text-gray-800">
                            {embarque.pod || "—"}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-500 font-medium">
                            Destino Final
                        </p>
                        <p className="font-semibold text-gray-800">
                            {embarque.destino_final || "—"}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-500 font-medium">
                            Línea Naviera / Aérea
                        </p>
                        <p className="font-semibold text-gray-800">
                            {embarque.naviera_aerolinea || "—"}
                        </p>
                    </div>

                    <div>
                        <p className="text-gray-500 font-medium">
                            Agente en Origen
                        </p>
                        <p className="font-semibold text-gray-800">
                            {embarque.agente_origen || "—"}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-500 font-medium">
                            Agente en Destino
                        </p>
                        <p className="font-semibold text-gray-800">
                            {embarque.agente_destino || "—"}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-500 font-medium">
                            Operativo Asignado
                        </p>
                        <p className="font-bold text-[#71BFA6]">
                            {embarque.operativo || "Sin Asignar"}
                        </p>
                    </div>
                </div>
            </div>

            {/* FORMULARIO DE CONTROL OPERATIVO */}
            <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-sm font-bold text-[#042753] border-b pb-2 uppercase tracking-wide">
                        Documentación y Control del Master
                    </h3>

                    {/* SECCIÓN MASTER (MBL / MAWB) */}
                    <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50/30 p-4">
                        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#042753]">
                            Información del Documento Master
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div>
                                <label className="block font-bold text-gray-700">
                                    Código MASTER (MBL / MAWB){" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="mt-1 w-full rounded-md border-gray-300 font-mono text-xs font-bold uppercase text-[#042753] shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                    placeholder="Escribe el código Master manualmente (ej: MSCUWD822422)"
                                    value={data.master_bl_hawb}
                                    onChange={(e) =>
                                        setData(
                                            "master_bl_hawb",
                                            e.target.value.toUpperCase(),
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-gray-700">
                                    Modo de Pago Master
                                </label>
                                <select
                                    className="mt-1 w-full rounded-md border-gray-300 text-xs shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                    value={data.pago_master}
                                    onChange={(e) =>
                                        setData("pago_master", e.target.value)
                                    }
                                >
                                    <option value="COLLECT">COLLECT</option>
                                    <option value="PREPAID">PREPAID</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN FECHAS Y TRANSPORTE */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                        <div>
                            <label className="block font-semibold text-gray-700">
                                Fecha Salida (ETD)
                            </label>
                            <input
                                type="date"
                                className="mt-1 w-full rounded-md border-gray-300 text-xs shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                value={data.etd}
                                onChange={(e) => setData("etd", e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-gray-700">
                                Fecha Llegada (ETA)
                            </label>
                            <input
                                type="date"
                                className="mt-1 w-full rounded-md border-gray-300 text-xs shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                value={data.eta}
                                onChange={(e) => setData("eta", e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-gray-700">
                                Nave / Muro
                            </label>
                            <input
                                type="text"
                                className="mt-1 w-full rounded-md border-gray-300 text-xs shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                value={data.nave}
                                onChange={(e) =>
                                    setData("nave", e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-gray-700">
                                Viaje / Vuelo
                            </label>
                            <input
                                type="text"
                                className="mt-1 w-full rounded-md border-gray-300 text-xs shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                value={data.viaje}
                                onChange={(e) =>
                                    setData("viaje", e.target.value)
                                }
                            />
                        </div>
                    </div>

                    {/* Módulo Administrador de Houses (HBL) */}
                    <div className="mt-6 pt-4 border-t border-gray-100">
                        <HouseHblManager
                            houses={data.houses}
                            onChange={(nuevosHouses) =>
                                setData("houses", nuevosHouses)
                            }
                        />
                    </div>
                </div>

                {/* MODULO PLANIFICACIÓN TERRESTRE (MUESTRA SÓLO SI EL MODO ES TERRESTRE) */}
                {isTerrestre && (
                    <div className="rounded-xl border border-amber-300 bg-amber-50/50 p-6 shadow-sm">
                        <h3 className="mb-4 text-xs font-bold text-amber-900 border-b border-amber-200 pb-2 uppercase tracking-wide">
                            Planificación Terrestre
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                            <div>
                                <label className="block font-semibold text-amber-900">
                                    ¿Sobrefacturado?
                                </label>
                                <select
                                    className="mt-1 w-full rounded-md border-gray-300 text-xs shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                    value={data.es_sobrefacturado}
                                    onChange={(e) =>
                                        setData(
                                            "es_sobrefacturado",
                                            e.target.value,
                                        )
                                    }
                                >
                                    <option value="SI">SI</option>
                                    <option value="NO">NO</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold text-amber-900">
                                    Importe Sobrefacturado (USD)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="mt-1 w-full rounded-md border-gray-300 text-xs shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                    value={data.monto_sobrefacturado}
                                    onChange={(e) =>
                                        setData(
                                            "monto_sobrefacturado",
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className="block font-semibold text-amber-900">
                                    ¿Flete Menor?
                                </label>
                                <select
                                    className="mt-1 w-full rounded-md border-gray-300 text-xs shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                    value={data.flete_menor}
                                    onChange={(e) =>
                                        setData("flete_menor", e.target.value)
                                    }
                                >
                                    <option value="SI">SI</option>
                                    <option value="NO">NO</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold text-amber-900">
                                    Recinto Aduanero
                                </label>
                                <input
                                    type="text"
                                    className="mt-1 w-full rounded-md border-gray-300 text-xs shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                    value={data.recinto_aduanero}
                                    onChange={(e) =>
                                        setData(
                                            "recinto_aduanero",
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Botón para guardar modificaciones del Embarque */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-md bg-[#042753] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#042753]/90 transition-all"
                    >
                        Guardar Información Operativa
                    </button>
                </div>
            </form>

            {/* SECCIÓN DE CONTENEDORES Y DETALLE DE CARGA */}
            <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-[#042753] uppercase tracking-wide">
                        Detalle de Contenedores y Carga
                    </h3>
                    <button
                        type="button"
                        onClick={() => {
                            setContenedorEditar(null);
                            setModalContenedor(true);
                        }}
                        className="rounded-md bg-[#71BFA6] px-3 py-1.5 text-xs font-bold text-[#042753] hover:opacity-90 shadow-sm"
                    >
                        + Agregar Contenedor / Unidades
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left font-semibold text-gray-600">
                                    Fecha Dev.
                                </th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-600">
                                    Nro. Contenedor
                                </th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-600">
                                    Sello
                                </th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-600">
                                    Tipo
                                </th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-600">
                                    Peso (kg)
                                </th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-600">
                                    Volumen (CBM)
                                </th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-600">
                                    Piezas/Bultos
                                </th>
                                <th className="px-3 py-2 text-center font-semibold text-gray-600">
                                    Acción
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {contenedores.map((c) => (
                                <tr
                                    key={c.id_contenedor}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-3 py-2 text-gray-500">
                                        {c.fecha_devolucion || "—"}
                                    </td>
                                    <td className="px-3 py-2 font-mono font-bold text-[#042753]">
                                        {c.numero_contenedor}
                                    </td>
                                    <td className="px-3 py-2 text-gray-600">
                                        {c.numero_sello || "—"}
                                    </td>
                                    <td className="px-3 py-2 font-medium">
                                        {c.tipo_contenedor}
                                    </td>
                                    <td className="px-3 py-2">
                                        {c.peso_kg || "—"}
                                    </td>
                                    <td className="px-3 py-2">
                                        {c.volumen_cbm || "—"}
                                    </td>
                                    <td className="px-3 py-2">
                                        {c.nro_piezas
                                            ? `${c.nro_piezas} ${c.unidad_piezas || ""}`
                                            : "—"}
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setContenedorEditar(c);
                                                setModalContenedor(true);
                                            }}
                                            className="text-xs font-bold text-[#042753] underline hover:text-[#71BFA6]"
                                        >
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {contenedores.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="text-center py-6 text-gray-400"
                                    >
                                        No hay contenedores registrados.
                                        Presiona "+ Agregar Contenedor" para
                                        añadir uno.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL DE CREACIÓN / EDICIÓN DE CONTENEDOR */}
            {modalContenedor && (
                <ContenedorModal
                    embarqueId={embarque.id_embarque}
                    contenedor={contenedorEditar}
                    onClose={() => setModalContenedor(false)}
                />
            )}

            {/* SECCIÓN INFERIOR: ASIGNACIÓN Y CAMBIO DE ESTADO */}
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#042753]">
                        Asignación de Operativo
                    </h3>
                    <AsignarOperativo
                        embarque={embarque}
                        operativosDisponibles={operativosDisponibles}
                    />
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#042753]">
                        Actualizar Flujo / Estado
                    </h3>
                    <CambiarEstado
                        embarque={embarque}
                        rutaEstado="gerente-operativo.embarques.cambiar-estado"
                    />
                </div>
            </div>
        </GerenteOperativoLayout>
    );
}
