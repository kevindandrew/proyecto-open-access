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

function ModalFormCategoria({ show, onClose, categoria = null }) {
    const esEdicion = Boolean(categoria);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        nombre: '',
        porcentaje: '',
        activo: true,
    });

    useEffect(() => {
        if (categoria) {
            setData({
                nombre: categoria.nombre ?? '',
                porcentaje: categoria.porcentaje ?? '',
                activo: categoria.activo ?? true,
            });
        } else {
            reset();
        }
    }, [categoria, show]);

    const submit = (e) => {
        e.preventDefault();

        const opciones = {
            onSuccess: () => {
                reset();
                onClose();
            },
        };

        if (esEdicion) {
            put(route('gerente-operativo.configuracion.comisiones.update', categoria.id_categoria), opciones);
        } else {
            post(route('gerente-operativo.configuracion.comisiones.store'), opciones);
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <form onSubmit={submit} className="p-6">
                <h2 className="text-lg font-bold text-[#042753]">
                    {esEdicion ? 'Editar Categoría' : 'Nueva Categoría de Comisión'}
                </h2>

                <div className="mt-4">
                    <InputLabel htmlFor="nombre" value="Categoría de vendedor" />
                    <TextInput
                        id="nombre"
                        type="text"
                        className="mt-1 block w-full"
                        placeholder="Ej: Senior"
                        value={data.nombre}
                        onChange={(e) => setData('nombre', e.target.value)}
                    />
                    <InputError message={errors.nombre} className="mt-1" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="porcentaje" value="% de comisión sobre el profit" />
                    <TextInput
                        id="porcentaje"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        className="mt-1 block w-full"
                        placeholder="Ej: 15"
                        value={data.porcentaje}
                        onChange={(e) => setData('porcentaje', e.target.value)}
                    />
                    <InputError message={errors.porcentaje} className="mt-1" />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton type="button" onClick={onClose}>
                        Cancelar
                    </SecondaryButton>
                    <PrimaryButton disabled={processing}>
                        {esEdicion ? 'Guardar Cambios' : 'Crear Categoría'}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}

export default function Index({ categorias }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [categoriaEditar, setCategoriaEditar] = useState(null);

    const crear = () => {
        setCategoriaEditar(null);
        setModalOpen(true);
    };

    const editar = (categoria) => {
        setCategoriaEditar(categoria);
        setModalOpen(true);
    };

    const desactivar = (categoria) => {
        if (confirm(`¿Desactivar "${categoria.nombre}"? Ya no se va a poder asignar a nuevos comerciales.`)) {
            router.delete(route('gerente-operativo.configuracion.comisiones.destroy', categoria.id_categoria));
        }
    };

    return (
        <GerenteOperativoLayout header="Configuración">
            <Head title="Comisiones" />

            <PageHeader
                icon={IconoConfiguracionNav}
                title="Configuración"
                subtitle="Categorías de vendedor y su % de comisión — se asignan a cada comercial en Personal y se usan en el Resultado de Operación"
            >
                <PrimaryButton onClick={crear} className="gap-2">
                    <IconoAgregar className="h-4 w-4" />
                    Nueva Categoría
                </PrimaryButton>
            </PageHeader>

            <ConfiguracionTabs activo="gerente-operativo.configuracion.comisiones.index" />

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-[#042753]">Categoría</th>
                            <th className="px-4 py-3 text-right font-semibold text-[#042753]">% Comisión</th>
                            <th className="px-4 py-3 text-right font-semibold text-[#042753]">Comerciales</th>
                            <th className="px-4 py-3 text-center font-semibold text-[#042753]">Estado</th>
                            <th className="px-4 py-3 text-right font-semibold text-[#042753]">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {categorias.map((categoria) => (
                            <tr
                                key={categoria.id_categoria}
                                className={`transition-colors hover:bg-gray-50 ${!categoria.activo ? 'opacity-60' : ''}`}
                            >
                                <td className="px-4 py-3 font-medium text-[#042753]">{categoria.nombre}</td>
                                <td className="px-4 py-3 text-right font-semibold text-[#042753]">
                                    {categoria.porcentaje}%
                                </td>
                                <td className="px-4 py-3 text-right text-[#A9ABAE]">{categoria.empleados_count}</td>
                                <td className="px-4 py-3 text-center">
                                    <span
                                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                            categoria.activo ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                                        }`}
                                    >
                                        {categoria.activo ? 'Activa' : 'Inactiva'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <BotonIcono variante="editar" titulo="Editar" onClick={() => editar(categoria)}>
                                            <IconoEditar className="h-4 w-4" />
                                        </BotonIcono>
                                        {categoria.activo && (
                                            <BotonIcono
                                                variante="eliminar"
                                                titulo="Desactivar"
                                                onClick={() => desactivar(categoria)}
                                            >
                                                <IconoEliminar className="h-4 w-4" />
                                            </BotonIcono>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {categorias.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-6 text-center text-[#A9ABAE]">
                                    Todavía no hay categorías de comisión cargadas.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ModalFormCategoria
                show={modalOpen}
                onClose={() => setModalOpen(false)}
                categoria={categoriaEditar}
            />
        </GerenteOperativoLayout>
    );
}
