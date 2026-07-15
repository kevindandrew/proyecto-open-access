<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Proveedor extends Model
{
    use HasFactory;

    protected $table = 'proveedores';
    protected $primaryKey = 'id_proveedor';

    protected $fillable = [
        'tipo',
        'nombre',
        'nombre_fantasia',
        'codigo_interno',
        'contacto',
        'direccion1',
        'direccion2',
        'ciudad',
        'pais',
        'telefono',
        'celular',
        'nit',
        'email',
    ];

    public function tarifas(): HasMany
    {
        return $this->hasMany(Tarifa::class, 'id_proveedor', 'id_proveedor');
    }

    public function embarquesComoAgenteOrigen(): HasMany
    {
        return $this->hasMany(Embarque::class, 'id_agente_origen', 'id_proveedor');
    }

    public function embarquesComoNavieraAerolinea(): HasMany
    {
        return $this->hasMany(Embarque::class, 'id_naviera_aerolinea', 'id_proveedor');
    }

    public function embarqueCostos(): HasMany
    {
        return $this->hasMany(EmbarqueCosto::class, 'id_proveedor', 'id_proveedor');
    }
}
