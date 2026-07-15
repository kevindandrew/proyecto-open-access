<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ciudad extends Model
{
    use HasFactory;

    protected $table = 'ciudades';
    protected $primaryKey = 'cod_ciudad';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'cod_ciudad',
        'nombre_ciudad',
    ];

    public function clientes(): HasMany
    {
        return $this->hasMany(Cliente::class, 'id_ciudad', 'cod_ciudad');
    }
}
