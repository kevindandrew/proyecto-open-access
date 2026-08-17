import { useEffect, useState } from 'react';

const EXTENSIONES_IMAGEN = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];

function esUrlDeImagen(url) {
    if (!url) return false;
    const limpia = url.split('?')[0].toLowerCase();
    return EXTENSIONES_IMAGEN.some((ext) => limpia.endsWith(ext));
}

function IconoDocumento() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="h-7 w-7 text-[#A9ABAE]"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6M9 8h1m5-5H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-6-6Z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v5h5" />
        </svg>
    );
}

export default function CampoDocumento({ label, value, onChange, urlActual, error }) {
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        if (!value || !value.type?.startsWith('image/')) {
            setPreviewUrl(null);
            return;
        }

        const url = URL.createObjectURL(value);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [value]);

    const inputId = `documento-${label.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`;
    const hayUrlPrevia = Boolean(urlActual) && !value;
    const imagenParaMostrar = previewUrl ?? (hayUrlPrevia && esUrlDeImagen(urlActual) ? urlActual : null);

    return (
        <div>
            <label className="text-sm font-medium text-[#042753]">{label}</label>
            <div className="mt-1 flex items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 bg-white p-3 transition-colors hover:border-[#71BFA6]">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-50">
                    {imagenParaMostrar ? (
                        <img
                            src={imagenParaMostrar}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <IconoDocumento />
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    {value ? (
                        <p className="truncate text-xs font-medium text-[#042753]">
                            {value.name}
                        </p>
                    ) : hayUrlPrevia ? (
                        <p className="text-xs font-medium text-[#71BFA6]">
                            Documento ya subido
                        </p>
                    ) : (
                        <p className="text-xs text-[#A9ABAE]">
                            JPG, PNG o PDF · máx. 5 MB
                        </p>
                    )}

                    <div className="mt-1 flex items-center gap-3">
                        <label
                            htmlFor={inputId}
                            className="inline-block cursor-pointer rounded-md bg-[#042753] px-3 py-1 text-xs font-semibold text-white hover:opacity-90"
                        >
                            {value || hayUrlPrevia ? 'Cambiar archivo' : 'Elegir archivo'}
                        </label>
                        {hayUrlPrevia && (
                            <a
                                href={urlActual}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[#71BFA6] underline"
                            >
                                Ver actual
                            </a>
                        )}
                    </div>
                    <input
                        id={inputId}
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => onChange(e.target.files[0] ?? null)}
                    />
                </div>
            </div>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}
