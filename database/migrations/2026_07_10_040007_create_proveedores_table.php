<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proveedores', function (Blueprint $table) {
            $table->id('id_proveedor');
            $table->string('tipo', 20);
            $table->string('nombre', 200);
            $table->string('nombre_fantasia', 100)->nullable();
            $table->string('codigo_interno', 20)->nullable();
            $table->string('contacto', 150)->nullable();
            $table->text('direccion1')->nullable();
            $table->text('direccion2')->nullable();
            $table->string('ciudad', 100)->nullable();
            $table->string('pais', 60)->nullable();
            $table->string('telefono', 50)->nullable();
            $table->string('celular', 30)->nullable();
            $table->string('nit', 30)->nullable();
            $table->string('email', 200)->nullable();
            $table->timestamps();
        });

        DB::statement("ALTER TABLE proveedores ADD CONSTRAINT proveedores_tipo_check CHECK (tipo IN ('Naviera','Aerolinea','Transportista','Agente_Origen'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('proveedores');
    }
};
