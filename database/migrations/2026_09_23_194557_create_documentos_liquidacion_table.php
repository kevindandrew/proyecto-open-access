<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documentos_liquidacion', function (Blueprint $table) {
            $table->id('id_documento');
            $table->foreignId('id_embarque')->constrained(table: 'embarques', column: 'id_embarque')->cascadeOnDelete();
            $table->string('tipo', 30);
            $table->string('numero', 30)->unique();
            $table->foreignId('id_cliente')->nullable()->constrained(table: 'clientes', column: 'id_cliente')->nullOnDelete();
            $table->foreignId('id_proveedor')->nullable()->constrained(table: 'proveedores', column: 'id_proveedor')->nullOnDelete();
            $table->string('moneda', 5);
            $table->decimal('monto', 12, 2);
            $table->string('condicion_pago', 20)->nullable();
            $table->decimal('tipo_cambio', 8, 4)->nullable();
            $table->date('fecha');
            $table->text('observaciones')->nullable();
            $table->foreignId('id_empleado_generador')->nullable()->constrained(table: 'empleados', column: 'id_empleado')->nullOnDelete();
            $table->timestamps();
        });

        DB::statement("ALTER TABLE documentos_liquidacion ADD CONSTRAINT documentos_liquidacion_tipo_check CHECK (tipo IN ('nota_reembolso','nota_cobranza','nota_interna','invoice','nota_descuento','orden_pago','orden_pago_provisional','orden_pago_cf','orden_pago_negativa'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('documentos_liquidacion');
    }
};
