<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documentos_cliente', function (Blueprint $table) {
            $table->id('id_documento');
            $table->foreignId('id_cliente')->constrained(table: 'clientes', column: 'id_cliente')->cascadeOnDelete();
            $table->string('tipo_documento', 50);
            $table->text('frente_url')->nullable();
            $table->text('dorso_url')->nullable();
            $table->timestamps();
        });

        DB::table('clientes')
            ->whereNotNull('tipo_documento')
            ->get(['id_cliente', 'tipo_documento', 'documento_frente_url', 'documento_dorso_url'])
            ->each(function ($cliente) {
                DB::table('documentos_cliente')->insert([
                    'id_cliente' => $cliente->id_cliente,
                    'tipo_documento' => $cliente->tipo_documento,
                    'frente_url' => $cliente->documento_frente_url,
                    'dorso_url' => $cliente->documento_dorso_url,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            });

        DB::statement('ALTER TABLE clientes DROP CONSTRAINT IF EXISTS clientes_tipo_documento_check');

        Schema::table('clientes', function (Blueprint $table) {
            $table->dropColumn(['tipo_documento', 'documento_frente_url', 'documento_dorso_url']);
        });
    }

    public function down(): void
    {
        Schema::table('clientes', function (Blueprint $table) {
            $table->string('tipo_documento', 5)->nullable()->after('nit');
            $table->text('documento_frente_url')->nullable()->after('tipo_documento');
            $table->text('documento_dorso_url')->nullable()->after('documento_frente_url');
        });

        DB::statement("ALTER TABLE clientes ADD CONSTRAINT clientes_tipo_documento_check CHECK (tipo_documento IN ('CI','NIT') OR tipo_documento IS NULL)");

        Schema::dropIfExists('documentos_cliente');
    }
};
