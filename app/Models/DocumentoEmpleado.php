<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentoEmpleado extends Model
{
    use HasFactory;

    protected $table = 'documentos_empleado';
    protected $primaryKey = 'id_documento';

    protected $fillable = [
        'id_empleado',
        'tipo_documento',
        'frente_url',
        'dorso_url',
    ];

    public function empleado(): BelongsTo
    {
        return $this->belongsTo(Empleado::class, 'id_empleado', 'id_empleado');
    }
}
