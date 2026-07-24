import GerenteOperativoLayout from "@/Layouts/GerenteOperativoLayout";
import PageHeader from "@/Components/PageHeader";
import Modal from "@/Components/Modal";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import Checkbox from "@/Components/Checkbox";
import { IconoClientes } from "@/Components/NavIcons";
import {
    BotonIcono,
    IconoAgregar,
    IconoAlerta,
    IconoEditar,
    IconoEliminar,
    IconoReasignar,
    IconoVer,
} from "@/Components/ActionIcons";
import { Head, useForm, router } from "@inertiajs/react";
import { useMemo, useState, useEffect } from "react";

// Auxiliar para iniciales
function getIniciales(nombre) {
    if (!nombre) return "CL";
    return nombre
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

/* =========================================================================
   1. MODAL: DETALLE DEL CLIENTE (VER)
   ========================================================================= */
function ModalDetalleCliente({ cliente, show, onClose }) {
    if (!cliente) return null;

    const contactos = cliente.contactos || [];

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <div className="p-6">
                <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 font-bold text-[#042753]">
                            {getIniciales(cliente.razon_social)}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[#042753]">
                                {cliente.razon_social}
                            </h2>
                            <p className="text-xs text-gray-500">
                                ID Cliente: CLI-
                                {String(cliente.id_cliente).padStart(3, "0")}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 font-bold text-lg"
                    >
                        ✕
                    </button>
                </div>

                <div className="mt-4 max-h-[65vh] overflow-y-auto pr-1 space-y-6 text-sm">
                    {/* Información General */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                            Información General
                        </h3>
                        <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                            <div>
                                <dt className="text-xs text-gray-400 font-medium">
                                    NIT / Tax ID
                                </dt>
                                <dd className="font-semibold text-[#042753]">
                                    {cliente.nit || "—"}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-gray-400 font-medium">
                                    Ciudad
                                </dt>
                                <dd className="font-semibold text-[#042753]">
                                    {cliente.ciudad || "—"}
                                </dd>
                            </div>
                            <div className="col-span-2">
                                <dt className="text-xs text-gray-400 font-medium">
                                    Dirección
                                </dt>
                                <dd className="font-semibold text-[#042753]">
                                    {cliente.direccion || "—"}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-gray-400 font-medium">
                                    Email General
                                </dt>
                                <dd className="font-semibold text-[#042753]">
                                    {cliente.email || "—"}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-gray-400 font-medium">
                                    Correo Factura
                                </dt>
                                <dd className="font-semibold text-[#042753]">
                                    {cliente.correo_factura || "—"}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-gray-400 font-medium">
                                    Condición Pago
                                </dt>
                                <dd className="font-semibold text-[#042753]">
                                    {cliente.condicion_pago || "—"}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-gray-400 font-medium">
                                    Comercial Asignado
                                </dt>
                                <dd className="font-semibold text-[#042753]">
                                    {cliente.comercial || "—"}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Contactos */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                            Contactos ({contactos.length})
                        </h3>
                        {contactos.length > 0 ? (
                            <div className="space-y-2">
                                {contactos.map((c, i) => (
                                    <div
                                        key={i}
                                        className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs grid grid-cols-3 gap-2"
                                    >
                                        <div>
                                            <span className="text-gray-400 block">
                                                Nombre:
                                            </span>{" "}
                                            <strong className="text-[#042753]">
                                                {c.nombre_completo || "—"}
                                            </strong>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 block">
                                                Teléfono / Celular:
                                            </span>{" "}
                                            <span className="font-medium">
                                                {c.numero || "—"}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 block">
                                                Correo:
                                            </span>{" "}
                                            <span className="font-medium">
                                                {c.correo || "—"}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400 italic">
                                No hay contactos registrados.
                            </p>
                        )}
                    </div>

                    {/* Consignatario */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                            Datos del Consignatario
                        </h3>
                        <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                            <div>
                                <dt className="text-xs text-gray-400 font-medium">
                                    Nombre
                                </dt>
                                <dd className="font-semibold text-[#042753]">
                                    {cliente.consignatario_nombre || "—"}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-gray-400 font-medium">
                                    NIT / CI Consignatario
                                </dt>
                                <dd className="font-semibold text-[#042753]">
                                    {cliente.consignatario_nit || "—"}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-gray-400 font-medium">
                                    Celular
                                </dt>
                                <dd className="font-semibold text-[#042753]">
                                    {cliente.consignatario_celular || "—"}
                                </dd>
                            </div>
                            <div className="col-span-2">
                                <dt className="text-xs text-gray-400 font-medium">
                                    Dirección
                                </dt>
                                <dd className="font-semibold text-[#042753]">
                                    {cliente.consignatario_direccion || "—"}
                                </dd>
                            </div>
                            <div className="col-span-2">
                                <dt className="text-xs text-gray-400 font-medium">
                                    Correo Electrónico
                                </dt>
                                <dd className="font-semibold text-[#042753]">
                                    {cliente.consignatario_correo || "—"}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <SecondaryButton onClick={onClose}>Cerrar</SecondaryButton>
                </div>
            </div>
        </Modal>
    );
}

/* =========================================================================
   2. MODAL FORMULARIO: CREAR / EDITAR CLIENTE
   ========================================================================= */
function ModalFormCliente({
    show,
    onClose,
    cliente = null,
    ciudades = [],
    comerciales = [],
}) {
    const esEdicion = Boolean(cliente);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        razon_social: "",
        nit: "",
        id_ciudad: "",
        ciudad_personalizada: "",
        direccion: "",
        email: "",
        correo_factura: "",
        condicion_pago: "Al contado",
        id_comercial: "",
        otro: "",
        activo: true,
        // Contactos Múltiples
        contactos: [{ nombre_completo: "", numero: "", correo: "" }],
        // Datos Consignatario
        consignatario_nombre: "",
        consignatario_nit: "",
        consignatario_direccion: "",
        consignatario_celular: "",
        consignatario_correo: "",
    });

    useEffect(() => {
        if (cliente) {
            setData({
                razon_social: cliente.razon_social ?? "",
                nit: cliente.nit ?? "",
                id_ciudad: cliente.id_ciudad ?? "",
                ciudad_personalizada: cliente.ciudad_personalizada ?? "",
                direccion: cliente.direccion ?? "",
                email: cliente.email ?? "",
                correo_factura: cliente.correo_factura ?? "",
                condicion_pago: cliente.condicion_pago ?? "Al contado",
                id_comercial: cliente.id_comercial ?? "",
                otro: cliente.otro ?? "",
                activo: cliente.activo ?? true,
                contactos: cliente.contactos?.length
                    ? cliente.contactos
                    : [{ nombre_completo: "", numero: "", correo: "" }],
                consignatario_nombre: cliente.consignatario_nombre ?? "",
                consignatario_nit: cliente.consignatario_nit ?? "",
                consignatario_direccion: cliente.consignatario_direccion ?? "",
                consignatario_celular: cliente.consignatario_celular ?? "",
                consignatario_correo: cliente.consignatario_correo ?? "",
            });
        } else {
            reset();
        }
    }, [cliente, show]);

    // Manejadores de Contactos
    const handleAgregarContacto = () => {
        setData("contactos", [
            ...data.contactos,
            { nombre_completo: "", numero: "", correo: "" },
        ]);
    };

    const handleEliminarContacto = (index) => {
        const nuevos = data.contactos.filter((_, i) => i !== index);
        setData("contactos", nuevos);
    };

    const handleCambioContacto = (index, campo, valor) => {
        const nuevos = [...data.contactos];
        nuevos[index][campo] = valor;
        setData("contactos", nuevos);
    };

    const submit = (e) => {
        e.preventDefault();
        if (esEdicion) {
            put(
                route("gerente-operativo.clientes.update", cliente.id_cliente),
                {
                    onSuccess: () => {
                        reset();
                        onClose();
                    },
                },
            );
        } else {
            post(route("gerente-operativo.clientes.store"), {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }
    };

    const selectClass =
        "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#042753] focus:ring-[#042753] text-sm";

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            {/* Contenedor flotante centrado con ancho máximo controlado */}
            <form
                onSubmit={submit}
                className="p-6 max-w-2xl mx-auto my-auto bg-white rounded-2xl shadow-xl"
            >
                <div className="flex items-center justify-between border-b pb-4">
                    <h2 className="text-xl font-bold text-[#042753]">
                        {esEdicion ? "Editar Cliente" : "Crear Nuevo Cliente"}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 font-bold text-lg p-1 transition"
                    >
                        ✕
                    </button>
                </div>

                {/* Ajuste de scroll para que no tape el footer ni se expanda al infinito */}
                <div className="mt-4 max-h-[60vh] space-y-5 overflow-y-auto pr-2 text-left">
                    {/* SECCIÓN 1: DATOS PRINCIPALES */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                            Datos Principales
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <InputLabel
                                    htmlFor="razon_social"
                                    value="Razón Social *"
                                />
                                <TextInput
                                    id="razon_social"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.razon_social}
                                    onChange={(e) =>
                                        setData("razon_social", e.target.value)
                                    }
                                    placeholder="Ej: Importadora Andina S.A."
                                />
                                <InputError
                                    message={errors.razon_social}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <InputLabel
                                    htmlFor="nit"
                                    value="NIT / Tax ID"
                                />
                                <TextInput
                                    id="nit"
                                    type="text"
                                    className="mt-1 block w-full"
                                    placeholder="Ej: 1023456028"
                                    value={data.nit}
                                    onChange={(e) =>
                                        setData("nit", e.target.value)
                                    }
                                />
                                <InputError
                                    message={errors.nit}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        {/* Selección de Ciudad y Opción 'Otro' */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <InputLabel
                                    htmlFor="id_ciudad"
                                    value="Ciudad"
                                />
                                <select
                                    id="id_ciudad"
                                    className={selectClass}
                                    value={data.id_ciudad}
                                    onChange={(e) =>
                                        setData("id_ciudad", e.target.value)
                                    }
                                >
                                    <option value="">Selecciona ciudad</option>
                                    {ciudades.map((c) => (
                                        <option
                                            key={c.cod_ciudad}
                                            value={c.cod_ciudad}
                                        >
                                            {c.nombre_ciudad}
                                        </option>
                                    ))}
                                    <option value="OTRO">
                                        Otro (Especificar ciudad / país)
                                    </option>
                                </select>
                                <InputError
                                    message={errors.id_ciudad}
                                    className="mt-1"
                                />
                            </div>

                            {data.id_ciudad === "OTRO" ? (
                                <div>
                                    <InputLabel
                                        htmlFor="ciudad_personalizada"
                                        value="Especifique Ciudad / País *"
                                    />
                                    <TextInput
                                        id="ciudad_personalizada"
                                        type="text"
                                        className="mt-1 block w-full"
                                        placeholder="Ej: Lima, Perú"
                                        value={data.ciudad_personalizada}
                                        onChange={(e) =>
                                            setData(
                                                "ciudad_personalizada",
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.ciudad_personalizada}
                                        className="mt-1"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <InputLabel
                                        htmlFor="direccion"
                                        value="Dirección"
                                    />
                                    <TextInput
                                        id="direccion"
                                        type="text"
                                        className="mt-1 block w-full"
                                        placeholder="Ej: Av. Arce #2077"
                                        value={data.direccion}
                                        onChange={(e) =>
                                            setData("direccion", e.target.value)
                                        }
                                    />
                                </div>
                            )}
                        </div>

                        {data.id_ciudad === "OTRO" && (
                            <div>
                                <InputLabel
                                    htmlFor="direccion"
                                    value="Dirección"
                                />
                                <TextInput
                                    id="direccion"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.direccion}
                                    onChange={(e) =>
                                        setData("direccion", e.target.value)
                                    }
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <InputLabel
                                    htmlFor="email"
                                    value="Email General"
                                />
                                <TextInput
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    placeholder="contacto@empresa.com"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                />
                                <InputError
                                    message={errors.email}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <InputLabel
                                    htmlFor="correo_factura"
                                    value="Correo Factura"
                                />
                                <TextInput
                                    id="correo_factura"
                                    type="email"
                                    className="mt-1 block w-full"
                                    placeholder="facturacion@empresa.com"
                                    value={data.correo_factura}
                                    onChange={(e) =>
                                        setData(
                                            "correo_factura",
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <InputLabel
                                    htmlFor="condicion_pago"
                                    value="Condición de Pago"
                                />
                                <TextInput
                                    id="condicion_pago"
                                    type="text"
                                    className="mt-1 block w-full"
                                    placeholder="Ej: Al contado, 30 días..."
                                    value={data.condicion_pago}
                                    onChange={(e) =>
                                        setData(
                                            "condicion_pago",
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <InputLabel
                                    htmlFor="id_comercial"
                                    value="Comercial Asignado"
                                />
                                <select
                                    id="id_comercial"
                                    className={selectClass}
                                    value={data.id_comercial}
                                    onChange={(e) =>
                                        setData("id_comercial", e.target.value)
                                    }
                                >
                                    <option value="">
                                        Selecciona comercial
                                    </option>
                                    {comerciales.map((com) => (
                                        <option
                                            key={com.id_empleado}
                                            value={com.id_empleado}
                                        >
                                            {com.nombre_completo}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 2: CONTACTOS MULTIPLES */}
                    <div className="space-y-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                Contactos
                            </h3>
                            <button
                                type="button"
                                onClick={handleAgregarContacto}
                                className="text-xs font-semibold text-[#042753] hover:underline flex items-center gap-1"
                            >
                                + Agregar Contacto
                            </button>
                        </div>

                        {data.contactos.map((contacto, index) => (
                            <div
                                key={index}
                                className="p-3 bg-gray-50 rounded-xl border border-gray-200 relative grid grid-cols-1 sm:grid-cols-3 gap-3"
                            >
                                <div>
                                    <InputLabel value="Nombre Completo" />
                                    <TextInput
                                        type="text"
                                        className="mt-1 block w-full text-xs"
                                        placeholder="Ej: Juan Pérez"
                                        value={contacto.nombre_completo}
                                        onChange={(e) =>
                                            handleCambioContacto(
                                                index,
                                                "nombre_completo",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div>
                                    <InputLabel value="Número (Tel / Cel)" />
                                    <TextInput
                                        type="text"
                                        className="mt-1 block w-full text-xs"
                                        placeholder="Ej: +591 70000000"
                                        value={contacto.numero}
                                        onChange={(e) =>
                                            handleCambioContacto(
                                                index,
                                                "numero",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="pr-4">
                                    <InputLabel value="Correo" />
                                    <TextInput
                                        type="email"
                                        className="mt-1 block w-full text-xs"
                                        placeholder="juan@empresa.com"
                                        value={contacto.correo}
                                        onChange={(e) =>
                                            handleCambioContacto(
                                                index,
                                                "correo",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>

                                {data.contactos.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleEliminarContacto(index)
                                        }
                                        className="absolute top-2 right-2 text-red-400 hover:text-red-600 font-bold text-xs"
                                        title="Eliminar contacto"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* SECCIÓN 3: CONSIGNATARIO */}
                    <div className="space-y-4 pt-3 border-t border-gray-100">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                            Datos del Consignatario
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <InputLabel
                                    htmlFor="consignatario_nombre"
                                    value="Nombre del Consignatario"
                                />
                                <TextInput
                                    id="consignatario_nombre"
                                    type="text"
                                    className="mt-1 block w-full"
                                    placeholder="Ej: Juan Pérez"
                                    value={data.consignatario_nombre}
                                    onChange={(e) =>
                                        setData(
                                            "consignatario_nombre",
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <InputLabel
                                    htmlFor="consignatario_nit"
                                    value="NIT / CI Consignatario"
                                />
                                <TextInput
                                    id="consignatario_nit"
                                    type="text"
                                    className="mt-1 block w-full"
                                    placeholder="Ej: 1023456028"
                                    value={data.consignatario_nit}
                                    onChange={(e) =>
                                        setData(
                                            "consignatario_nit",
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <InputLabel
                                    htmlFor="consignatario_celular"
                                    value="Celular Consignatario"
                                />
                                <TextInput
                                    id="consignatario_celular"
                                    type="text"
                                    className="mt-1 block w-full"
                                    placeholder="Ej: +591 70000000"
                                    value={data.consignatario_celular}
                                    onChange={(e) =>
                                        setData(
                                            "consignatario_celular",
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <InputLabel
                                    htmlFor="consignatario_correo"
                                    value="Correo Consignatario"
                                />
                                <TextInput
                                    id="consignatario_correo"
                                    type="email"
                                    className="mt-1 block w-full"
                                    placeholder="consignatario@empresa.com"
                                    value={data.consignatario_correo}
                                    onChange={(e) =>
                                        setData(
                                            "consignatario_correo",
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="consignatario_direccion"
                                value="Dirección Consignatario"
                            />
                            <TextInput
                                id="consignatario_direccion"
                                type="text"
                                className="mt-1 block w-full"
                                placeholder="Ej: Av. Siempre Viva #123"
                                value={data.consignatario_direccion}
                                onChange={(e) =>
                                    setData(
                                        "consignatario_direccion",
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                    </div>

                    {/* SECCIÓN 4: OBSERVACIONES Y ESTADO */}
                    <div className="space-y-4 pt-3 border-t border-gray-100">
                        <div>
                            <InputLabel
                                htmlFor="otro"
                                value="Observaciones / Notas"
                            />
                            <TextInput
                                id="otro"
                                type="text"
                                className="mt-1 block w-full"
                                placeholder="Notas adicionales sobre este cliente..."
                                value={data.otro}
                                onChange={(e) =>
                                    setData("otro", e.target.value)
                                }
                            />
                        </div>

                        {esEdicion && (
                            <div>
                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                    <Checkbox
                                        name="activo"
                                        checked={data.activo}
                                        onChange={(e) =>
                                            setData("activo", e.target.checked)
                                        }
                                    />
                                    Cliente Activo
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                    <SecondaryButton onClick={onClose}>
                        Cancelar
                    </SecondaryButton>
                    <PrimaryButton disabled={processing}>
                        {esEdicion ? "Guardar Cambios" : "Crear Cliente"}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}

/* =========================================================================
   2b. MODAL: REASIGNAR COMERCIAL
   ========================================================================= */
function ModalReasignarComercial({ cliente, show, onClose, comerciales = [] }) {
    const { data, setData, patch, processing, errors, reset } = useForm({
        id_comercial: "",
    });

    useEffect(() => {
        if (cliente) {
            setData("id_comercial", cliente.id_comercial ?? "");
        }
    }, [cliente, show]);

    if (!cliente) return null;

    const submit = (e) => {
        e.preventDefault();
        patch(
            route("gerente-operativo.clientes.reasignar", cliente.id_cliente),
            {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            },
        );
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <form onSubmit={submit} className="p-6">
                <h2 className="text-lg font-bold text-[#042753]">
                    Reasignar Comercial
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    Cliente:{" "}
                    <strong className="text-[#042753]">
                        {cliente.razon_social}
                    </strong>
                </p>
                <p className="text-xs text-gray-400">
                    Comercial actual: {cliente.comercial ?? "Sin asignar"}
                </p>

                {cliente.sin_seguimiento && (
                    <p className="mt-3 flex items-start gap-1.5 rounded-md bg-amber-50 px-2.5 py-1.5 text-xs text-amber-700">
                        <IconoAlerta className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                        Este cliente no tiene cotizaciones en los últimos 6
                        meses (o nunca tuvo una).
                    </p>
                )}

                <div className="mt-4">
                    <InputLabel
                        htmlFor="nuevo_comercial"
                        value="Nuevo Comercial"
                    />
                    <select
                        id="nuevo_comercial"
                        className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-[#042753] focus:ring-[#042753]"
                        value={data.id_comercial}
                        onChange={(e) =>
                            setData("id_comercial", e.target.value)
                        }
                    >
                        <option value="">Selecciona comercial</option>
                        {comerciales.map((com) => (
                            <option
                                key={com.id_empleado}
                                value={com.id_empleado}
                            >
                                {com.nombre_completo}
                            </option>
                        ))}
                    </select>
                    <InputError message={errors.id_comercial} className="mt-1" />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton type="button" onClick={onClose}>
                        Cancelar
                    </SecondaryButton>
                    <PrimaryButton
                        disabled={
                            processing ||
                            !data.id_comercial ||
                            String(data.id_comercial) ===
                                String(cliente.id_comercial ?? "")
                        }
                    >
                        Reasignar
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}

/* =========================================================================
   3. VISTA PRINCIPAL
   ========================================================================= */
export default function Index({
    clientes = [],
    ciudades = [],
    comerciales = [],
}) {
    const [busqueda, setBusqueda] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("todos");
    const [filtroReasignado, setFiltroReasignado] = useState("todos");

    // Estados para Paginación
    const [paginaActual, setPaginaActual] = useState(1);
    const [itemsPorPagina, setItemsPorPagina] = useState(10);

    // Control de Modales
    const [clienteVer, setClienteVer] = useState(null);
    const [modalFormOpen, setModalFormOpen] = useState(false);
    const [clienteEditar, setClienteEditar] = useState(null);
    const [clienteReasignar, setClienteReasignar] = useState(null);

    // KPIs
    const totalClientes = clientes.length;
    const activosCount = useMemo(
        () => clientes.filter((c) => c.activo).length,
        [clientes],
    );
    const inactivosCount = totalClientes - activosCount;

    useEffect(() => {
        setPaginaActual(1);
    }, [busqueda, filtroEstado, filtroReasignado, itemsPorPagina]);

    // Filtro interactivo
    const clientesFiltrados = useMemo(() => {
        return clientes.filter((cliente) => {
            const coincideTexto =
                cliente.razon_social
                    ?.toLowerCase()
                    .includes(busqueda.toLowerCase()) ||
                cliente.nit?.toLowerCase().includes(busqueda.toLowerCase()) ||
                cliente.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
                cliente.ciudad?.toLowerCase().includes(busqueda.toLowerCase());

            const coincideEstado =
                filtroEstado === "todos" ||
                (filtroEstado === "activos" && cliente.activo) ||
                (filtroEstado === "inactivos" && !cliente.activo);

            const coincideReasignado =
                filtroReasignado === "todos" ||
                (filtroReasignado === "reasignados" && cliente.fue_reasignado) ||
                (filtroReasignado === "no_reasignados" && !cliente.fue_reasignado);

            return coincideTexto && coincideEstado && coincideReasignado;
        });
    }, [clientes, busqueda, filtroEstado, filtroReasignado]);

    // Cálculo para paginación
    const totalPaginas =
        Math.ceil(clientesFiltrados.length / itemsPorPagina) || 1;
    const indiceInicio = (paginaActual - 1) * itemsPorPagina;
    const clientesPaginados = useMemo(() => {
        return clientesFiltrados.slice(
            indiceInicio,
            indiceInicio + itemsPorPagina,
        );
    }, [clientesFiltrados, indiceInicio, itemsPorPagina]);

    const handleCrear = () => {
        setClienteEditar(null);
        setModalFormOpen(true);
    };

    const handleEditar = (cliente) => {
        setClienteEditar(cliente);
        setModalFormOpen(true);
    };

    const eliminar = (cliente) => {
        if (confirm(`¿Desactivar a ${cliente.razon_social}?`)) {
            router.delete(
                route("gerente-operativo.clientes.destroy", cliente.id_cliente),
            );
        }
    };

    return (
        <GerenteOperativoLayout header="Clientes">
            <Head title="Clientes" />

            {/* Cabecera */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#042753]">
                        Clientes
                    </h1>
                    <p className="text-sm text-gray-500">
                        Gestiona tu cartera de clientes y prospectos
                    </p>
                </div>
                <PrimaryButton onClick={handleCrear} className="gap-2">
                    <IconoAgregar className="h-4 w-4" />
                    Crear Cliente
                </PrimaryButton>
            </div>

            {/* Tarjetas Métricas */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Total Clientes
                        </p>
                        <p className="mt-1 text-2xl font-extrabold text-[#042753]">
                            {totalClientes}
                        </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-[#042753]">
                        <IconoClientes className="h-6 w-6" />
                    </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Activos
                        </p>
                        <p className="mt-1 text-2xl font-extrabold text-[#042753]">
                            {activosCount}
                        </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold">
                        ✓
                    </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Inactivos
                        </p>
                        <p className="mt-1 text-2xl font-extrabold text-[#042753]">
                            {inactivosCount}
                        </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500 font-bold">
                        —
                    </div>
                </div>
            </div>

            {/* Filtros y Buscador */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
                <div className="relative flex-1">
                    <TextInput
                        type="text"
                        placeholder="Buscar por nombre, NIT, correo o ciudad..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full border-none bg-gray-50 focus:bg-white"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                        className="rounded-xl border-none bg-gray-50 py-2.5 px-4 text-sm font-medium text-[#042753] focus:ring-2 focus:ring-[#042753]"
                    >
                        <option value="todos">Todos los estados</option>
                        <option value="activos">Solo Activos</option>
                        <option value="inactivos">Solo Inactivos</option>
                    </select>

                    <select
                        value={filtroReasignado}
                        onChange={(e) => setFiltroReasignado(e.target.value)}
                        className="rounded-xl border-none bg-gray-50 py-2.5 px-4 text-sm font-medium text-[#042753] focus:ring-2 focus:ring-[#042753]"
                    >
                        <option value="todos">Reasignados o no</option>
                        <option value="reasignados">Solo Reasignados</option>
                        <option value="no_reasignados">
                            Nunca Reasignados
                        </option>
                    </select>

                    <select
                        value={itemsPorPagina}
                        onChange={(e) =>
                            setItemsPorPagina(Number(e.target.value))
                        }
                        className="rounded-xl border-none bg-gray-50 py-2.5 px-3 text-sm font-medium text-[#042753] focus:ring-2 focus:ring-[#042753]"
                    >
                        <option value={5}>5 por pág.</option>
                        <option value={10}>10 por pág.</option>
                        <option value={20}>20 por pág.</option>
                    </select>
                </div>
            </div>

            {/* Tabla Enumerada */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-400 font-semibold border-b border-gray-100">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-4 py-3.5 text-center w-12"
                                >
                                    #
                                </th>
                                <th scope="col" className="px-6 py-3.5">
                                    Cliente
                                </th>
                                <th scope="col" className="px-6 py-3.5">
                                    Contacto Principal
                                </th>
                                <th scope="col" className="px-6 py-3.5">
                                    Ciudad
                                </th>
                                <th scope="col" className="px-6 py-3.5">
                                    Comercial
                                </th>
                                <th scope="col" className="px-6 py-3.5">
                                    Última Cotización
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3.5 text-center"
                                >
                                    Estado
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3.5 text-right"
                                >
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {clientesPaginados.map((cliente, index) => {
                                const numeroCorrelativo =
                                    indiceInicio + index + 1;
                                const primerContacto = cliente.contactos?.[0];

                                return (
                                    <tr
                                        key={cliente.id_cliente}
                                        className={`transition hover:bg-gray-50/80 ${
                                            !cliente.activo
                                                ? "opacity-60 bg-gray-50/40"
                                                : ""
                                        }`}
                                    >
                                        <td className="px-4 py-4 text-center font-bold text-gray-400">
                                            {numeroCorrelativo}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-[#042753]">
                                                    {getIniciales(
                                                        cliente.razon_social,
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-[#042753]">
                                                        {cliente.razon_social}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        CLI-
                                                        {String(
                                                            cliente.id_cliente,
                                                        ).padStart(3, "0")}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-800">
                                                {primerContacto?.nombre_completo ||
                                                    "—"}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {primerContacto?.correo ||
                                                    cliente.email ||
                                                    "Sin correo"}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 font-medium text-gray-600">
                                            {cliente.ciudad || "—"}
                                        </td>

                                        <td className="px-6 py-4 font-medium text-gray-600">
                                            {cliente.comercial || "Sin asignar"}
                                            {cliente.fue_reasignado && (
                                                <div
                                                    className="mt-1 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600"
                                                    title={`Reasignado el ${cliente.reasignado_en}`}
                                                >
                                                    <IconoReasignar className="h-3 w-3" />
                                                    Reasignado
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-6 py-4">
                                            {cliente.ultima_cotizacion ? (
                                                <div className="text-gray-600">
                                                    {cliente.ultima_cotizacion}
                                                </div>
                                            ) : (
                                                <div className="italic text-gray-400">
                                                    Sin cotizaciones
                                                </div>
                                            )}
                                            {cliente.sin_seguimiento && (
                                                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                                    <IconoAlerta className="h-3 w-3" />
                                                    Sin seguimiento
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                    cliente.activo
                                                        ? "bg-emerald-50 text-emerald-600"
                                                        : "bg-gray-100 text-gray-500"
                                                }`}
                                            >
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${cliente.activo ? "bg-emerald-500" : "bg-gray-400"}`}
                                                />
                                                {cliente.activo
                                                    ? "Activo"
                                                    : "Inactivo"}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <BotonIcono
                                                    variante="ver"
                                                    titulo="Ver detalle"
                                                    onClick={() =>
                                                        setClienteVer(cliente)
                                                    }
                                                >
                                                    <IconoVer className="h-4 w-4" />
                                                </BotonIcono>
                                                <BotonIcono
                                                    variante="editar"
                                                    titulo="Editar"
                                                    onClick={() =>
                                                        handleEditar(cliente)
                                                    }
                                                >
                                                    <IconoEditar className="h-4 w-4" />
                                                </BotonIcono>
                                                {cliente.activo && (
                                                    <BotonIcono
                                                        variante="reasignar"
                                                        titulo="Reasignar comercial"
                                                        onClick={() =>
                                                            setClienteReasignar(
                                                                cliente,
                                                            )
                                                        }
                                                    >
                                                        <IconoReasignar className="h-4 w-4" />
                                                    </BotonIcono>
                                                )}
                                                {cliente.activo && (
                                                    <BotonIcono
                                                        variante="eliminar"
                                                        titulo="Desactivar"
                                                        onClick={() =>
                                                            eliminar(cliente)
                                                        }
                                                    >
                                                        <IconoEliminar className="h-4 w-4" />
                                                    </BotonIcono>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {clientesFiltrados.length === 0 && (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="p-12 text-center text-gray-400"
                                    >
                                        No se encontraron clientes registrados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Paginación */}
                {clientesFiltrados.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 px-6 py-4 bg-gray-50/50">
                        <p className="text-xs text-gray-500">
                            Mostrando{" "}
                            <span className="font-bold text-gray-700">
                                {indiceInicio + 1}
                            </span>{" "}
                            a{" "}
                            <span className="font-bold text-gray-700">
                                {Math.min(
                                    indiceInicio + itemsPorPagina,
                                    clientesFiltrados.length,
                                )}
                            </span>{" "}
                            de{" "}
                            <span className="font-bold text-gray-700">
                                {clientesFiltrados.length}
                            </span>{" "}
                            resultados
                        </p>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() =>
                                    setPaginaActual((p) => Math.max(p - 1, 1))
                                }
                                disabled={paginaActual === 1}
                                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white"
                            >
                                Anteriores
                            </button>

                            <div className="px-2 text-xs font-semibold text-[#042753]">
                                {paginaActual} / {totalPaginas}
                            </div>

                            <button
                                onClick={() =>
                                    setPaginaActual((p) =>
                                        Math.min(p + 1, totalPaginas),
                                    )
                                }
                                disabled={paginaActual === totalPaginas}
                                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modales */}
            <ModalDetalleCliente
                show={Boolean(clienteVer)}
                cliente={clienteVer}
                onClose={() => setClienteVer(null)}
            />

            <ModalFormCliente
                show={modalFormOpen}
                onClose={() => setModalFormOpen(false)}
                cliente={clienteEditar}
                ciudades={ciudades}
                comerciales={comerciales}
            />

            <ModalReasignarComercial
                show={Boolean(clienteReasignar)}
                cliente={clienteReasignar}
                onClose={() => setClienteReasignar(null)}
                comerciales={comerciales}
            />
        </GerenteOperativoLayout>
    );
}
