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
        
        $recentVerifications = Tukang::where('status_verifikasi', 'Menunggu')
                                     ->orderBy('created_at', 'desc')
                                     ->limit(5)
                                     ->get();
                                     
        return response()->json([
            'status' => 'Sukses',
            'data' => [
                'pendingCount' => $pendingCount,
                'activeCount' => $activeCount,
                'inactiveCount' => $inactiveCount,
                'problemCount' => $problemCount,
                'recentVerifications' => $recentVerifications
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
