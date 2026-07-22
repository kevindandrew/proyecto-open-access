import ModoTransporteIcon from '@/Components/ModoTransporteIcon';
import {
    MODO_TRANSPORTE_ICON_COLOR,
    MODO_TRANSPORTE_LABELS,
    MODO_TRANSPORTE_STYLES,
} from '@/constants/modoTransporte';

export default function ModoTransporteBadge({ modo, className = '' }) {
    if (!modo) {
        return <span className="text-sm text-[#A9ABAE]">—</span>;
    }

    return (
        <span
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                MODO_TRANSPORTE_STYLES[modo] ?? 'bg-gray-100 text-gray-700'
            } ${className}`}
        >
            <ModoTransporteIcon
                modo={modo}
                className={`h-3.5 w-3.5 ${MODO_TRANSPORTE_ICON_COLOR[modo] ?? 'text-gray-500'}`}
            />
            {MODO_TRANSPORTE_LABELS[modo] ?? modo}
        </span>
    );
}
