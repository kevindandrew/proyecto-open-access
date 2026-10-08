<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // El % de comisión del comercial depende de su categoría de vendedor.
        Schema::create('categorias_comision', function (Blueprint $table) {
            $table->id('id_categoria');
            $table->string('nombre', 50);
            $table->decimal('porcentaje', 5, 2);
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        Schema::table('empleados', function (Blueprint $table) {
            $table->foreignId('id_categoria_comision')->nullable()->after('id_rol')
                ->constrained(table: 'categorias_comision', column: 'id_categoria')->nullOnDelete();
        });

        Schema::table('embarques', function (Blueprint $table) {
            // Ajuste manual del % de comisión para este file (null = el de la
            // categoría del comercial).
            $table->decimal('porcentaje_comision', 5, 2)->nullable()->after('liquidacion_cerrada_en');
        });

        Schema::table('documentos_liquidacion', function (Blueprint $table) {
            // Cuando el documento se emite en otra moneda (ej. Factura en Bs de
            // un cobro en USD), el monto antes de convertir — el Resultado de
            // Operación suma en la moneda de origen.
            $table->string('moneda_origen', 5)->nullable()->after('monto');
            $table->decimal('monto_origen', 12, 2)->nullable()->after('moneda_origen');
        });
    }

    public function down(): void
    {
        Schema::table('documentos_liquidacion', function (Blueprint $table) {
            $table->dropColumn(['moneda_origen', 'monto_origen']);
        });

        Schema::table('embarques', function (Blueprint $table) {
            $table->dropColumn('porcentaje_comision');
        });

        Schema::table('empleados', function (Blueprint $table) {
            $table->dropConstrainedForeignId('id_categoria_comision');
        });

        Schema::dropIfExists('categorias_comision');
    }
};
