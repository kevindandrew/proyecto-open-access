<?php

namespace Database\Seeders;

use App\Models\RoleEmpleado;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $roles = [
            'Gerente Comercial',
            'Comercial',
            'Gerente Operativo',
            'Operativo',
        ];

        foreach ($roles as $nombreRol) {
            RoleEmpleado::firstOrCreate(['nombre_rol' => $nombreRol]);
        }
    }
}
