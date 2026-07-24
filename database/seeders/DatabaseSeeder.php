<?php

namespace Database\Seeders;

use App\Models\User;
use App\Support\GeneradorUsername;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RoleSeeder::class);
        $this->call(CiudadSeeder::class);
        $this->call(DemoAccountsSeeder::class);

        // User::factory(10)->create();

        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'username' => GeneradorUsername::generar('Test User'),
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ],
        );
    }
}
