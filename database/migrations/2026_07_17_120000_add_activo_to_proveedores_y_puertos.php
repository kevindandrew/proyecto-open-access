<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('proveedores', function (Blueprint $table) {
            $table->boolean('activo')->default(true);
        });

        Schema::table('puertos_aeropuertos', function (Blueprint $table) {
            $table->boolean('activo')->default(true);
        });
    }

    public function down(): void
    {
        Schema::table('proveedores', function (Blueprint $table) {
            $table->dropColumn('activo');
        });

        Schema::table('puertos_aeropuertos', function (Blueprint $table) {
            $table->dropColumn('activo');
        });
    }
};
