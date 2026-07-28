<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cotizacion_contenedores', function (Blueprint $table) {
            $table->string('tipo_contenedor', 50)->change();
        });
    }

    public function down(): void
    {
        Schema::table('cotizacion_contenedores', function (Blueprint $table) {
            $table->string('tipo_contenedor', 10)->change();
        });
    }
};
