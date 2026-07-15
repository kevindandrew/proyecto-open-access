<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GastoDestino extends Model
{
    use HasFactory;

    protected $table = 'gastos_destino';
    protected $primaryKey = 'id_gasto';

    protected $fillable = [
        'id_embarque',
        'concepto',
        'monto',
        'moneda',
        'pagado',
        'fecha_pago',
    ];

    protected function casts(): array
    {
        return [
            'pagado' => 'boolean',
            'fecha_pago' => 'date',
        ];
    }

    public function embarque(): BelongsTo
    {
        return $this->belongsTo(Embarque::class, 'id_embarque', 'id_embarque');
    }
}
