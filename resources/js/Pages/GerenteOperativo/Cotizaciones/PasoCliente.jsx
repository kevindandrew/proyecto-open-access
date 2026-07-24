import React, { useState, useRef, useEffect } from "react";

export default function PasoCliente({
    data = {},
    setData,
    clientesIniciales = [],
    errors = {},
}) {
    const [mostrarDesplegable, setMostrarDesplegable] = useState(false);

    const clienteSeleccionadoActual = clientesIniciales.find(
        (c) => c.id === data.id_cliente,
    );
    const [busqueda, setBusqueda] = useState(
        data.cliente_nombre || clienteSeleccionadoActual?.nombre || "",
    );

    const wrapperRef = useRef(null);

    const clientesFiltrados = clientesIniciales.filter((c) => {
        if (data.cliente_nombre && busqueda === data.cliente_nombre) {
            return true;
        }
        const nombre = (c.nombre || c.razon_social || "").toLowerCase();
        return nombre.includes(busqueda.toLowerCase());
    });

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target)
            ) {
                setMostrarDesplegable(false);
                if (!data.id_cliente && busqueda !== "") {
                    setBusqueda("");
                } else if (
                    data.id_cliente &&
                    busqueda !== data.cliente_nombre
                ) {
                    setBusqueda(data.cliente_nombre || "");
                }
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [data.id_cliente, data.cliente_nombre, busqueda]);

    const seleccionarCliente = (cliente) => {
        const nombreCompleto = cliente.nombre || cliente.razon_social;

        if (typeof setData === "function") {
            setData("id_cliente", cliente.id);
            setData("cliente_nombre", nombreCompleto);
        }

        setBusqueda(nombreCompleto);
        setMostrarDesplegable(false);
    };

    const handleInputChange = (e) => {
        const valor = e.target.value;
        setBusqueda(valor);
        setMostrarDesplegable(true);

        if (data.id_cliente && valor !== data.cliente_nombre) {
            if (typeof setData === "function") {
                setData("id_cliente", "");
                setData("cliente_nombre", "");
            }
        }
    };

    return (
        <div className="space-y-5 max-w-md">
            <div>
                <h2 className="text-base font-bold text-[#042753]">Cliente</h2>
                <p className="text-xs text-gray-500">
                    Selecciona el cliente para esta cotización
                </p>
            </div>

            <div className="relative" ref={wrapperRef}>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Cliente <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                    <input
                        type="text"
                        value={busqueda}
                        onFocus={() => setMostrarDesplegable(true)}
                        onChange={handleInputChange}
                        placeholder="Haz clic para desplegar o escribe para buscar..."
                        className={`w-full rounded-xl border bg-white px-3 py-2 text-xs text-gray-700 shadow-sm transition focus:outline-none focus:ring-1 ${
                            errors?.id_cliente
                                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                : "border-gray-200 focus:border-[#042753] focus:ring-[#042753]"
                        }`}
                    />

                    <div
                        onClick={() =>
                            setMostrarDesplegable(!mostrarDesplegable)
                        }
                        className="absolute inset-y-0 right-0 flex items-center px-3 cursor-pointer text-gray-400 hover:text-gray-600"
                    >
                        <svg
                            className={`h-4 w-4 transition-transform duration-200 ${
                                mostrarDesplegable ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </div>
                </div>

                {errors?.id_cliente && (
                    <p className="mt-1 text-[11px] text-red-500">
                        {errors.id_cliente}
                    </p>
                )}

                {mostrarDesplegable && (
                    <ul className="absolute z-50 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg text-xs">
                        {clientesFiltrados.length > 0 ? (
                            clientesFiltrados.map((cliente) => {
                                const esSeleccionado =
                                    cliente.id === data.id_cliente;

                                return (
                                    <li
                                        key={cliente.id}
                                        onClick={() =>
                                            seleccionarCliente(cliente)
                                        }
                                        className={`cursor-pointer px-3 py-2.5 transition flex items-center justify-between ${
                                            esSeleccionado
                                                ? "bg-[#042753]/5 font-semibold text-[#042753]"
                                                : "hover:bg-gray-50 text-gray-700"
                                        }`}
                                    >
                                        <span>{cliente.nombre}</span>
                                        {esSeleccionado && (
                                            <svg
                                                className="h-4 w-4 text-[#042753]"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        )}
                                    </li>
                                );
                            })
                        ) : (
                            <li className="px-3 py-2.5 text-gray-400 text-center">
                                No se encontraron clientes
                            </li>
                        )}
                    </ul>
                )}
            </div>

            <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Válido hasta <span className="text-red-500">*</span>
                </label>
                <input
                    type="date"
                    value={data.fecha_validez || ""}
                    onChange={(e) => {
                        if (typeof setData === "function") {
                            setData("fecha_validez", e.target.value);
                        }
                    }}
                    className={`w-full rounded-xl border bg-white px-3 py-2 text-xs text-gray-700 shadow-sm focus:outline-none focus:ring-1 ${
                        errors?.fecha_validez
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : "border-gray-200 focus:border-[#042753] focus:ring-[#042753]"
                    }`}
                />
                {errors?.fecha_validez && (
                    <p className="mt-1 text-[11px] text-red-500">
                        {errors.fecha_validez}
                    </p>
                )}
            </div>
        </div>
    );
}
