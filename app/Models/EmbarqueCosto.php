<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmbarqueCosto extends Model
{
    use HasFactory;

    protected $table = 'embarque_costos';
    protected $primaryKey = 'id_costo';

    protected $fillable = [
        'id_embarque',
        'concepto',
        'id_proveedor',
        'id_cliente_cobro',
        'id_consignatario_cobro',
        'costo_compra',
        'costo_venta',
        'moneda',
    ];

    public function embarque(): BelongsTo
    {
        return $this->belongsTo(Embarque::class, 'id_embarque', 'id_embarque');
    }

    public function proveedor(): BelongsTo
    {
        return $this->belongsTo(Proveedor::class, 'id_proveedor', 'id_proveedor');
    }

    public function clienteCobro(): BelongsTo
    {
        return $this->belongsTo(Cliente::class, 'id_cliente_cobro', 'id_cliente');
    }

    public function consignatarioCobro(): BelongsTo
    {
        return $this->belongsTo(ClienteConsignatario::class, 'id_consignatario_cobro', 'id_consignatario');
    }

    /**
     * A quién se le cobra este concepto, como lo elige el selector "Cobrar a"
     * ("cliente:{id}" / "consignatario:{id}"; '' = el cliente del embarque).
     */
    public function valorCobrarA(): string
    {
        return match (true) {
            (bool) $this->id_consignatario_cobro => "consignatario:{$this->id_consignatario_cobro}",
            (bool) $this->id_cliente_cobro => "cliente:{$this->id_cliente_cobro}",
            default => '',
        };
    }

    /**
     * Nombre de a quién se le cobra (por defecto, el cliente del embarque).
     */
    public function nombreCobrarA(): ?string
    {
        return $this->consignatarioCobro?->nombre
            ?? $this->clienteCobro?->razon_social
            ?? $this->embarque?->cliente?->razon_social;
    }
}
