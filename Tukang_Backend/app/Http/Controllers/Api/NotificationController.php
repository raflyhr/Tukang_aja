<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Notification;

class NotificationController extends Controller
{
    // Ambil daftar notifikasi berdasarkan user_id
    public function index($user_id)
    {
        $notifications = Notification::where('user_id', $user_id)
            ->latest()
            ->get();

        return response()->json([
            'status' => 'Sukses',
            'data' => $notifications
        ], 200);
    }

    // Tandai semua notifikasi user sebagai terbaca
    public function markAllRead($user_id)
    {
        Notification::where('user_id', $user_id)
            ->update(['unread' => false]);

        return response()->json([
            'status' => 'Sukses',
            'message' => 'Semua notifikasi ditandai sebagai terbaca'
        ], 200);
    }

    // Tandai satu notifikasi (toggle read/unread)
    public function toggleRead($id)
    {
        $notification = Notification::find($id);

        if (!$notification) {
            return response()->json([
                'status' => 'Gagal',
                'message' => 'Notifikasi tidak ditemukan'
            ], 404);
        }

        $notification->unread = !$notification->unread;
        $notification->save();

        return response()->json([
            'status' => 'Sukses',
            'data' => $notification
        ], 200);
    }

    // Hapus satu notifikasi
    public function destroy($id)
    {
        $notification = Notification::find($id);

        if (!$notification) {
            return response()->json([
                'status' => 'Gagal',
                'message' => 'Notifikasi tidak ditemukan'
            ], 404);
        }

        $notification->delete();

        return response()->json([
            'status' => 'Sukses',
            'message' => 'Notifikasi berhasil dihapus'
        ], 200);
    }
}
