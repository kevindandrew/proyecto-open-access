export default function AyudaTermino({ info }) {
    if (!info) {
        return null;
    }

    return (
        <p className="mt-1.5 rounded-md bg-[#71BFA6]/10 px-2.5 py-1.5 text-xs leading-snug text-[#042753]">
            <span className="font-semibold">{info.nombre}:</span>{' '}
            <span className="text-[#042753]/80">{info.explicacion}</span>
        </p>
    );
}
