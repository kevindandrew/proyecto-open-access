import Modal from "@/Components/Modal";

export default function ModalAlertaTarifaInexistente({
    show,
    onClose,
    esGerenteComercial,
    onNotificarGerente,
}) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    ⚠️
                </div>
                <h3 className="mt-3 text-lg font-bold text-gray-900">
                    Tarifa Inexistente
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                    {esGerenteComercial
                        ? "La tarifa seleccionada no existe. Como Gerente Comercial, puedes autorizar y crear esta cotización manualmente."
                        : "No existe una tarifa vigente para esta combinación. Se enviará un aviso al Gerente Operativo para que proceda con su creación."}
                </p>

                <div className="mt-6 flex justify-center gap-3">
                    <button
                        onClick={onClose}
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Cancelar
                    </button>

                    {!esGerenteComercial ? (
                        <button
                            onClick={onNotificarGerente}
                            className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
                        >
                            Solicitar Tarifa al Gerente
                        </button>
                    ) : (
                        <button
                            onClick={onClose}
                            className="rounded-md bg-[#042753] px-4 py-2 text-sm font-semibold text-white"
                        >
                            Autorizar Cotización
                        </button>
                    )}
                </div>
            </div>
        </Modal>
    );
}
