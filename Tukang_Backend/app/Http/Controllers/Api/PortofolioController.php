<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Portofolio;

class PortofolioController extends Controller
{
    /**
     * Mengunggah portofolio baru untuk seorang Tukang
     */
    public function store(Request $request, $tukang_id)
    {
        // 1. Validasi Input (Harus ada judul, deskripsi, dan foto berupa gambar)
        $request->validate([
            'judul' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'foto' => 'required|image|mimes:jpeg,png,jpg|max:5120' // Maksimal 5MB
        ]);

        // 2. Simpan file foto ke dalam folder "storage/app/public/portofolio"
        if ($request->hasFile('foto')) {
            // $path bakal nyimpen nama jalurnya otomatis, misal: "portofolio/nama_file_acak.jpg"
            $path = $request->file('foto')->store('portofolio', 'public');
        } else {
            return response()->json(['message' => 'Gagal mengunggah foto'], 400);
        }

        // 3. Simpan data teks dan jalur fotonya ke Database
        $portofolio = Portofolio::create([
            'tukang_id' => $tukang_id,
            'judul' => $request->judul,
            'deskripsi' => $request->deskripsi,
            'foto_url' => $path
        ]);

        return response()->json([
            'status' => 'Sukses',
            'message' => 'Portofolio berhasil ditambahkan!',
            'data' => $portofolio
        ], 201);
    }

    /**
     * Melihat semua portofolio milik seorang Tukang
     */
    public function getPortofolioTukang($tukang_id)
    {
        $portofolio = Portofolio::where('tukang_id', $tukang_id)->get();
        return response()->json([
            'status' => 'Sukses',
            'data' => $portofolio
        ], 200);
    }
    public function destroy($tukang_id, $portofolio_id)
    {
        $portofolio = Portofolio::where('tukang_id', $tukang_id)->where('id', $portofolio_id)->first();
        if($portofolio) {
            if(\Illuminate\Support\Facades\Storage::disk('public')->exists($portofolio->foto_url)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($portofolio->foto_url);
            }
            $portofolio->delete();
        }
        return response()->json(['status' => 'Sukses']);
    }
}
