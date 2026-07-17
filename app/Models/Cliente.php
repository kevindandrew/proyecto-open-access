<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Cliente extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'clientes';
    protected $primaryKey = 'id_cliente';

    protected $fillable = [
        'id_comercial',
        'razon_social',
        'nit',
        'id_ciudad',
        'direccion',
        'persona_contacto',
        'telefono1',
        'celular_whatsapp',
        'email',
        'correo_factura',
        'condicion_pago',
        'otro',
    ];

    public function comercial(): BelongsTo
    {
        return $this->belongsTo(Empleado::class, 'id_comercial', 'id_empleado');
    }

    public function ciudad(): BelongsTo
    {
        return $this->belongsTo(Ciudad::class, 'id_ciudad', 'cod_ciudad');
    }

    public function cotizaciones(): HasMany
    {
        return $this->hasMany(Cotizacion::class, 'id_cliente', 'id_cliente');
    }

    public function embarques(): HasMany
    {
        return $this->hasMany(Embarque::class, 'id_cliente', 'id_cliente');
    }

    public function resolveRouteBindingQuery($query, $value, $field = null)
    {
        return parent::resolveRouteBindingQuery($query, $value, $field)->withTrashed();
    }
}
