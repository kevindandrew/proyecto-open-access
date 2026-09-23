<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('house_bl', function (Blueprint $table) {
            $table->string('shipper_nombre', 200)->nullable()->after('id_cliente');
            $table->text('shipper_direccion')->nullable()->after('shipper_nombre');
        });
    }

    public function down(): void
    {
        Schema::table('house_bl', function (Blueprint $table) {
            $table->dropColumn(['shipper_nombre', 'shipper_direccion']);
        });
    }
};
