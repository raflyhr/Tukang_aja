<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register Tukang</title>

    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center py-10">

    <div class="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-lg">

        <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-gray-800">
                Daftar Tukang
            </h1>
            <p class="text-gray-500 mt-2">
                Lengkapi data untuk membuat akun tukang
            </p>
        </div>

        <form
            action="/register/tukang"
            method="POST"
            class="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
            @csrf

            @if($errors->any())
    <div class="bg-red-100 text-red-600 p-3 rounded-lg mb-5">
        <ul>
            @foreach($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif

            <div>
                <label class="block text-sm font-medium mb-2">
                    Nama Lengkap
                </label>
                <input
                    type="text"
                    name="name"
                    value="{{ old('name') }}"
                    placeholder="Nama lengkap"
                    class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
            </div>

            <div>
                <label class="block text-sm font-medium mb-2">
                    Nomor HP
                </label>
                <input
                    type="text"
                    name="no_hp"
                    value="{{ old('no_hp') }}"
                    placeholder="08xxxxxxxxxx"
                    class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
            </div>

            <div>
                <label class="block text-sm font-medium mb-2">
                    Email
                </label>
                <input
                    type="email"
                    name="email"
                    value="{{ old('email') }}"
                    placeholder="email@example.com"
                    class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
            </div>

            <div>
                <label class="block text-sm font-medium mb-2">
                    Keahlian
                </label>
                <select
    name="keahlian"
    class="w-full px-4 py-3 border rounded-lg"
>
    <option value="">Pilih Keahlian</option>

    <option value="Tukang Bangunan">
        Tukang Bangunan
    </option>

    <option value="Tukang Listrik">
        Tukang Listrik
    </option>

    <option value="Tukang AC">
        Tukang AC
    </option>

    <option value="Tukang Ledeng">
        Tukang Ledeng
    </option>

</select>
            </div>

            <div class="md:col-span-2">
                <label class="block text-sm font-medium mb-2">
                    Alamat
                </label>
                <textarea
                    name="alamat"
                    rows="3"
                    placeholder="Masukkan alamat lengkap"
                    class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >{{ old('alamat') }}</textarea>
            </div>

            <div>
                <label class="block text-sm font-medium mb-2">
                    Password
                </label>
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
            </div>

            <div>
                <label class="block text-sm font-medium mb-2">
                    Konfirmasi Password
                </label>
                <input
                    type="password"
                    name="password_confirmation"
                    placeholder="Konfirmasi password"
                    class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
            </div>

            <div class="md:col-span-2">
                <button
                    type="submit"
                    class="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
                >
                    Daftar Sebagai Tukang
                </button>
            </div>
        </form>

        <p class="text-center text-sm text-gray-600 mt-6">
            Sudah punya akun?
            <a
                href="/login"
                class="text-green-600 font-semibold hover:underline"
            >
                Login
            </a>
        </p>

    </div>

</body>
</html>