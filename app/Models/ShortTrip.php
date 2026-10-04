<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShortTrip extends Model
{
    use HasFactory;

    protected $table = 'short_trips';

    protected $fillable = [
        'trip_id',
        'driver_id',
        'session_id',
        'slot_number',
        'assigned_by',
        'assigned_at',
        'status',
        'queue_result',
        'checked_in_at',
        'checked_in_by',
        'remarks',
    ];

    protected $casts = [
        'session_id'    => 'integer',
        'slot_number'   => 'integer',
        'assigned_at'   => 'datetime',
        'checked_in_at' => 'datetime',
    ];

    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function checkedInBy()
    {
        return $this->belongsTo(User::class, 'checked_in_by');
    }
}
