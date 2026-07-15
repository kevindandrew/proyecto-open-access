function ShipIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 18.75 4.5 21l2.25-2.25L9 21l2.25-2.25L13.5 21l2.25-2.25L18 21l2.25-2.25M3.75 14.25h16.5l-1.72 4.83M5.47 14.25 6 9.75h12l.53 4.5M9 9.75V6.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V9.75"
            />
        </svg>
    );
}

function PlaneIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v7.5m0 0-6 3v2.25l6-1.5 6 1.5v-2.25l-6-3ZM12 10.5V19.5m0 0-2.25 1.5v-3l2.25-.75 2.25.75v3L12 19.5Z"
            />
        </svg>
    );
}

function TruckIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h9m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-2.25c0-.51-.343-.94-.8-1.078a13.94 13.94 0 0 0-3.174-.475M15 5.25v10.5M15 5.25H5.625c-.621 0-1.125.504-1.125 1.125v9c0 .621.504 1.125 1.125 1.125H15m0-11.25h2.945c.621 0 1.125.504 1.125 1.125v.75l1.72 2.58a1.125 1.125 0 0 1 .18.617v3.128a1.125 1.125 0 0 1-1.125 1.125H18"
            />
        </svg>
    );
}

const ICONS = {
    Maritimo: ShipIcon,
    Aereo: PlaneIcon,
    Terrestre: TruckIcon,
};

export default function ModoTransporteIcon({ modo, className = 'h-4 w-4' }) {
    const Icon = ICONS[modo];

    return Icon ? <Icon className={className} /> : null;
}
