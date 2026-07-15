<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('embarques', function (Blueprint $table) {
            $table->id('id_embarque');
            $table->string('numero_file', 30)->unique();
            $table->foreignId('id_cotizacion')->nullable()->constrained(table: 'cotizaciones', column: 'id_cotizacion');
            $table->foreignId('id_cliente')->constrained(table: 'clientes', column: 'id_cliente');
            $table->string('consignatario', 200)->nullable();
            $table->foreignId('id_comercial')->nullable()->constrained(table: 'empleados', column: 'id_empleado');
            $table->foreignId('id_operativo')->nullable()->constrained(table: 'empleados', column: 'id_empleado');
            $table->foreignId('id_agente_origen')->nullable()->constrained(table: 'proveedores', column: 'id_proveedor');
            $table->foreignId('id_naviera_aerolinea')->nullable()->constrained(table: 'proveedores', column: 'id_proveedor');
            $table->string('modo_transporte', 15);
            $table->string('tipo_embarque', 10)->nullable();
            $table->string('oficina_venta', 60)->nullable();
            $table->string('oficina_operacional', 60)->nullable();
            $table->string('mbl', 50)->nullable();
            $table->string('id_pol', 10)->nullable();
            $table->foreign('id_pol')->references('codigo')->on('puertos_aeropuertos');
            $table->string('id_pod', 10)->nullable();
            $table->foreign('id_pod')->references('codigo')->on('puertos_aeropuertos');
            $table->string('destino_final', 150)->nullable();
            $table->date('etd')->nullable();
            $table->date('eta')->nullable();
            $table->string('nave', 100)->nullable();
            $table->string('viaje', 30)->nullable();
            $table->string('pago_master', 15)->nullable();
            $table->string('estado_embarque', 30)->default('Confirmado_Origen');
            $table->timestamps();
        });

        DB::statement("ALTER TABLE embarques ADD CONSTRAINT embarques_modo_transporte_check CHECK (modo_transporte IN ('Maritimo','Aereo','Terrestre'))");
        DB::statement("ALTER TABLE embarques ADD CONSTRAINT embarques_tipo_embarque_check CHECK (tipo_embarque IN ('IMPO','EXPO','DOM') OR tipo_embarque IS NULL)");
        DB::statement("ALTER TABLE embarques ADD CONSTRAINT embarques_pago_master_check CHECK (pago_master IN ('Prepaid','Collect') OR pago_master IS NULL)");
        DB::statement("ALTER TABLE embarques ADD CONSTRAINT embarques_estado_embarque_check CHECK (estado_embarque IN ('Confirmado_Origen','En_Transito','En_Aduana_Destino','Entregado','Cerrado'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('embarques');
    }
};
