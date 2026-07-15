<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CotizacionDetalle extends Model
{
    use HasFactory;

    protected $table = 'cotizacion_detalle';
    protected $primaryKey = 'id_detalle';

    protected $fillable = [
        'id_cotizacion',
        'nro_item',
        'descripcion',
        'tipo_tarifa_unidad',
        'costo_unitario',
        'base_calculo',
        'moneda',
        'costo_total',
    ];

    public function cotizacion(): BelongsTo
    {
        return $this->belongsTo(Cotizacion::class, 'id_cotizacion', 'id_cotizacion');
    }
}
