<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TukangController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
{
    $query = \App\Models\Tukang::query();

    if ($request->has('alamat')) {
        $query->where('alamat', 'like', '%' . $request->alamat . '%');
    }

    if ($request->has('rating')) {
        $query->where('rating', '>=', $request->rating);
    }

    if ($request->has('sort') && $request->sort == 'rating') {
        $query->orderBy('rating', 'desc');
    }

    $tukang = $query->get();

    return response()->json([
        'status' => 'Sukses',
        'data' => $tukang
    ]);
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
    $tukang = \App\Models\Tukang::with([
        'user',
        'ulasans',
        'portofolios'
    ])->find($id);

    if (!$tukang) {
        return response()->json([
            'message' => 'Tukang tidak ditemukan'
        ], 404);
    }

    return response()->json([
        'status' => 'Sukses',
        'data' => $tukang
    ]);
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

    public function updateProfil(Request $request, $id)
    {
        $tukang = \App\Models\Tukang::find($id);
        if (!$tukang) {
            return response()->json(['message' => 'Tukang tidak ditemukan'], 404);
        }

        $request->validate([
            'nama' => 'required|string',
            'no_hp' => 'required|string',
            'keahlian' => 'required|string',
            'radius_layanan' => 'required|integer',
            'area_cakupan' => 'nullable|string',
            'keahlian_tambahan' => 'nullable|array'
        ]);

        $tukang->nama = $request->nama;
        $tukang->no_hp = $request->no_hp;
        $tukang->keahlian = $request->keahlian;
        $tukang->radius_layanan = $request->radius_layanan;
        $tukang->area_cakupan = $request->area_cakupan;
        $tukang->keahlian_tambahan = $request->keahlian_tambahan;
        $tukang->save();

        return response()->json([
            'status' => 'Sukses',
            'message' => 'Profil berhasil diperbarui',
            'data' => $tukang
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    /**
     * Mendapatkan Statistik Dashboard untuk Tukang
     */
    public function getDashboardStats($id)
    {
        $tukang = \App\Models\Tukang::find($id);
        
        if (!$tukang) {
            return response()->json(['message' => 'Tukang tidak ditemukan'], 404);
        }

        $pesananAktif = \App\Models\Pesanan::where('tukang_id', $id)
            ->whereIn('status', ['menunggu', 'diterima', 'dinego'])
            ->count();
            
        $pekerjaanSelesai = \App\Models\Pesanan::where('tukang_id', $id)
            ->where('status', 'selesai')
            ->count();
            
        $pendapatanBulanIni = \App\Models\Pesanan::where('tukang_id', $id)
            ->where('status', 'selesai')
            ->whereMonth('created_at', date('m'))
            ->whereYear('created_at', date('Y'))
            ->sum('harga_penawaran');

        return response()->json([
            'status' => 'Sukses',
            'data' => [
                'pesanan_aktif' => str_pad($pesananAktif, 2, '0', STR_PAD_LEFT),
                'pekerjaan_selesai' => $pekerjaanSelesai,
                'rating_rata_rata' => $tukang->rating,
                'pendapatan_bulan_ini' => $pendapatanBulanIni
            ]
        ]);
    }

    /**
     * Mendapatkan Aktivitas Terbaru untuk Tukang
     */
    public function getRecentActivities($id)
    {
        // Sebagai contoh simulasi data log, ambil pesanan terbaru dan ulasan terbaru.
        // Di aplikasi riil bisa berupa tabel 'notifications' khusus.
        
        $pesananSelesai = \App\Models\Pesanan::with('user')
            ->where('tukang_id', $id)
            ->where('status', 'selesai')
            ->latest()
            ->take(2)
            ->get()
            ->map(function ($item) {
                return [
                    'tipe' => 'pekerjaan_selesai',
                    'judul' => 'Selesaikan Pekerjaan #' . $item->id,
                    'deskripsi' => $item->kategori_layanan . ' - ' . ($item->user->name ?? 'Pelanggan'),
                    'waktu' => $item->updated_at->diffForHumans()
                ];
            });

        $ulasanBaru = \App\Models\Ulasan::with('user')
            ->where('tukang_id', $id)
            ->latest()
            ->take(1)
            ->get()
            ->map(function ($item) {
                return [
                    'tipe' => 'ulasan',
                    'judul' => 'Rating ' . $item->rating . ' Bintang Diterima',
                    'deskripsi' => $item->komentar . ' - ' . ($item->user->name ?? 'Pelanggan'),
                    'waktu' => $item->created_at->diffForHumans()
                ];
            });

        $activities = $pesananSelesai->concat($ulasanBaru)->sortByDesc('waktu')->values();

        return response()->json([
            'status' => 'Sukses',
            'data' => $activities
        ]);
    }
}
