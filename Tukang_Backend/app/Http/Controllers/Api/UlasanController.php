<?php

namespace App\Http\Controllers\Api;

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
}
