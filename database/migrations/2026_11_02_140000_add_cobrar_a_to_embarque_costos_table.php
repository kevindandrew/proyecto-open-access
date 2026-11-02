<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('embarque_costos', function (Blueprint $table) {
            // A quién se le cobra la venta de este concepto: el cliente del
            // embarque o uno de sus consignatarios (vacío = el cliente).
            $table->foreignId('id_cliente_cobro')->nullable()->after('id_proveedor')
                ->constrained(table: 'clientes', column: 'id_cliente')->nullOnDelete();
            $table->foreignId('id_consignatario_cobro')->nullable()->after('id_cliente_cobro')
                ->constrained(table: 'cliente_consignatarios', column: 'id_consignatario')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('embarque_costos', function (Blueprint $table) {
            $table->dropConstrainedForeignId('id_consignatario_cobro');
            $table->dropConstrainedForeignId('id_cliente_cobro');
        });
    }
};
