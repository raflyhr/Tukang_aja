<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LayananTukang extends Model
{
    protected $fillable = ['tukang_id', 'nama_layanan', 'harga', 'satuan', 'deskripsi'];

    public function tukang()
    {
        return $this->belongsTo(Tukang::class);
    }
}
