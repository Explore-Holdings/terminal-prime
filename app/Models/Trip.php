<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Trip extends Model
{
    protected $fillable = [
        'driver_id',
        'customer_id',
        'agent_id',
        'trip_assigned_at',
        'trip_assigned_by',
        'trip_started_at',
        'trip_ended_at',
        'remarks',
        'status',
        'survey_sent_at',
    ];

    protected $casts = [
        'trip_started_at' => 'datetime',
        'trip_ended_at' => 'datetime',
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function agent()
    {
        return $this->belongsTo(Agent::class);
    }

    public function finance()
    {
        return $this->hasOne(Finance::class);
    }
}