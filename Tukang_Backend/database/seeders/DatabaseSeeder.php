<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        // Bikin akun Admin
        User::create([
            'name' => 'Super Admin',
            'email' => 'admin@tukangaja.com',
            'password' => \Illuminate\Support\Facades\Hash::make('admin123'),
            'role' => 'admin',
        ]);

        $this->call(TukangSeeder::class);
        $this->call(PesananSeeder::class);
    }
}
