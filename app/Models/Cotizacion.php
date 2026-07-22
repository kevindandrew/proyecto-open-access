<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cotizacion extends Model
{
    use HasFactory;

    protected $table = 'cotizaciones';
    protected $primaryKey = 'id_cotizacion';

    protected $fillable = [
        'numero_referencia',
        'id_cliente',
        'id_comercial',
        'modo_transporte',
        'tipo_servicio',
        'incoterm',
        'id_pol',
        'id_pod',
        'destino_final',
        'fecha_emision',
        'fecha_validez',
        'estado',
        'peso_kg',
        'volumen_cbm',
        'mercancia_peligrosa',
        'dias_transito',
        'motivo_rechazo',
    ];

    protected function casts(): array
    {
        return [
            'fecha_emision' => 'date',
            'fecha_validez' => 'date',
            'mercancia_peligrosa' => 'boolean',
        ];
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class, 'id_cliente', 'id_cliente');
    }

    public function comercial(): BelongsTo
    {
        return $this->belongsTo(Empleado::class, 'id_comercial', 'id_empleado');
    }

    public function pol(): BelongsTo
    {
        return $this->belongsTo(PuertoAeropuerto::class, 'id_pol', 'codigo');
    }

    public function pod(): BelongsTo
    {
        return $this->belongsTo(PuertoAeropuerto::class, 'id_pod', 'codigo');
    }

    public function contenedores(): HasMany
    {
        return $this->hasMany(CotizacionContenedor::class, 'id_cotizacion', 'id_cotizacion');
    }

    public function detalle(): HasMany
    {
        return $this->hasMany(CotizacionDetalle::class, 'id_cotizacion', 'id_cotizacion');
    }

    public function embarques(): HasMany
    {
        return $this->hasMany(Embarque::class, 'id_cotizacion', 'id_cotizacion');
    }
}
