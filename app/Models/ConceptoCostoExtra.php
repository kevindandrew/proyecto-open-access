<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConceptoCostoExtra extends Model
{
    use HasFactory;

    protected $table = 'conceptos_costo_extra';
    protected $primaryKey = 'id_concepto';

    protected $fillable = [
        'nombre',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'activo' => 'boolean',
        ];
    }
}
