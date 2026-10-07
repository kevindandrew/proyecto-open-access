<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('house_bl', function (Blueprint $table) {
            // El consignee de un house se elige entre el cliente del embarque y
            // los consignatarios registrados de ese cliente.
            $table->foreignId('id_consignatario')->nullable()->after('id_cliente')
                ->constrained(table: 'cliente_consignatarios', column: 'id_consignatario')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('house_bl', function (Blueprint $table) {
            $table->dropConstrainedForeignId('id_consignatario');
        });
    }
};
