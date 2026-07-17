export default function PageHeader({ icon: Icon, title, subtitle, children }) {
    return (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#71BFA6]/20 text-[#042753]">
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-[#042753]">{title}</h2>
                    {subtitle && <p className="text-sm text-[#A9ABAE]">{subtitle}</p>}
                </div>
            </div>

            {children && <div className="flex items-center gap-2">{children}</div>}
        </div>
    );
}
