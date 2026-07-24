import { COTIZACION_ESTADO_STYLES } from "@/constants/cotizacionEstados";
import GerenteOperativoLayout from "@/Layouts/GerenteOperativoLayout";
import ModoTransporteBadge from "@/Components/ModoTransporteBadge";
import PageHeader from "@/Components/PageHeader";
import { IconoCotizacionesNav } from "@/Components/NavIcons";
import { BotonIcono, IconoAgregar, IconoVer } from "@/Components/ActionIcons";
import Modal from "@/Components/Modal";
import { Head, Link, router } from "@inertiajs/react";
import { useMemo, useState } from "react";

const ESTADOS = ["Todos", "Cotizado", "Aceptado", "Rechazado", "Vencido"];

function formatoMonto(valor) {
    if (valor === null || valor === undefined || valor === "") return "—";
    return `USD ${Number(valor).toLocaleString("es-BO", { maximumFractionDigits: 2 })}`;
}

export default function Index({ cotizaciones, auth }) {
    const [estado, setEstado] = useState("Todos");
    const [busqueda, setBusqueda] = useState("");

    // --- ESTADOS PARA MODALES ---
    const [modalTerrestre, setModalTerrestre] = useState({
        show: false,
        cotizacion: null,
    });
    const [modalTarifa, setModalTarifa] = useState({
        show: false,
        cotizacion: null,
    });

    const porEstado = useMemo(
        () =>
            estado === "Todos"
                ? cotizaciones
                : cotizaciones.filter((c) => c.estado === estado),
        [cotizaciones, estado],
    );

    const filtradas = useMemo(() => {
        const termino = busqueda.trim().toLowerCase();
        if (!termino) return porEstado;

        return porEstado.filter((c) =>
            [c.numero_referencia, c.cliente, c.comercial, c.pol, c.pod]
                .filter(Boolean)
                .some((campo) => campo.toLowerCase().includes(termino)),
        );
    }, [porEstado, busqueda]);

    // Handler para iniciar cotización terrestre reutilizando el destino (POD)
    const handleCrearTerrestreDesdeMaritima = (cotizacionMaritima) => {
        router.get(route("gerente-operativo.cotizaciones.create"), {
            modo: "Terrestre",
            origen_reutilizado: cotizacionMaritima.pod,
            cliente_id: cotizacionMaritima.cliente_id,
            cotizacion_padre_id: cotizacionMaritima.id_cotizacion,
        });
    };

    // Handler para solicitar creación de tarifa al Gerente Operativo
    const handleSolicitarTarifa = (cotizacion) => {
        router.post(
            route("gerente-operativo.tarifas.notificar-inexistente"),
            { cotizacion_id: cotizacion.id_cotizacion },
            {
                onSuccess: () =>
                    setModalTarifa({ show: false, cotizacion: null }),
            },
        );
    };

    return (
        <GerenteOperativoLayout header="Cotizaciones">
            <Head title="Cotizaciones" />

            <PageHeader
                icon={IconoCotizacionesNav}
                title="Cotizaciones"
                subtitle="Gestiona cotizaciones y crea nuevas propuestas comerciales"
            >
                <Link
                    href={route("gerente-operativo.cotizaciones.create")}
                    className="flex items-center gap-1.5 rounded-lg bg-[#042753] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#063570] active:scale-[0.98]"
                >
                    <IconoAgregar className="h-4 w-4" />+ Nueva
                </Link>
            </PageHeader>

            {/* BARRA DE BÚSQUEDA Y FILTROS */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full max-w-md">
                    <input
                        type="text"
                        placeholder="Buscar por número, cliente, ruta..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm focus:border-[#71BFA6] focus:outline-none focus:ring-1 focus:ring-[#71BFA6]"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                        className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm focus:border-[#71BFA6] focus:outline-none focus:ring-1 focus:ring-[#71BFA6]"
                    >
                        {ESTADOS.map((e) => (
                            <option key={e} value={e}>
                                {e === "Todos" ? "Todos" : e}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* TABLA PRINCIPAL DE COTIZACIONES */}
            <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-100 text-sm">
                    <thead>
                        <tr className="bg-gray-50/50 text-xs text-gray-500">
                            <th className="px-4 py-3.5 text-left font-medium">
                                Número
                            </th>
                            <th className="px-4 py-3.5 text-left font-medium">
                                Cliente
                            </th>
                            <th className="px-4 py-3.5 text-left font-medium">
                                Modo
                            </th>
                            <th className="px-4 py-3.5 text-left font-medium">
                                Ruta
                            </th>
                            <th className="px-4 py-3.5 text-center font-medium">
                                Incoterm
                            </th>
                            <th className="px-4 py-3.5 text-center font-medium">
                                Carga
                            </th>
                            <th className="px-4 py-3.5 text-right font-medium">
                                Total
                            </th>
                            <th className="px-4 py-3.5 text-center font-medium">
                                Estado
                            </th>
                            <th className="px-4 py-3.5 text-left font-medium">
                                Válido hasta
                            </th>
                            <th className="px-4 py-3.5 text-right font-medium">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtradas.map((c) => (
                            <tr
                                key={c.id_cotizacion}
                                className="transition-colors hover:bg-gray-50/80"
                            >
                                <td className="px-4 py-3 font-medium text-gray-900">
                                    {c.numero_referencia}
                                </td>
                                <td className="px-4 py-3 text-gray-700">
                                    {c.cliente}
                                </td>
                                <td className="px-4 py-3">
                                    <ModoTransporteBadge
                                        modo={c.modo_transporte}
                                    />
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                    {c.pol ?? "—"}{" "}
                                    <span className="text-gray-400">→</span>{" "}
                                    {c.pod ?? "—"}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                                        {c.incoterm ?? "CIF"}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center text-xs font-semibold text-gray-600">
                                    {c.tipo_carga ?? "FCL"}
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-gray-900">
                                    {formatoMonto(c.total)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                                            COTIZACION_ESTADO_STYLES[
                                                c.estado
                                            ] ?? "bg-gray-100 text-gray-700"
                                        }`}
                                    >
                                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                        {c.estado}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-500">
                                    {c.fecha_validez}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {/* Botón opcional para derivar tramo terrestre desde una cotización marítima */}
                                        {c.modo_transporte?.toLowerCase() ===
                                            "marítimo" && (
                                            <button
                                                type="button"
                                                title="Crear tramo terrestre desde puerto destino"
                                                onClick={() =>
                                                    setModalTerrestre({
                                                        show: true,
                                                        cotizacion: c,
                                                    })
                                                }
                                                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-[#042753]"
                                            >
                                                🚚
                                            </button>
                                        )}

                                        <BotonIcono
                                            as="link"
                                            variante="ver"
                                            titulo="Ver detalle"
                                            href={route(
                                                "gerente-operativo.cotizaciones.show",
                                                c.id_cotizacion,
                                            )}
                                        >
                                            <IconoVer className="h-4 w-4 text-gray-500 hover:text-gray-900" />
                                        </BotonIcono>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {filtradas.length === 0 && (
                            <tr>
                                <td
                                    colSpan={10}
                                    className="px-4 py-8 text-center text-gray-400"
                                >
                                    No se encontraron cotizaciones registradas.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ========================================== */}
            {/* MODAL 1: CONTINUAR CON COTIZACIÓN TERRESTRE */}
            {/* ========================================== */}
            <Modal
                show={modalTerrestre.show}
                onClose={() =>
                    setModalTerrestre({ show: false, cotizacion: null })
                }
                maxWidth="md"
            >
                <div className="p-6">
                    <div className="flex items-center gap-3 text-[#042753]">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-lg">
                            🚚
                        </div>
                        <h3 className="text-lg font-bold">
                            Crear Cotización Terrestre
                        </h3>
                    </div>

                    <p className="mt-3 text-sm text-gray-600">
                        ¿Deseas iniciar una nueva cotización terrestre
                        utilizando como origen el puerto final (POD) de esta
                        cotización marítima?
                    </p>

                    {modalTerrestre.cotizacion && (
                        <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-3.5 text-xs space-y-1">
                            <p>
                                <strong className="text-gray-700">
                                    Cotización Origen:
                                </strong>{" "}
                                {modalTerrestre.cotizacion.numero_referencia}
                            </p>
                            <p>
                                <strong className="text-gray-700">
                                    Cliente:
                                </strong>{" "}
                                {modalTerrestre.cotizacion.cliente}
                            </p>
                            <p>
                                <strong className="text-gray-700">
                                    Nuevo Origen Terrestre (POD):
                                </strong>{" "}
                                <span className="font-semibold text-emerald-600">
                                    {modalTerrestre.cotizacion.pod}
                                </span>
                            </p>
                        </div>
                    )}

                    <div className="mt-6 flex justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={() =>
                                setModalTerrestre({
                                    show: false,
                                    cotizacion: null,
                                })
                            }
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                handleCrearTerrestreDesdeMaritima(
                                    modalTerrestre.cotizacion,
                                )
                            }
                            className="rounded-lg bg-[#042753] px-4 py-2 text-sm font-semibold text-white hover:bg-[#063570]"
                        >
                            Generar Cotización
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ========================================== */}
            {/* MODAL 2: ALERTA DE TARIFA INEXISTENTE     */}
            {/* ========================================== */}
            <Modal
                show={modalTarifa.show}
                onClose={() =>
                    setModalTarifa({ show: false, cotizacion: null })
                }
                maxWidth="md"
            >
                <div className="p-6 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                        ⚠️
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-gray-900">
                        Tarifa Inexistente
                    </h3>

                    <p className="mt-2 text-sm text-gray-600">
                        No existe una tarifa registrada en el sistema para esta
                        ruta y requerimiento.
                    </p>

                    <div className="mt-6 flex justify-center gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                setModalTarifa({
                                    show: false,
                                    cotizacion: null,
                                })
                            }
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cerrar
                        </button>

                        {auth?.user?.rol === "Gerente Comercial" ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setModalTarifa({
                                        show: false,
                                        cotizacion: null,
                                    });
                                    // Continuar con autorización
                                }}
                                className="rounded-lg bg-[#042753] px-4 py-2 text-sm font-semibold text-white hover:bg-[#063570]"
                            >
                                Autorizar Excepción
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() =>
                                    handleSolicitarTarifa(
                                        modalTarifa.cotizacion,
                                    )
                                }
                                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
                            >
                                Notificar a Gerencia Operativa
                            </button>
                        )}
                    </div>
                </div>
            </Modal>
        </GerenteOperativoLayout>
    );
}
