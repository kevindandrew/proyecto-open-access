import { useForm } from '@inertiajs/react';
import { useMemo } from 'react';

// Mismo criterio que TiposTransportePorModo.php: en LCL marítimo el "carrier"
// cotizado suele ser en realidad un consolidador/agente (NVOCC), no una
// naviera con buque propio.
function tiposCarrierPara(modoTransporte, tipoServicio) {
    switch (modoTransporte) {
        case 'Maritimo':
            return tipoServicio === 'LCL' ? ['Naviera', 'Agente_Origen'] : ['Naviera'];
        case 'Aereo':
            return ['Aerolinea'];
        case 'Terrestre':
            return ['Transportista'];
        default:
            return [];
    }
}

export default function ActualizarTransporte({ embarque, rutaActualizar, proveedores = [] }) {
    const { data, setData, patch, processing, errors } = useForm({
        mbl: embarque.mbl ?? '',
        etd: embarque.etd ?? '',
        eta: embarque.eta ?? '',
        nave: embarque.nave ?? '',
        viaje: embarque.viaje ?? '',
        pago_master: embarque.pago_master ?? '',
        id_agente_origen: embarque.id_agente_origen ?? '',
        id_naviera_aerolinea: embarque.id_naviera_aerolinea ?? '',
    });

    const tiposCarrier = useMemo(
        () => tiposCarrierPara(embarque.modo_transporte, embarque.tipo_servicio),
        [embarque.modo_transporte, embarque.tipo_servicio],
    );

    const carriers = useMemo(
        () => proveedores.filter((proveedor) => tiposCarrier.includes(proveedor.tipo)),
        [proveedores, tiposCarrier],
    );

    const agentes = useMemo(
        () => proveedores.filter((proveedor) => proveedor.tipo === 'Agente_Origen'),
        [proveedores],
    );

    const esAereo = embarque.modo_transporte === 'Aereo';
    const etiquetaMbl = esAereo ? 'MAWB' : 'MBL';
    const etiquetaNave = esAereo ? 'Aeronave' : 'Nave';

    const submit = (e) => {
        e.preventDefault();

        patch(route(rutaActualizar, embarque.id_embarque));
    };

    const inputClass =
        'mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]';
    const labelClass = 'text-xs font-medium text-[#042753]';

    return (
        <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
                <label className={labelClass}>Carrier (Naviera / Aerolínea)</label>
                <select
                    className={inputClass}
                    value={data.id_naviera_aerolinea}
                    onChange={(e) => setData('id_naviera_aerolinea', e.target.value)}
                >
                    <option value="">—</option>
                    {carriers.map((proveedor) => (
                        <option key={proveedor.id_proveedor} value={proveedor.id_proveedor}>
                            {proveedor.nombre}
                        </option>
                    ))}
                </select>
                {errors.id_naviera_aerolinea && (
                    <p className="mt-1 text-xs text-red-600">{errors.id_naviera_aerolinea}</p>
                )}
            </div>

            <div>
                <label className={labelClass}>Agente de Origen</label>
                <select
                    className={inputClass}
                    value={data.id_agente_origen}
                    onChange={(e) => setData('id_agente_origen', e.target.value)}
                >
                    <option value="">—</option>
                    {agentes.map((proveedor) => (
                        <option key={proveedor.id_proveedor} value={proveedor.id_proveedor}>
                            {proveedor.nombre}
                        </option>
                    ))}
                </select>
                {errors.id_agente_origen && (
                    <p className="mt-1 text-xs text-red-600">{errors.id_agente_origen}</p>
                )}
            </div>

            <div>
                <label className={labelClass}>{etiquetaMbl}</label>
                <input
                    type="text"
                    placeholder={esAereo ? 'Ej. 123-12345678' : 'Ej. MSCUBS123456'}
                    className={inputClass}
                    value={data.mbl}
                    onChange={(e) => setData('mbl', e.target.value)}
                />
                {errors.mbl && <p className="mt-1 text-xs text-red-600">{errors.mbl}</p>}
            </div>

            <div>
                <label className={labelClass}>ETD</label>
                <input
                    type="date"
                    className={inputClass}
                    value={data.etd}
                    onChange={(e) => setData('etd', e.target.value)}
                />
                {errors.etd && <p className="mt-1 text-xs text-red-600">{errors.etd}</p>}
            </div>

            <div>
                <label className={labelClass}>ETA</label>
                <input
                    type="date"
                    className={inputClass}
                    value={data.eta}
                    onChange={(e) => setData('eta', e.target.value)}
                />
                {errors.eta && <p className="mt-1 text-xs text-red-600">{errors.eta}</p>}
            </div>

            <div>
                <label className={labelClass}>{etiquetaNave}</label>
                <input
                    type="text"
                    placeholder={esAereo ? 'Ej. Boeing 767' : 'Ej. MSC Bolivia'}
                    className={inputClass}
                    value={data.nave}
                    onChange={(e) => setData('nave', e.target.value)}
                />
                {errors.nave && <p className="mt-1 text-xs text-red-600">{errors.nave}</p>}
            </div>

            <div>
                <label className={labelClass}>Viaje</label>
                <input
                    type="text"
                    placeholder="Ej. 123W"
                    className={inputClass}
                    value={data.viaje}
                    onChange={(e) => setData('viaje', e.target.value)}
                />
                {errors.viaje && <p className="mt-1 text-xs text-red-600">{errors.viaje}</p>}
            </div>

            <div>
                <label className={labelClass}>Pago Master</label>
                <select
                    className={inputClass}
                    value={data.pago_master}
                    onChange={(e) => setData('pago_master', e.target.value)}
                >
                    <option value="">—</option>
                    <option value="Prepaid">Prepaid</option>
                    <option value="Collect">Collect</option>
                </select>
                {errors.pago_master && (
                    <p className="mt-1 text-xs text-red-600">{errors.pago_master}</p>
                )}
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-md bg-[#71BFA6] px-4 py-2 text-sm font-semibold text-[#042753] hover:opacity-90 disabled:opacity-50"
                >
                    Guardar Datos de Transporte
                </button>
            </div>
        </form>
    );
}
