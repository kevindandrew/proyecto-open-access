import { IconoCotizacionesNav, IconoDashboard } from '@/Components/NavIcons';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

const navItems = [
    { label: 'Dashboard', routeName: 'gerente-comercial.dashboard', icon: IconoDashboard },
    { label: 'Cotizaciones', routeName: 'gerente-comercial.cotizaciones.index', icon: IconoCotizacionesNav },
];

function iniciales(nombre) {
    return nombre
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0].toUpperCase())
        .join('');
}

export default function GerenteComercialLayout({ header, children }) {
    const { auth, flash } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100">
            <aside
                className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-[#042753] text-white transition-transform duration-200 lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#71BFA6]/20 font-bold text-[#71BFA6]">
                        OA
                    </div>
                    <div>
                        <p className="text-sm font-bold leading-tight">OPEN ACCESS</p>
                        <p className="text-[10px] tracking-wide text-white/60">BOLIVIA S.R.L.</p>
                    </div>
                </div>

                <nav className="mt-4 space-y-1 px-3">
                    {navItems.map((item) => {
                        const activo = route().current(item.routeName + '*');
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.routeName}
                                href={route(item.routeName)}
                                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                                    activo
                                        ? 'bg-[#71BFA6] text-[#042753]'
                                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <Icon className={`h-5 w-5 flex-shrink-0 ${activo ? 'text-[#042753]' : 'text-white/50'}`} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 px-4 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#71BFA6]/20 text-sm font-bold text-[#71BFA6]">
                            {iniciales(auth.user.name)}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{auth.user.name}</p>
                            <p className="text-xs text-white/60">Gerente Comercial</p>
                        </div>
                    </div>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="mt-3 text-xs text-[#71BFA6] hover:underline"
                    >
                        Cerrar sesión
                    </Link>
                </div>
            </aside>

            {sidebarOpen && (
                <div className="fixed inset-0 z-20 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            <div className="lg:pl-64">
                <header className="flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm sm:px-6">
                    <div className="flex items-center gap-3">
                        <button className="text-[#042753] lg:hidden" onClick={() => setSidebarOpen((v) => !v)}>
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h1 className="text-lg font-semibold text-[#042753]">{header}</h1>
                    </div>
                    <div className="text-sm text-[#A9ABAE]">@{auth.user.username}</div>
                </header>

                {(flash?.error || flash?.success) && (
                    <div className="space-y-2 px-4 pt-4 sm:px-6">
                        {flash.error && (
                            <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{flash.error}</div>
                        )}
                        {flash.success && (
                            <div className="rounded-md bg-[#71BFA6]/10 px-4 py-3 text-sm text-[#042753]">{flash.success}</div>
                        )}
                    </div>
                )}

                <main className="p-4 sm:p-6">{children}</main>
            </div>
        </div>
    );
}
