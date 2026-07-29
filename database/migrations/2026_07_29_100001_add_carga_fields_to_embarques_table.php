<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('embarques', function (Blueprint $table) {
            $table->string('tipo_servicio', 5)->nullable()->after('modo_transporte');
            $table->decimal('peso_kg', 12, 2)->nullable()->after('destino_final');
            $table->decimal('volumen_cbm', 12, 3)->nullable()->after('peso_kg');
        });

        DB::statement("ALTER TABLE embarques ADD CONSTRAINT embarques_tipo_servicio_check CHECK (tipo_servicio IN ('FCL','LCL') OR tipo_servicio IS NULL)");
    }

    public function down(): void
    {
        Schema::table('embarques', function (Blueprint $table) {
            $table->dropColumn(['tipo_servicio', 'peso_kg', 'volumen_cbm']);
        });
    }
};
