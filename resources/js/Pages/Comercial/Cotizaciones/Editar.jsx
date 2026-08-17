import AyudaTermino from '@/Components/AyudaTermino';
import { INCOTERMS_INFO } from '@/constants/glosario';
import ComercialLayout from '@/Layouts/ComercialLayout';
import { bloquearNotacionCientifica } from '@/utils/inputNumerico';
import { Head, Link, useForm } from '@inertiajs/react';

const INCOTERMS = ['FOB', 'EXW', 'CIF', 'CFR', 'DDP'];

const inputClass =
    'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]';
const labelClass = 'text-sm font-medium text-[#042753]';

function CampoError({ mensaje }) {
    return mensaje ? <p className="mt-1 text-sm text-red-600">{mensaje}</p> : null;
}

export default function Editar({ cotizacion }) {
    const { data, setData, put, processing, errors } = useForm({
        incoterm: cotizacion.incoterm ?? '',
        mercancia_peligrosa: cotizacion.mercancia_peligrosa ?? false,
        dias_transito: cotizacion.dias_transito ?? '',
        comision_openaccess: cotizacion.comision_openaccess ?? '',
    });

    const guardar = (e) => {
        e.preventDefault();
        put(route('comercial.cotizaciones.update', cotizacion.id_cotizacion));
    };

    return (
        <ComercialLayout header={`Editar Cotización ${cotizacion.numero_referencia}`}>
            <Head title={`Editar Cotización ${cotizacion.numero_referencia}`} />

            <form
                onSubmit={guardar}
                className="mx-auto max-w-2xl space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
                <p className="text-sm text-[#A9ABAE]">
                    Solo se pueden editar estos campos. El resto de la cotización (ruta,
                    cliente, costos de tarifa) queda fijo una vez creada.
                </p>

                <div>
                    <label className={labelClass}>Incoterm</label>
                    <select
                        className={inputClass}
                        value={data.incoterm}
                        onChange={(e) => setData('incoterm', e.target.value)}
                    >
                        <option value="">—</option>
                        {INCOTERMS.map((incoterm) => (
                            <option key={incoterm} value={incoterm}>
                                {incoterm} ({INCOTERMS_INFO[incoterm].nombre})
                            </option>
                        ))}
                    </select>
                    <AyudaTermino info={INCOTERMS_INFO[data.incoterm]} />
                    <CampoError mensaje={errors.incoterm} />
                </div>

                <div>
                    <label className={labelClass}>Días de Tránsito</label>
                    <input
                        type="number"
                        min="0"
                        step="1"
                        onKeyDown={bloquearNotacionCientifica}
                        className={inputClass}
                        value={data.dias_transito}
                        onChange={(e) => setData('dias_transito', e.target.value)}
                    />
                    <CampoError mensaje={errors.dias_transito} />
                </div>

                <label className="flex items-center gap-2 text-sm text-[#042753]">
                    <input
                        type="checkbox"
                        checked={data.mercancia_peligrosa}
                        onChange={(e) => setData('mercancia_peligrosa', e.target.checked)}
                        className="rounded border-gray-300 text-[#71BFA6] focus:ring-[#71BFA6]"
                    />
                    Mercancía peligrosa
                </label>
                <CampoError mensaje={errors.mercancia_peligrosa} />

                <div className="rounded-lg border border-[#042753]/20 bg-[#042753]/5 p-4">
                    <label className={labelClass}>Comisión OpenAccess (USD)</label>
                    <p className="mb-2 text-xs text-[#A9ABAE]">
                        Uso interno — el cliente nunca la ve.
                    </p>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            onKeyDown={bloquearNotacionCientifica}
                            placeholder="Monto en USD"
                            className="w-40 rounded-md border-gray-300 text-sm"
                            value={data.comision_openaccess}
                            onChange={(e) => setData('comision_openaccess', e.target.value)}
                        />
                        <span className="text-sm text-[#A9ABAE]">USD</span>
                    </div>
                    <CampoError mensaje={errors.comision_openaccess} />
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <Link
                        href={route('comercial.cotizaciones.show', cotizacion.id_cotizacion)}
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-[#042753] hover:bg-gray-50"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-md bg-[#042753] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                    >
                        Guardar Cambios
                    </button>
                </div>
            </form>
        </ComercialLayout>
    );
}
