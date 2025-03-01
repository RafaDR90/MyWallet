<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransferRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'cantidad',
        'descripcion',
        'tipo',
        'banco_anterior',
        'cajon_anterior',
        'banco_posterior',
        'cajon_posterior',
        'fecha'
    ];

    protected $casts = [
        'fecha' => 'datetime'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
