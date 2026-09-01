export default function SeccionCard({ icon: Icon, title, subtitle, action, children, className = '' }) {
    return (
        <div className={`mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/70 px-6 py-4">
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#71BFA6]/15 text-[#042753]">
                            <Icon className="h-5 w-5" />
                        </div>
                    )}
                    <div>
                        <h3 className="text-sm font-semibold text-[#042753]">{title}</h3>
                        {subtitle && <p className="text-xs text-[#A9ABAE]">{subtitle}</p>}
                    </div>
                </div>
                {action && <div className="flex items-center gap-2">{action}</div>}
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

export function EstadoVacio({ icon: Icon, mensaje }) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
            {Icon && (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-[#A9ABAE]">
                    <Icon className="h-5 w-5" />
                </div>
            )}
            <p className="text-sm text-[#A9ABAE]">{mensaje}</p>
        </div>
    );
}
