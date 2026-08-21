<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documentos_empleado', function (Blueprint $table) {
            $table->id('id_documento');
            $table->foreignId('id_empleado')->constrained(table: 'empleados', column: 'id_empleado')->cascadeOnDelete();
            $table->string('tipo_documento', 50);
            $table->text('frente_url')->nullable();
            $table->text('dorso_url')->nullable();
            $table->timestamps();
        });

        DB::table('empleados')
            ->whereNotNull('tipo_documento')
            ->get(['id_empleado', 'tipo_documento', 'documento_frente_url', 'documento_dorso_url'])
            ->each(function ($empleado) {
                DB::table('documentos_empleado')->insert([
                    'id_empleado' => $empleado->id_empleado,
                    'tipo_documento' => $empleado->tipo_documento,
                    'frente_url' => $empleado->documento_frente_url,
                    'dorso_url' => $empleado->documento_dorso_url,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            });

        DB::statement('ALTER TABLE empleados DROP CONSTRAINT IF EXISTS empleados_tipo_documento_check');

        Schema::table('empleados', function (Blueprint $table) {
            $table->dropColumn(['tipo_documento', 'documento_frente_url', 'documento_dorso_url']);
        });
    }

    public function down(): void
    {
        Schema::table('empleados', function (Blueprint $table) {
            $table->string('tipo_documento', 5)->nullable()->after('ci');
            $table->text('documento_frente_url')->nullable()->after('tipo_documento');
            $table->text('documento_dorso_url')->nullable()->after('documento_frente_url');
        });

        DB::statement("ALTER TABLE empleados ADD CONSTRAINT empleados_tipo_documento_check CHECK (tipo_documento IN ('CI','NIT') OR tipo_documento IS NULL)");

        Schema::dropIfExists('documentos_empleado');
    }
};
