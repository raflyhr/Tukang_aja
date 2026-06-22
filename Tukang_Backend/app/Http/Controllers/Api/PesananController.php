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
}
