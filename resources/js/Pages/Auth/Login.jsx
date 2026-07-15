import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

function EnvelopeIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0-.621.504-1.125 1.125-1.125h17.25c.621 0 1.125.504 1.125 1.125v10.5c0 .621-.504 1.125-1.125 1.125H3.375A1.125 1.125 0 0 1 2.25 17.25V6.75Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="m3 7 9 6 9-6" />
        </svg>
    );
}

function LockIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75M3.75 21h16.5a1.5 1.5 0 0 0 1.5-1.5v-7.5a1.5 1.5 0 0 0-1.5-1.5H3.75a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5Z"
            />
        </svg>
    );
}

function EyeIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
    );
}

function EyeSlashIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
            />
        </svg>
    );
}

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Iniciar Sesión" />

            <div className="flex min-h-screen">
                <div
                    className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#042753] p-12 text-white lg:flex"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#71BFA6"
                                strokeWidth="1.5"
                                className="h-8 w-8"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M2.25 15.75 12 3l9.75 12.75M4.5 10.5v9.75a.75.75 0 0 0 .75.75h4.5v-6h4.5v6h4.5a.75.75 0 0 0 .75-.75V10.5"
                                />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xl font-extrabold tracking-tight">
                                OPEN ACCESS
                            </p>
                            <p className="text-xs tracking-widest text-white/50">
                                BOLIVIA S.R.L.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h1 className="max-w-md text-4xl font-bold leading-tight">
                            Logística internacional, gestionada con precisión.
                        </h1>
                        <p className="mt-4 max-w-sm text-white/60">
                            ERP/CRM integral para importaciones y
                            exportaciones por mar, aire y tierra.
                        </p>

                        <div className="mt-10 flex gap-10">
                            <div>
                                <p className="text-3xl font-bold text-[#71BFA6]">
                                    180+
                                </p>
                                <p className="text-sm text-white/50">
                                    Embarques/mes
                                </p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-[#71BFA6]">
                                    50+
                                </p>
                                <p className="text-sm text-white/50">
                                    Clientes activos
                                </p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-[#71BFA6]">
                                    99.2%
                                </p>
                                <p className="text-sm text-white/50">
                                    Tasa de éxito
                                </p>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-white/40">
                        © 2026 Open Access Bolivia S.R.L. — Todos los derechos
                        reservados.
                    </p>
                </div>

                <div className="flex w-full items-center justify-center bg-white px-6 py-12 lg:w-1/2">
                    <div className="w-full max-w-sm">
                        <h2 className="text-2xl font-bold text-[#042753]">
                            Bienvenido de nuevo
                        </h2>
                        <p className="mt-1 text-sm text-[#A9ABAE]">
                            Ingrese sus credenciales para acceder al sistema.
                        </p>

                        {status && (
                            <div className="mt-4 text-sm font-medium text-green-600">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="mt-6 space-y-4">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="text-sm font-medium text-[#042753]"
                                >
                                    Correo electrónico
                                </label>
                                <div className="relative mt-1">
                                    <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#A9ABAE]" />
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        autoComplete="username"
                                        autoFocus
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                    />
                                </div>
                                <InputError
                                    message={errors.email}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <label
                                        htmlFor="password"
                                        className="text-sm font-medium text-[#042753]"
                                    >
                                        Contraseña
                                    </label>
                                    {canResetPassword && (
                                        <Link
                                            href={route('password.request')}
                                            className="text-xs text-[#042753] underline hover:text-[#71BFA6]"
                                        >
                                            ¿Olvidó su contraseña?
                                        </Link>
                                    )}
                                </div>
                                <div className="relative mt-1">
                                    <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#A9ABAE]" />
                                    <input
                                        id="password"
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        name="password"
                                        value={data.password}
                                        autoComplete="current-password"
                                        onChange={(e) =>
                                            setData(
                                                'password',
                                                e.target.value,
                                            )
                                        }
                                        className="block w-full rounded-md border-gray-300 pl-10 pr-10 shadow-sm focus:border-[#71BFA6] focus:ring-[#71BFA6]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword((v) => !v)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A9ABAE] hover:text-[#042753]"
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="h-5 w-5" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                <InputError
                                    message={errors.password}
                                    className="mt-1"
                                />
                            </div>

                            <label className="flex items-center gap-2 text-sm text-[#042753]">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData(
                                            'remember',
                                            e.target.checked,
                                        )
                                    }
                                    className="rounded border-gray-300 text-[#71BFA6] focus:ring-[#71BFA6]"
                                />
                                Recordarme
                            </label>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-md bg-[#042753] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                            >
                                Iniciar Sesión
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
