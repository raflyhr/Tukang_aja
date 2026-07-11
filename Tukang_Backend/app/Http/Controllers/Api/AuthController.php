<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Tukang;
use Illuminate\Support\Facades\Hash;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\WebpEncoder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use App\Services\SupabaseStorageService;

class AuthController extends Controller
{
    /**
     * API Universal untuk Login (Admin, Tukang, Pelanggan)
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau Password salah.'
            ], 401);
        }

        // Bikin token Sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil sebagai ' . $user->role,
            'access_token' => $token,
            'token_type' => 'Bearer',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'foto_profil' => $user->foto_profil,
                    'latitude' => $user->latitude,
                    'longitude' => $user->longitude,
                    'alamat' => $user->alamat,
                    'no_hp' => $user->no_hp
                ],
                'tukang' => $user->role === 'tukang' ? $user->tukang : null
            ]
        ], 200);
    }

    /**
     * API untuk Register (Daftar) Tukang Baru.
     */
    public function registerTukang(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'no_hp' => 'required|string|max:20',
            'email' => 'required|string|email|max:255|unique:roles',
            'password' => 'required|string|min:8|confirmed',
            'keahlian' => 'nullable|string',
            'alamat' => 'required|string',
            // Field tambahan 
            'keahlian_tambahan' => 'nullable|string',
            'tahun_pengalaman' => 'required|integer|min:0',
            'deskripsi_pengalaman' => 'required|string',
            // Lokasi (otomatis dari peta, bukan diketik user)
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            // Upload file (semua wajib diisi saat register)
            'foto_profil' => 'required|image|mimes:jpg,jpeg,png|max:2048',
            'nik' => 'required|string|size:16|unique:tukangs,nik',
            'cv_portofolio' => 'required|file|mimes:pdf|max:5120',
        ]);

        // 1. Handle upload file (coba Supabase dulu, fallback ke local storage)
        $fotoProfilPath = null;
        if ($request->hasFile('foto_profil')) {
            $filename = Str::random(40) . '.webp';
            $storagePath = 'tukang/profil/' . $filename;

            if (extension_loaded('gd')) {
                $manager = new ImageManager(new Driver());
                $image = $manager->decode($request->file('foto_profil'));
                $image->scaleDown(width: 300);
                $encoded = $image->encode(new WebpEncoder(5));
                $fileContent = (string) $encoded;
            } else {
                $fileContent = file_get_contents($request->file('foto_profil')->getRealPath());
            }

            // Coba upload ke Supabase
            $supabase = new SupabaseStorageService();
            $publicUrl = $supabase->upload($fileContent, $storagePath, 'image/webp');

            if ($publicUrl) {
                // Supabase berhasil, simpan URL publik langsung
                $fotoProfilPath = $publicUrl;
            } else {
                // Supabase gagal, fallback ke local storage
                Storage::disk('public')->put($storagePath, $fileContent);
                $fotoProfilPath = $storagePath;
            }
        }

        $cvPath = null;
        if ($request->hasFile('cv_portofolio')) {
            $cvPath = $request->file('cv_portofolio')->store('tukang/cv', 'public');
        }

        // 2. Bikin akun User (buat login)
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'tukang',
            'no_hp' => $request->no_hp,
            'alamat' => $request->alamat,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'foto_profil' => $fotoProfilPath,
        ]);

        // 3. Bikin profil Tukang (buat nampung data kerjaan)
        $tukang = Tukang::create([
            'user_id' => $user->id,
            'nama' => $request->name,
            'no_hp' => $request->no_hp,
            'alamat' => $request->alamat,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'keahlian' => $request->keahlian ?? 'Belum memilih',
            'keahlian_tambahan' => $request->keahlian_tambahan,
            'tahun_pengalaman' => $request->tahun_pengalaman ?? 0,
            'deskripsi_pengalaman' => $request->deskripsi_pengalaman,
            'foto_profil' => $fotoProfilPath,
            'nik' => $request->nik,
            'cv_portofolio' => $cvPath,
        ]);

        // 4. Bikinin Token Akses
        $token = $user->createToken('auth_token_tukang')->plainTextToken;

        return response()->json([
            'message' => 'Registrasi Tukang Berhasil!',
            'data' => [
                'user' => $user,
                'tukang' => $tukang
            ],
            'access_token' => $token,
            'token_type' => 'Bearer'
        ], 201);
    }

    /**
     * API untuk Login Tukang.
     */
    public function loginTukang(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        // Cek email ada atau nggak
        $user = User::where('email', $request->email)->first();

        // Kalo email ga ketemu atau password salah
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email atau Password salah!'
            ], 401);
        }

        // Kalo dia bukan tukang (misal pelanggan nyasar login di aplikasi tukang)
        if ($user->role !== 'tukang') {
            return response()->json([
                'message' => 'Akses ditolak! Anda bukan Tukang.'
            ], 403);
        }

        // Bikinin Token Akses baru
        $token = $user->createToken('auth_token_tukang')->plainTextToken;

        return response()->json([
            'message' => 'Login Berhasil!',
            'data' => [
                'user' => $user,
                'tukang' => $user->tukang
            ],
            'access_token' => $token,
            'token_type' => 'Bearer'
        ], 200);
    }

    /**
     * API untuk Register (Daftar) Pelanggan / User Biasa.
     */
    public function registerUser(Request $request)
{
    $request->validate([
        'name' => 'required|string|max:255',
        'no_hp' => 'required|string|max:20',
        'email' => 'required|string|email|max:255|unique:roles',
        'password' => 'required|string|min:8|confirmed',
        'alamat' => 'required|string',
        'latitude' => 'required|numeric',
        'longitude' => 'required|numeric',
        'catatan' => 'nullable|string',
        'foto_profil' => 'nullable|image|mimes:jpg,jpeg,png|max:5120',
    ]);

    $fotoProfilPath = null;
    if ($request->hasFile('foto_profil')) {
        $filename = Str::random(40) . '.webp';
        $storagePath = 'pelanggan/profil/' . $filename;

        if (extension_loaded('gd')) {
            $manager = new ImageManager(new Driver());
            $image = $manager->read($request->file('foto_profil'));
            $image->scaleDown(width: 300);
            $fileContent = (string) $image->toWebp(5);
        } else {
            $fileContent = file_get_contents($request->file('foto_profil')->getRealPath());
        }

        // Coba upload ke Supabase
        $supabase = new SupabaseStorageService();
        $publicUrl = $supabase->upload($fileContent, $storagePath, 'image/webp');

        if ($publicUrl) {
            // Supabase berhasil, simpan URL publik langsung
            $fotoProfilPath = $publicUrl;
        } else {
            // Supabase gagal, fallback ke local storage
            Storage::disk('public')->put($storagePath, $fileContent);
            $fotoProfilPath = $storagePath;
        }
    }

    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => Hash::make($request->password),
        'role' => 'user',
        'no_hp' => $request->no_hp,
        'alamat' => $request->alamat,
        'latitude' => $request->latitude,
        'longitude' => $request->longitude,
        'catatan' => $request->catatan,
        'foto_profil' => $fotoProfilPath,
    ]);

    $token = $user->createToken('auth_token_user')->plainTextToken;

    return response()->json([
        'success' => true,
        'message' => 'Registrasi Pelanggan Berhasil!',
        'data' => $user,
        'access_token' => $token,
        'token_type' => 'Bearer'
    ], 201);
}

    /**
     * API untuk Login Pelanggan / User Biasa.
     */
    public function loginUser(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email atau Password salah!'
            ], 401);
        }

        // Pastikan yang login bukan Tukang (kalo mau dipisah tegas)
        if ($user->role === 'tukang') {
            return response()->json([
                'message' => 'Akun ini adalah akun Tukang. Silakan login di portal Tukang.'
            ], 403);
        }

        $token = $user->createToken('auth_token_user')->plainTextToken;

        return response()->json([
            'message' => 'Login Pelanggan Berhasil!',
            'data' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer'
        ], 200);
    }

    /**
     * API untuk Login Admin.
     */
    public function loginAdmin(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email atau Password salah!'
            ], 401);
        }

        // Pastikan yang login adalah Admin
        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'Akses ditolak! Anda bukan Admin.'
            ], 403);
        }

        $token = $user->createToken('auth_token_admin')->plainTextToken;

        return response()->json([
            'message' => 'Login Admin Berhasil!',
            'data' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer'
        ], 200);
    }
}
