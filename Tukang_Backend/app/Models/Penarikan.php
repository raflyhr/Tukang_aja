<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Penarikan extends Model
{
    use HasFactory;

    protected $fillable = [
        'tukang_id',
        'jumlah_tarik',
        'rekening_tujuan',
        'status',
    ];

    public function tukang()
    {
        return $this->belongsTo(Tukang::class);
    }
}
