<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tarifa_costos', function (Blueprint $table) {
            $table->id('id_costo');
            $table->foreignId('id_tarifa')->constrained(table: 'tarifas', column: 'id_tarifa')->cascadeOnDelete();
            $table->string('tipo_servicio', 10);
            $table->string('tipo_contenedor', 20)->nullable();
            $table->decimal('costo', 12, 2);
            $table->string('moneda', 5)->default('USD');
            $table->timestamps();
        });

        DB::statement("ALTER TABLE tarifa_costos ADD CONSTRAINT tarifa_costos_tipo_servicio_check CHECK (tipo_servicio IN ('FCL','LCL'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('tarifa_costos');
    }
};
