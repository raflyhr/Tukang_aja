<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TukangController;
use App\Http\Controllers\Api\PesananController;
use App\Http\Controllers\Api\UlasanController;
use App\Http\Controllers\Api\PortofolioController;
use App\Http\Controllers\Api\PenarikanController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\AdminController;

// --- Rute Otentikasi Universal (Satu Login untuk Semua Role) ---
Route::post('/auth/login', [AuthController::class, 'login']);

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
Route::put('/tukang/{id}/profil', [TukangController::class, 'updateProfil']);
Route::get('/tukang', [TukangController::class, 'index']);
Route::get('/tukang/{id}', [TukangController::class, 'show']);

// --- Rute Fitur Pesanan untuk Tukang ---
Route::get('/pesanan/available', [PesananController::class, 'getAvailableOrders']);
Route::post('/pesanan/{id}/terima', [PesananController::class, 'terimaPekerjaan']);
Route::get('/tukang/{id}/pesanan', [PesananController::class, 'getPesananTukang']);
Route::put('/pesanan/{id}/tawar', [PesananController::class, 'kasihPenawaran']);
Route::put('/pesanan/{id}/tolak', [PesananController::class, 'tolakPesanan']);
Route::put('/pesanan/{id}/bayar', [PesananController::class, 'bayarPesanan']);
Route::put('/pesanan/{id}/selesai', [PesananController::class, 'selesaikanPekerjaan']);
Route::put('/pesanan/{id}/konfirmasi-selesai', [PesananController::class, 'konfirmasiSelesai']);
Route::put('/pesanan/{id}/komplain', [PesananController::class, 'komplainPesanan']);
// --- Rute Dashboard Tukang ---
Route::get('/tukang/{id}/dashboard-stats', [TukangController::class, 'getDashboardStats']);
Route::get('/tukang/{id}/activities', [TukangController::class, 'getRecentActivities']);

// --- Rute Fitur Ulasan untuk Tukang ---
Route::get('/tukang/{id}/ulasan', [UlasanController::class, 'getUlasanTukang']);

// --- Rute Fitur Portofolio, Sertifikat, dan Layanan ---
Route::post('/tukang/{id}/portofolio', [PortofolioController::class, 'store']);
Route::delete('/tukang/{id}/portofolio/{portofolio_id}', [PortofolioController::class, 'destroy']);
Route::get('/tukang/{id}/portofolio', [PortofolioController::class, 'getPortofolioTukang']);

Route::post('/tukang/{id}/sertifikat', [TukangController::class, 'addSertifikat']);
Route::delete('/tukang/{id}/sertifikat/{sertifikat_id}', [TukangController::class, 'deleteSertifikat']);

Route::post('/tukang/{id}/layanan', [TukangController::class, 'addLayanan']);
Route::delete('/tukang/{id}/layanan/{layanan_id}', [TukangController::class, 'deleteLayanan']);

// --- Rute Fitur Dompet (Penarikan Dana) ---
Route::post('/tukang/{id}/tarik-dana', [PenarikanController::class, 'tarikDana']);
Route::get('/tukang/{id}/riwayat-tarik', [PenarikanController::class, 'getRiwayatPenarikan']);

Route::get('/tukang/{id}/ulasan', [UlasanController::class, 'getUlasanTukang']);
Route::post('/ulasan', [UlasanController::class,'store']);

Route::post('/pesanan', [PesananController::class, 'store']);
Route::get('/user/{id}/pesanan', [PesananController::class, 'getPesananUser']);
Route::get('/user/{id}/dashboard-stats', [PesananController::class, 'getDashboardStatsUser']);

// --- Rute Fitur Chat ---
Route::get('/tukang/{id}/chats', [ChatController::class, 'getTukangChats']);
Route::get('/chat/{chat_id}/messages', [ChatController::class, 'getMessages']);
Route::post('/chat/send', [ChatController::class, 'sendMessage']);

// --- Rute Admin ---
Route::get('/admin/dashboard-stats', [AdminController::class, 'getDashboardStats']);
Route::get('/admin/verifikasi', [AdminController::class, 'getVerifications']);
Route::put('/admin/verifikasi/{id}', [AdminController::class, 'verifyTukang']);
Route::get('/admin/tukang', [AdminController::class, 'getAllTukang']);
Route::put('/admin/tukang/{id}/status', [AdminController::class, 'toggleTukangStatus']);
Route::get('/admin/monitoring', [AdminController::class, 'getMonitoring']);
Route::get('/admin/disputes', [AdminController::class, 'getDisputes']);
Route::put('/admin/disputes/{id}/resolve', [AdminController::class, 'resolveDispute']);