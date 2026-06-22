<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class detailTukang extends Controller
{
    public function index()
    {
        return view('frontend.tukangDetail');
    }
}