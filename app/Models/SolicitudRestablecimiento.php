<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SolicitudRestablecimiento extends Model
{
    protected $table = 'solicitudes_restablecimiento';
    protected $primaryKey = 'id_solicitud';

    protected $fillable = [
        'user_id',
        'ip',
        'estado',
        'id_empleado_atendio',
        'atendida_en',
    ];

    protected function casts(): array
    {
        return [
            'atendida_en' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function atendidoPor(): BelongsTo
    {
        return $this->belongsTo(Empleado::class, 'id_empleado_atendio', 'id_empleado');
    }
}
