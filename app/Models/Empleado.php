<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Empleado extends Model
{
    use HasFactory;

    protected $table = 'empleados';
    protected $primaryKey = 'id_empleado';

    protected $fillable = [
        'nombre_completo',
        'ci',
        'telefono',
        'email',
        'id_rol',
        'especialidad_operativa',
        'id_jefe',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'activo' => 'boolean',
        ];
    }

    public function rol(): BelongsTo
    {
        return $this->belongsTo(RoleEmpleado::class, 'id_rol', 'id_rol');
    }

    public function jefe(): BelongsTo
    {
        return $this->belongsTo(Empleado::class, 'id_jefe', 'id_empleado');
    }

    public function subordinados(): HasMany
    {
        return $this->hasMany(Empleado::class, 'id_jefe', 'id_empleado');
    }

    public function user(): HasOne
    {
        return $this->hasOne(User::class, 'empleado_id', 'id_empleado');
    }

    public function clientesComoComercial(): HasMany
    {
        return $this->hasMany(Cliente::class, 'id_comercial', 'id_empleado');
    }

    public function cotizaciones(): HasMany
    {
        return $this->hasMany(Cotizacion::class, 'id_comercial', 'id_empleado');
    }

    public function embarquesComoComercial(): HasMany
    {
        return $this->hasMany(Embarque::class, 'id_comercial', 'id_empleado');
    }

    public function embarquesComoOperativo(): HasMany
    {
        return $this->hasMany(Embarque::class, 'id_operativo', 'id_empleado');
    }

    public function seguimientosResponsable(): HasMany
    {
        return $this->hasMany(SeguimientoEmbarque::class, 'id_empleado_responsable', 'id_empleado');
    }
}
