<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Pesanan;

class PesananController extends Controller
{
    /**
     * Mendapatkan daftar pesanan masuk berdasarkan ID Tukang.
     */
    public function getPesananTukang($tukang_id)
    {
        $pesanan = Pesanan::with('user')->where('tukang_id', $tukang_id)->latest()->get();
        return response()->json(['status' => 'Sukses', 'data' => $pesanan], 200);
    }

    /**
     * Memberikan penawaran harga untuk sebuah pesanan.
     */
    public function kasihPenawaran(Request $request, $id)
    {
        $request->validate([
            'harga_penawaran' => 'required|integer'
        ]);

        $pesanan = Pesanan::find($id);
        if (!$pesanan) {
            return response()->json(['message' => 'Pesanan tidak ditemukan'], 404);
        }

        $pesanan->harga_penawaran = $request->harga_penawaran;
        $pesanan->status = 'menunggu_persetujuan';
        $pesanan->save();

        return response()->json([
            'message' => 'Penawaran harga berhasil dikirim, menunggu persetujuan pelanggan.',
            'data' => $pesanan
        ], 200);
    }

    /**
     * Menolak pesanan dengan memberikan alasan.
     */
    public function tolakPesanan(Request $request, $id)
    {
        $request->validate([
            'alasan_penolakan' => 'required|string'
        ]);

        $pesanan = Pesanan::find($id);
        if (!$pesanan) {
            return response()->json(['message' => 'Pesanan tidak ditemukan'], 404);
        }

        $pesanan->alasan_penolakan = $request->alasan_penolakan;
        $pesanan->status = 'ditolak';
        $pesanan->save();

        return response()->json(['message' => 'Pesanan berhasil ditolak.', 'data' => $pesanan], 200);
    }
    /**
     * Selesaikan pekerjaan dan tambahkan saldo ke Tukang.
     */
    public function selesaikanPekerjaan($id)
    {
        $pesanan = Pesanan::find($id);
        if (!$pesanan) {
            return response()->json(['message' => 'Pesanan tidak ditemukan'], 404);
        }

        if ($pesanan->status === 'selesai') {
            return response()->json(['message' => 'Pesanan ini sudah diselesaikan sebelumnya'], 400);
        }

        // 1. Ubah status pesanan
        $pesanan->status = 'selesai';
        $pesanan->save();

        // 2. Tambahkan saldo ke Tukang
        // Karena kita sudah mendefinisikan relasi tukang() di model Pesanan, kita bisa langsung akses
        $tukang = $pesanan->tukang;
        if ($tukang) {
            // Asumsi harga_penawaran adalah harga akhir yang disetujui
            $tukang->saldo += $pesanan->harga_penawaran;
            $tukang->save();
        }

        return response()->json([
            'message' => 'Pekerjaan selesai! Saldo Tukang berhasil ditambahkan.',
            'data' => $pesanan,
            'saldo_sekarang' => $tukang->saldo ?? 0
        ], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:roles,id',
            'deskripsi_masalah' => 'required|string',
            'judul' => 'required|string',
            'kategori_layanan' => 'required|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'alamat_lengkap' => 'required|string',
            'harga_penawaran' => 'required|integer',
        ]);

        $pesanan = Pesanan::create([
            'user_id' => $request->user_id,
            'tukang_id' => $request->tukang_id ?? null,
            'deskripsi_masalah' => $request->deskripsi_masalah,
            'judul' => $request->judul,
            'kategori_layanan' => $request->kategori_layanan,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'alamat_lengkap' => $request->alamat_lengkap,
            'harga_penawaran' => $request->harga_penawaran,
            'budget_perkiraan' => $request->budget_perkiraan ?? null,
            'status' => 'menunggu',
        ]);

        return response()->json([
            'message' => 'Pesanan berhasil dibuat.',
            'data' => $pesanan
        ], 201);
    }

    public function getPesananUser($id)
    {
        $pesanan = Pesanan::with('tukang')
            ->where('user_id', $id)
            ->latest()
            ->get();

        return response()->json([
            'status' => 'Sukses',
            'data' => $pesanan
        ]);
    }

    /**
     * Mendapatkan pesanan baru yang tersedia berdasarkan radius dan kategori
     */
    public function getAvailableOrders(Request $request)
    {
        $latitude = $request->query('lat');
        $longitude = $request->query('lng');
        $radius = $request->query('radius', 5); // default 5 km
        $kategori = $request->query('kategori', 'Semua');

        $query = Pesanan::whereNull('tukang_id')->where('status', 'menunggu');

        if ($kategori !== 'Semua') {
            $query->where('kategori_layanan', $kategori);
        }

        if ($latitude && $longitude) {
            // Haversine formula
            $haversine = "(6371 * acos(cos(radians($latitude)) 
                         * cos(radians(latitude)) 
                         * cos(radians(longitude) - radians($longitude)) 
                         + sin(radians($latitude)) 
                         * sin(radians(latitude))))";

            $query->selectRaw("*, {$haversine} AS jarak")
                  ->having('jarak', '<=', $radius)
                  ->orderBy('jarak', 'asc');
        } else {
            $query->latest();
        }

        $pesanan = $query->get();

        return response()->json([
            'status' => 'Sukses',
            'data' => $pesanan
        ]);
    }

    /**
     * Tukang menerima pesanan dari marketplace
     */
    public function terimaPekerjaan(Request $request, $id)
    {
        $request->validate([
            'tukang_id' => 'required|exists:tukangs,id'
        ]);

        $pesanan = Pesanan::find($id);

        if (!$pesanan) {
            return response()->json(['message' => 'Pesanan tidak ditemukan'], 404);
        }

        if ($pesanan->tukang_id !== null) {
            return response()->json(['message' => 'Pesanan ini sudah diambil oleh tukang lain'], 400);
        }

        $pesanan->tukang_id = $request->tukang_id;
        $pesanan->status = 'menunggu_penawaran';
        $pesanan->save();

        return response()->json([
            'message' => 'Berhasil menerima pekerjaan!',
            'data' => $pesanan
        ]);
    }
}
