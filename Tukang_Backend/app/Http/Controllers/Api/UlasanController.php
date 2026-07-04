<?php

namespace App\Http\Controllers\Api;

use App\Models\Pesanan;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Ulasan;
use App\Models\Tukang;

class UlasanController extends Controller
{
    /**
     * Mendapatkan daftar ulasan dan rata-rata rating untuk seorang Tukang.
     */
    public function getUlasanTukang($tukang_id)
    {
        // Tarik semua ulasan milik tukang ini, sekalian bawa data user (pelanggan) yang ngasih ulasan
        $ulasan = Ulasan::where('tukang_id', $tukang_id)->with('user:id,name')->get();
        
        // Menghitung rata-rata bintang
        $rata_rata = $ulasan->avg('rating');
        
        // Update kolom rating di tabel Tukang secara otomatis biar datanya selalu sinkron
        $tukang = Tukang::find($tukang_id);
        if ($tukang && $rata_rata !== null) {
            $tukang->rating = round($rata_rata, 2);
            $tukang->save();
        }

        return response()->json([
            'status' => 'Sukses',
            'rata_rata_rating' => $rata_rata ? round($rata_rata, 2) : 0,
            'total_ulasan' => $ulasan->count(),
            'data_ulasan' => $ulasan
        ], 200);
    }

   public function store(Request $request)
{
    $request->validate([
        'user_id' => 'required|exists:roles,id',
        'tukang_id' => 'required|exists:tukangs,id',
        'pesanan_id' => 'required|exists:pesanans,id',
        'rating' => 'required|integer|min:1|max:5',
        'komentar' => 'nullable|string'
    ]);

    // Cek apakah pesanan ada dan sudah selesai
    $pesanan = \App\Models\Pesanan::where('id', $request->pesanan_id)
        ->where('user_id', $request->user_id)
        ->where('tukang_id', $request->tukang_id)
        ->where('status', 'selesai')
        ->first();

    if (!$pesanan) {
        return response()->json([
            'message' => 'Pesanan belum selesai atau tidak ditemukan.'
        ], 400);
    }

    // Cegah ulasan ganda
    $cek = Ulasan::where('pesanan_id', $request->pesanan_id)->first();

    if ($cek) {
        return response()->json([
            'message' => 'Pesanan ini sudah diberi ulasan.'
        ], 400);
    }

    // Simpan ulasan
    $ulasan = Ulasan::create([
        'user_id' => $request->user_id,
        'tukang_id' => $request->tukang_id,
        'pesanan_id' => $request->pesanan_id,
        'rating' => $request->rating,
        'komentar' => $request->komentar
    ]);

    // Update rating rata-rata tukang
    $rata = Ulasan::where('tukang_id', $request->tukang_id)->avg('rating');

    $tukang = Tukang::find($request->tukang_id);
    $tukang->rating = round($rata, 2);
    $tukang->save();

    return response()->json([
        'message' => 'Ulasan berhasil dikirim.',
        'rating_tukang' => $tukang->rating,
        'data' => $ulasan
    ], 201);
}

}
