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
        $this->call([
            TukangAjaSeeder::class
        ]);

        // Bikin akun Admin
        User::create([
            'name' => 'Super Admin',
            'email' => 'admin@tukangaja.com',
            'password' => \Illuminate\Support\Facades\Hash::make('admin123'),
            'role' => 'admin',
            'no_hp' => '080000000000',
            'alamat' => 'Kantor Pusat TukangAja',
            'latitude' => -6.2088,
            'longitude' => 106.8456,
        ]);

        // $this->call(TukangSeeder::class);
        // $this->call(PesananSeeder::class);
    }
}
