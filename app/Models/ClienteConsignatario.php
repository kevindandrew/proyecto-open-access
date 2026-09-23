<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClienteConsignatario extends Model
{
    use HasFactory;

    protected $table = 'cliente_consignatarios';
    protected $primaryKey = 'id_consignatario';

    protected $fillable = [
        'id_cliente',
        'nombre',
        'nit',
        'direccion',
        'celular',
        'correo',
    ];

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class, 'id_cliente', 'id_cliente');
    }
}
