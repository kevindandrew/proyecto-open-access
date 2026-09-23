<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentoLiquidacionLinea extends Model
{
    use HasFactory;

    protected $table = 'documento_liquidacion_lineas';
    protected $primaryKey = 'id_linea';

    protected $fillable = [
        'id_documento',
        'tipo_origen',
        'id_origen',
        'descripcion',
        'monto',
        'moneda',
    ];

    protected function casts(): array
    {
        return [
            'monto' => 'decimal:2',
        ];
    }

    public function documento(): BelongsTo
    {
        return $this->belongsTo(DocumentoLiquidacion::class, 'id_documento', 'id_documento');
    }
}
