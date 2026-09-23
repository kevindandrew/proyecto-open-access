<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documento_liquidacion_lineas', function (Blueprint $table) {
            $table->id('id_linea');
            $table->foreignId('id_documento')->constrained(table: 'documentos_liquidacion', column: 'id_documento')->cascadeOnDelete();
            $table->string('tipo_origen', 10);
            $table->unsignedBigInteger('id_origen');
            $table->string('descripcion', 200)->nullable();
            $table->decimal('monto', 12, 2);
            $table->string('moneda', 5);
            $table->timestamps();
        });

        DB::statement("ALTER TABLE documento_liquidacion_lineas ADD CONSTRAINT documento_liquidacion_lineas_tipo_origen_check CHECK (tipo_origen IN ('costo','gasto'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('documento_liquidacion_lineas');
    }
};
