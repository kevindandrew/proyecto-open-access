// resources/js/Components/Embarques/ContenedorModal.jsx
import React from "react";
import { useForm } from "@inertiajs/react";

export default function ContenedorModal({ embarqueId, contenedor, onClose }) {
    const isEditing = !!contenedor;

    const { data, setData, post, put, processing, errors } = useForm({
        fecha_devolucion: contenedor?.fecha_devolucion || "",
        numero_contenedor: contenedor?.numero_contenedor || "",
        numero_sello: contenedor?.numero_sello || "",
        tipo_contenedor: contenedor?.tipo_contenedor || "20' DRY",
        descripcion: contenedor?.descripcion || "",
        peso_kg: contenedor?.peso_kg || "",
        volumen_cbm: contenedor?.volumen_cbm || "",
        nro_piezas: contenedor?.nro_piezas || "",
        unidad_piezas: contenedor?.unidad_piezas || "CTNS",
        chargeable_weight: contenedor?.chargeable_weight || "",
        descripcion_mercaderia: contenedor?.descripcion_mercaderia || "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(
                route(
                    "gerente-operativo.contenedores.update",
                    contenedor.id_contenedor,
                ),
                {
                    onSuccess: () => onClose(),
                },
            );
        } else {
            post(
                route(
                    "gerente-operativo.embarques.contenedores.store",
                    embarqueId,
                ),
                {
                    onSuccess: () => onClose(),
                },
            );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl overflow-hidden border border-gray-200">
                <div className="bg-[#042753] px-6 py-4 text-white flex justify-between items-center">
                    <h3 className="font-semibold text-lg">
                        {isEditing
                            ? `Editar Contenedor ${data.numero_contenedor}`
                            : "Agregar Nuevo Contenedor / Carga"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-300 hover:text-white text-xl"
                    >
                        &times;
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
                >
                    {/* Fila 1: Datos Principales del Contenedor */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700">
                                Fecha Devolución
                            </label>
                            <input
                                type="date"
                                className="mt-1 w-full rounded-md border-gray-300 text-xs shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                value={data.fecha_devolucion}
                                onChange={(e) =>
                                    setData("fecha_devolucion", e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700">
                                No. Contenedor
                            </label>
                            <input
                                type="text"
                                placeholder="ej. MSCU7164830"
                                className="mt-1 w-full rounded-md border-gray-300 text-xs shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                value={data.numero_contenedor}
                                onChange={(e) =>
                                    setData("numero_contenedor", e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700">
                                No. de Sello
                            </label>
                            <input
                                type="text"
                                placeholder="ej. 1049373"
                                className="mt-1 w-full rounded-md border-gray-300 text-xs shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                value={data.numero_sello}
                                onChange={(e) =>
                                    setData("numero_sello", e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700">
                                Tipo Contenedor
                            </label>
                            <select
                                className="mt-1 w-full rounded-md border-gray-300 text-xs shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                value={data.tipo_contenedor}
                                onChange={(e) =>
                                    setData("tipo_contenedor", e.target.value)
                                }
                            >
                                <option value="20' DRY">20' DRY</option>
                                <option value="40' DRY">40' DRY</option>
                                <option value="40' HC">40' HC</option>
                                <option value="NOR">NOR</option>
                                <option value="REEFER">REEFER</option>
                                <option value="SUELTA/AEREO">
                                    SUELTA / AÉREO
                                </option>
                            </select>
                        </div>
                    </div>

                    {/* Fila 2: Métricas Pesos y Volúmenes */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700">
                                Peso Gross (KGS)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                className="mt-1 w-full rounded-md border-gray-300 text-xs shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                value={data.peso_kg}
                                onChange={(e) =>
                                    setData("peso_kg", e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700">
                                Volumen (CBM)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                className="mt-1 w-full rounded-md border-gray-300 text-xs shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                value={data.volumen_cbm}
                                onChange={(e) =>
                                    setData("volumen_cbm", e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700">
                                Nro. Piezas / Bultos
                            </label>
                            <input
                                type="number"
                                className="mt-1 w-full rounded-md border-gray-300 text-xs shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                value={data.nro_piezas}
                                onChange={(e) =>
                                    setData("nro_piezas", e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700">
                                Unidad Piezas
                            </label>
                            <input
                                type="text"
                                placeholder="ej. CTNS / PKGS"
                                className="mt-1 w-full rounded-md border-gray-300 text-xs shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                value={data.unidad_piezas}
                                onChange={(e) =>
                                    setData("unidad_piezas", e.target.value)
                                }
                            />
                        </div>
                    </div>

                    {/* Fila 3: Descripción de Mercadería */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700">
                            Naturaleza y Descripción de la Mercadería (Nature
                            and Quantity of Goods)
                        </label>
                        <textarea
                            rows={3}
                            placeholder="ej. ADULT FACE MASK CVC 60% COTTON - INVOICE KZM-GDR44"
                            className="mt-1 w-full rounded-md border-gray-300 text-xs shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                            value={data.descripcion_mercaderia}
                            onChange={(e) =>
                                setData(
                                    "descripcion_mercaderia",
                                    e.target.value,
                                )
                            }
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-md bg-[#71BFA6] px-5 py-2 text-xs font-bold text-[#042753] hover:opacity-90"
                        >
                            {isEditing ? "Actualizar" : "Guardar Contenedor"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
