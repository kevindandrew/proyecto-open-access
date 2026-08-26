<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('house_bl', function (Blueprint $table) {
            $table->foreignId('id_cliente')
                ->nullable()
                ->after('id_embarque')
                ->constrained('clientes', 'id_cliente')
                ->nullOnDelete();
            // Se llena la primera vez que se genera el HBL Original — a partir
            // de ahí, el house queda protegido de ediciones accidentales para
            // cualquier rol que no sea Gerente Operativo.
            $table->timestamp('congelado_en')->nullable()->after('fecha_emision');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('house_bl', function (Blueprint $table) {
            $table->dropConstrainedForeignId('id_cliente');
            $table->dropColumn('congelado_en');
        });
    }
};
