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


        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'tukang',
        ]);

        \App\Models\Tukang::create([
            'user_id' => $user->id,
            'nama' => $request->name,
            'no_hp' => $request->no_hp,
            'alamat' => $request->alamat,
            'keahlian' => $request->keahlian,
        ]);


        return redirect()->route('login')
            ->with('success', 'Registrasi tukang berhasil');
    }
}