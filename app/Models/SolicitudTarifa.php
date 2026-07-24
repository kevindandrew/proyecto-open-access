<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SolicitudTarifa extends Model
{
    use HasFactory;

    protected $table = 'solicitudes_tarifa';
    protected $primaryKey = 'id_solicitud';

    protected $fillable = [
        'id_cliente',
        'id_comercial',
        'modo_transporte',
        'tipo_servicio',
        'id_pol',
        'id_pod',
        'id_cotizacion',
        'estado',
    ];

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

    public function cotizacion(): BelongsTo
    {
        return $this->belongsTo(Cotizacion::class, 'id_cotizacion', 'id_cotizacion');
    }
}
