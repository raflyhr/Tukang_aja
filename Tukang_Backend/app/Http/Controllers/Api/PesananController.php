<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Pesanan; // Panggil buku panduan Pesanan

class PesananController extends Controller
{
    // 1. Koki cek pesanan yang masuk buat Tukang tertentu
    public function getPesananTukang($tukang_id)
    {
        $pesanan = Pesanan::where('tukang_id', $tukang_id)->get();
        return response()->json(['status' => 'Sukses', 'data' => $pesanan], 200);
    }

    // 2. Koki ngirim harga tawaran dari Tukang
    public function kasihPenawaran(Request $request, $id)
    {
        $request->validate([
            'harga_penawaran' => 'required|integer' // Harus angka
        ]);

        $pesanan = Pesanan::find($id);
        if (!$pesanan) return response()->json(['message' => 'Pesanan tidak ditemukan'], 404);

        $pesanan->harga_penawaran = $request->harga_penawaran;
        $pesanan->status = 'dinego'; // Otomatis berubah statusnya
        $pesanan->save();

        return response()->json(['message' => 'Berhasil ngasih harga! Nunggu jawaban user...', 'data' => $pesanan], 200);
    }

    // 3. Koki nolak pesanan (wajib isi alasan)
    public function tolakPesanan(Request $request, $id)
    {
        $request->validate([
            'alasan_penolakan' => 'required|string'
        ]);

        $pesanan = Pesanan::find($id);
        if (!$pesanan) return response()->json(['message' => 'Pesanan tidak ditemukan'], 404);

        $pesanan->alasan_penolakan = $request->alasan_penolakan;
        $pesanan->status = 'ditolak';
        $pesanan->save();

        return response()->json(['message' => 'Pesanan berhasil ditolak', 'data' => $pesanan], 200);
    }
}
