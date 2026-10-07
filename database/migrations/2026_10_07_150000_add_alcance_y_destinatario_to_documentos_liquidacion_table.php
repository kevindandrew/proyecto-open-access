<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documentos_liquidacion', function (Blueprint $table) {
            // Notas de cobro emitidas por house (null = por MBL / todo el embarque).
            $table->foreignId('id_hbl')->nullable()->after('id_embarque')
                ->constrained(table: 'house_bl', column: 'id_hbl')->nullOnDelete();
            // A quién se emitió (cliente o consignatario), congelado al generar.
            $table->string('destinatario_nombre', 200)->nullable()->after('id_proveedor');
            $table->string('destinatario_nit', 30)->nullable()->after('destinatario_nombre');
        });
    }

    public function down(): void
    {
        Schema::table('documentos_liquidacion', function (Blueprint $table) {
            $table->dropConstrainedForeignId('id_hbl');
            $table->dropColumn(['destinatario_nombre', 'destinatario_nit']);
        });
    }
};
