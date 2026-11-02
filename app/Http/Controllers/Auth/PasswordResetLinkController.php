<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\SolicitudRestablecimiento;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * "Olvidé mi contraseña": el sistema no manda correos, así que el pedido le
 * llega a Gerente Operativo (Restablecer Contraseñas), que genera una
 * contraseña nueva y se la comunica al usuario.
 */
class PasswordResetLinkController extends Controller
{
    private const MENSAJE = 'Tu solicitud fue enviada. El Gerente Operativo va a generarte una contraseña nueva y te la va a comunicar.';

    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'usuario' => ['required', 'string', 'max:120'],
        ], [
            'usuario.required' => 'Ingresá tu usuario o tu correo.',
        ]);

        $usuario = Str::lower(trim($request->input('usuario')));
        $clave = 'restablecer|'.$request->ip();

        if (RateLimiter::tooManyAttempts($clave, 5)) {
            throw ValidationException::withMessages([
                'usuario' => 'Demasiados intentos. Probá de nuevo en unos minutos.',
            ]);
        }

        RateLimiter::hit($clave, 600);

        $user = User::whereRaw('LOWER(username) = ?', [$usuario])
            ->orWhereRaw('LOWER(email) = ?', [$usuario])
            ->first();

        // Un mismo usuario no acumula pedidos pendientes.
        if ($user && ! SolicitudRestablecimiento::where('user_id', $user->id)->where('estado', 'Pendiente')->exists()) {
            SolicitudRestablecimiento::create([
                'user_id' => $user->id,
                'ip' => $request->ip(),
                'estado' => 'Pendiente',
            ]);
        }

        // Siempre el mismo mensaje, exista o no el usuario: así no se puede
        // averiguar desde afuera qué usuarios hay en el sistema.
        return back()->with('status', self::MENSAJE);
    }
}
