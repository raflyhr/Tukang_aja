<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Penarikan;
use App\Models\Tukang;

class PenarikanController extends Controller
{
    /**
     * Fitur untuk Tukang menarik dana (Withdraw).
     */
    public function tarikDana(Request $request, $tukang_id)
    {
        $request->validate([
            'jumlah_tarik' => 'required|integer|min:10000',
            'rekening_tujuan' => 'required|string',
        ]);

        $tukang = Tukang::find($tukang_id);
        if (!$tukang) {
            return response()->json(['message' => 'Tukang tidak ditemukan'], 404);
        }

        // Cek apakah saldo cukup
        if ($tukang->saldo < $request->jumlah_tarik) {
            return response()->json([
                'message' => 'Saldo tidak mencukupi',
                'saldo_saat_ini' => $tukang->saldo
            ], 400);
        }

        // Kurangi saldo Tukang langsung
        $tukang->saldo -= $request->jumlah_tarik;
        $tukang->save();

        // Catat di riwayat penarikan
        $penarikan = Penarikan::create([
            'tukang_id' => $tukang_id,
            'jumlah_tarik' => $request->jumlah_tarik,
            'rekening_tujuan' => $request->rekening_tujuan,
            'status' => 'pending' // Nunggu dikirim admin manual
        ]);

        return response()->json([
            'message' => 'Permintaan penarikan dana berhasil diproses. Dana akan segera dikirim.',
            'sisa_saldo' => $tukang->saldo,
            'data' => $penarikan
        ], 200);
    }

    /**
     * Lihat riwayat penarikan dana.
     */
    public function getRiwayatPenarikan($tukang_id)
    {
        $riwayat = Penarikan::where('tukang_id', $tukang_id)
                    ->orderBy('created_at', 'desc')
                    ->get();
                    
        return response()->json([
            'status' => 'Sukses',
            'data' => $riwayat
        ], 200);
    }
}
