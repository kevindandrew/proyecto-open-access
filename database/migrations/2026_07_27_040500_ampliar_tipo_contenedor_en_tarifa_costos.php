<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tarifa_costos', function (Blueprint $table) {
            $table->string('tipo_contenedor', 50)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('tarifa_costos', function (Blueprint $table) {
            $table->string('tipo_contenedor', 20)->nullable()->change();
        });
    }
};
