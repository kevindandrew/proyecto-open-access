<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class HouseBl extends Model
{
    use HasFactory;

    protected $table = 'house_bl';
    protected $primaryKey = 'id_hbl';

    protected $fillable = [
        'id_embarque',
        'id_cliente',
        'numero_hbl',
        'condicion_pago',
        'flete_valor_texto',
        'fecha_emision',
        'congelado_en',
    ];

    protected function casts(): array
    {
        return [
            'fecha_emision' => 'date',
            'congelado_en' => 'datetime',
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

    public function contenedores(): BelongsToMany
    {
        // Un mismo contenedor puede repartirse entre varios houses (ej. un
        // contenedor de 2500 kg dividido entre 2 consignatarios) — por eso
        // peso/volumen/descripción de "la porción de este house" viven en el
        // pivot, separados del dato del contenedor completo.
        return $this->belongsToMany(EmbarqueContenedor::class, 'house_bl_contenedor', 'id_hbl', 'id_item')
            ->withPivot(['peso_kg', 'volumen_cbm', 'descripcion_mercancia']);
    }
}
