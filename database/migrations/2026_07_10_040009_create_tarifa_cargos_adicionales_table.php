<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tarifa_cargos_adicionales', function (Blueprint $table) {
            $table->id('id_cargo');
            $table->foreignId('id_tarifa')->constrained(table: 'tarifas', column: 'id_tarifa')->cascadeOnDelete();
            $table->string('concepto', 100);
            $table->decimal('monto', 12, 2);
            $table->string('moneda', 5)->default('USD');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tarifa_cargos_adicionales');
    }
};
