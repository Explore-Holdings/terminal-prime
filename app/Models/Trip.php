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
        'cash_received',
    ];

    protected $casts = [
        'trip_started_at' => 'datetime',
        'trip_ended_at' => 'datetime',
    ];

    protected $appends = ['shift_id'];

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

    public function tripFinance()
    {
        return $this->hasOne(TripFinance::class);
    }

    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'trip_assigned_by');
    }

    public function getShiftIdAttribute()
    {
        if (!$this->trip_assigned_by || !$this->trip_assigned_at) return null;
        $log = \App\Models\UserLoginLog::where('user_id', $this->trip_assigned_by)
            ->where('login_at', '<=', $this->trip_assigned_at)
            ->where(function($q) {
                $q->where('logout_at', '>=', $this->trip_assigned_at)
                  ->orWhereNull('logout_at');
            })
            ->first();
        return $log ? $log->shift_id : null;
    }
}