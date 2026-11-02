import InputError from "@/Components/InputError";
import { Head, Link, useForm } from "@inertiajs/react";

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        usuario: "",
    });

    const submit = (e) => {
        e.preventDefault();

        post(route("password.email"), {
            onSuccess: () => reset("usuario"),
        });
    };

    return (
        <>
            <Head title="Recuperar Contraseña" />

            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
                <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
                    <img
                        src="/images/logoOpenAccess.png"
                        alt="Logo Open Access"
                        className="mb-6 h-12 w-auto rounded bg-[#042753] p-2"
                    />

                    <h2 className="text-2xl font-bold text-[#042753]">
                        ¿Olvidó su contraseña?
                    </h2>
                    <p className="mt-2 text-sm text-[#A9ABAE]">
                        Ingrese su usuario o su correo. El pedido le llega al
                        Gerente Operativo, que le va a generar una contraseña
                        nueva y se la va a comunicar.
                    </p>

                    {status && (
                        <div className="mt-4 rounded-md bg-[#71BFA6]/10 p-3 text-sm font-medium text-[#042753]">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="mt-6 space-y-4">
                        <div>
                            <label
                                htmlFor="usuario"
                                className="text-sm font-medium text-[#042753]"
                            >
                                Usuario o correo
                            </label>
                            <input
                                id="usuario"
                                type="text"
                                name="usuario"
                                value={data.usuario}
                                autoComplete="username"
                                autoFocus
                                onChange={(e) =>
                                    setData("usuario", e.target.value)
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                            />
                            <InputError message={errors.usuario} className="mt-2" />
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-md bg-[#042753] py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                        >
                            Enviar solicitud
                        </button>
                    </form>

                    <Link
                        href={route("login")}
                        className="mt-6 block text-center text-xs text-[#042753] underline hover:text-[#71BFA6]"
                    >
                        Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        </>
    );
}
