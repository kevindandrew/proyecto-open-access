<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('embarques', function (Blueprint $table) {
            $table->string('codigo_house_base', 6)->nullable()->unique()->after('numero_file');
        });
    }

    public function down(): void
    {
        Schema::table('embarques', function (Blueprint $table) {
            $table->dropColumn('codigo_house_base');
        });
    }
};
