<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('embarques', function (Blueprint $table) {
            $table->foreignId('id_consignatario')
                ->nullable()
                ->after('id_cliente')
                ->constrained(table: 'cliente_consignatarios', column: 'id_consignatario')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('embarques', function (Blueprint $table) {
            $table->dropConstrainedForeignId('id_consignatario');
        });
    }
};
