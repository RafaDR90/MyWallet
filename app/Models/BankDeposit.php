<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BankDeposit extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'tipo',
        'cantidad',
        'balance_anterior',
        'balance_posterior',
        'descripcion',
        'fecha'
    ];

    protected $casts = [
        'fecha' => 'datetime',
        'cantidad' => 'float',
        'balance_anterior' => 'float',
        'balance_posterior' => 'float'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
