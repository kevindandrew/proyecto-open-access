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
}
