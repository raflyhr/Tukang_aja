<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
       public function up(): void
    {
        Schema::create('pesanans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('roles')->onDelete('cascade');
            $table->foreignId('tukang_id')->nullable()->constrained('tukangs')->onDelete('cascade');
            $table->text('deskripsi_masalah');
            $table->string('judul')->nullable();
            $table->string('kategori_layanan')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('alamat_lengkap')->nullable();
            $table->integer('harga_penawaran')->nullable();
            $table->string('foto_lampiran')->nullable(); // Foto array JSON
            $table->string('budget_perkiraan')->nullable();
            $table->enum('status', [
                'menunggu', // Belum ada tukang
                'menunggu_penawaran', // Diambil tukang, belum kirim harga
                'menunggu_persetujuan', // Tukang kirim harga, nunggu ACC client
                'menunggu_pembayaran', // Client ACC, nunggu bayar (optional flow)
                'menunggu_pengerjaan', // Sudah dibayar, nunggu tukang datang (escrow)
                'sedang_dikerjakan', // Sedang dikerjakan
                'menunggu_konfirmasi_selesai', // Tukang selesai, nunggu ACC client
                'komplain', // Client komplain
                'selesai', // Selesai & Uang cair
                'dibatalkan', // Dibatalkan (oleh sistem atau user)
                'ditolak' // Ditolak
            ])->default('menunggu');
            $table->text('alasan_penolakan')->nullable();

            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pesanans');
    }
};
