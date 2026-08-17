<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cotizaciones', function (Blueprint $table) {
            $table->foreignId('id_cotizacion_origen')
                ->nullable()
                ->after('id_cotizacion')
                ->constrained('cotizaciones', 'id_cotizacion')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('cotizaciones', function (Blueprint $table) {
            $table->dropConstrainedForeignId('id_cotizacion_origen');
        });
    }
};
