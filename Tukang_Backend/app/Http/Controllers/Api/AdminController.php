<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Tukang;
use App\Models\Ulasan;
use Illuminate\Support\Facades\DB;
use App\Models\Dispute;
use App\Models\Escrow;
use App\Models\Pesanan;

class AdminController extends Controller
{
    public function getDashboardStats()
    {
        $pendingCount = Tukang::where('status_verifikasi', 'Menunggu')->count();
        $activeCount = Tukang::where('is_aktif', true)->count();
        $inactiveCount = Tukang::where('is_aktif', false)->where('status_verifikasi', '!=', 'Menunggu')->count();
        $problemCount = Tukang::where('rating', '<', 4.0)->where('is_aktif', true)->count();
        
        $totalPelanggan = \App\Models\User::where('role', 'user')->count();
        $activeOrders = \App\Models\Pesanan::whereNotIn('status', ['selesai', 'dibatalkan', 'ditolak'])->count();
        $completedOrders = \App\Models\Pesanan::where('status', 'selesai')->count();
        $platformRevenue = \App\Models\Pesanan::where('status', 'selesai')->sum('harga_penawaran') ?? 0;
        $incomingReports = \App\Models\Dispute::where('status_dispute', 'pending')->count();
        
        $recentVerifications = Tukang::where('status_verifikasi', 'Menunggu')
                                     ->orderBy('created_at', 'desc')
                                     ->limit(5)
                                     ->get();

        // Fetch dynamic activities
        $activities = [];
        
        $recentUsers = \App\Models\User::orderBy('created_at', 'desc')->limit(3)->get();
        foreach ($recentUsers as $u) {
            $activities[] = [
                'id' => 'u_' . $u->id,
                'text' => 'Pelanggan ' . $u->name . ' mendaftar ke platform',
                'time' => $u->created_at ? $u->created_at->diffForHumans() : 'Baru saja',
                'icon' => 'group',
                'color' => 'text-green-400 bg-green-500/10',
                'timestamp' => $u->created_at ? $u->created_at->timestamp : 0
            ];
        }

        $recentTukangs = Tukang::where('status_verifikasi', 'Aktif')->orderBy('updated_at', 'desc')->limit(3)->get();
        foreach ($recentTukangs as $t) {
            $activities[] = [
                'id' => 't_' . $t->id,
                'text' => 'Mitra Tukang ' . $t->nama . ' berhasil diverifikasi',
                'time' => $t->updated_at ? $t->updated_at->diffForHumans() : 'Baru saja',
                'icon' => 'verified',
                'color' => 'text-secondary bg-secondary/10',
                'timestamp' => $t->updated_at ? $t->updated_at->timestamp : 0
            ];
        }

        $recentOrders = \App\Models\Pesanan::with('user')->orderBy('created_at', 'desc')->limit(3)->get();
        foreach ($recentOrders as $o) {
            $activities[] = [
                'id' => 'o_' . $o->id,
                'text' => 'Pesanan baru masuk dari ' . ($o->user->name ?? 'Pelanggan') . ' untuk ' . $o->kategori_layanan,
                'time' => $o->created_at ? $o->created_at->diffForHumans() : 'Baru saja',
                'icon' => 'pending_actions',
                'color' => 'text-blue-400 bg-blue-500/10',
                'timestamp' => $o->created_at ? $o->created_at->timestamp : 0
            ];
        }

        // Sort activities by timestamp descending
        usort($activities, function($a, $b) {
            return $b['timestamp'] <=> $a['timestamp'];
        });
        $activities = array_slice($activities, 0, 6);

        // Fetch dynamic customer stats
        $customerStats = [
            'total' => $totalPelanggan,
            'newThisWeek' => \App\Models\User::where('role', 'user')->where('created_at', '>=', now()->subWeek())->count(),
            'activeToday' => \App\Models\User::where('role', 'user')->where('updated_at', '>=', now()->subDay())->count(),
            'neverOrdered' => \App\Models\User::where('role', 'user')->doesntHave('pesanans')->count(),
            'mostActive' => \App\Models\User::where('role', 'user')->withCount('pesanans')->orderBy('pesanans_count', 'desc')->first()->name ?? '-'
        ];

        // Fetch dynamic order stats
        $totalOrders = \App\Models\Pesanan::count();
        $orderStats = [
            'new' => \App\Models\Pesanan::where('status', 'menunggu')->count(),
            'processing' => \App\Models\Pesanan::whereIn('status', ['menunggu_pengerjaan', 'proses_pengerjaan'])->count(),
            'pendingPayment' => \App\Models\Pesanan::where('status', 'menunggu_pembayaran')->count(),
            'completed' => $completedOrders,
            'cancelled' => \App\Models\Pesanan::whereIn('status', ['dibatalkan', 'ditolak'])->count(),
            'total' => $totalOrders > 0 ? $totalOrders : 1
        ];

        // Fetch top categories
        $categoriesData = \App\Models\Pesanan::selectRaw('kategori_layanan, count(*) as count')
            ->groupBy('kategori_layanan')
            ->orderBy('count', 'desc')
            ->limit(5)
            ->get();
        $categories = $categoriesData->map(function($cat) use ($totalOrders) {
            return [
                'name' => $cat->kategori_layanan,
                'count' => $cat->count,
                'percentage' => round(($cat->count / ($totalOrders > 0 ? $totalOrders : 1)) * 100)
            ];
        });

        // Fetch top tukang
        $topTukangs = Tukang::withCount('pesanans')
            ->orderBy('rating', 'desc')
            ->orderBy('pesanans_count', 'desc')
            ->limit(3)
            ->get();
        $topTukangList = $topTukangs->map(function($t) {
            return [
                'name' => $t->nama,
                'specialty' => $t->keahlian,
                'orders' => $t->pesanans_count,
                'rating' => (float)$t->rating,
                'revenue' => $t->saldo ?? 0,
                'avatar' => $t->foto_profil ? (str_starts_with($t->foto_profil, 'http') ? $t->foto_profil : asset('storage/' . $t->foto_profil)) : "https://ui-avatars.com/api/?name=" . urlencode($t->nama),
                'online' => $t->is_aktif
            ];
        });

        // Fetch top pelanggan
        $topUsers = \App\Models\User::where('role', 'user')
            ->withCount('pesanans')
            ->orderBy('pesanans_count', 'desc')
            ->limit(3)
            ->get();
        $topPelangganList = $topUsers->map(function($u) {
            return [
                'name' => $u->name,
                'orders' => $u->pesanans_count,
                'spending' => \App\Models\Pesanan::where('user_id', $u->id)->where('status', 'selesai')->sum('harga_penawaran') ?? 0,
                'lastActive' => $u->updated_at ? $u->updated_at->diffForHumans() : '-',
                'avatar' => "https://ui-avatars.com/api/?name=" . urlencode($u->name)
            ];
        });

        // Compute Growth Stats for last 6 months
        $growthStats = [
            'labels' => [],
            'pelanggan' => [],
            'tukang' => []
        ];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthName = strtoupper($date->translatedFormat('M'));
            $growthStats['labels'][] = $monthName;
            
            $endOfMonth = $date->copy()->endOfMonth();
            $growthStats['pelanggan'][] = \App\Models\User::where('role', 'user')->where('created_at', '<=', $endOfMonth)->count();
            $growthStats['tukang'][] = Tukang::where('created_at', '<=', $endOfMonth)->count();
        }
                                     
