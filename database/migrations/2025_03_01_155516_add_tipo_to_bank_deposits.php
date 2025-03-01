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
        Schema::table('bank_deposits', function (Blueprint $table) {
            $table->string('tipo')->default('cartera')->after('user_id'); // 'banco' o 'cartera'
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bank_deposits', function (Blueprint $table) {
            $table->dropColumn('tipo');
        });
    }
};
