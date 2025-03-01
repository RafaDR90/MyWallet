<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ExpenseTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
{
    $defaultTypes = [
        'Comida',
        'Caprichos',
        'Viajes',
        'Gastos Fijos'
        
        
    ];

    foreach ($defaultTypes as $type) {
        DB::table('expense_types')->insert([
            'nombre' => $type,
            'is_default' => true,
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }
}
}
