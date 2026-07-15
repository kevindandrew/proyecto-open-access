<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tipo_cambio', function (Blueprint $table) {
            $table->id('id_tc');
            $table->date('fecha');
            $table->string('moneda_origen', 5);
            $table->string('moneda_destino', 5);
            $table->decimal('valor', 10, 4);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tipo_cambio');
    }
};
