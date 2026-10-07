<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documento_liquidacion_lineas', function (Blueprint $table) {
            // Las notas de cobro llevan Cant × Unitario = Total por línea.
            $table->decimal('cantidad', 10, 2)->default(1)->after('fecha_documento');
            $table->decimal('precio_unitario', 12, 2)->nullable()->after('cantidad');
        });

        Schema::table('documentos_liquidacion', function (Blueprint $table) {
            $table->text('destinatario_direccion')->nullable()->after('destinatario_nit');
            // Texto libre ("Al Contado", "20 días"...).
            $table->string('condicion_pago', 50)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('documento_liquidacion_lineas', function (Blueprint $table) {
            $table->dropColumn(['cantidad', 'precio_unitario']);
        });

        Schema::table('documentos_liquidacion', function (Blueprint $table) {
            $table->dropColumn('destinatario_direccion');
            $table->string('condicion_pago', 20)->nullable()->change();
        });
    }
};
