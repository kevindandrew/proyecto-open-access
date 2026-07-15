<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CotizacionContenedor extends Model
{
    use HasFactory;

    protected $table = 'cotizacion_contenedores';
    protected $primaryKey = 'id_item';

    protected $fillable = [
        'id_cotizacion',
        'tipo_contenedor',
        'cantidad',
    ];

    public function cotizacion(): BelongsTo
    {
        return $this->belongsTo(Cotizacion::class, 'id_cotizacion', 'id_cotizacion');
    }
}
