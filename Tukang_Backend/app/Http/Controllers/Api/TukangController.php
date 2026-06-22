<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TukangController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // Mencari data Tukang berdasarkan ID
        $tukang = \App\Models\Tukang::find($id);

        if (!$tukang) {
            return response()->json([
                'status' => 'Gagal',
                'message' => 'Data Tukang tidak ditemukan'
            ], 404);
        }

        // Validasi input status
        $request->validate([
            'is_aktif' => 'required|boolean'
        ]);

        // Update status aktif Tukang
        $tukang->is_aktif = $request->is_aktif;
        $tukang->save();

        // Mengembalikan respons JSON
        return response()->json([
            'status' => 'Sukses',
            'message' => 'Status Tukang berhasil diubah.',
            'data_tukang' => [
                'nama' => $tukang->nama,
                'status_sekarang' => $tukang->is_aktif ? 'Aktif Menerima Pesanan' : 'Tidak Aktif (Sedang Libur)'
            ]
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
