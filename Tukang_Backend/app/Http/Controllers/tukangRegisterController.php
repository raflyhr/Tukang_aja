<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class TukangRegisterController extends Controller
{
    public function index()
    {
        return view('frontend.tukangRegister');
    }


    public function store(Request $request)
    {
        $request->validate([
    'name' => 'required',
    'no_hp' => 'required',
    'email' => 'required|email|unique:users,email',
    'keahlian' => 'required',
    'alamat' => 'required',
    'password' => 'required|min:8|confirmed',
]);


        User::create([
            'name' => $request->name,
            'no_hp' => $request->no_hp,
            'email' => $request->email,
            'keahlian' => $request->keahlian,
            'alamat' => $request->alamat,
            'password' => Hash::make($request->password),
            'role' => 'tukang',
        ]);


        return redirect()->route('login')
            ->with('success', 'Registrasi tukang berhasil');
    }
}