<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');  
});

Route::get('/storage/storage/{path}', function ($path) {
    return redirect('/storage/' . $path);
})->where('path', '.*');


