<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tarifas', function (Blueprint $table) {
            $table->text('observaciones')->nullable()->after('tipo_tarifa');
            $table->decimal('costo_tramite', 12, 2)->nullable()->after('costo_base');
            $table->string('moneda_tramite', 5)->nullable()->after('costo_tramite');
        });
    }

    public function down(): void
    {
        Schema::table('tarifas', function (Blueprint $table) {
            $table->dropColumn(['observaciones', 'costo_tramite', 'moneda_tramite']);
        });
    }
};
