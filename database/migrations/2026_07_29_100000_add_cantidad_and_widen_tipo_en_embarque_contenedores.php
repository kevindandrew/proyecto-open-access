<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('embarque_contenedores', function (Blueprint $table) {
            $table->string('tipo_contenedor', 50)->nullable()->change();
            $table->integer('cantidad')->default(1)->after('tipo_contenedor');
        });
    }

    public function down(): void
    {
        Schema::table('embarque_contenedores', function (Blueprint $table) {
            $table->dropColumn('cantidad');
            $table->string('tipo_contenedor', 10)->nullable()->change();
        });
    }
};
