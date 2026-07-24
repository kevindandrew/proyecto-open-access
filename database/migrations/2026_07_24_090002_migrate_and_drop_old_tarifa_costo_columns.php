<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $tarifas = DB::table('tarifas')->get();

        foreach ($tarifas as $tarifa) {
            $filas = [];

            if ($tarifa->tipo_servicio === 'FCL') {
                $porContenedor = [
                    '20 DRY' => $tarifa->costo_20,
                    '40 DRY' => $tarifa->costo_40,
                    '40 HC' => $tarifa->costo_40hc,
                ];

                foreach ($porContenedor as $tipoContenedor => $costo) {
                    if ($costo !== null) {
                        $filas[] = [
                            'id_tarifa' => $tarifa->id_tarifa,
                            'tipo_servicio' => 'FCL',
                            'tipo_contenedor' => $tipoContenedor,
                            'costo' => $costo,
                            'moneda' => $tarifa->moneda,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                    }
                }
            } elseif ($tarifa->tipo_servicio === 'LCL' && $tarifa->costo_cbm !== null) {
                $filas[] = [
                    'id_tarifa' => $tarifa->id_tarifa,
                    'tipo_servicio' => 'LCL',
                    'tipo_contenedor' => null,
                    'costo' => $tarifa->costo_cbm,
                    'moneda' => $tarifa->moneda,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            } elseif ($tarifa->modo === 'Terrestre' && $tarifa->costo_base !== null) {
                // El antiguo modelo terrestre era una tarifa plana por viaje;
                // se preserva como una única línea LCL para no perder el dato.
                $filas[] = [
                    'id_tarifa' => $tarifa->id_tarifa,
                    'tipo_servicio' => 'LCL',
                    'tipo_contenedor' => null,
                    'costo' => $tarifa->costo_base,
                    'moneda' => $tarifa->moneda,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            if ($filas !== []) {
                DB::table('tarifa_costos')->insert($filas);
            }
        }

        // El campo tipo_servicio ahora puede ser un resumen compuesto ("FCL,LCL").
        DB::statement('ALTER TABLE tarifas DROP CONSTRAINT IF EXISTS tarifas_tipo_servicio_check');
        DB::statement("ALTER TABLE tarifas ADD CONSTRAINT tarifas_tipo_servicio_check CHECK (tipo_servicio IN ('FCL','LCL','FCL,LCL') OR tipo_servicio IS NULL)");

        Schema::table('tarifas', function (Blueprint $table) {
            $table->dropColumn(['costo_20', 'costo_40', 'costo_40hc', 'costo_cbm']);
        });

        // costo_base ahora es exclusivo del modo Aereo (tarifa por kilo).
        DB::table('tarifas')->where('modo', 'Terrestre')->update(['costo_base' => null]);
    }

    public function down(): void
    {
        Schema::table('tarifas', function (Blueprint $table) {
            $table->decimal('costo_20', 12, 2)->nullable();
            $table->decimal('costo_40', 12, 2)->nullable();
            $table->decimal('costo_40hc', 12, 2)->nullable();
            $table->decimal('costo_cbm', 12, 2)->nullable();
        });

        DB::statement('ALTER TABLE tarifas DROP CONSTRAINT IF EXISTS tarifas_tipo_servicio_check');
        DB::statement("ALTER TABLE tarifas ADD CONSTRAINT tarifas_tipo_servicio_check CHECK (tipo_servicio IN ('FCL','LCL') OR tipo_servicio IS NULL)");
    }
};
