<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cotizacion_contenedores', function (Blueprint $table) {
            $table->id('id_item');
            $table->foreignId('id_cotizacion')->constrained(table: 'cotizaciones', column: 'id_cotizacion')->cascadeOnDelete();
            $table->string('tipo_contenedor', 10);
            $table->integer('cantidad')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cotizacion_contenedores');
    }
};
