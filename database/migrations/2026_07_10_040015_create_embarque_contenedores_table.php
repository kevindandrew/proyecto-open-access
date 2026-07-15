<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('embarque_contenedores', function (Blueprint $table) {
            $table->id('id_item');
            $table->foreignId('id_embarque')->constrained(table: 'embarques', column: 'id_embarque')->cascadeOnDelete();
            $table->string('tipo_contenedor', 10)->nullable();
            $table->string('numero_contenedor', 20)->nullable();
            $table->string('numero_sello', 20)->nullable();
            $table->decimal('peso_kg', 12, 2)->nullable();
            $table->decimal('volumen_cbm', 12, 3)->nullable();
            $table->text('descripcion_mercancia')->nullable();
            $table->date('fecha_devolucion')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('embarque_contenedores');
    }
};
