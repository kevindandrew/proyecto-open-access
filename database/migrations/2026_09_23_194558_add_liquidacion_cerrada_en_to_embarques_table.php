<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('embarques', function (Blueprint $table) {
            $table->timestamp('liquidacion_cerrada_en')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('embarques', function (Blueprint $table) {
            $table->dropColumn('liquidacion_cerrada_en');
        });
    }
};
