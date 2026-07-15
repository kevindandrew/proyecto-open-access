<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documentos_embarque', function (Blueprint $table) {
            $table->id('id_documento');
            $table->foreignId('id_embarque')->constrained(table: 'embarques', column: 'id_embarque')->cascadeOnDelete();
            $table->string('tipo_documento', 50);
            $table->string('numero_documento', 50)->nullable();
            $table->date('fecha_emision')->nullable();
            $table->text('archivo_url')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documentos_embarque');
    }
};
