<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TarifaAgente extends Model
{
    use HasFactory;

    protected $table = 'tarifas_agente';
    protected $primaryKey = 'id_tarifa_agente';

    protected $fillable = [
        'id_proveedor',
        'id_origen',
        'id_destino',
        'modo',
        'observaciones',
        'fecha_inicio_vigencia',
        'fecha_fin_vigencia',
    ];

    protected function casts(): array
    {
        return [
            'fecha_inicio_vigencia' => 'date',
            'fecha_fin_vigencia' => 'date',
        ];
    }

    public function proveedor(): BelongsTo
    {
        return $this->belongsTo(Proveedor::class, 'id_proveedor', 'id_proveedor');
    }

    public function origen(): BelongsTo
    {
        return $this->belongsTo(PuertoAeropuerto::class, 'id_origen', 'codigo');
    }

    public function destino(): BelongsTo
    {
        return $this->belongsTo(PuertoAeropuerto::class, 'id_destino', 'codigo');
    }

    public function costos(): HasMany
    {
        return $this->hasMany(TarifaAgenteCosto::class, 'id_tarifa_agente', 'id_tarifa_agente');
    }
}
