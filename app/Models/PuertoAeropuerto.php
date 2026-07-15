<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PuertoAeropuerto extends Model
{
    use HasFactory;

    protected $table = 'puertos_aeropuertos';
    protected $primaryKey = 'codigo';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'codigo',
        'nombre',
        'tipo',
        'pais',
    ];

    public function tarifasOrigen(): HasMany
    {
        return $this->hasMany(Tarifa::class, 'id_origen', 'codigo');
    }

    public function tarifasDestino(): HasMany
    {
        return $this->hasMany(Tarifa::class, 'id_destino', 'codigo');
    }

    public function cotizacionesPol(): HasMany
    {
        return $this->hasMany(Cotizacion::class, 'id_pol', 'codigo');
    }

    public function cotizacionesPod(): HasMany
    {
        return $this->hasMany(Cotizacion::class, 'id_pod', 'codigo');
    }

    public function embarquesPol(): HasMany
    {
        return $this->hasMany(Embarque::class, 'id_pol', 'codigo');
    }

    public function embarquesPod(): HasMany
    {
        return $this->hasMany(Embarque::class, 'id_pod', 'codigo');
    }
}
