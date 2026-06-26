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
     * API untuk Register (Daftar) Tukang Baru.
     */
    public function registerTukang(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'no_hp' => 'required|string|max:20',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'keahlian' => 'required|string',
            'alamat' => 'required|string',
        ]);

        // 1. Bikin akun User (buat login)
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'tukang',
        ]);

        // 2. Bikin profil Tukang (buat nampung data kerjaan)
        $tukang = Tukang::create([
            'user_id' => $user->id,
            'nama' => $request->name,
            'no_hp' => $request->no_hp,
            'alamat' => $request->alamat,
            'keahlian' => $request->keahlian,
        ]);

        // 3. Bikinin Token Akses
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
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'user', // Role sebagai pelanggan biasa
        ]);

        $token = $user->createToken('auth_token_user')->plainTextToken;

        return response()->json([
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
