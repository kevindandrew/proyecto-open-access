<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentoProveedor extends Model
{
    use HasFactory;

    protected $table = 'documentos_proveedor';
    protected $primaryKey = 'id_documento';

    protected $fillable = [
        'id_proveedor',
        'tipo_documento',
        'frente_url',
        'dorso_url',
    ];

    public function proveedor(): BelongsTo
    {
        return $this->belongsTo(Proveedor::class, 'id_proveedor', 'id_proveedor');
    }
}
