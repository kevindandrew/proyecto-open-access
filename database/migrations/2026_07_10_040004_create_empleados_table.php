<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('empleados', function (Blueprint $table) {
            $table->id('id_empleado');
            $table->string('nombre_completo', 150);
            $table->string('ci', 20)->nullable();
            $table->string('telefono', 30)->nullable();
            $table->string('email', 120)->nullable();
            $table->foreignId('id_rol')->constrained(table: 'roles_empleado', column: 'id_rol');
            $table->string('especialidad_operativa', 20)->nullable();
            $table->foreignId('id_jefe')->nullable()->constrained(table: 'empleados', column: 'id_empleado');
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        DB::statement("ALTER TABLE empleados ADD CONSTRAINT empleados_especialidad_operativa_check CHECK (especialidad_operativa IN ('Maritimo','Aereo','Terrestre') OR especialidad_operativa IS NULL)");
    }

    public function down(): void
    {
        Schema::dropIfExists('empleados');
    }
};
