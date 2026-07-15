<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HouseBl extends Model
{
    use HasFactory;

    protected $table = 'house_bl';
    protected $primaryKey = 'id_hbl';

    protected $fillable = [
        'id_embarque',
        'numero_hbl',
        'condicion_pago',
        'fecha_emision',
    ];

    protected function casts(): array
    {
        return [
            'fecha_emision' => 'date',
        ];
    }

    public function embarque(): BelongsTo
    {
        return $this->belongsTo(Embarque::class, 'id_embarque', 'id_embarque');
    }
}
