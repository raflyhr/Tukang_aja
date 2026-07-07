<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    protected $fillable = ['user_id', 'tukang_id', 'pesanan_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tukang()
    {
        return $this->belongsTo(Tukang::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function pesanan()
    {
        return $this->belongsTo(Pesanan::class);
    }
}
