<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::table('roles', function (Blueprint $table) {

            $table->string('keahlian')->nullable();


        });
    }


    public function down(): void
    {
        Schema::table('roles', function (Blueprint $table) {

            $table->dropColumn([
                'no_hp',
                'keahlian',
                'alamat'
            ]);

        });
    }
};