<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DocumentoLiquidacion extends Model
{
    use HasFactory;

    protected $table = 'documentos_liquidacion';
    protected $primaryKey = 'id_documento';

    protected $fillable = [
        'id_embarque',
        'tipo',
        'numero',
        'id_cliente',
        'id_proveedor',
        'moneda',
        'monto',
        'condicion_pago',
        'tipo_cambio',
        'fecha',
        'observaciones',
        'id_empleado_generador',
    ];

    protected function casts(): array
    {
        return [
            'fecha' => 'date',
            'monto' => 'decimal:2',
            'tipo_cambio' => 'decimal:4',
        ];
    }

    public function embarque(): BelongsTo
    {
        return $this->belongsTo(Embarque::class, 'id_embarque', 'id_embarque');
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class, 'id_cliente', 'id_cliente');
    }

    public function proveedor(): BelongsTo
    {
        return $this->belongsTo(Proveedor::class, 'id_proveedor', 'id_proveedor');
    }

    public function empleadoGenerador(): BelongsTo
    {
        return $this->belongsTo(Empleado::class, 'id_empleado_generador', 'id_empleado');
    }

    public function lineas(): HasMany
    {
        return $this->hasMany(DocumentoLiquidacionLinea::class, 'id_documento', 'id_documento');
    }
}
