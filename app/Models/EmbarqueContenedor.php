<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmbarqueContenedor extends Model
{
    use HasFactory;

    protected $table = 'embarque_contenedores';
    protected $primaryKey = 'id_item';

    protected $fillable = [
        'id_embarque',
        'tipo_contenedor',
        'numero_contenedor',
        'numero_sello',
        'peso_kg',
        'volumen_cbm',
        'descripcion_mercancia',
        'fecha_devolucion',
    ];

    protected function casts(): array
    {
        return [
            'fecha_devolucion' => 'date',
        ];
    }

    public function embarque(): BelongsTo
    {
        return $this->belongsTo(Embarque::class, 'id_embarque', 'id_embarque');
    }
}
