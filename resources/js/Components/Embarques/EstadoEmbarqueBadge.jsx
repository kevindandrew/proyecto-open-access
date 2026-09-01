import { ESTADO_ESTILOS, ESTADO_LABELS } from '@/constants/estados';

export default function EstadoEmbarqueBadge({ estado, className = '' }) {
    if (!estado) {
        return <span className="text-sm text-[#A9ABAE]">—</span>;
    }

    return (
        <span
            className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                ESTADO_ESTILOS[estado] ?? 'bg-gray-100 text-gray-700'
            } ${className}`}
        >
            {ESTADO_LABELS[estado] ?? estado}
        </span>
    );
}
