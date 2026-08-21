<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documentos_proveedor', function (Blueprint $table) {
            $table->id('id_documento');
            $table->foreignId('id_proveedor')->constrained(table: 'proveedores', column: 'id_proveedor')->cascadeOnDelete();
            $table->string('tipo_documento', 50);
            $table->text('frente_url')->nullable();
            $table->text('dorso_url')->nullable();
            $table->timestamps();
        });

        DB::table('proveedores')
            ->whereNotNull('documento_nit_url')
            ->get(['id_proveedor', 'documento_nit_url'])
            ->each(function ($proveedor) {
                DB::table('documentos_proveedor')->insert([
                    'id_proveedor' => $proveedor->id_proveedor,
                    'tipo_documento' => 'NIT',
                    'frente_url' => $proveedor->documento_nit_url,
                    'dorso_url' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            });

        Schema::table('proveedores', function (Blueprint $table) {
            $table->dropColumn('documento_nit_url');
        });
    }

    public function down(): void
    {
        Schema::table('proveedores', function (Blueprint $table) {
            $table->text('documento_nit_url')->nullable()->after('nit');
        });

        Schema::dropIfExists('documentos_proveedor');
    }
};
