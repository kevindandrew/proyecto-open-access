import React from "react";

export default function PasoRuta({ data, setData, errores }) {
    const MODOS = [
        { id: "Marítimo", label: "Marítimo" },
        { id: "Aéreo", label: "Aéreo" },
        { id: "Terrestre", label: "Terrestre" },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-[#042753]">
                    Ruta e Incoterm
                </h3>
                <p className="text-xs text-gray-500">
                    Define origen, destino y modo de transporte
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label className="block text-xs font-semibold text-gray-700">
                        Origen
                    </label>
                    <input
                        type="text"
                        value={data.pol}
                        onChange={(e) => setData("pol", e.target.value)}
                        placeholder="Ej. Shanghai, China"
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#042753] focus:outline-none"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-700">
                        Destino
                    </label>
                    <input
                        type="text"
                        value={data.pod}
                        onChange={(e) => setData("pod", e.target.value)}
                        placeholder="Ej. Cochabamba, Bolivia"
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#042753] focus:outline-none"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold text-gray-700">
                    Incoterm
                </label>
                <select
                    value={data.incoterm}
                    onChange={(e) => setData("incoterm", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-[#042753] focus:outline-none"
                >
                    <option value="FOB">FOB</option>
                    <option value="CIF">CIF</option>
                    <option value="EXW">EXW</option>
                    <option value="DDP">DDP</option>
                </select>
            </div>

            <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Modo de Transporte
                </label>
                <div className="grid grid-cols-3 gap-3">
                    {MODOS.map((m) => (
                        <button
                            key={m.id}
                            type="button"
                            onClick={() => setData("modo_transporte", m.id)}
                            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                                data.modo_transporte === m.id
                                    ? "border-[#042753] bg-gray-50 text-[#042753] ring-1 ring-[#042753]"
                                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                            }`}
                        >
                            <input
                                type="radio"
                                checked={data.modo_transporte === m.id}
                                onChange={() => {}}
                                className="h-4 w-4 text-[#042753]"
                            />
                            <span>{m.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
