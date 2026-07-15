<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tarifas', function (Blueprint $table) {
            $table->id('id_tarifa');
            $table->foreignId('id_proveedor')->constrained(table: 'proveedores', column: 'id_proveedor');
            $table->string('id_origen', 10)->nullable();
            $table->foreign('id_origen')->references('codigo')->on('puertos_aeropuertos');
            $table->string('id_destino', 10)->nullable();
            $table->foreign('id_destino')->references('codigo')->on('puertos_aeropuertos');
            $table->string('modo', 15);
            $table->string('tipo_servicio', 10)->nullable();
            $table->decimal('costo_20', 12, 2)->nullable();
            $table->decimal('costo_40', 12, 2)->nullable();
            $table->decimal('costo_40hc', 12, 2)->nullable();
            $table->string('moneda', 5)->default('USD');
            $table->string('tipo_tarifa', 20)->default('Normal');
            $table->date('fecha_inicio_vigencia');
            $table->date('fecha_fin_vigencia');
            $table->timestamps();
        });

        DB::statement("ALTER TABLE tarifas ADD CONSTRAINT tarifas_modo_check CHECK (modo IN ('Maritimo','Aereo','Terrestre'))");
        DB::statement("ALTER TABLE tarifas ADD CONSTRAINT tarifas_tipo_servicio_check CHECK (tipo_servicio IN ('FCL','LCL') OR tipo_servicio IS NULL)");
    }

    public function down(): void
    {
        Schema::dropIfExists('tarifas');
    }
};
