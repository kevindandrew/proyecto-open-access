import GerenteOperativoLayout from '@/Layouts/GerenteOperativoLayout';
import ConfiguracionTabs from '@/Components/Configuracion/ConfiguracionTabs';
import PageHeader from '@/Components/PageHeader';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { IconoConfiguracionNav } from '@/Components/NavIcons';
import { BotonIcono, IconoAgregar, IconoEditar, IconoEliminar } from '@/Components/ActionIcons';
import { Head, useForm, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

function ModalFormConcepto({ show, onClose, concepto = null }) {
    const esEdicion = Boolean(concepto);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        nombre: '',
        activo: true,
    });

    useEffect(() => {
        if (concepto) {
            setData({ nombre: concepto.nombre ?? '', activo: concepto.activo ?? true });
        } else {
            reset();
        }
    }, [concepto, show]);

    const submit = (e) => {
        e.preventDefault();

        if (esEdicion) {
            put(route('gerente-operativo.configuracion.costos-extra.update', concepto.id_concepto), {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        } else {
            post(route('gerente-operativo.configuracion.costos-extra.store'), {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <form onSubmit={submit} className="p-6">
                <h2 className="text-lg font-bold text-[#042753]">
                    {esEdicion ? 'Editar Concepto' : 'Nuevo Concepto de Costo Extra'}
                </h2>

                <div className="mt-4">
                    <InputLabel htmlFor="nombre" value="Nombre" />
                    <TextInput
                        id="nombre"
                        type="text"
                        className="mt-1 block w-full"
                        placeholder="Ej: Seguro de Carga"
                        value={data.nombre}
                        onChange={(e) => setData('nombre', e.target.value)}
                    />
                    <InputError message={errors.nombre} className="mt-1" />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton type="button" onClick={onClose}>
                        Cancelar
                    </SecondaryButton>
                    <PrimaryButton disabled={processing}>
                        {esEdicion ? 'Guardar Cambios' : 'Crear Concepto'}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}

export default function Index({ conceptos }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [conceptoEditar, setConceptoEditar] = useState(null);

    const crear = () => {
        setConceptoEditar(null);
        setModalOpen(true);
    };

    const editar = (concepto) => {
        setConceptoEditar(concepto);
        setModalOpen(true);
    };

    const desactivar = (concepto) => {
        if (confirm(`¿Desactivar "${concepto.nombre}"? Ya no va a estar disponible para elegir en nuevas cotizaciones.`)) {
            router.delete(route('gerente-operativo.configuracion.costos-extra.destroy', concepto.id_concepto));
        }
    };

    return (
        <GerenteOperativoLayout header="Configuración">
            <Head title="Costos Extra" />

            <PageHeader
                icon={IconoConfiguracionNav}
                title="Configuración"
                subtitle="Conceptos disponibles para que el Comercial agregue costos extra opcionales a una cotización"
            >
                <PrimaryButton onClick={crear} className="gap-2">
                    <IconoAgregar className="h-4 w-4" />
                    Nuevo Concepto
                </PrimaryButton>
            </PageHeader>

            <ConfiguracionTabs activo="gerente-operativo.configuracion.costos-extra.index" />

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Nombre</th>
                            <th className="px-4 py-3 text-center font-semibold text-[#042753]">Estado</th>
                            <th className="px-4 py-3 text-right font-semibold text-[#042753]">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {conceptos.map((concepto) => (
                            <tr key={concepto.id_concepto} className={`transition-colors hover:bg-gray-50 ${!concepto.activo ? 'opacity-60' : ''}`}>
                                <td className="px-4 py-3 font-medium text-[#042753]">{concepto.nombre}</td>
                                <td className="px-4 py-3 text-center">
                                    <span
                                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                            concepto.activo ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                                        }`}
                                    >
                                        {concepto.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <BotonIcono variante="editar" titulo="Editar" onClick={() => editar(concepto)}>
                                            <IconoEditar className="h-4 w-4" />
                                        </BotonIcono>
                                        {concepto.activo && (
                                            <BotonIcono variante="eliminar" titulo="Desactivar" onClick={() => desactivar(concepto)}>
                                                <IconoEliminar className="h-4 w-4" />
                                            </BotonIcono>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {conceptos.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-4 py-6 text-center text-[#A9ABAE]">
                                    Todavía no hay conceptos de costo extra cargados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ModalFormConcepto
                show={modalOpen}
                onClose={() => setModalOpen(false)}
                concepto={conceptoEditar}
            />
        </GerenteOperativoLayout>
    );
}
