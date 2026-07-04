<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Tukang;
use App\Models\Pesanan;
use App\Models\Ulasan;
use App\Models\Chat;
use App\Models\Message;
use Illuminate\Support\Facades\Hash;

class TukangAjaSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Buat User Tukang (Denji - Sesuai Figma)
        $userTukang = User::create([
            'name' => 'Denji',
            'email' => 'denji@tukangaja.com',
            'password' => Hash::make('password123'),
            'role' => 'tukang',
            'no_hp' => '081234567890',
            'alamat' => 'Jakarta Selatan',
            'latitude' => -6.2088,
            'longitude' => 106.8456,
        ]);

        $tukang = Tukang::create([
            'user_id' => $userTukang->id,
            'nama' => 'Denji',
            'no_hp' => '081234567890',
            'foto_profil' => 'https://64.media.tumblr.com/c9a40e15310bd677150504d378595de4/708a33221029625f-0b/s1280x1920/3304739f2245fc3c15e6e70ffff7ee91b2d2ac69.jpg',
            'alamat' => 'Jakarta Selatan',
            'latitude' => -6.2088,
            'longitude' => 106.8456,
            'keahlian' => 'Teknisi Elektrik & AC',
            'keahlian_tambahan' => ['Instalasi AC', 'Perbaikan Panel Listrik', 'Instalasi Pompa Air'],
            'radius_layanan' => 15,
            'area_cakupan' => 'Jakarta Selatan, Pusat, dan sebagian Jakarta Timur',
            'tahun_pengalaman' => 5,
            'is_aktif' => true,
            'rating' => 4.9,
            'saldo' => 2500000
        ]);

        // 2. Buat Beberapa User Pelanggan
        $pelanggan1 = User::create([
            'name' => 'Siska Pratama',
            'email' => 'siska@mail.com',
            'password' => Hash::make('123'),
            'role' => 'user',
            'no_hp' => '081111111111',
            'alamat' => 'Jl. Sudirman No.1',
            'latitude' => -6.2088,
            'longitude' => 106.8456,
        ]);
        $pelanggan2 = User::create([
            'name' => 'Andi Wijaya',
            'email' => 'andi@mail.com',
            'password' => Hash::make('123'),
            'role' => 'user',
            'no_hp' => '082222222222',
            'alamat' => 'Jl. Thamrin No.2',
            'latitude' => -6.2088,
            'longitude' => 106.8456,
        ]);
        $pelanggan3 = User::create([
            'name' => 'Santi Rahayu',
            'email' => 'santi@mail.com',
            'password' => Hash::make('123'),
            'role' => 'user',
            'no_hp' => '083333333333',
            'alamat' => 'Jl. Gatot Subroto No.3',
            'latitude' => -6.2088,
            'longitude' => 106.8456,
        ]);

        // Akun Pelanggan Uji Coba (Dimas & Dai)
        $dimas = User::create([
            'name' => 'Dimas',
            'email' => 'dimas@mail.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
            'no_hp' => '081234567891',
            'alamat' => 'Sleman, Yogyakarta',
            'latitude' => -7.797068,
            'longitude' => 110.370529,
        ]);

        $dai = User::create([
            'name' => 'Dai',
            'email' => 'dai@mail.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
            'no_hp' => '081234567892',
            'alamat' => 'Bantul, Yogyakarta',
            'latitude' => -7.8890,
            'longitude' => 110.3290,
        ]);

        // 3. Buat Beberapa Pesanan untuk Tukang Denji
        $pesananAktif = Pesanan::create([
            'user_id' => $pelanggan1->id,
            'tukang_id' => $tukang->id,
            'kategori_layanan' => 'Perbaikan Listrik',
            'deskripsi_masalah' => 'Lampu ruang tamu sering kedap-kedip.',
            'alamat_lengkap' => 'Jl. Sudirman No.1',
            'longitude' => 106.84,
            'status' => 'menunggu_pembayaran',
            'harga_penawaran' => 150000
        ]);

        $pesananSelesai1 = Pesanan::create([
            'user_id' => $pelanggan2->id,
            'tukang_id' => $tukang->id,
            'kategori_layanan' => 'Servis AC',
            'deskripsi_masalah' => 'AC tidak dingin sama sekali.',
            'alamat_lengkap' => 'Jl. Thamrin No.2',
            'status' => 'selesai',
            'harga_penawaran' => 250000
        ]);

        $pesananSelesai2 = Pesanan::create([
            'user_id' => $pelanggan3->id,
            'tukang_id' => $tukang->id,
            'kategori_layanan' => 'Instalasi Listrik',
            'deskripsi_masalah' => 'Pasang stop kontak baru.',
            'alamat_lengkap' => 'Jl. Gatot Subroto No.3',
            'status' => 'selesai',
            'harga_penawaran' => 100000
        ]);

        // 4. Buat Ulasan
        Ulasan::create([
            'user_id' => $pelanggan2->id,
            'tukang_id' => $tukang->id,
            'pesanan_id' => $pesananSelesai1->id,
            'rating' => 4,
            'komentar' => 'Kerja cepat dan paham masalah kelistrikan rumah saya. Terima kasih banyak.'
        ]);

        Ulasan::create([
            'user_id' => $pelanggan3->id,
            'tukang_id' => $tukang->id,
            'pesanan_id' => $pesananSelesai2->id,
            'rating' => 5,
            'komentar' => 'Pak Denji sangat profesional. Datang tepat waktu dan perbaikan dilakukan dengan sangat rapi. Sangat direkomendasikan!'
        ]);

        // 5. Buat Chat
        $chat1 = Chat::create([
            'user_id' => $pelanggan1->id,
            'tukang_id' => $tukang->id,
            'pesanan_id' => $pesananAktif->id
        ]);

        Message::create(['chat_id' => $chat1->id, 'sender_type' => 'user', 'sender_id' => $pelanggan1->id, 'text' => 'Halo Pak, lampu saya bermasalah.']);
        Message::create(['chat_id' => $chat1->id, 'sender_type' => 'tukang', 'sender_id' => $tukang->id, 'text' => 'Baik bu Siska, saya cek besok ya.']);
        Message::create(['chat_id' => $chat1->id, 'sender_type' => 'system', 'message_type' => 'negotiation_offer', 'text' => 'Rp 150.000']);
        Message::create(['chat_id' => $chat1->id, 'sender_type' => 'user', 'sender_id' => $pelanggan1->id, 'text' => 'Oke, saya setuju dengan harga tersebut.']);
    }
}
