<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TukangController;
use App\Http\Controllers\Api\PesananController;
use App\Http\Controllers\Api\UlasanController;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Rute buat ganti status Tukang
Route::put('/tukang/{id}/status', [TukangController::class, 'update']);

// --- Rute Fitur Pesanan untuk Tukang ---
Route::get('/tukang/{id}/pesanan', [PesananController::class, 'getPesananTukang']);
Route::put('/pesanan/{id}/tawar', [PesananController::class, 'kasihPenawaran']);
Route::put('/pesanan/{id}/tolak', [PesananController::class, 'tolakPesanan']);

// --- Rute Fitur Ulasan untuk Tukang ---
Route::get('/tukang/{id}/ulasan', [UlasanController::class, 'getUlasanTukang']);
