import React from "react";

export default function PasoCostos({
    data,
    setData,
    errors,
    auth,
    tarifaEstado,
}) {
    const handleCostoChange = (field, value) => {
        setData(field, parseFloat(value) || 0);
    };

    const totalCalculado =
        (parseFloat(data.costo_flete) || 0) +
        (parseFloat(data.costos_origen) || 0) +
        (parseFloat(data.costos_destino) || 0);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-bold text-[#042753]">
                    Costos y Tarifas
                </h2>
                <p className="text-xs text-gray-500">
                    Establece el flete principal y los recargos en
                    origen/destino
                </p>
            </div>

            {/* ALERTA DE TARIFA SI APLICA */}
            {tarifaEstado && !tarifaEstado.existe && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
                    <strong>Atención:</strong> No se encontró una tarifa
                    automática para la ruta seleccionada. Se requiere ingreso
                    manual.
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Costo de Flete */}
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Flete Principal (USD)
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        value={data.costo_flete || ""}
                        onChange={(e) =>
                            handleCostoChange("costo_flete", e.target.value)
                        }
                        placeholder="0.00"
                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs text-gray-700 shadow-sm focus:border-[#042753] focus:outline-none"
                    />
                    {errors?.costo_flete && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.costo_flete}
                        </p>
                    )}
                </div>

                {/* Gastos en Origen */}
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Gastos en Origen (USD)
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        value={data.costos_origen || ""}
                        onChange={(e) =>
                            handleCostoChange("costos_origen", e.target.value)
                        }
                        placeholder="0.00"
                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs text-gray-700 shadow-sm focus:border-[#042753] focus:outline-none"
                    />
                </div>

                {/* Gastos en Destino */}
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Gastos en Destino (USD)
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        value={data.costos_destino || ""}
                        onChange={(e) =>
                            handleCostoChange("costos_destino", e.target.value)
                        }
                        placeholder="0.00"
                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs text-gray-700 shadow-sm focus:border-[#042753] focus:outline-none"
                    />
                </div>
            </div>

            {/* RESUMEN TOTAL DE COSTOS */}
            <div className="mt-6 rounded-xl bg-gray-50 p-4 flex items-center justify-between border border-gray-100">
                <span className="text-xs font-semibold text-gray-600">
                    Total Cotización Estimado:
                </span>
                <span className="text-base font-bold text-[#042753]">
                    USD{" "}
                    {totalCalculado.toLocaleString("es-BO", {
                        minimumFractionDigits: 2,
                    })}
                </span>
            </div>
        </div>
    );
}
