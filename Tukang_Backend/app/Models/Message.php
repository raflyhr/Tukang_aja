<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'chat_id',
        'sender_type',
        'sender_id',
        'message_type',
        'text',
        'metadata'
    ];

    protected $casts = [
        'metadata' => 'array'
    ];

    public function chat()
    {
        return $this->belongsTo(Chat::class);
    }
}
