<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Tukang;
use Illuminate\Support\Facades\Hash;

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
                    'role' => $user->role
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
            'keahlian' => 'required|string',
            'alamat' => 'required|string',
            // Field tambahan 
            'keahlian_tambahan' => 'required|string',
            'tahun_pengalaman' => 'required|integer|min:0',
            'deskripsi_pengalaman' => 'required|string',
            // Lokasi (otomatis dari peta, bukan diketik user)
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            // Upload file (semua wajib diisi saat register)
            'foto_profil' => 'required|image|mimes:jpg,jpeg,png|max:2048',
            'foto_ktp' => 'required|file|mimes:pdf|max:5120',
            'cv_portofolio' => 'required|file|mimes:pdf|max:5120',
        ]);

        // 1. Bikin akun User (buat login)
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'tukang',
        ]);

        // 2. Handle upload file (simpan ke folder storage/app/public/...)
        $fotoProfilPath = null;
        if ($request->hasFile('foto_profil')) {
            $fotoProfilPath = $request->file('foto_profil')->store('tukang/profil', 'public');
        }

        $fotoKtpPath = null;
        if ($request->hasFile('foto_ktp')) {
            $fotoKtpPath = $request->file('foto_ktp')->store('tukang/ktp', 'public');
        }

        $cvPath = null;
        if ($request->hasFile('cv_portofolio')) {
            $cvPath = $request->file('cv_portofolio')->store('tukang/cv', 'public');
        }

        // 3. Bikin profil Tukang (buat nampung data kerjaan)
        $tukang = Tukang::create([
            'user_id' => $user->id,
            'nama' => $request->name,
            'no_hp' => $request->no_hp,
            'alamat' => $request->alamat,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'keahlian' => $request->keahlian,
            'keahlian_tambahan' => $request->keahlian_tambahan,
            'tahun_pengalaman' => $request->tahun_pengalaman ?? 0,
            'deskripsi_pengalaman' => $request->deskripsi_pengalaman,
            'foto_profil' => $fotoProfilPath,
            'foto_ktp' => $fotoKtpPath,
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
    ]);

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
