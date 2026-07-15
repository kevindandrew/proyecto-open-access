<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clientes', function (Blueprint $table) {
            $table->id('id_cliente');
            $table->foreignId('id_comercial')->nullable()->constrained(table: 'empleados', column: 'id_empleado');
            $table->string('razon_social', 200);
            $table->string('nit', 30)->nullable();
            $table->string('id_ciudad', 2)->nullable();
            $table->foreign('id_ciudad')->references('cod_ciudad')->on('ciudades');
            $table->text('direccion')->nullable();
            $table->string('persona_contacto', 150)->nullable();
            $table->string('telefono1', 30)->nullable();
            $table->string('celular_whatsapp', 30)->nullable();
            $table->string('email', 120)->nullable();
            $table->string('correo_factura', 120)->nullable();
            $table->string('condicion_pago', 50)->default('Al contado');
            $table->text('otro')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clientes');
    }
};
