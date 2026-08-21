<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('house_bl_contenedor', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_hbl')->constrained(table: 'house_bl', column: 'id_hbl')->cascadeOnDelete();
            $table->foreignId('id_item')->constrained(table: 'embarque_contenedores', column: 'id_item')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['id_hbl', 'id_item']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('house_bl_contenedor');
    }
};
