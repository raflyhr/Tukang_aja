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
        'nik',
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

public function pesanans()
{
    return $this->hasMany(Pesanan::class);
}

public function sertifikats()
{
    return $this->hasMany(SertifikatTukang::class);
}

public function layanans()
{
    return $this->hasMany(LayananTukang::class);
}

public function getFotoProfilAttribute($value)
{
    if (!$value) {
        return null;
    }
    if (str_starts_with($value, 'http')) {
        return $value;
    }
    $baseUrl = rtrim(url('/'), '/');
    if (str_starts_with($value, '/storage/')) {
        return $baseUrl . $value;
    }
    return $baseUrl . '/storage/' . $value;
}

}
