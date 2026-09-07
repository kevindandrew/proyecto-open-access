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
        Schema::table('embarques', function (Blueprint $table) {
            // El Shipper (embarcador) del House Bill of Lading es el
            // exportador de origen — una persona/empresa distinta del
            // Cliente (que en este sistema es siempre el consignatario en
            // Bolivia). No existía ningún campo para esto todavía.
            $table->string('shipper_nombre', 200)->nullable()->after('consignatario_correo');
            $table->text('shipper_direccion')->nullable()->after('shipper_nombre');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('embarques', function (Blueprint $table) {
            $table->dropColumn(['shipper_nombre', 'shipper_direccion']);
        });
    }
};
