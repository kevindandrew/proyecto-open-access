<?php

namespace Database\Seeders;

use App\Models\Ciudad;
use Illuminate\Database\Seeder;

class CiudadSeeder extends Seeder
{
    public function run(): void
    {
        $ciudades = [
            ['cod_ciudad' => 'LP', 'nombre_ciudad' => 'La Paz'],
            ['cod_ciudad' => 'EA', 'nombre_ciudad' => 'El Alto'],
            ['cod_ciudad' => 'SC', 'nombre_ciudad' => 'Santa Cruz de la Sierra'],
            ['cod_ciudad' => 'CB', 'nombre_ciudad' => 'Cochabamba'],
            ['cod_ciudad' => 'SU', 'nombre_ciudad' => 'Sucre'],
            ['cod_ciudad' => 'OR', 'nombre_ciudad' => 'Oruro'],
            ['cod_ciudad' => 'PT', 'nombre_ciudad' => 'Potosí'],
            ['cod_ciudad' => 'TJ', 'nombre_ciudad' => 'Tarija'],
            ['cod_ciudad' => 'TR', 'nombre_ciudad' => 'Trinidad'],
            ['cod_ciudad' => 'CO', 'nombre_ciudad' => 'Cobija'],
        ];

        foreach ($ciudades as $ciudad) {
            Ciudad::updateOrCreate(['cod_ciudad' => $ciudad['cod_ciudad']], $ciudad);
        }
    }
}
