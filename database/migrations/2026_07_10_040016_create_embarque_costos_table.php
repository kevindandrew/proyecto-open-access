<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('embarque_costos', function (Blueprint $table) {
            $table->id('id_costo');
            $table->foreignId('id_embarque')->constrained(table: 'embarques', column: 'id_embarque')->cascadeOnDelete();
            $table->string('concepto', 100);
            $table->foreignId('id_proveedor')->nullable()->constrained(table: 'proveedores', column: 'id_proveedor');
            $table->decimal('costo_compra', 12, 2);
            $table->decimal('costo_venta', 12, 2);
            $table->string('moneda', 5)->default('USD');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('embarque_costos');
    }
};
