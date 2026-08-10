<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TarifaAgenteCosto extends Model
{
    use HasFactory;

    protected $table = 'tarifa_agente_costos';
    protected $primaryKey = 'id_costo';

    protected $fillable = [
        'id_tarifa_agente',
        'concepto',
        'costo',
        'moneda',
    ];

    public function tarifaAgente(): BelongsTo
    {
        return $this->belongsTo(TarifaAgente::class, 'id_tarifa_agente', 'id_tarifa_agente');
    }
}
