<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tukang extends Model
{
    protected $fillable = [
        'user_id',
        'nama',
        'alamat',
        'keahlian',
        'no_hp',
        'is_aktif',
        'saldo',
        'rating'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
