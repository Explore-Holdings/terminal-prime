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
        'selection_reason',
        'selection_reason_by',
        'is_short_trip',
        'short_trip_by',
        'original_session_id',
        'original_slot_number',
        'status',
        'survey_sent_at',
        'cash_received',
    ];

    protected $casts = [
        'trip_assigned_at' => 'datetime',
        'trip_started_at' => 'datetime',
        'trip_ended_at' => 'datetime',
        'is_short_trip' => 'boolean',
        'original_session_id' => 'integer',
        'original_slot_number' => 'integer',
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

    public function selectionReasonBy()
    {
        return $this->belongsTo(User::class, 'selection_reason_by');
    }

    public function shortTripBy()
    {
        return $this->belongsTo(User::class, 'short_trip_by');
    }

    public function shortTripRecord()
    {
        return $this->hasOne(ShortTrip::class);
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