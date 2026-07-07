<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Chat;
use App\Models\Message;

class ChatController extends Controller
{
    // Mengambil daftar percakapan untuk tukang
    public function getTukangChats($tukang_id)
    {
        $chats = Chat::with(['user', 'messages' => function($q) {
            $q->latest()->limit(1);
        }])->where('tukang_id', $tukang_id)->latest()->get();

        return response()->json([
            'status' => 'Sukses',
            'data' => $chats
        ], 200);
    }

    // Mengambil daftar percakapan untuk pelanggan
    public function getUserChats($user_id)
    {
        $chats = Chat::with(['tukang', 'messages' => function($q) {
            $q->latest()->limit(1);
        }])->where('user_id', $user_id)->latest()->get();

        return response()->json([
            'status' => 'Sukses',
            'data' => $chats
        ], 200);
    }

    // Mengambil isi pesan dalam satu chat
    public function getMessages($chat_id)
    {
        $messages = Message::where('chat_id', $chat_id)->oldest()->get();
        return response()->json([
            'status' => 'Sukses',
            'data' => $messages
        ], 200);
    }

    // Mengirim pesan baru
    public function sendMessage(Request $request)
    {
        $request->validate([
            'chat_id' => 'required|exists:chats,id',
            'sender_type' => 'required|in:user,tukang,system',
            'sender_id' => 'required|integer',
            'text' => 'required|string',
            'message_type' => 'nullable|string'
        ]);

        $message = Message::create([
            'chat_id' => $request->chat_id,
            'sender_type' => $request->sender_type,
            'sender_id' => $request->sender_id,
            'text' => $request->text,
            'message_type' => $request->message_type ?? 'text',
            'metadata' => $request->metadata ?? null
        ]);

        // Update updated_at di tabel chats
        Chat::where('id', $request->chat_id)->update(['updated_at' => now()]);

        return response()->json([
            'status' => 'Sukses',
            'message' => 'Pesan terkirim',
            'data' => $message
        ], 201);
    }

    // Memulai obrolan baru atau mendapatkan yang sudah ada
    public function startChat(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:roles,id',
            'tukang_id' => 'required|exists:tukangs,id',
            'pesanan_id' => 'nullable|exists:pesanans,id'
        ]);

        $query = Chat::where('user_id', $request->user_id)
            ->where('tukang_id', $request->tukang_id);

        if ($request->has('pesanan_id') && $request->pesanan_id !== null) {
            $query->where('pesanan_id', $request->pesanan_id);
        }

        $chat = $query->first();

        if (!$chat) {
            $chat = Chat::create([
                'user_id' => $request->user_id,
                'tukang_id' => $request->tukang_id,
                'pesanan_id' => $request->pesanan_id
            ]);
        }

        // Load relationships
        $chat->load(['user', 'tukang', 'messages']);

        return response()->json([
            'status' => 'Sukses',
            'message' => 'Obrolan berhasil dimulai',
            'data' => $chat
        ], 200);
    }

    // Menghapus obrolan
    public function destroy($chat_id)
    {
        $chat = Chat::find($chat_id);
        if (!$chat) {
            return response()->json([
                'status' => 'Gagal',
                'message' => 'Obrolan tidak ditemukan'
            ], 404);
        }

        // Hapus pesan terkait (meskipun secara default ON DELETE CASCADE di database biasanya menghapus, kita pastikan manual juga bisa)
        Message::where('chat_id', $chat_id)->delete();
        $chat->delete();

        return response()->json([
            'status' => 'Sukses',
            'message' => 'Obrolan berhasil dihapus'
        ], 200);
    }
}