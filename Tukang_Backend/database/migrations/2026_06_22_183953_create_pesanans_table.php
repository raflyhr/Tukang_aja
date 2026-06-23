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
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('tukang_id')->constrained('tukangs')->onDelete('cascade');
            $table->text('deskripsi_masalah');
            $table->integer('harga_penawaran')->nullable();
            $table->enum('status', ['menunggu', 'dinego', 'ditolak', 'diterima', 'selesai'])->default('menunggu');
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
