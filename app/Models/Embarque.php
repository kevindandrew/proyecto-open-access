<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Embarque extends Model
{
    use HasFactory;

    protected $table = 'embarques';
    protected $primaryKey = 'id_embarque';

    protected $fillable = [
        'numero_file',
        'id_cotizacion',
        'id_cliente',
        'consignatario',
        'id_comercial',
        'id_operativo',
        'id_agente_origen',
        'id_naviera_aerolinea',
        'modo_transporte',
        'tipo_embarque',
        'oficina_venta',
        'oficina_operacional',
        'mbl',
        'id_pol',
        'id_pod',
        'destino_final',
        'etd',
        'eta',
        'nave',
        'viaje',
        'pago_master',
        'estado_embarque',
    ];

    protected function casts(): array
    {
        return [
            'etd' => 'date',
            'eta' => 'date',
        ];
    }

    public function cotizacion(): BelongsTo
    {
        return $this->belongsTo(Cotizacion::class, 'id_cotizacion', 'id_cotizacion');
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class, 'id_cliente', 'id_cliente');
    }

    public function comercial(): BelongsTo
    {
        return $this->belongsTo(Empleado::class, 'id_comercial', 'id_empleado');
    }

    public function operativo(): BelongsTo
    {
        return $this->belongsTo(Empleado::class, 'id_operativo', 'id_empleado');
    }

    public function agenteOrigen(): BelongsTo
    {
        return $this->belongsTo(Proveedor::class, 'id_agente_origen', 'id_proveedor');
    }

    public function navieraAerolinea(): BelongsTo
    {
        return $this->belongsTo(Proveedor::class, 'id_naviera_aerolinea', 'id_proveedor');
    }

    public function pol(): BelongsTo
    {
        return $this->belongsTo(PuertoAeropuerto::class, 'id_pol', 'codigo');
    }

    public function pod(): BelongsTo
    {
        return $this->belongsTo(PuertoAeropuerto::class, 'id_pod', 'codigo');
    }

    public function houseBls(): HasMany
    {
        return $this->hasMany(HouseBl::class, 'id_embarque', 'id_embarque');
    }

    public function contenedores(): HasMany
    {
        return $this->hasMany(EmbarqueContenedor::class, 'id_embarque', 'id_embarque');
    }

    public function costos(): HasMany
    {
        return $this->hasMany(EmbarqueCosto::class, 'id_embarque', 'id_embarque');
    }

    public function seguimientos(): HasMany
    {
        return $this->hasMany(SeguimientoEmbarque::class, 'id_embarque', 'id_embarque');
    }

    public function documentos(): HasMany
    {
        return $this->hasMany(DocumentoEmbarque::class, 'id_embarque', 'id_embarque');
    }

    public function gastosDestino(): HasMany
    {
        return $this->hasMany(GastoDestino::class, 'id_embarque', 'id_embarque');
    }
}
