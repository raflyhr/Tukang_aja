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
        Schema::create('tukangs', function (Blueprint $table) {
            $table->id();
            // penghubung database dari login
            $table->foreignId('user_id')->constrained('roles')->onDelete('cascade');
            $table->string('nama');
            $table->string('no_hp')->unique();
            $table->string('foto_profil')->nullable();

            // Alamat + Lokasi Peta
            $table->string('alamat');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();

            // Keahlian
            $table->string('keahlian');
            $table->json('keahlian_tambahan')->nullable();

            // Area Cakupan
            $table->integer('radius_layanan')->default(15);
            $table->string('area_cakupan')->nullable();

            // Pengalaman Kerja
            $table->integer('tahun_pengalaman')->default(0);
            $table->text('deskripsi_pengalaman')->nullable();

            // Dokumen Legal
            $table->string('nik', 16)->unique()->nullable();
            $table->string('cv_portofolio')->nullable();

            // Status Tukang
            $table->boolean('is_aktif')->default(false);
            // Dompet tukang
            $table->integer('saldo')->default(0);
            // Rating tukang
            $table->decimal('rating', 3, 2)->default(0.00);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tukangs');
    }
};
