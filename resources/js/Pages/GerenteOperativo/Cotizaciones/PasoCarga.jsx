import React from "react";

export default function PasoCarga({ data, setData }) {
    const TIPOS_CONTENEDOR = [
        { id: "20ST", label: "20' Standard" },
        { id: "40ST", label: "40' Standard" },
        { id: "40HQ", label: "40' High Cube" },
        { id: "40NORM", label: "40' Normal (40NORM)" },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-[#042753]">Carga</h3>
                <p className="text-xs text-gray-500">
                    Especifica el tipo de carga y sus dimensiones
                </p>
            </div>

            <div>
                <label className="block text-xs font-semibold text-gray-700">
                    Tipo de Carga / Contenedor
                </label>
                <select
                    value={data.tipo_contenedor}
                    onChange={(e) => setData("tipo_contenedor", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-[#042753] focus:outline-none"
                >
                    {TIPOS_CONTENEDOR.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                    <label className="block text-xs font-semibold text-gray-700">
                        Contenedores
                    </label>
                    <input
                        type="number"
                        min="1"
                        value={data.cantidad_contenedores}
                        onChange={(e) =>
                            setData("cantidad_contenedores", e.target.value)
                        }
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#042753] focus:outline-none"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-700">
                        Peso (kg)
                    </label>
                    <input
                        type="number"
                        value={data.peso_kg}
                        onChange={(e) => setData("peso_kg", e.target.value)}
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#042753] focus:outline-none"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-700">
                        Volumen (CBM)
                    </label>
                    <input
                        type="number"
                        value={data.volumen_cbm}
                        onChange={(e) => setData("volumen_cbm", e.target.value)}
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#042753] focus:outline-none"
                    />
                </div>
            </div>

            {/* Selector de Mercancía Peligrosa estilizado */}
            <div className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50/40 p-4">
                <div>
                    <p className="text-sm font-semibold text-amber-900">
                        Mercancía Peligrosa
                    </p>
                    <p className="text-xs text-amber-700">
                        Marca si la carga requiere manejo especial
                    </p>
                </div>
                <input
                    type="checkbox"
                    checked={data.es_peligrosa}
                    onChange={(e) => setData("es_peligrosa", e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 text-[#042753] focus:ring-0"
                />
            </div>
        </div>
    );
}
