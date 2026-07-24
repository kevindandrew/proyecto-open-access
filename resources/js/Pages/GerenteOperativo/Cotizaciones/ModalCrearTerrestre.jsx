import Modal from "@/Components/Modal";

export default function ModalCrearTerrestre({
    show,
    onClose,
    cotizacionMaritima,
    onConfirm,
}) {
    if (!cotizacionMaritima) return null;

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <h3 className="text-lg font-bold text-[#042753]">
                    Continuar con Tramo Terrestre
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                    Se creará una cotización terrestre utilizando el puerto
                    final
                    <strong className="text-gray-900">
                        {" "}
                        {cotizacionMaritima.pod}
                    </strong>{" "}
                    como punto de origen.
                </p>

                <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
                    <p>• Cliente: {cotizacionMaritima.cliente}</p>
                    <p>• Origen Terrestre: {cotizacionMaritima.pod}</p>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onConfirm(cotizacionMaritima)}
                        className="rounded-md bg-[#042753] px-4 py-2 text-sm font-semibold text-white hover:bg-[#063570]"
                    >
                        Crear Cotización Terrestre
                    </button>
                </div>
            </div>
        </Modal>
    );
}
