<?php

use App\Http\Controllers\homeController;
use App\Http\Controllers\loginController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/', [homeController::class, 'landing'])->name('home.landing');
Route::get('/login', [loginController::class, 'index'])->name('login');
