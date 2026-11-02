<?php

namespace App\Http\Controllers\GerenteOperativo;

use App\Http\Controllers\Controller;
use App\Models\SolicitudRestablecimiento;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Pedidos de "olvidé mi contraseña" que llegan desde el login. Gerente
 * Operativo genera una contraseña nueva, que se muestra una sola vez para
 * comunicársela al usuario.
 */
class RestablecimientoController extends Controller
{
    public function index(): Response
    {
        $mapear = fn (SolicitudRestablecimiento $s) => [
            'id_solicitud' => $s->id_solicitud,
            'nombre' => $s->user?->empleado?->nombre_completo ?? $s->user?->name,
            'username' => $s->user?->username,
            'email' => $s->user?->email,
            'rol' => $s->user?->empleado?->rol?->nombre_rol,
            'activo' => (bool) ($s->user?->empleado?->activo ?? true),
            'solicitada' => $s->created_at->format('d/m/Y H:i'),
            'estado' => $s->estado,
            'atendida_por' => $s->atendidoPor?->nombre_completo,
            'atendida_en' => $s->atendida_en?->format('d/m/Y H:i'),
        ];

        $relaciones = ['user.empleado.rol', 'atendidoPor'];

        return Inertia::render('GerenteOperativo/Restablecimientos/Index', [
            'pendientes' => SolicitudRestablecimiento::with($relaciones)
                ->where('estado', 'Pendiente')
                ->orderBy('created_at')
                ->get()
                ->map($mapear),
            'historial' => SolicitudRestablecimiento::with($relaciones)
                ->where('estado', '!=', 'Pendiente')
                ->orderByDesc('atendida_en')
                ->limit(30)
                ->get()
                ->map($mapear),
        ]);
    }

    public function generar(SolicitudRestablecimiento $solicitud): RedirectResponse
    {
        abort_unless($solicitud->estado === 'Pendiente', 422, 'Esta solicitud ya fue atendida.');

        $user = $solicitud->user;
        $password = Str::password(10, symbols: false);

        DB::transaction(function () use ($solicitud, $user, $password) {
            $user->update(['password' => bcrypt($password)]);
            $this->cerrar($solicitud, 'Atendida');

            // Si el mismo usuario tenía otros pedidos pendientes, quedan resueltos.
            SolicitudRestablecimiento::where('user_id', $user->id)
                ->where('estado', 'Pendiente')
                ->get()
                ->each(fn ($otra) => $this->cerrar($otra, 'Atendida'));
        });

        return redirect()
            ->route('gerente-operativo.restablecimientos.index')
            ->with('success', "Contraseña nueva generada para {$user->username}.")
            ->with('credenciales', [
                'nombre' => $user->empleado?->nombre_completo ?? $user->name,
                'username' => $user->username,
                'password' => $password,
            ]);
    }

    public function descartar(SolicitudRestablecimiento $solicitud): RedirectResponse
    {
        abort_unless($solicitud->estado === 'Pendiente', 422, 'Esta solicitud ya fue atendida.');

        $this->cerrar($solicitud, 'Descartada');

        return redirect()
            ->route('gerente-operativo.restablecimientos.index')
            ->with('success', 'Solicitud descartada. La contraseña del usuario no se cambió.');
    }

    private function cerrar(SolicitudRestablecimiento $solicitud, string $estado): void
    {
        $solicitud->update([
            'estado' => $estado,
            'id_empleado_atendio' => Auth::user()->empleado?->id_empleado,
            'atendida_en' => now(),
        ]);
    }
}
