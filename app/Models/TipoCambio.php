<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TipoCambio extends Model
{
    use HasFactory;

    protected $table = 'tipo_cambio';
    protected $primaryKey = 'id_tc';

    protected $fillable = [
        'fecha',
        'moneda_origen',
        'moneda_destino',
        'valor',
    ];

    protected function casts(): array
    {
        return [
            'fecha' => 'date',
        ];
    }
}
