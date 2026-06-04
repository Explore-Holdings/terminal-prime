<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Agent extends Model
{
    protected $fillable = [
        'user_id',
        'customer_passport',
        'currency',
        'price',
        'remarks',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}