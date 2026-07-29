<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('embarques', function (Blueprint $table) {
            $table->boolean('sobrefacturado')->default(false)->after('volumen_cbm');
            $table->decimal('importe_sobrefacturado', 12, 2)->nullable()->after('sobrefacturado');
            $table->boolean('flete_menor')->default(false)->after('importe_sobrefacturado');
            $table->string('porcentaje_reparto', 20)->nullable()->after('flete_menor');
            $table->string('recinto_aduanero', 100)->nullable()->after('porcentaje_reparto');
            $table->string('tramite_aduanero', 100)->nullable()->after('recinto_aduanero');
            $table->string('instruccion_tramite_puerto', 100)->nullable()->after('tramite_aduanero');
            $table->string('pagos_liberacion', 100)->nullable()->after('instruccion_tramite_puerto');
        });
    }

    public function down(): void
    {
        Schema::table('embarques', function (Blueprint $table) {
            $table->dropColumn([
                'sobrefacturado',
                'importe_sobrefacturado',
                'flete_menor',
                'porcentaje_reparto',
                'recinto_aduanero',
                'tramite_aduanero',
                'instruccion_tramite_puerto',
                'pagos_liberacion',
            ]);
        });
    }
};
