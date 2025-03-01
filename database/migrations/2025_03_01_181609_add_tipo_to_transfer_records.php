<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('transfer_records', function (Blueprint $table) {
            $table->string('tipo')->nullable()->after('descripcion');
        });

        // Migrar los datos existentes
        DB::table('transfer_records')->orderBy('id')->chunk(100, function ($transfers) {
            foreach ($transfers as $transfer) {
                $tipo = null;
                if (str_contains($transfer->descripcion, '[banco_a_cajon]')) {
                    $tipo = 'banco_a_cajon';
                } elseif (str_contains($transfer->descripcion, '[cajon_a_banco]')) {
                    $tipo = 'cajon_a_banco';
                }
                
                if ($tipo) {
                    // Limpiar la descripción y guardar el tipo
                    $descripcionLimpia = trim(str_replace(['[banco_a_cajon]', '[cajon_a_banco]'], '', $transfer->descripcion));
                    DB::table('transfer_records')
                        ->where('id', $transfer->id)
                        ->update([
                            'descripcion' => $descripcionLimpia,
                            'tipo' => $tipo
                        ]);
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transfer_records', function (Blueprint $table) {
            $table->dropColumn('tipo');
        });
    }
};
