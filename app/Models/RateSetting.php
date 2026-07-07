<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RateSetting extends Model
{
    protected $fillable = [
        'name',
        'agent_rate',
        'driver_rate',
        'is_active',
    ];
}
