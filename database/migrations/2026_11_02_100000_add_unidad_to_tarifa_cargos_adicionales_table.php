<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tarifa_cargos_adicionales', function (Blueprint $table) {
            // Cómo se cobra el cargo al cotizar: monto fijo (Flat) o
            // multiplicado por contenedor, por m³ (LCL) o por kg (Aéreo).
            // Mismos valores que tipo_tarifa_unidad del detalle de cotización.
            $table->string('unidad', 20)->default('Flat')->after('moneda');
        });

        DB::statement("ALTER TABLE tarifa_cargos_adicionales ADD CONSTRAINT tarifa_cargos_adicionales_unidad_check CHECK (unidad IN ('Flat','Per Container','Per CBM','Per Kg'))");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE tarifa_cargos_adicionales DROP CONSTRAINT tarifa_cargos_adicionales_unidad_check');

        Schema::table('tarifa_cargos_adicionales', function (Blueprint $table) {
            $table->dropColumn('unidad');
        });
    }
};
