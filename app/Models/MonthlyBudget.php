<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MonthlyBudget extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'monto',
        'mes',
        'activo'
    ];

    protected $casts = [
        'mes' => 'date',
        'activo' => 'boolean'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
