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
        'unidad',
    ];

    /**
     * Cómo se cobra el cargo según el modo de la tarifa. "Per Container" y
     * "Per CBM" solo tienen sentido en Marítimo / Terrestre, "Per Kg" en Aéreo.
     */
    public const UNIDADES_POR_MODO = [
        'Maritimo' => ['Flat', 'Per Container', 'Per CBM'],
        'Terrestre' => ['Flat', 'Per Container', 'Per CBM'],
        'Aereo' => ['Flat', 'Per Kg'],
    ];

    public function tarifa(): BelongsTo
    {
        return $this->belongsTo(Tarifa::class, 'id_tarifa', 'id_tarifa');
    }
}
