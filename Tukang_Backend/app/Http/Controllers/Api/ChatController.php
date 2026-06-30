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
}
