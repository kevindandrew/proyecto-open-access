<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CategoriaComision extends Model
{
    use HasFactory;

    protected $table = 'categorias_comision';
    protected $primaryKey = 'id_categoria';

    protected $fillable = [
        'nombre',
        'porcentaje',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'porcentaje' => 'decimal:2',
            'activo' => 'boolean',
        ];
    }

    public function empleados(): HasMany
    {
        return $this->hasMany(Empleado::class, 'id_categoria_comision', 'id_categoria');
    }
}
