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
        return $this->belongsToMany(EmbarqueContenedor::class, 'house_bl_contenedor', 'id_hbl', 'id_item');
    }
}
