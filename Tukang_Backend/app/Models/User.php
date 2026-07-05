<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{

    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'roles';


  protected $fillable = [
    'name',
    'email',
    'password',
    'role',
    'no_hp',
    'alamat',
    'latitude',
    'longitude',
    'catatan',
    'foto_profil',
];

    public function tukang()
    {
        return $this->hasOne(Tukang::class);
    }


    protected $hidden = [

        'password',
        'remember_token',

    ];


    protected function casts(): array
    {
        return [

            'email_verified_at' => 'datetime',
            'password' => 'hashed',

        ];
    }
    public function ulasan()
{
    return $this->hasMany(Ulasan::class);
}

}