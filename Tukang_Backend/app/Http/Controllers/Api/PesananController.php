<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Pesanan;
use App\Models\Escrow;
use App\Models\Dispute;

class PesananController extends Controller
{
    private function autoCancelExpiredOrders()
    {
        // Cancel orders that are waiting for tukang's offer for more than 15 minutes
        $expiredTime = now()->subMinutes(15);
        Pesanan::where('status', 'menunggu_penawaran')
            ->where('updated_at', '<', $expiredTime)
            ->update(['status' => 'dibatalkan', 'alasan_penolakan' => 'Sistem: Tukang tidak merespon dalam 15 menit']);
    }

    /**
     * Mendapatkan daftar pesanan masuk berdasarkan ID Tukang.
     */
    public function getPesananTukang($tukang_id)
    {
        $this->autoCancelExpiredOrders();
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

        // Cari chat terkait untuk mengirim pesan sistem penawaran harga
        $chat = \App\Models\Chat::where('pesanan_id', $pesanan->id)->first();
        if (!$chat) {
            $chat = \App\Models\Chat::where('user_id', $pesanan->user_id)
                ->where('tukang_id', $pesanan->tukang_id)
                ->first();
        }

        if ($chat) {
            \App\Models\Message::create([
                'chat_id' => $chat->id,
                'sender_type' => 'system',
                'message_type' => 'negotiation_offer',
                'text' => 'Rp ' . number_format($request->harga_penawaran, 0, ',', '.')
            ]);
        }

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
     * Pelanggan melakukan pembayaran. Uang ditahan di Escrow.
     */
    public function bayarPesanan(Request $request, $id)
    {
        $pesanan = Pesanan::find($id);
        if (!$pesanan) return response()->json(['message' => 'Pesanan tidak ditemukan'], 404);

        if ($pesanan->status !== 'menunggu' && $pesanan->status !== 'menunggu_persetujuan' && $pesanan->status !== 'menunggu_pembayaran') {
            return response()->json(['message' => 'Pesanan belum bisa dibayar'], 400);
        }

        $user = $pesanan->user;
        if ($user) {
            if ($user->saldo < $pesanan->harga_penawaran) {
                return response()->json(['message' => 'Saldo Anda tidak mencukupi untuk melakukan pembayaran.'], 400);
            }
            $user->saldo -= $pesanan->harga_penawaran;
            $user->save();
        }

        $pesanan->status = 'menunggu_pengerjaan';
        $pesanan->save();

        Escrow::create([
            'pesanan_id' => $pesanan->id,
            'jumlah_bayar' => $pesanan->harga_penawaran,
            'tipe_pembayaran' => $request->tipe ?? 'full',
            'status_escrow' => 'ditahan'
        ]);

        return response()->json([
            'message' => 'Pembayaran berhasil! Uang ditahan oleh sistem.',
            'saldo_sekarang' => $user ? $user->saldo : null
        ], 200);
    }

    /**
     * Tukang menyelesaikan pekerjaan. (Hanya lapor selesai, belum terima uang)
     */
    public function selesaikanPekerjaan($id)
    {
        $pesanan = Pesanan::find($id);
        if (!$pesanan) return response()->json(['message' => 'Pesanan tidak ditemukan'], 404);

        if ($pesanan->status !== 'sedang_dikerjakan' && $pesanan->status !== 'menunggu_pengerjaan') {
            return response()->json(['message' => 'Pesanan belum dalam status pengerjaan'], 400);
        }

        $pesanan->status = 'menunggu_konfirmasi_selesai';
        $pesanan->save();

        return response()->json(['message' => 'Laporan selesai dikirim. Menunggu konfirmasi pelanggan.'], 200);
    }

    /**
     * Pelanggan mengkonfirmasi pekerjaan selesai. Uang cair ke Tukang.
     */
    public function konfirmasiSelesai($id)
    {
        $pesanan = Pesanan::find($id);
        if (!$pesanan) return response()->json(['message' => 'Pesanan tidak ditemukan'], 404);

        if ($pesanan->status !== 'menunggu_konfirmasi_selesai' && $pesanan->status !== 'menunggu_pengerjaan' && $pesanan->status !== 'sedang_dikerjakan') {
            return response()->json(['message' => 'Belum bisa dikonfirmasi'], 400);
        }

        $pesanan->status = 'selesai';
        $pesanan->save();

        // Cairkan Escrow ke Tukang
        $escrow = Escrow::where('pesanan_id', $pesanan->id)->first();
        if ($escrow) {
            $escrow->status_escrow = 'dicairkan_ke_tukang';
            $escrow->save();

            $tukang = $pesanan->tukang;
            if ($tukang) {
                $tukang->saldo += $escrow->jumlah_bayar;
                $tukang->save();
            }
        } else {
            $tukang = $pesanan->tukang;
            if ($tukang) {
                $tukang->saldo += $pesanan->harga_penawaran;
                $tukang->save();
            }
        }

        return response()->json(['message' => 'Pekerjaan selesai! Dana telah diteruskan ke Tukang.'], 200);
    }

    /**
     * Pelanggan komplain/dispute.
     */
    public function komplainPesanan(Request $request, $id)
    {
        $pesanan = Pesanan::find($id);
        if (!$pesanan) return response()->json(['message' => 'Pesanan tidak ditemukan'], 404);

        $pesanan->status = 'komplain';
        $pesanan->save();

        Dispute::create([
            'pesanan_id' => $pesanan->id,
            'user_id' => $pesanan->user_id,
            'alasan_komplain' => $request->alasan_komplain ?? 'Tidak ada alasan'
        ]);

        return response()->json(['message' => 'Komplain berhasil diajukan. Admin akan meninjau pesanan ini.'], 200);
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
            'foto_lampiran' => 'nullable|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        $path = null;
        if ($request->hasFile('foto_lampiran')) {
            $path = $request->file('foto_lampiran')->store('pesanan', 'public');
        }

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
            'status' => $request->tukang_id ? 'menunggu_penawaran' : 'menunggu',
            'foto_lampiran' => $path,
        ]);

        return response()->json([
            'message' => 'Pesanan berhasil dibuat.',
            'data' => $pesanan
        ], 201);
    }

    public function getPesananUser($id)
    {
        $this->autoCancelExpiredOrders();
        $pesanan = Pesanan::with('tukang')
            ->where('user_id', $id)
            ->latest()
            ->get();

        return response()->json([
            'status' => 'Sukses',
            'data' => $pesanan
        ]);
    }

    public function getDashboardStatsUser($id)
    {
        $pesananAktif = Pesanan::where('user_id', $id)
            ->whereNotIn('status', ['selesai', 'batal', 'ditolak'])
            ->count();
            
        $pekerjaanSelesai = Pesanan::where('user_id', $id)
            ->where('status', 'selesai')
            ->count();
            
        $totalPengeluaran = Pesanan::where('user_id', $id)
            ->where('status', 'selesai')
            ->sum('harga_penawaran');

        return response()->json([
            'status' => 'Sukses',
            'data' => [
                'pesanan_aktif' => str_pad($pesananAktif, 2, '0', STR_PAD_LEFT),
                'pekerjaan_selesai' => str_pad($pekerjaanSelesai, 2, '0', STR_PAD_LEFT),
                'total_pengeluaran' => $totalPengeluaran
            ]
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
        $kategori = $request->query('kategori', 'semua');

        $query = Pesanan::whereNull('tukang_id')->where('status', 'menunggu');

        if ($kategori !== 'semua') {
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
