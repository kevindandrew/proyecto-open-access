// Avisa a Gerente Operativo que el Comercial no va a encontrar esta tarifa al
// cotizar, con el motivo (proveedor o puerto desactivado, puerto de tipo
// incorrecto para el modo, vigencia que todavía no empieza...).
export default function AvisoNoVisible({ problemas = [] }) {
    if (problemas.length === 0) {
        return null;
    }

    return (
        <div className="mt-1.5 max-w-xs rounded-md border border-red-200 bg-red-50 px-2 py-1.5">
            <p className="text-xs font-semibold text-red-700">No visible para comerciales</p>
            <ul className="mt-0.5 list-disc space-y-0.5 pl-4 text-[11px] leading-snug text-red-700">
                {problemas.map((problema) => (
                    <li key={problema}>{problema}</li>
                ))}
            </ul>
        </div>
    );
}
