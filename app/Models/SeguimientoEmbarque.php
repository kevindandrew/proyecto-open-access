<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SeguimientoEmbarque extends Model
{
    use HasFactory;

    protected $table = 'seguimiento_embarque';
    protected $primaryKey = 'id_seguimiento';

    protected $fillable = [
        'id_embarque',
        'fecha',
        'estado',
        'comentario',
        'id_empleado_responsable',
    ];

    protected function casts(): array
    {
        return [
            'fecha' => 'datetime',
        ];
    }

    public function embarque(): BelongsTo
    {
        return $this->belongsTo(Embarque::class, 'id_embarque', 'id_embarque');
    }

    public function empleadoResponsable(): BelongsTo
    {
        return $this->belongsTo(Empleado::class, 'id_empleado_responsable', 'id_empleado');
    }
}
