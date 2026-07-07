<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SertifikatTukang extends Model
{
    protected $fillable = ['tukang_id', 'judul', 'penerbit', 'tahun', 'deskripsi'];

    public function tukang()
    {
        return $this->belongsTo(Tukang::class);
    }
}
