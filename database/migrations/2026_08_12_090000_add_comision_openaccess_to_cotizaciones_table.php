<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cotizaciones', function (Blueprint $table) {
            $table->decimal('comision_openaccess', 12, 2)->default(0)->after('dias_transito');
            $table->string('comision_moneda', 5)->default('USD')->after('comision_openaccess');
        });
    }

    public function down(): void
    {
        Schema::table('cotizaciones', function (Blueprint $table) {
            $table->dropColumn(['comision_openaccess', 'comision_moneda']);
        });
    }
};
