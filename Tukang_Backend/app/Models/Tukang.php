<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tukang extends Model
{
    protected $fillable = [
        'user_id',
        'nama',
        'alamat',
        'latitude',
        'longitude',
        'keahlian',
        'keahlian_tambahan',
        'no_hp',
        'foto_profil',
        'tahun_pengalaman',
        'deskripsi_pengalaman',
        'foto_ktp',
        'cv_portofolio',
        'is_aktif',
        'radius_layanan',
        'area_cakupan',
        'saldo',
        'rating',
        'status_verifikasi'
    ];

    protected $casts = [
        'keahlian_tambahan' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function ulasan()
{
    return $this->hasMany(Ulasan::class);
}

public function ulasans()
{
    return $this->hasMany(Ulasan::class);
}

public function portofolios()
{
    return $this->hasMany(Portofolio::class);
}

}
