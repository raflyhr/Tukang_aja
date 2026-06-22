<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pesanan extends Model
{
     // 1. Daftarin kolom mana aja yang boleh diisi
    protected $fillable = [
        'user_id',
        'tukang_id',
        'deskripsi_masalah',
        'harga_penawaran',
        'status',
        'alasan_penolakan'
    ];
    // 2. Kasih tau tali pengikat ke User (Pelanggan)
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function tukang()
    {
        return $this->belongsTo(Tukang::class);
    }
}
