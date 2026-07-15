<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TarifaCargoAdicional extends Model
{
    use HasFactory;

    protected $table = 'tarifa_cargos_adicionales';
    protected $primaryKey = 'id_cargo';

    protected $fillable = [
        'id_tarifa',
        'concepto',
        'monto',
        'moneda',
    ];

    public function tarifa(): BelongsTo
    {
        return $this->belongsTo(Tarifa::class, 'id_tarifa', 'id_tarifa');
    }
}
