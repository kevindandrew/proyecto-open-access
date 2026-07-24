import React, { useState } from "react";

export default function HouseHblManager({ houses = [], onChange }) {
    // Generar prefijo alfanumérico aleatorio de 6 caracteres si no existe
    const [codigoBase, setCodigoBase] = useState(() => {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    });

    const abecedario = "abcdefghijklmnopqrstuvwxyz";

    const handleCantidadChange = (cantidad) => {
        const num = parseInt(cantidad, 10) || 0;
        const nuevosHouses = [];

        for (let i = 0; i < num; i++) {
            const sufijo = abecedario[i] || `_${i + 1}`;
            // Mantiene los datos existentes si ya fueron tipeados o actualizados
            const codigoExistente = houses[i]?.codigo;
            nuevosHouses.push({
                id: houses[i]?.id || i,
                codigo: codigoExistente || `OA-${codigoBase}${sufijo}`,
            });
        }
        onChange(nuevosHouses);
    };

    const handleHouseEdit = (index, nuevoValor) => {
        const actualizados = [...houses];
        actualizados[index].codigo = nuevoValor;
        onChange(actualizados);
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
            <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-[#042753]">
                    Gestión de House (HBL / HAWB)
                </label>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                        Cantidad de Houses:
                    </span>
                    <input
                        type="number"
                        min="0"
                        max="10"
                        className="w-16 rounded-md border-gray-300 py-1 text-xs text-center font-bold focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                        value={houses.length}
                        onChange={(e) => handleCantidadChange(e.target.value)}
                    />
                </div>
            </div>

            {houses.length > 0 ? (
                <div className="space-y-2">
                    {houses.map((house, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-gray-400 w-20">
                                House #{idx + 1}:
                            </span>
                            <input
                                type="text"
                                className="w-full rounded-md border-gray-300 py-1 px-3 text-xs font-mono font-bold text-[#042753] shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                value={house.codigo}
                                onChange={(e) =>
                                    handleHouseEdit(idx, e.target.value)
                                }
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-gray-400 italic text-center py-2">
                    Sin códigos House asignados. Indica la cantidad arriba para
                    autogenerarlos.
                </p>
            )}
        </div>
    );
}
