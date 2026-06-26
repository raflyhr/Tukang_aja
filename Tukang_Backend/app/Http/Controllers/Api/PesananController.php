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
        $pesanan = Pesanan::where('tukang_id', $tukang_id)->get();
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
        $pesanan->status = 'dinego';
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
        'user_id' => 'required|exists:users,id',
        'tukang_id' => 'required|exists:tukangs,id',
        'deskripsi_masalah' => 'required|string',
    ]);

    $pesanan = Pesanan::create([
        'user_id' => $request->user_id,
        'tukang_id' => $request->tukang_id,
        'deskripsi_masalah' => $request->deskripsi_masalah,
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

}
