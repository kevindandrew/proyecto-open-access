<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documento_liquidacion_lineas', function (Blueprint $table) {
            // Datos del documento del proveedor que respalda la línea
            // (ej. Debit Note RDEKHN26080403 del 27-08-2026) — van en la
            // Orden de Pago.
            $table->string('tipo_documento', 50)->nullable()->after('descripcion');
            $table->string('numero_documento', 50)->nullable()->after('tipo_documento');
            $table->date('fecha_documento')->nullable()->after('numero_documento');
        });
    }

    public function down(): void
    {
        Schema::table('documento_liquidacion_lineas', function (Blueprint $table) {
            $table->dropColumn(['tipo_documento', 'numero_documento', 'fecha_documento']);
        });
    }
};
