<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('solicitudes_tarifa', function (Blueprint $table) {
            $table->id('id_solicitud');
            $table->foreignId('id_cliente')->nullable()->constrained('clientes', 'id_cliente')->nullOnDelete();
            $table->foreignId('id_comercial')->nullable()->constrained('empleados', 'id_empleado')->nullOnDelete();
            $table->string('modo_transporte', 20);
            $table->string('tipo_servicio', 10)->nullable();
            $table->string('id_pol', 10)->nullable();
            $table->foreign('id_pol')->references('codigo')->on('puertos_aeropuertos');
            $table->string('id_pod', 10)->nullable();
            $table->foreign('id_pod')->references('codigo')->on('puertos_aeropuertos');
            $table->foreignId('id_cotizacion')->nullable()->constrained('cotizaciones', 'id_cotizacion')->nullOnDelete();
            $table->string('estado', 20)->default('Pendiente');
            $table->timestamps();
        });

        DB::statement("ALTER TABLE solicitudes_tarifa ADD CONSTRAINT solicitudes_tarifa_estado_check CHECK (estado IN ('Pendiente','Atendida'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('solicitudes_tarifa');
    }
};
