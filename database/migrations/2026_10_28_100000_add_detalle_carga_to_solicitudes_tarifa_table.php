<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('solicitudes_tarifa', function (Blueprint $table) {
            // Detalle de la carga que Operaciones necesita para pedir la tarifa
            // afuera (ej. Aéreo: bultos con L x A x A, cantidad, peso en báscula
            // y el peso tasable calculado) — ver App\Support\CargaAerea.
            $table->jsonb('detalle_carga')->nullable()->after('id_pod');
        });
    }

    public function down(): void
    {
        Schema::table('solicitudes_tarifa', function (Blueprint $table) {
            $table->dropColumn('detalle_carga');
        });
    }
};
