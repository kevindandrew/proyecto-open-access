<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cotizaciones', function (Blueprint $table) {
            $table->string('tipo_embarque', 10)->nullable()->after('modo_transporte');
            $table->foreignId('id_agente_origen')->nullable()->after('tipo_embarque')
                ->constrained(table: 'proveedores', column: 'id_proveedor')->nullOnDelete();
            $table->foreignId('id_naviera_aerolinea')->nullable()->after('id_agente_origen')
                ->constrained(table: 'proveedores', column: 'id_proveedor')->nullOnDelete();
        });

        DB::statement("ALTER TABLE cotizaciones ADD CONSTRAINT cotizaciones_tipo_embarque_check CHECK (tipo_embarque IN ('IMPO','EXPO','DOM'))");
    }

    public function down(): void
    {
        Schema::table('cotizaciones', function (Blueprint $table) {
            $table->dropConstrainedForeignId('id_naviera_aerolinea');
            $table->dropConstrainedForeignId('id_agente_origen');
            $table->dropColumn('tipo_embarque');
        });
    }
};
