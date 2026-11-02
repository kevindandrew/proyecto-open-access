<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('embarques', function (Blueprint $table) {
            // El Nro. de File lo asigna Gerente Operativo a mano según la fecha
            // de arribo; hasta entonces el embarque se identifica por la
            // cotización. Sigue siendo único (Postgres permite varios NULL).
            $table->string('numero_file', 30)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('embarques', function (Blueprint $table) {
            $table->string('numero_file', 30)->nullable(false)->change();
        });
    }
};
