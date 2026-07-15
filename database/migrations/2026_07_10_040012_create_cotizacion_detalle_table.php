<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cotizacion_detalle', function (Blueprint $table) {
            $table->id('id_detalle');
            $table->foreignId('id_cotizacion')->constrained(table: 'cotizaciones', column: 'id_cotizacion')->cascadeOnDelete();
            $table->integer('nro_item')->nullable();
            $table->string('descripcion', 200);
            $table->string('tipo_tarifa_unidad', 50)->nullable();
            $table->decimal('costo_unitario', 12, 2)->nullable();
            $table->decimal('base_calculo', 12, 3)->default(1);
            $table->string('moneda', 5)->default('USD');
            $table->decimal('costo_total', 12, 2)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cotizacion_detalle');
    }
};
