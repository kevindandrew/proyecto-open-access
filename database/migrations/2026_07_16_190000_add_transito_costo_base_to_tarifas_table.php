<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tarifas', function (Blueprint $table) {
            $table->unsignedSmallInteger('dias_transito')->nullable()->after('tipo_servicio');
            $table->decimal('costo_base', 12, 2)->nullable()->after('costo_40hc');
        });
    }

    public function down(): void
    {
        Schema::table('tarifas', function (Blueprint $table) {
            $table->dropColumn(['dias_transito', 'costo_base']);
        });
    }
};
