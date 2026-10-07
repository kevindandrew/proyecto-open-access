<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documentos_liquidacion', function (Blueprint $table) {
            // N° de la factura emitida en el sistema de facturación externo —
            // la Factura solo se registra acá, no se genera.
            $table->string('numero_factura', 50)->nullable()->after('numero');
        });

        DB::statement('ALTER TABLE documentos_liquidacion DROP CONSTRAINT documentos_liquidacion_tipo_check');
        DB::statement("ALTER TABLE documentos_liquidacion ADD CONSTRAINT documentos_liquidacion_tipo_check CHECK (tipo IN ('nota_reembolso','nota_cobranza','nota_interna','invoice','nota_descuento','factura','orden_pago','orden_pago_provisional','orden_pago_cf','orden_pago_negativa'))");
    }

    public function down(): void
    {
        DB::statement("DELETE FROM documentos_liquidacion WHERE tipo = 'factura'");
        DB::statement('ALTER TABLE documentos_liquidacion DROP CONSTRAINT documentos_liquidacion_tipo_check');
        DB::statement("ALTER TABLE documentos_liquidacion ADD CONSTRAINT documentos_liquidacion_tipo_check CHECK (tipo IN ('nota_reembolso','nota_cobranza','nota_interna','invoice','nota_descuento','orden_pago','orden_pago_provisional','orden_pago_cf','orden_pago_negativa'))");

        Schema::table('documentos_liquidacion', function (Blueprint $table) {
            $table->dropColumn('numero_factura');
        });
    }
};
