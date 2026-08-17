<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clientes', function (Blueprint $table) {
            $table->string('tipo_documento', 5)->nullable()->after('nit');
            $table->text('documento_frente_url')->nullable()->after('tipo_documento');
            $table->text('documento_dorso_url')->nullable()->after('documento_frente_url');
        });

        DB::statement("ALTER TABLE clientes ADD CONSTRAINT clientes_tipo_documento_check CHECK (tipo_documento IN ('CI','NIT') OR tipo_documento IS NULL)");
    }

    public function down(): void
    {
        Schema::table('clientes', function (Blueprint $table) {
            $table->dropColumn(['tipo_documento', 'documento_frente_url', 'documento_dorso_url']);
        });
    }
};
