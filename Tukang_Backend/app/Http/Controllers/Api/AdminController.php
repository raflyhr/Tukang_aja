<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Tukang;
use App\Models\Ulasan;
use Illuminate\Support\Facades\DB;

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
}
