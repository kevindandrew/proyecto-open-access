<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cotizaciones', function (Blueprint $table) {
            $table->id('id_cotizacion');
            $table->string('numero_referencia', 30)->unique();
            $table->foreignId('id_cliente')->constrained(table: 'clientes', column: 'id_cliente');
            $table->foreignId('id_comercial')->constrained(table: 'empleados', column: 'id_empleado');
            $table->string('modo_transporte', 15);
            $table->string('tipo_servicio', 10)->nullable();
            $table->string('incoterm', 10)->nullable();
            $table->string('id_pol', 10)->nullable();
            $table->foreign('id_pol')->references('codigo')->on('puertos_aeropuertos');
            $table->string('id_pod', 10)->nullable();
            $table->foreign('id_pod')->references('codigo')->on('puertos_aeropuertos');
            $table->string('destino_final', 150)->nullable();
            $table->date('fecha_emision')->default(DB::raw('CURRENT_DATE'));
            $table->date('fecha_validez');
            $table->string('estado', 20)->default('Cotizado');
            $table->decimal('peso_kg', 12, 2)->nullable();
            $table->decimal('volumen_cbm', 12, 3)->nullable();
            $table->boolean('mercancia_peligrosa')->default(false);
            $table->integer('dias_transito')->nullable();
            $table->timestamps();
        });

        DB::statement("ALTER TABLE cotizaciones ADD CONSTRAINT cotizaciones_modo_transporte_check CHECK (modo_transporte IN ('Maritimo','Aereo','Terrestre'))");
        DB::statement("ALTER TABLE cotizaciones ADD CONSTRAINT cotizaciones_tipo_servicio_check CHECK (tipo_servicio IN ('FCL','LCL') OR tipo_servicio IS NULL)");
        DB::statement("ALTER TABLE cotizaciones ADD CONSTRAINT cotizaciones_estado_check CHECK (estado IN ('Cotizado','Aceptado','Rechazado','Vencido'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('cotizaciones');
    }
};
