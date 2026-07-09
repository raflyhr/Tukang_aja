<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pesanan extends Model
{
    protected $fillable = [
        'user_id',
        'tukang_id',
        'deskripsi_masalah',
        'judul',
        'kategori_layanan',
        'latitude',
        'longitude',
        'alamat_lengkap',
        'harga_penawaran',
        'status',
        'alasan_penolakan',
        'foto_lampiran',
        'tanggal_kunjungan',
        'jam_kunjungan',
        'metode_pembayaran'
    ];

    /**
     * Relasi ke model User (Pelanggan)
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi ke model Tukang
     */
    public function tukang()
    {
        return $this->belongsTo(Tukang::class);
    }
    public function ulasan()
    {
        return $this->hasOne(Ulasan::class);
    }
    public function chat()
    {
        return $this->hasOne(Chat::class);
    }
}
