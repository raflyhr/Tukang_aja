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
        Schema::create('penarikans', function (Blueprint $table) {
            $table->id();
            // Penghubung ke tabel tukangs
            $table->foreignId('tukang_id')->constrained('tukangs')->onDelete('cascade');
            
            $table->integer('jumlah_tarik'); 
            $table->string('rekening_tujuan'); 
        
            $table->enum('status', ['pending', 'sukses', 'ditolak'])->default('pending');
            $table->timestamps(); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('penarikans');
    }
};
