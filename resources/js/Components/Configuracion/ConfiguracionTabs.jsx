import { Link } from '@inertiajs/react';

const TABS = [
    { label: 'Proveedores', routeName: 'gerente-operativo.configuracion.proveedores.index' },
    { label: 'Puertos y Aeropuertos', routeName: 'gerente-operativo.configuracion.puertos.index' },
];

export default function ConfiguracionTabs({ activo }) {
    return (
        <div className="mb-4 inline-flex rounded-lg bg-gray-100 p-1">
            {TABS.map((tab) => (
                <Link
                    key={tab.routeName}
                    href={route(tab.routeName)}
                    className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition ${
                        activo === tab.routeName
                            ? 'bg-white text-[#042753] shadow-sm'
                            : 'text-[#A9ABAE] hover:text-[#042753]'
                    }`}
                >
                    {tab.label}
                </Link>
            ))}
        </div>
    );
}
