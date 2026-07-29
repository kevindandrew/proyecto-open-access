<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('embarques', function (Blueprint $table) {
            $table->integer('nro_piezas')->nullable()->after('volumen_cbm');
            $table->string('unidad_piezas', 20)->nullable()->after('nro_piezas');
            $table->decimal('peso_bruto', 12, 2)->nullable()->after('unidad_piezas');
            $table->decimal('peso_cobrable', 12, 2)->nullable()->after('peso_bruto');
            $table->text('naturaleza_mercancia')->nullable()->after('peso_cobrable');
        });
    }

    public function down(): void
    {
        Schema::table('embarques', function (Blueprint $table) {
            $table->dropColumn([
                'nro_piezas',
                'unidad_piezas',
                'peso_bruto',
                'peso_cobrable',
                'naturaleza_mercancia',
            ]);
        });
    }
};
