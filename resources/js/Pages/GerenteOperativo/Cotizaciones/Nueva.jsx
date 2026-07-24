import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import GerenteOperativoLayout from "@/Layouts/GerenteOperativoLayout";

import PasoCliente from "./PasoCliente";
import PasoRuta from "./PasoRuta";
import PasoCarga from "./PasoCarga";
import PasoCostos from "./PasoCostos";

const PASOS = [
    {
        id: 1,
        titulo: "Cliente",
        icon: (
            <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
            </svg>
        ),
    },
    {
        id: 2,
        titulo: "Ruta",
        icon: (
            <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
            </svg>
        ),
    },
    {
        id: 3,
        titulo: "Carga",
        icon: (
            <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
            </svg>
        ),
    },
    {
        id: 4,
        titulo: "Costos",
        icon: (
            <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
            </svg>
        ),
    },
    {
        id: 5,
        titulo: "Revisión",
        icon: (
            <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 022 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
            </svg>
        ),
    },
    {
        id: 6,
        titulo: "Acciones",
        icon: (
            <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
            </svg>
        ),
    },
];

export default function Nueva({
    clientes = [],
    puertos = [],
    tiposContenedor = [],
    costosExtrasCatalogo = [],
}) {
    const [pasoActual, setPasoActual] = useState(1);
    const [errors, setErrors] = useState({});

    // Homogenizado a id_cliente
    const [formData, setFormData] = useState({
        id_cliente: "",
        cliente_nombre: "",
        fecha_validez: "2026-08-23",
    });

    const updateFormData = (key, val) => {
        setFormData((prev) => ({ ...prev, [key]: val }));
    };

    const siguiente = () =>
        pasoActual < PASOS.length && setPasoActual((p) => p + 1);
    const anterior = () => pasoActual > 1 && setPasoActual((p) => p - 1);

    return (
        <GerenteOperativoLayout header="Nueva Cotización">
            <Head title="Nueva Cotización" />

            <div className="mx-auto max-w-5xl py-2 space-y-4">
                {/* FILA SUPERIOR: BARRA DE PASOS Y CANCELAR */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <div className="flex items-center justify-around flex-1 max-w-3xl">
                        {PASOS.map((paso) => {
                            const esActivo = paso.id === pasoActual;
                            const esCompletado = paso.id < pasoActual;

                            return (
                                <div
                                    key={paso.id}
                                    className="flex flex-col items-center"
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            paso.id < pasoActual &&
                                            setPasoActual(paso.id)
                                        }
                                        className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all ${
                                            esActivo
                                                ? "border-[#042753] bg-white text-[#042753] ring-2 ring-[#042753]/20 font-bold"
                                                : esCompletado
                                                  ? "border-gray-300 bg-gray-50 text-gray-700"
                                                  : "border-gray-200 bg-white text-gray-400"
                                        }`}
                                    >
                                        {paso.icon}
                                    </button>
                                    <span
                                        className={`mt-1 text-[11px] font-medium ${esActivo ? "text-[#042753] font-bold" : "text-gray-400"}`}
                                    >
                                        {paso.titulo}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <Link
                        href={route("gerente-operativo.cotizaciones.index")}
                        className="ml-4 flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-50"
                    >
                        ✕ Cancelar
                    </Link>
                </div>

                {/* CONTENIDO DEL PASO ACTUAL */}
                <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm min-h-[320px]">
                    {pasoActual === 1 && (
                        <PasoCliente
                            data={formData}
                            setData={updateFormData}
                            clientesIniciales={clientes}
                            errors={errors}
                        />
                    )}
                    {pasoActual === 2 && (
                        <PasoRuta
                            data={formData}
                            setData={updateFormData}
                            puertos={puertos}
                            errors={errors}
                        />
                    )}
                    {pasoActual === 3 && (
                        <PasoCarga
                            data={formData}
                            setData={updateFormData}
                            tiposContenedor={tiposContenedor}
                            errors={errors}
                        />
                    )}
                    {pasoActual === 4 && (
                        <PasoCostos
                            data={formData}
                            setData={updateFormData}
                            costosExtrasCatalogo={costosExtrasCatalogo}
                            errors={errors}
                        />
                    )}
                </div>

                {/* BOTONES DE NAVEGACIÓN */}
                <div className="flex items-center justify-between pt-2">
                    <button
                        type="button"
                        onClick={anterior}
                        disabled={pasoActual === 1}
                        className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-xs font-semibold text-gray-600 shadow-sm disabled:opacity-30"
                    >
                        ‹ Anterior
                    </button>

                    <button
                        type="button"
                        onClick={siguiente}
                        className="rounded-xl bg-[#042753] px-6 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#063570]"
                    >
                        Siguiente ›
                    </button>
                </div>
            </div>
        </GerenteOperativoLayout>
    );
}
