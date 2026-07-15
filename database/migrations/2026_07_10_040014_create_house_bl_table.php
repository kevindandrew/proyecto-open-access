<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('house_bl', function (Blueprint $table) {
            $table->id('id_hbl');
            $table->foreignId('id_embarque')->constrained(table: 'embarques', column: 'id_embarque')->cascadeOnDelete();
            $table->string('numero_hbl', 50);
            $table->string('condicion_pago', 15)->nullable();
            $table->date('fecha_emision')->nullable();
            $table->timestamps();
        });

        DB::statement("ALTER TABLE house_bl ADD CONSTRAINT house_bl_condicion_pago_check CHECK (condicion_pago IN ('Prepaid','Collect') OR condicion_pago IS NULL)");
    }

    public function down(): void
    {
        Schema::dropIfExists('house_bl');
    }
};
