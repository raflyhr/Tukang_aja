<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class loginController extends Controller
{

    public function index()
    {
        return view('frontend.login');
    }


    public function login(Request $request)
    {

        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);


        if(Auth::attempt([
            'email' => $request->email,
            'password' => $request->password
        ])) {


            $user = Auth::user();


            if($user->role == 'user') {

                return redirect('/');

            }


            if($user->role == 'tukang') {

                return redirect('/detail/tukang');

            }

        }


        return back()->with('error', 'Email atau password salah');

    }

}