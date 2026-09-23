const inputClass =
    'mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]';
const labelClass = 'text-xs font-medium text-[#042753]';

export function consignatarioVacio() {
    return {
        id_consignatario: null,
        nombre: '',
        nit: '',
        direccion: '',
        celular: '',
        correo: '',
    };
}

export function mapearConsignatariosIniciales(consignatarios) {
    return (consignatarios ?? []).map((consignatario) => ({
        id_consignatario: consignatario.id_consignatario,
        nombre: consignatario.nombre ?? '',
        nit: consignatario.nit ?? '',
        direccion: consignatario.direccion ?? '',
        celular: consignatario.celular ?? '',
        correo: consignatario.correo ?? '',
    }));
}

export function useConsignatariosMultiples(data, setData, campo = 'consignatarios', campoEliminados = 'consignatarios_eliminados') {
    const agregar = () => {
        setData(campo, [...data[campo], consignatarioVacio()]);
    };

    const actualizar = (index, clave, valor) => {
        setData(
            campo,
            data[campo].map((consignatario, i) =>
                i === index ? { ...consignatario, [clave]: valor } : consignatario,
            ),
        );
    };

    const quitar = (index) => {
        const consignatario = data[campo][index];

        setData({
            ...data,
            [campo]: data[campo].filter((_, i) => i !== index),
            [campoEliminados]: consignatario.id_consignatario
                ? [...data[campoEliminados], consignatario.id_consignatario]
                : data[campoEliminados],
        });
    };

    return { agregar, actualizar, quitar };
}

export default function ConsignatariosMultiples({
    consignatarios,
    agregar,
    quitar,
    actualizar,
    errores = {},
    campoErrores = 'consignatarios',
    titulo = 'Consignatarios (opcional)',
    descripcion = 'Un cliente puede tener más de un consignatario — agregá los que necesites.',
}) {
    return (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-[#042753]">{titulo}</label>
                <button
                    type="button"
                    onClick={agregar}
                    className="text-sm font-medium text-[#71BFA6] hover:underline"
                >
                    + Agregar consignatario
                </button>
            </div>
            <p className="mb-2 text-xs text-[#A9ABAE]">{descripcion}</p>

            <div className="space-y-3">
                {consignatarios.map((consignatario, index) => (
                    <div key={index} className="rounded-md border border-gray-200 bg-white p-3">
                        <div className="flex items-start justify-between gap-2">
                            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                                <div>
                                    <label className={labelClass}>Nombre</label>
                                    <input
                                        type="text"
                                        placeholder="Ej. Juan Pérez"
                                        className={inputClass}
                                        value={consignatario.nombre}
                                        onChange={(e) => actualizar(index, 'nombre', e.target.value)}
                                    />
                                    <p className="mt-1 text-xs text-red-600">
                                        {errores[`${campoErrores}.${index}.nombre`]}
                                    </p>
                                </div>
                                <div>
                                    <label className={labelClass}>NIT / CI</label>
                                    <input
                                        type="text"
                                        placeholder="Ej. 1023456011"
                                        className={inputClass}
                                        value={consignatario.nit}
                                        onChange={(e) => actualizar(index, 'nit', e.target.value)}
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className={labelClass}>Dirección</label>
                                    <input
                                        type="text"
                                        placeholder="Ej. Av. Siempre Viva #123"
                                        className={inputClass}
                                        value={consignatario.direccion}
                                        onChange={(e) => actualizar(index, 'direccion', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Celular</label>
                                    <input
                                        type="text"
                                        placeholder="Ej. 71234567"
                                        className={inputClass}
                                        value={consignatario.celular}
                                        onChange={(e) => actualizar(index, 'celular', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Correo</label>
                                    <input
                                        type="email"
                                        placeholder="Ej. consignatario@empresa.com"
                                        className={inputClass}
                                        value={consignatario.correo}
                                        onChange={(e) => actualizar(index, 'correo', e.target.value)}
                                    />
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => quitar(index)}
                                className="mt-5 flex-shrink-0 text-sm font-medium text-red-600 hover:underline"
                            >
                                Quitar
                            </button>
                        </div>
                    </div>
                ))}

                {consignatarios.length === 0 && (
                    <p className="text-sm text-[#A9ABAE]">Todavía no se agregó ningún consignatario.</p>
                )}
            </div>
        </div>
    );
}
