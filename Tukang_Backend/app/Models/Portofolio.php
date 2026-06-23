<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Portofolio extends Model
{
    protected $fillable = [
        'tukang_id',
        'judul',
        'deskripsi',
        'foto_url'
    ];

    public function tukang()
    {
        return $this->belongsTo(Tukang::class);
    }
}