        return response()->json([
            'status' => 'Sukses',
            'data' => [
                'pendingCount' => $pendingCount,
                'activeCount' => $activeCount,
                'inactiveCount' => $inactiveCount,
                'problemCount' => $problemCount,
                'totalPelanggan' => $totalPelanggan,
                'activeOrders' => $activeOrders,
                'completedOrders' => $completedOrders,
                'platformRevenue' => $platformRevenue,
                'incomingReports' => $incomingReports,
                'recentVerifications' => $recentVerifications,
                'recentActivities' => $activities,
                'customerStats' => $customerStats,
                'orderStats' => $orderStats,
                'categories' => $categories,
                'topTukang' => $topTukangList,
                'topPelanggan' => $topPelangganList,
                'growthStats' => $growthStats
            ]
        ]);
    }

    public function getVerifications()
    {
        $verifications = Tukang::where('status_verifikasi', 'Menunggu')
                               ->orderBy('created_at', 'desc')
                               ->get();
                               
        return response()->json([
            'status' => 'Sukses',
            'data' => $verifications
        ]);
    }

    public function verifyTukang(Request $request, $id)
    {
        $tukang = Tukang::findOrFail($id);
        
        $request->validate([
            'action' => 'required|in:approve,reject',
            'reason' => 'nullable|string'
        ]);
        
        if ($request->action === 'approve') {
            $tukang->status_verifikasi = 'Aktif';
            $tukang->is_aktif = true;
            
            // Buat notifikasi sistem untuk Tukang
            \App\Models\Notification::create([
                'user_id' => $tukang->user_id,
                'category' => 'sistem',
                'title' => 'Verifikasi Berhasil',
                'message' => 'Dokumen KTP dan Sertifikat keahlian Anda telah diverifikasi oleh tim TukangAja.',
                'unread' => true
            ]);
        } else {
            $tukang->status_verifikasi = 'Ditolak';
            $tukang->is_aktif = false;
        }
        
        $tukang->save();
        
        return response()->json([
            'status' => 'Sukses',
            'message' => 'Verifikasi berhasil diproses',
            'data' => $tukang
        ]);
    }

    public function getAllTukang()
    {
        $tukangs = Tukang::orderBy('created_at', 'desc')->get();
        return response()->json([
            'status' => 'Sukses',
            'data' => $tukangs
        ]);
    }

    public function toggleTukangStatus($id)
    {
        $tukang = Tukang::findOrFail($id);
        
        if ($tukang->is_aktif) {
            $tukang->is_aktif = false;
            $tukang->status_verifikasi = 'Tidak Aktif';
        } else {
            $tukang->is_aktif = true;
            $tukang->status_verifikasi = 'Aktif';
        }
        $tukang->save();
        
        return response()->json([
            'status' => 'Sukses',
            'message' => 'Status Tukang berhasil diubah',
            'data' => $tukang
        ]);
    }

    public function getAllPelanggan()
    {
        $pelanggans = \App\Models\User::where('role', 'user')
            ->withCount('pesanans')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($u) {
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'no_hp' => $u->no_hp,
                    'alamat' => $u->alamat,
                    'is_active' => true, // Default to true since no is_active column exists yet
                    'transaksi_count' => $u->pesanans_count,
                    'total_spending' => \App\Models\Pesanan::where('user_id', $u->id)->where('status', 'selesai')->sum('harga_penawaran') ?? 0,
                    'created_at' => $u->created_at,
                    'avatar' => $u->foto_profil
                ];
            });

        return response()->json([
            'status' => 'Sukses',
            'data' => $pelanggans
        ]);
    }

    public function togglePelangganStatus($id)
    {
        // Because User model doesn't have an is_active column for now, we just mock the success.
        // If you add is_active to users table, you can uncomment the logic below:
        /*
        $user = \App\Models\User::findOrFail($id);
        $user->is_active = !$user->is_active;
        $user->save();
        */
        
        return response()->json([
            'status' => 'Sukses',
            'message' => 'Status Pelanggan berhasil diubah'
        ]);
    }

    public function deletePelanggan($id)
    {
        $user = \App\Models\User::findOrFail($id);
        
        DB::beginTransaction();
        try {
            $user->pesanans()->delete();
            $user->ulasan()->delete();
            $user->delete();
            DB::commit();

            return response()->json([
                'status' => 'Sukses',
                'message' => 'Akun Pelanggan berhasil dihapus permanen'
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'status' => 'Gagal',
                'message' => 'Gagal menghapus akun: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getMonitoring()
    {
        $averageRating = Tukang::where('is_aktif', true)->avg('rating') ?? 0;
        $totalReviews = Ulasan::count();
        $problematicTukang = Tukang::where('rating', '<', 4.0)->where('is_aktif', true)->count();
        
        $performances = Tukang::withCount('ulasans')
                              ->orderBy('rating', 'asc')
                              ->get();
                              
        return response()->json([
            'status' => 'Sukses',
            'data' => [
                'averageRating' => round($averageRating, 1),
                'totalReviews' => $totalReviews,
                'problematicCount' => $problematicTukang,
                'performances' => $performances
            ]
        ]);
    }

    public function getDisputes()
    {
        $disputes = Dispute::with(['pesanan.user', 'pesanan.tukang'])->orderBy('created_at', 'desc')->get();
        return response()->json([
            'status' => 'Sukses',
            'data' => $disputes
        ]);
    }

    public function resolveDispute(Request $request, $id)
    {
        $dispute = Dispute::findOrFail($id);
        $request->validate([
            'keputusan' => 'required|in:refund_pelanggan,bayar_tukang',
            'catatan_admin' => 'nullable|string'
        ]);

        $pesanan = Pesanan::findOrFail($dispute->pesanan_id);
        $escrow = Escrow::where('pesanan_id', $pesanan->id)->first();

        DB::beginTransaction();
        try {
            $dispute->status_dispute = 'resolved';
            $dispute->keputusan_admin = $request->keputusan;
            $dispute->catatan_admin = $request->catatan_admin;
            $dispute->save();

            if ($request->keputusan === 'refund_pelanggan') {
                if ($escrow) {
                    $escrow->status = 'refunded';
                    $escrow->save();
                }
                $pesanan->status = 'dibatalkan';
                // Refund logic (simulated)
            } else if ($request->keputusan === 'bayar_tukang') {
                if ($escrow) {
                    $escrow->status = 'released';
                    $escrow->save();
                }
                $pesanan->status = 'selesai';
                
                // Add balance to Tukang
                $tukang = Tukang::find($pesanan->tukang_id);
                if ($tukang && $pesanan->harga_penawaran) {
                    $tukang->saldo = ($tukang->saldo ?? 0) + $pesanan->harga_penawaran;
                    $tukang->save();
                }
            }
            $pesanan->save();
            DB::commit();

            return response()->json([
                'status' => 'Sukses',
                'message' => 'Dispute berhasil diselesaikan.',
                'data' => $dispute
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'status' => 'Gagal',
                'message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()
            ], 500);
        }
    }

    public function deleteTukang($id)
    {
        $tukang = Tukang::findOrFail($id);
        $user = \App\Models\User::find($tukang->user_id);

        DB::beginTransaction();
        try {
            // Delete related records (portfolios, certifications, etc.) if any cascading delete is not set
            $tukang->portofolios()->delete();
            $tukang->sertifikats()->delete();
            $tukang->layanans()->delete();
            
            // Delete the Tukang record
            $tukang->delete();

            // Delete the User record
            if ($user) {
                $user->delete();
            }

            DB::commit();
            return response()->json([
                'status' => 'Sukses',
                'message' => 'Akun Tukang dan data terkait berhasil dihapus permanen'
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'status' => 'Gagal',
                'message' => 'Gagal menghapus akun: ' . $e->getMessage()
            ], 500);
        }
    }
}
