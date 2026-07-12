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

        if ($pesanan->status !== 'menunggu' && $pesanan->status !== 'menunggu_persetujuan' && $pesanan->status !== 'menunggu_pembayaran' && $pesanan->status !== 'menunggu_penawaran') {
            return response()->json(['message' => 'Pesanan belum bisa dibayar'], 400);
        }

        // Midtrans Integration
        $serverKey = env('MIDTRANS_SERVER_KEY');
        if ($serverKey && strpos($serverKey, 'samplekey') === false) {
            try {
                \Midtrans\Config::$serverKey = $serverKey;
                \Midtrans\Config::$isProduction = env('MIDTRANS_IS_PRODUCTION', false);
                \Midtrans\Config::$isSanitized = env('MIDTRANS_IS_SANITIZED', true);
                \Midtrans\Config::$is3ds = env('MIDTRANS_IS_3DS', true);

                $transaction_details = [
                    'order_id' => 'TKG-ORDER-' . $pesanan->id . '-' . time(),
                    'gross_amount' => (int) $pesanan->harga_penawaran,
                ];

                $customer_details = [
                    'first_name' => $pesanan->user->nama ?? $pesanan->user->name ?? 'Pelanggan',
                    'email' => $pesanan->user->email ?? 'customer@tukangaja.com',
                    'phone' => $pesanan->user->no_hp ?? '',
                ];

                $item_details = [[
                    'id' => $pesanan->id,
                    'price' => (int) $pesanan->harga_penawaran,
                    'quantity' => 1,
                    'name' => 'Jasa: ' . substr($pesanan->judul, 0, 45),
                ]];

                $payload = [
                    'transaction_details' => $transaction_details,
                    'customer_details' => $customer_details,
                    'item_details' => $item_details,
                ];

                $snapToken = \Midtrans\Snap::getSnapToken($payload);

                $pesanan->status = 'menunggu_pembayaran';
                $pesanan->save();

                return response()->json([
                    'status' => 'Sukses',
                    'snap_token' => $snapToken,
                    'message' => 'Midtrans transaction created successfully'
                ]);
            } catch (\Exception $e) {
                // If Midtrans API fails (e.g. invalid server key), fall back to direct simulation
                \Illuminate\Support\Facades\Log::warning('Midtrans integration error: ' . $e->getMessage() . '. Falling back to direct wallet simulation.');
            }
        }

        // Direct Simulation Fallback (Old Wallet Payment Code)
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

        // Buat record Escrow
        Escrow::create([
            'pesanan_id' => $pesanan->id,
            'jumlah_bayar' => $pesanan->harga_penawaran,
            'tipe_pembayaran' => $request->tipe ?? 'full',
            'status_escrow' => 'ditahan'
        ]);

        // Buat notifikasi transaksi untuk pelanggan (user)
        \App\Models\Notification::create([
            'user_id' => $pesanan->user_id,
            'category' => 'transaksi',
            'title' => 'Pembayaran Berhasil (Simulasi)',
            'message' => 'Pembayaran untuk pesanan #' . $pesanan->id . ' (' . $pesanan->judul . ') telah dikonfirmasi sebesar Rp ' . number_format($pesanan->harga_penawaran, 0, ',', '.') . '.',
            'unread' => true
        ]);

        // Buat notifikasi transaksi untuk tukang
        if ($pesanan->tukang) {
            \App\Models\Notification::create([
                'user_id' => $pesanan->tukang->user_id,
                'category' => 'transaksi',
                'title' => 'Pembayaran Berhasil (Simulasi)',
                'message' => 'Pelanggan telah melakukan pembayaran untuk pesanan #' . $pesanan->id . ' (' . $pesanan->judul . ') sebesar Rp ' . number_format($pesanan->harga_penawaran, 0, ',', '.') . '. Silakan segera mulai bekerja.',
                'unread' => true
            ]);
        }

        return response()->json([
            'status' => 'Sukses',
            'is_simulation' => true,
            'message' => 'Pembayaran (simulasi saldo) berhasil dilakukan! Uang ditahan oleh sistem escrow.',
            'saldo_sekarang' => $user ? $user->saldo : null
        ], 200);
    }

    /**
     * Bypass Midtrans (Developer Only) untuk localhost
     */
    public function bypassMidtrans($id)
    {
        $pesanan = Pesanan::find($id);
        if (!$pesanan) {
            return response()->json(['message' => 'Pesanan tidak ditemukan'], 404);
        }
        
        $pesanan->status = 'menunggu_pengerjaan';
        $pesanan->save();

        // Buat record Escrow
        Escrow::create([
            'pesanan_id' => $pesanan->id,
            'jumlah_bayar' => $pesanan->harga_penawaran,
            'tipe_pembayaran' => 'full',
            'status_escrow' => 'ditahan'
        ]);

        // Tambahkan chat sistem untuk notifikasi di room chat
        $chat = \App\Models\Chat::where('pesanan_id', $pesanan->id)->first();
        if ($chat) {
            \App\Models\Message::create([
                'chat_id' => $chat->id,
                'sender_type' => 'system',
                'sender_id' => null,
                'message_type' => 'text',
                'text' => 'Pembayaran telah berhasil dikonfirmasi sebesar Rp ' . number_format($pesanan->harga_penawaran, 0, ',', '.') . '. Tukang akan segera memulai pekerjaan.',
            ]);
        }

        return response()->json(['status' => 'Sukses', 'message' => 'Pembayaran berhasil dikonfirmasi (Bypass Dev)']);
    }

    /**
     * Handle Webhook Notification dari Midtrans
     */
    public function handleMidtransNotification(Request $request)
    {
        $payload = $request->all();
        
        $serverKey = env('MIDTRANS_SERVER_KEY');
        if (!$serverKey) {
            return response()->json(['message' => 'Server key not configured'], 500);
        }

        // Verifikasi keaslian signature key dari Midtrans
        $signature = hash("sha512", $payload['order_id'] . $payload['status_code'] . $payload['gross_amount'] . $serverKey);
        if ($signature !== $payload['signature_key']) {
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        // Ambil ID pesanan dari string order_id Midtrans (TKG-ORDER-{id}-timestamp)
        $orderIdParts = explode('-', $payload['order_id']);
        $pesananId = $orderIdParts[2] ?? null;

        $pesanan = Pesanan::find($pesananId);
        if (!$pesanan) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $transactionStatus = $payload['transaction_status'];

        if ($transactionStatus == 'capture' || $transactionStatus == 'settlement') {
            // Pembayaran Berhasil!
            $pesanan->status = 'menunggu_pengerjaan';
            $pesanan->save();

            // Buat record Escrow
            Escrow::create([
                'pesanan_id' => $pesanan->id,
                'jumlah_bayar' => $pesanan->harga_penawaran,
                'tipe_pembayaran' => 'full',
                'status_escrow' => 'ditahan'
            ]);

            // Buat notifikasi transaksi untuk pelanggan (user)
            \App\Models\Notification::create([
                'user_id' => $pesanan->user_id,
                'category' => 'transaksi',
                'title' => 'Pembayaran Berhasil',
                'message' => 'Pembayaran untuk pesanan #' . $pesanan->id . ' (' . $pesanan->judul . ') telah dikonfirmasi via Midtrans sebesar Rp ' . number_format($pesanan->harga_penawaran, 0, ',', '.') . '.',
                'unread' => true
            ]);

            // Buat notifikasi transaksi untuk tukang
            if ($pesanan->tukang) {
                \App\Models\Notification::create([
                    'user_id' => $pesanan->tukang->user_id,
                    'category' => 'transaksi',
                    'title' => 'Pembayaran Berhasil',
                    'message' => 'Pelanggan telah melakukan pembayaran untuk pesanan #' . $pesanan->id . ' (' . $pesanan->judul . ') sebesar Rp ' . number_format($pesanan->harga_penawaran, 0, ',', '.') . '. Silakan segera mulai bekerja.',
                    'unread' => true
                ]);
            }
        } else if ($transactionStatus == 'deny' || $transactionStatus == 'expire' || $transactionStatus == 'cancel') {
            // Pembayaran gagal/batal/kedaluwarsa
            $pesanan->status = 'menunggu_persetujuan';
            $pesanan->save();
        }

        return response()->json(['message' => 'Webhook processed successfully']);
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
            'foto_lampiran' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'tanggal_kunjungan' => 'nullable|string',
            'jam_kunjungan' => 'nullable|string',
            'metode_pembayaran' => 'nullable|string',
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
            'tanggal_kunjungan' => $request->tanggal_kunjungan,
            'jam_kunjungan' => $request->jam_kunjungan,
            'metode_pembayaran' => $request->metode_pembayaran,
        ]);

        if ($pesanan->tukang_id) {
            $tukang = \App\Models\Tukang::find($pesanan->tukang_id);
            if ($tukang) {
                \App\Models\Notification::create([
                    'user_id' => $tukang->user_id,
                    'category' => 'transaksi',
                    'title' => 'Pesanan Baru Tersedia',
                    'message' => $pesanan->kategori_layanan . ' - ' . $pesanan->judul . ' membutuhkan penawaran jasa Anda segera.',
                    'unread' => true
                ]);
            }
        }

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
        $tukangId = $request->query('tukang_id');

        // Load marketplace orders OR direct orders assigned to this Tukang
        $query = Pesanan::where(function($q) use ($tukangId) {
            $q->whereNull('tukang_id')->where('status', 'menunggu');
            if ($tukangId) {
                $q->orWhere('tukang_id', $tukangId)->whereIn('status', ['menunggu', 'menunggu_penawaran']);
            }
        });

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
                  ->whereRaw("{$haversine} <= ?", [$radius])
                  ->orderBy('jarak', 'asc');
        } else {
            $query->latest();
        }

        $pesanan = $query->with(['user', 'chat'])->get();

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
