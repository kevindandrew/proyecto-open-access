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
            // Lo que va en la columna "Freight & Charges" (Prepaid o
            // Collect, según condicion_pago) del HBL — texto libre porque a
            // veces es "AS AGREED" y a veces un monto.
            $table->string('flete_valor_texto', 50)->nullable()->after('condicion_pago');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('house_bl', function (Blueprint $table) {
            $table->dropColumn('flete_valor_texto');
        });
    }
};
