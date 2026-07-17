<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tarifa extends Model
{
    use HasFactory;

    protected $table = 'tarifas';
    protected $primaryKey = 'id_tarifa';

    protected $fillable = [
        'id_proveedor',
        'id_origen',
        'id_destino',
        'modo',
        'tipo_servicio',
        'dias_transito',
        'costo_20',
        'costo_40',
        'costo_40hc',
        'costo_base',
        'moneda',
        'tipo_tarifa',
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

    public function cargosAdicionales(): HasMany
    {
        return $this->hasMany(TarifaCargoAdicional::class, 'id_tarifa', 'id_tarifa');
    }
}
