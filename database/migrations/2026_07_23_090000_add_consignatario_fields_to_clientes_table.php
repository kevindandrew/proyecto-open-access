<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clientes', function (Blueprint $table) {
            $table->string('ciudad_personalizada', 100)->nullable()->after('id_ciudad');
            $table->string('consignatario_nombre', 150)->nullable()->after('otro');
            $table->string('consignatario_nit', 30)->nullable()->after('consignatario_nombre');
            $table->text('consignatario_direccion')->nullable()->after('consignatario_nit');
            $table->string('consignatario_celular', 30)->nullable()->after('consignatario_direccion');
            $table->string('consignatario_correo', 120)->nullable()->after('consignatario_celular');
        });
    }

    public function down(): void
    {
        Schema::table('clientes', function (Blueprint $table) {
            $table->dropColumn([
                'ciudad_personalizada',
                'consignatario_nombre',
                'consignatario_nit',
                'consignatario_direccion',
                'consignatario_celular',
                'consignatario_correo',
            ]);
        });
    }
};
