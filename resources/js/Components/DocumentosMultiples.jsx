import CampoDocumento from '@/Components/CampoDocumento';

const inputClass =
    'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]';
const labelClass = 'text-sm font-medium text-[#042753]';

export function documentoVacio() {
    return {
        id_documento: null,
        tipo_documento: '',
        personalizado: false,
        frente: null,
        dorso: null,
        frente_url: null,
        dorso_url: null,
    };
}

export function mapearDocumentosIniciales(documentos) {
    return (documentos ?? []).map((documento) => ({
        id_documento: documento.id_documento,
        tipo_documento: documento.tipo_documento,
        personalizado: false,
        frente: null,
        dorso: null,
        frente_url: documento.frente_url,
        dorso_url: documento.dorso_url,
    }));
}

export function useDocumentosMultiples(data, setData, campo = 'documentos', campoEliminados = 'documentos_eliminados') {
    const agregar = () => {
        setData(campo, [...data[campo], documentoVacio()]);
    };

    const actualizar = (index, clave, valor) => {
        setData(
            campo,
            data[campo].map((documento, i) => (i === index ? { ...documento, [clave]: valor } : documento)),
        );
    };

    const cambiarTipo = (index, valorSelect) => {
        setData(
            campo,
            data[campo].map((documento, i) => {
                if (i !== index) return documento;
                return valorSelect === 'Otro'
                    ? { ...documento, tipo_documento: '', personalizado: true }
                    : { ...documento, tipo_documento: valorSelect, personalizado: false };
            }),
        );
    };

    const quitar = (index) => {
        const documento = data[campo][index];

        setData({
            ...data,
            [campo]: data[campo].filter((_, i) => i !== index),
            [campoEliminados]: documento.id_documento
                ? [...data[campoEliminados], documento.id_documento]
                : data[campoEliminados],
        });
    };

    return { agregar, actualizar, cambiarTipo, quitar };
}

function opcionSelect(documento, tiposConocidos) {
    if (documento.personalizado) return 'Otro';
    if (!documento.tipo_documento) return '';
    return tiposConocidos.includes(documento.tipo_documento) ? documento.tipo_documento : 'Otro';
}

function CampoError({ mensaje }) {
    return mensaje ? <p className="mt-1 text-sm text-red-600">{mensaje}</p> : null;
}

export default function DocumentosMultiples({
    documentos,
    tiposDisponibles,
    agregar,
    quitar,
    cambiarTipo,
    actualizar,
    errores = {},
    campoErrores = 'documentos',
    titulo = 'Documentos (opcional)',
    descripcion = 'Se pueden cargar varios documentos, ahora o más adelante editando este registro.',
}) {
    const tiposValores = tiposDisponibles.map((tipo) => (typeof tipo === 'string' ? tipo : tipo.valor));

    return (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="mb-2 flex items-center justify-between">
                <label className={labelClass}>{titulo}</label>
                <button
                    type="button"
                    onClick={agregar}
                    className="text-sm font-medium text-[#71BFA6] hover:underline"
                >
                    + Agregar documento
                </button>
            </div>
            <p className="mb-2 text-xs text-[#A9ABAE]">{descripcion}</p>

            <div className="space-y-4">
                {documentos.map((documento, index) => {
                    const seleccionActual = opcionSelect(documento, tiposValores);
                    const esCI = documento.tipo_documento === 'CI';

                    return (
                        <div key={index} className="rounded-md border border-gray-200 bg-white p-3">
                            <div className="flex items-center gap-2">
                                <select
                                    className={`${inputClass} mt-0 flex-1`}
                                    value={seleccionActual}
                                    onChange={(e) => cambiarTipo(index, e.target.value)}
                                >
                                    <option value="">Selecciona el tipo de documento</option>
                                    {tiposDisponibles.map((tipo) => {
                                        const valor = typeof tipo === 'string' ? tipo : tipo.valor;
                                        const etiqueta = typeof tipo === 'string' ? tipo : tipo.etiqueta;
                                        return (
                                            <option key={valor} value={valor}>
                                                {etiqueta}
                                            </option>
                                        );
                                    })}
                                    <option value="Otro">Otro</option>
                                </select>
                                <button
                                    type="button"
                                    onClick={() => quitar(index)}
                                    className="text-sm font-medium text-red-600 hover:underline"
                                >
                                    Quitar
                                </button>
                            </div>
                            <CampoError mensaje={errores[`${campoErrores}.${index}.tipo_documento`]} />

                            {seleccionActual === 'Otro' && (
                                <input
                                    type="text"
                                    placeholder="Especificá el tipo de documento"
                                    className={`${inputClass} mt-2`}
                                    value={documento.tipo_documento}
                                    onChange={(e) => actualizar(index, 'tipo_documento', e.target.value)}
                                />
                            )}

                            <div className={`mt-3 grid gap-4 ${esCI ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                <CampoDocumento
                                    label={esCI ? 'Frente' : 'Documento'}
                                    value={documento.frente}
                                    onChange={(archivo) => actualizar(index, 'frente', archivo)}
                                    urlActual={documento.frente_url}
                                    error={errores[`${campoErrores}.${index}.frente`]}
                                />
                                {esCI && (
                                    <CampoDocumento
                                        label="Dorso"
                                        value={documento.dorso}
                                        onChange={(archivo) => actualizar(index, 'dorso', archivo)}
                                        urlActual={documento.dorso_url}
                                        error={errores[`${campoErrores}.${index}.dorso`]}
                                    />
                                )}
                            </div>
                        </div>
                    );
                })}

                {documentos.length === 0 && (
                    <p className="text-sm text-[#A9ABAE]">Todavía no se agregó ningún documento.</p>
                )}
            </div>
        </div>
    );
}
