<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Pedidos de "olvidé mi contraseña": en lugar de mandar un correo, le
        // llegan a Gerente Operativo, que genera una contraseña nueva.
        Schema::create('solicitudes_restablecimiento', function (Blueprint $table) {
            $table->id('id_solicitud');
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('ip', 45)->nullable();
            $table->string('estado', 20)->default('Pendiente');
            $table->foreignId('id_empleado_atendio')->nullable()
                ->constrained(table: 'empleados', column: 'id_empleado')->nullOnDelete();
            $table->timestamp('atendida_en')->nullable();
            $table->timestamps();
        });

        DB::statement("ALTER TABLE solicitudes_restablecimiento ADD CONSTRAINT solicitudes_restablecimiento_estado_check CHECK (estado IN ('Pendiente','Atendida','Descartada'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('solicitudes_restablecimiento');
    }
};
