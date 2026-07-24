// resources/js/Pages/GerenteOperativo/Embarques/Index.jsx
import React from "react";
import GerenteOperativoLayout from "@/Layouts/GerenteOperativoLayout";
import { Head, Link, router } from "@inertiajs/react";
import ModoTransporteBadge from "@/Components/ModoTransporteBadge";

export default function Index({
    embarques,
    filtros,
    operativos,
    modos,
    estados,
}) {
    const handleFilterChange = (key, value) => {
        router.get(
            route("gerente-operativo.embarques.index"),
            { ...filtros, [key]: value },
            { preserveState: true, replace: true },
        );
    };

    return (
        <GerenteOperativoLayout header="Gestión de Embarques">
            <Head title="Embarques Operativos" />

            {/* Barra de Filtros */}
            <div className="mb-6 grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-3">
                <div>
                    <label className="block text-xs font-semibold text-gray-600">
                        Modo Transportes
                    </label>
                    <select
                        className="mt-1 w-full rounded-md border-gray-300 text-xs focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                        value={filtros.modo_transporte || ""}
                        onChange={(e) =>
                            handleFilterChange(
                                "modo_transporte",
                                e.target.value,
                            )
                        }
                    >
                        <option value="">Todos los modos</option>
                        {modos.map((m) => (
                            <option key={m} value={m}>
                                {m}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-600">
                        Operativo Responsable
                    </label>
                    <select
                        className="mt-1 w-full rounded-md border-gray-300 text-xs focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                        value={filtros.id_operativo || ""}
                        onChange={(e) =>
                            handleFilterChange("id_operativo", e.target.value)
                        }
                    >
                        <option value="">Todos los operativos</option>
                        {operativos.map((op) => (
                            <option key={op.id_empleado} value={op.id_empleado}>
                                {op.nombre_completo}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-600">
                        Estado del Embarque
                    </label>
                    <select
                        className="mt-1 w-full rounded-md border-gray-300 text-xs focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                        value={filtros.estado_embarque || ""}
                        onChange={(e) =>
                            handleFilterChange(
                                "estado_embarque",
                                e.target.value,
                            )
                        }
                    >
                        <option value="">Todos los estados</option>
                        {estados.map((est) => (
                            <option key={est} value={est}>
                                {est}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tabla de Embarques */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-xs">
                    <thead className="bg-[#042753] text-white">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold">
                                Nro. FILE
                            </th>
                            <th className="px-4 py-3 text-left font-semibold">
                                Cliente / Razón Social
                            </th>
                            <th className="px-4 py-3 text-left font-semibold">
                                Modo
                            </th>
                            <th className="px-4 py-3 text-left font-semibold">
                                Operativo Asignado
                            </th>
                            <th className="px-4 py-3 text-left font-semibold">
                                ETA
                            </th>
                            <th className="px-4 py-3 text-left font-semibold">
                                Estado
                            </th>
                            <th className="px-4 py-3 text-center font-semibold">
                                Acción
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {embarques.map((emb) => (
                            <tr
                                key={emb.id_embarque}
                                className="hover:bg-gray-50"
                            >
                                <td className="px-4 py-3 font-mono font-bold text-[#042753]">
                                    #{emb.numero_file}
                                </td>
                                <td className="px-4 py-3 font-semibold text-gray-800">
                                    {emb.cliente || "—"}
                                </td>
                                <td className="px-4 py-3">
                                    <ModoTransporteBadge
                                        modo={emb.modo_transporte}
                                    />
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                    {emb.operativo ? (
                                        <span className="inline-flex items-center gap-1 font-medium text-gray-800">
                                            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                            {emb.operativo}
                                        </span>
                                    ) : (
                                        <span className="italic text-amber-600">
                                            Sin Asignar
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                    {emb.eta || "—"}
                                </td>
                                <td className="px-4 py-3">
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-700 uppercase border border-slate-200">
                                        {emb.estado_embarque}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <Link
                                        href={route(
                                            "gerente-operativo.embarques.show",
                                            emb.id_embarque,
                                        )}
                                        className="rounded-md bg-[#71BFA6] px-3 py-1.5 font-bold text-[#042753] hover:opacity-80 transition-all shadow-sm"
                                    >
                                        Ver Detalle
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {embarques.length === 0 && (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="py-8 text-center text-gray-400"
                                >
                                    No se encontraron embarques registrados con
                                    los filtros seleccionados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </GerenteOperativoLayout>
    );
}
