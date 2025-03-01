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
    Schema::create('transfer_records', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->decimal('cantidad', 10, 2);
        $table->decimal('banco_anterior', 10, 2);
        $table->decimal('cajon_anterior', 10, 2);
        $table->decimal('banco_posterior', 10, 2);
        $table->decimal('cajon_posterior', 10, 2);
        $table->string('descripcion')->nullable();
        $table->timestamp('fecha');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transfer_records');
    }
};
