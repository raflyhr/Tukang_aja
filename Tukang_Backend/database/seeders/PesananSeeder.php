<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pesanan;

class PesananSeeder extends Seeder
{
    /**
     * Bikin data pesanan palsu buat ngetes.
     */
    public function run(): void
    {
        // Pesanan 1: Status "menunggu" (baru masuk, belum ditawar)
        Pesanan::create([
            'user_id' => 1,
            'tukang_id' => 1,
            'deskripsi_masalah' => 'AC bocor netes air terus, udah 3 hari',
            'harga_penawaran' => null,
            'status' => 'menunggu',
        ]);

        // Pesanan 2: Status "dinego" (tukang udah kasih harga)
        Pesanan::create([
            'user_id' => 1,
            'tukang_id' => 1,
            'deskripsi_masalah' => 'Keran kamar mandi mampet, air ga keluar',
            'harga_penawaran' => 150000,
            'status' => 'dinego',
        ]);

        // Pesanan 3: Status "diterima" (siap dikerjain, buat tes tombol Selesai)
        Pesanan::create([
            'user_id' => 1,
            'tukang_id' => 1,
            'deskripsi_masalah' => 'Pasang keramik lantai dapur 3x3 meter',
            'harga_penawaran' => 500000,
            'status' => 'diterima',
        ]);
    }
}
