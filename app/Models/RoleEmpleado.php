<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RoleEmpleado extends Model
{
    use HasFactory;

    protected $table = 'roles_empleado';
    protected $primaryKey = 'id_rol';

    protected $fillable = [
        'nombre_rol',
    ];

    public function empleados(): HasMany
    {
        return $this->hasMany(Empleado::class, 'id_rol', 'id_rol');
    }
}
