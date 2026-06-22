<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register User</title>

    <script src="https://cdn.tailwindcss.com"></script>
</head>

<body class="bg-gray-100 min-h-screen flex items-center justify-center py-10">


<div class="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg">


    <div class="text-center mb-8">

        <h1 class="text-3xl font-bold text-gray-800">
            Register User
        </h1>

        <p class="text-gray-500 mt-2">
            Buat akun untuk menggunakan layanan
        </p>

    </div>



    @if($errors->any())

        <div class="bg-red-100 text-red-600 p-3 rounded-lg mb-5">

            <ul>

                @foreach($errors->all() as $error)

                    <li>{{ $error }}</li>

                @endforeach

            </ul>

        </div>

    @endif



    <form action="/register/user" method="POST" class="space-y-5">

        @csrf



        <div>

            <label class="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap
            </label>

            <input
                type="text"
                name="name"
                value="{{ old('name') }}"
                placeholder="Masukkan nama lengkap"
                class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >

        </div>




        <div>

            <label class="block text-sm font-medium text-gray-700 mb-2">
                Email
            </label>

            <input
                type="email"
                name="email"
                value="{{ old('email') }}"
                placeholder="Masukkan email"
                class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >

        </div>




        <div>

            <label class="block text-sm font-medium text-gray-700 mb-2">
                Nomor HP
            </label>

            <input
                type="text"
                name="no_hp"
                value="{{ old('no_hp') }}"
                placeholder="08xxxxxxxxxx"
                class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >

        </div>




        <div>

            <label class="block text-sm font-medium text-gray-700 mb-2">
                Alamat
            </label>

            <textarea
                name="alamat"
                rows="3"
                placeholder="Masukkan alamat"
                class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >{{ old('alamat') }}</textarea>

        </div>




        <div>

            <label class="block text-sm font-medium text-gray-700 mb-2">
                Password
            </label>

            <input
                type="password"
                name="password"
                placeholder="Masukkan password"
                class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >

        </div>




        <div>

            <label class="block text-sm font-medium text-gray-700 mb-2">
                Konfirmasi Password
            </label>

            <input
                type="password"
                name="password_confirmation"
                placeholder="Konfirmasi password"
                class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >

        </div>




        <button
            type="submit"
            class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
        >
            Daftar
        </button>



    </form>




    <p class="text-center text-sm text-gray-600 mt-6">

        Sudah punya akun?

        <a 
            href="/login"
            class="text-blue-600 font-semibold hover:underline"
        >
            Login
        </a>

    </p>



</div>


</body>
</html>