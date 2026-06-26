<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TukangController;
use App\Http\Controllers\Api\PesananController;
use App\Http\Controllers\Api\UlasanController;
use App\Http\Controllers\Api\PortofolioController;
use App\Http\Controllers\Api\PenarikanController;
use App\Http\Controllers\Api\AuthController;

// --- Rute Otentikasi Tukang (Login & Register) ---
Route::post('/auth/tukang/register', [AuthController::class, 'registerTukang']);
Route::post('/auth/tukang/login', [AuthController::class, 'loginTukang']);

// --- Rute Otentikasi Pelanggan / User Biasa ---
Route::post('/auth/user/register', [AuthController::class, 'registerUser']);
Route::post('/auth/user/login', [AuthController::class, 'loginUser']);

// --- Rute Otentikasi Admin ---
Route::post('/auth/admin/login', [AuthController::class, 'loginAdmin']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Rute buat ganti status Tukang
Route::put('/tukang/{id}/status', [TukangController::class, 'update']);
Route::get('/tukang', [TukangController::class, 'index']);
Route::get('/tukang/{id}', [TukangController::class, 'show']);

// --- Rute Fitur Pesanan untuk Tukang ---
Route::get('/tukang/{id}/pesanan', [PesananController::class, 'getPesananTukang']);
Route::put('/pesanan/{id}/tawar', [PesananController::class, 'kasihPenawaran']);
Route::put('/pesanan/{id}/tolak', [PesananController::class, 'tolakPesanan']);
Route::put('/pesanan/{id}/selesai', [PesananController::class, 'selesaikanPekerjaan']);

// --- Rute Fitur Ulasan untuk Tukang ---
Route::get('/tukang/{id}/ulasan', [UlasanController::class, 'getUlasanTukang']);

// --- Rute Fitur Portofolio (Upload Foto) ---
Route::post('/tukang/{id}/portofolio', [PortofolioController::class, 'store']);
Route::get('/tukang/{id}/portofolio', [PortofolioController::class, 'getPortofolioTukang']);

// --- Rute Fitur Dompet (Penarikan Dana) ---
Route::post('/tukang/{id}/tarik-dana', [PenarikanController::class, 'tarikDana']);
Route::get('/tukang/{id}/riwayat-tarik', [PenarikanController::class, 'getRiwayatPenarikan']);

Route::get('/tukang/{id}/ulasan', [UlasanController::class, 'getUlasanTukang']);
Route::post('/ulasan', [UlasanController::class,'store']);

Route::post('/pesanan', [PesananController::class, 'store']);
