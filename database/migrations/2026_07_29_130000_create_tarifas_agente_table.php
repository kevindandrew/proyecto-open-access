<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tarifas_agente', function (Blueprint $table) {
            $table->id('id_tarifa_agente');
            $table->foreignId('id_proveedor')->constrained(table: 'proveedores', column: 'id_proveedor');
            $table->string('id_origen', 10)->nullable();
            $table->foreign('id_origen')->references('codigo')->on('puertos_aeropuertos');
            $table->string('id_destino', 10)->nullable();
            $table->foreign('id_destino')->references('codigo')->on('puertos_aeropuertos');
            $table->string('modo', 15);
            $table->text('observaciones')->nullable();
            $table->date('fecha_inicio_vigencia');
            $table->date('fecha_fin_vigencia');
            $table->timestamps();
        });

        DB::statement("ALTER TABLE tarifas_agente ADD CONSTRAINT tarifas_agente_modo_check CHECK (modo IN ('Maritimo','Aereo','Terrestre'))");

        Schema::create('tarifa_agente_costos', function (Blueprint $table) {
            $table->id('id_costo');
            $table->foreignId('id_tarifa_agente')->constrained(table: 'tarifas_agente', column: 'id_tarifa_agente')->cascadeOnDelete();
            $table->string('concepto', 100);
            $table->decimal('costo', 12, 2);
            $table->string('moneda', 5)->default('USD');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tarifa_agente_costos');
        Schema::dropIfExists('tarifas_agente');
    }
};
