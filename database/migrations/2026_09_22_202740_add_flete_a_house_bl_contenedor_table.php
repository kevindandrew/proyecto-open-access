<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('house_bl_contenedor', function (Blueprint $table) {
            // Cada contenedor de un house puede tener su propia condición de
            // pago y monto de flete, distinta al resto — si queda en null, se
            // usa el dato general del house como valor por defecto (mismo
            // criterio que peso_kg/volumen_cbm/descripcion_mercancia).
            $table->string('condicion_pago', 15)->nullable();
            $table->string('flete_valor_texto', 50)->nullable();
        });

        DB::statement("ALTER TABLE house_bl_contenedor ADD CONSTRAINT house_bl_contenedor_condicion_pago_check CHECK (condicion_pago IN ('Prepaid','Collect') OR condicion_pago IS NULL)");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE house_bl_contenedor DROP CONSTRAINT IF EXISTS house_bl_contenedor_condicion_pago_check');

        Schema::table('house_bl_contenedor', function (Blueprint $table) {
            $table->dropColumn(['condicion_pago', 'flete_valor_texto']);
        });
    }
};
