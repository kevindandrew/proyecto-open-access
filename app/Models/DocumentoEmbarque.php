<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentoEmbarque extends Model
{
    use HasFactory;

    protected $table = 'documentos_embarque';
    protected $primaryKey = 'id_documento';

    protected $fillable = [
        'id_embarque',
        'tipo_documento',
        'numero_documento',
        'fecha_emision',
        'archivo_url',
    ];

    protected function casts(): array
    {
        return [
            'fecha_emision' => 'date',
        ];
    }

    public function embarque(): BelongsTo
    {
        return $this->belongsTo(Embarque::class, 'id_embarque', 'id_embarque');
    }
}
