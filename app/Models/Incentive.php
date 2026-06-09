<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Incentive extends Model
{
    protected $fillable = [
        'driver_id',
        'agent_id',
        'person_type',
        'amount',
        'currency',
        'remarks',
        'created_by',
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function agent()
    {
        return $this->belongsTo(Agent::class);
    }
}