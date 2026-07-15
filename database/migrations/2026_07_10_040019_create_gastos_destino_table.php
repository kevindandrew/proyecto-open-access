<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gastos_destino', function (Blueprint $table) {
            $table->id('id_gasto');
            $table->foreignId('id_embarque')->constrained(table: 'embarques', column: 'id_embarque')->cascadeOnDelete();
            $table->string('concepto', 20);
            $table->decimal('monto', 12, 2);
            $table->string('moneda', 5)->default('USD');
            $table->boolean('pagado')->default(false);
            $table->date('fecha_pago')->nullable();
            $table->timestamps();
        });

        DB::statement("ALTER TABLE gastos_destino ADD CONSTRAINT gastos_destino_concepto_check CHECK (concepto IN ('Arancel','Impuesto','Tasa','Otro'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('gastos_destino');
    }
};
