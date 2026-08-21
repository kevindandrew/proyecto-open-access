<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('embarques', function (Blueprint $table) {
            $table->string('consignatario_nombre', 200)->nullable()->after('consignatario');
            $table->string('consignatario_nit', 30)->nullable()->after('consignatario_nombre');
            $table->text('consignatario_direccion')->nullable()->after('consignatario_nit');
            $table->string('consignatario_celular', 30)->nullable()->after('consignatario_direccion');
            $table->string('consignatario_correo', 120)->nullable()->after('consignatario_celular');
        });

        DB::table('embarques')
            ->whereNotNull('consignatario')
            ->update(['consignatario_nombre' => DB::raw('consignatario')]);

        Schema::table('embarques', function (Blueprint $table) {
            $table->dropColumn('consignatario');
        });
    }

    public function down(): void
    {
        Schema::table('embarques', function (Blueprint $table) {
            $table->string('consignatario', 200)->nullable()->after('id_cliente');
        });

        DB::table('embarques')
            ->whereNotNull('consignatario_nombre')
            ->update(['consignatario' => DB::raw('consignatario_nombre')]);

        Schema::table('embarques', function (Blueprint $table) {
            $table->dropColumn([
                'consignatario_nombre',
                'consignatario_nit',
                'consignatario_direccion',
                'consignatario_celular',
                'consignatario_correo',
            ]);
        });
    }
};
