<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('puertos_aeropuertos', function (Blueprint $table) {
            $table->string('codigo', 10)->primary();
            $table->string('nombre', 150);
            $table->string('tipo', 15);
            $table->string('pais', 60)->nullable();
            $table->timestamps();
        });

        DB::statement("ALTER TABLE puertos_aeropuertos ADD CONSTRAINT puertos_aeropuertos_tipo_check CHECK (tipo IN ('Puerto','Aeropuerto','Frontera'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('puertos_aeropuertos');
    }
};
