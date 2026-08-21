<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // El tipo de cambio BOB/USD ya no es fijo (era ~6.96 antes de que el
    // Boliviano pasara a flotar) — se usa solo como referencia puntual para
    // migrar los pocos registros viejos que quedaron cargados en BOB antes de
    // que la comisión se forzara a ser siempre en USD.
    private const TASA_REFERENCIA_BOB_USD = 6.96;

    public function up(): void
    {
        Schema::table('cotizacion_detalle', function (Blueprint $table) {
            $table->decimal('comision_openaccess', 12, 2)->default(0)->after('costo_total');
        });

        DB::table('cotizaciones')
            ->where('comision_openaccess', '>', 0)
            ->orderBy('id_cotizacion')
            ->get()
            ->each(function ($cotizacion) {
                $comision = (float) $cotizacion->comision_openaccess;

                if ($cotizacion->comision_moneda === 'BOB') {
                    $comision = round($comision / self::TASA_REFERENCIA_BOB_USD, 2);
                }

                $linea = DB::table('cotizacion_detalle')
                    ->where('id_cotizacion', $cotizacion->id_cotizacion)
                    ->where('descripcion', 'like', 'Flete%')
                    ->orderBy('nro_item')
                    ->first();

                $linea ??= DB::table('cotizacion_detalle')
                    ->where('id_cotizacion', $cotizacion->id_cotizacion)
                    ->orderByDesc('nro_item')
                    ->first();

                if ($linea) {
                    DB::table('cotizacion_detalle')
                        ->where('id_detalle', $linea->id_detalle)
                        ->update(['comision_openaccess' => $comision]);
                }
            });

        Schema::table('cotizaciones', function (Blueprint $table) {
            $table->dropColumn(['comision_openaccess', 'comision_moneda']);
        });
    }

    public function down(): void
    {
        Schema::table('cotizaciones', function (Blueprint $table) {
            $table->decimal('comision_openaccess', 12, 2)->default(0)->after('dias_transito');
            $table->string('comision_moneda', 5)->default('USD')->after('comision_openaccess');
        });

        Schema::table('cotizacion_detalle', function (Blueprint $table) {
            $table->dropColumn('comision_openaccess');
        });
    }
};
