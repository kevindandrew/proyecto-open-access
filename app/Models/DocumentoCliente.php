<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentoCliente extends Model
{
    use HasFactory;

    protected $table = 'documentos_cliente';
    protected $primaryKey = 'id_documento';

    protected $fillable = [
        'id_cliente',
        'tipo_documento',
        'frente_url',
        'dorso_url',
    ];

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class, 'id_cliente', 'id_cliente');
    }
}
