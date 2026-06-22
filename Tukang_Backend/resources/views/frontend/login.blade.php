<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>

    <script src="https://cdn.tailwindcss.com"></script>
</head>

<body class="bg-gray-100 min-h-screen flex items-center justify-center">

    <div class="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">

        <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-gray-800">
                Login
            </h1>

            <p class="text-gray-500 mt-2">
                Masuk ke akun Anda
            </p>
        </div>


        @if(session('error'))
            <div class="bg-red-100 text-red-600 p-3 rounded-lg mb-5 text-sm">
                {{ session('error') }}
            </div>
        @endif

        @if(session('success'))
    <div class="bg-green-100 text-green-600 p-3 rounded-lg mb-5">
        {{ session('success') }}
    </div>
@endif

        @if($errors->any())
            <div class="bg-red-100 text-red-600 p-3 rounded-lg mb-5 text-sm">
                <ul>
                    @foreach($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif



        <form action="/login" method="POST" class="space-y-5">

            @csrf


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
                    Password
                </label>

                <input
                    type="password"
                    name="password"
                    placeholder="Masukkan password"
                    class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
            </div>



            <div class="flex justify-between items-center text-sm">

                <label class="flex items-center gap-2">
                    <input type="checkbox">

                    <span>
                        Remember me
                    </span>
                </label>


                <a href="#" class="text-blue-600 hover:underline">
                    Lupa password?
                </a>

            </div>



            <button
                type="submit"
                class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
                Login
            </button>


        </form>



        <p class="text-center text-sm text-gray-600 mt-6">

            Belum punya akun?

            <a
                href="/register/tukang"
                class="text-blue-600 font-semibold hover:underline"
            >
                Daftar
            </a>

        </p>


    </div>

</body>
</html>