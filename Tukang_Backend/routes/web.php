<?php

use App\Http\Controllers\detailTukang;
use App\Http\Controllers\homeController;
use App\Http\Controllers\loginController;
use App\Http\Controllers\tukangRegisterController;
use App\Http\Controllers\userRegisterController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/', [homeController::class, 'landing'])->name('home.landing');
Route::get('/login', [loginController::class, 'index'])->name('login');
Route::post('/login', [loginController::class, 'login']);

Route::get('/register/user', [userRegisterController::class, 'index'])->name('registerUser');
Route::post('/register/user', [userRegisterController::class, 'store']);

Route::get('/register/tukang', [tukangRegisterController::class, 'index'])->name('registerTukang');
Route::post('/register/tukang', [tukangRegisterController::class, 'store']);

Route::get('/detail/tukang', [detailTukang::class, 'index'])->name('detailTukang');
