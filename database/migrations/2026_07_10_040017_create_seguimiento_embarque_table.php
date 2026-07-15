<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seguimiento_embarque', function (Blueprint $table) {
            $table->id('id_seguimiento');
            $table->foreignId('id_embarque')->constrained(table: 'embarques', column: 'id_embarque')->cascadeOnDelete();
            $table->timestamp('fecha')->useCurrent();
            $table->string('estado', 30);
            $table->text('comentario')->nullable();
            $table->foreignId('id_empleado_responsable')->nullable()->constrained(table: 'empleados', column: 'id_empleado');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seguimiento_embarque');
    }
};
