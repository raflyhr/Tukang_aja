<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Tukang;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
class TukangSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Bikin akun login bohongan
        $user = User::create([
            'name' => 'Bang rehan tes',
            'email' => 'bangrehan@gmail.com',
            'password' => Hash::make('12345678'),
            'role' => 'tukang',
        ]);

        // 2. Bikin profil tukangnya
        Tukang::create([
            'user_id' => $user->id,
            'nama' => 'Bang Rehan',
            'alamat' => 'Jl. Veteran No. 123',
            'keahlian' => 'Tukang Las dan Tukang Pipa',
            'no_hp' => '085156090756',
            'is_aktif' => false,
            'saldo' => 100000,
            'rating' => 5.00
        ]);

    }
}
