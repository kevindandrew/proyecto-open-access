<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cliente_consignatarios', function (Blueprint $table) {
            $table->id('id_consignatario');
            $table->foreignId('id_cliente')->constrained(table: 'clientes', column: 'id_cliente')->cascadeOnDelete();
            $table->string('nombre', 150)->nullable();
            $table->string('nit', 30)->nullable();
            $table->text('direccion')->nullable();
            $table->string('celular', 30)->nullable();
            $table->string('correo', 120)->nullable();
            $table->timestamps();
        });

        DB::table('clientes')
            ->whereNotNull('consignatario_nombre')
            ->get(['id_cliente', 'consignatario_nombre', 'consignatario_nit', 'consignatario_direccion', 'consignatario_celular', 'consignatario_correo'])
            ->each(function ($cliente) {
                DB::table('cliente_consignatarios')->insert([
                    'id_cliente' => $cliente->id_cliente,
                    'nombre' => $cliente->consignatario_nombre,
                    'nit' => $cliente->consignatario_nit,
                    'direccion' => $cliente->consignatario_direccion,
                    'celular' => $cliente->consignatario_celular,
                    'correo' => $cliente->consignatario_correo,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            });

        Schema::table('clientes', function (Blueprint $table) {
            $table->dropColumn([
                'consignatario_nombre',
                'consignatario_nit',
                'consignatario_direccion',
                'consignatario_celular',
                'consignatario_correo',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('clientes', function (Blueprint $table) {
            $table->string('consignatario_nombre', 150)->nullable();
            $table->string('consignatario_nit', 30)->nullable();
            $table->text('consignatario_direccion')->nullable();
            $table->string('consignatario_celular', 30)->nullable();
            $table->string('consignatario_correo', 120)->nullable();
        });

        DB::table('cliente_consignatarios')
            ->orderBy('id_consignatario')
            ->get()
            ->groupBy('id_cliente')
            ->each(function ($grupo) {
                $primero = $grupo->first();

                DB::table('clientes')
                    ->where('id_cliente', $primero->id_cliente)
                    ->update([
                        'consignatario_nombre' => $primero->nombre,
                        'consignatario_nit' => $primero->nit,
                        'consignatario_direccion' => $primero->direccion,
                        'consignatario_celular' => $primero->celular,
                        'consignatario_correo' => $primero->correo,
                    ]);
            });

        Schema::dropIfExists('cliente_consignatarios');
    }
};
