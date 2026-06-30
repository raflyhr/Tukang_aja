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
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_id')->constrained('chats')->onDelete('cascade');
            $table->enum('sender_type', ['user', 'tukang', 'system']);
            $table->unsignedBigInteger('sender_id')->nullable(); // ID dari user/tukang
            $table->enum('message_type', ['text', 'negotiation_offer'])->default('text');
            $table->text('text');
            $table->json('metadata')->nullable(); // Untuk nyimpen nominal harga nego
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
