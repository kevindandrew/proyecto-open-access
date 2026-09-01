<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('house_bl_contenedor', function (Blueprint $table) {
            // Cuando un mismo contenedor lo comparten varios houses (ej. un
            // contenedor de 2500 kg dividido entre 2 consignatarios), cada
            // house declara solo la porción que le corresponde — nunca el
            // total del contenedor. Si queda en null, se usa el dato del
            // contenedor completo como valor por defecto.
            $table->decimal('peso_kg', 12, 2)->nullable();
            $table->decimal('volumen_cbm', 12, 3)->nullable();
            $table->text('descripcion_mercancia')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('house_bl_contenedor', function (Blueprint $table) {
            $table->dropColumn(['peso_kg', 'volumen_cbm', 'descripcion_mercancia']);
        });
    }
};
