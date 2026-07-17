export const COTIZACION_ESTADO_STYLES = {
    Cotizado: 'bg-gray-100 text-gray-700',
    Aceptado: 'bg-green-100 text-green-700',
    Rechazado: 'bg-red-100 text-red-700',
    Vencido: 'bg-amber-100 text-amber-700',
};

// Same status meaning as COTIZACION_ESTADO_STYLES, as hex for chart fills
// (SVG can't consume Tailwind classes directly).
export const COTIZACION_ESTADO_HEX = {
    Cotizado: '#6b7280',
    Aceptado: '#16a34a',
    Rechazado: '#dc2626',
    Vencido: '#d97706',
};
