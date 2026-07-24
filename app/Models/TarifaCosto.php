<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TarifaCosto extends Model
{
    use HasFactory;

    protected $table = 'tarifa_costos';
    protected $primaryKey = 'id_costo';

    protected $fillable = [
        'id_tarifa',
        'tipo_servicio',
        'tipo_contenedor',
        'costo',
        'moneda',
    ];

    public function tarifa(): BelongsTo
    {
        return $this->belongsTo(Tarifa::class, 'id_tarifa', 'id_tarifa');
    }
}
