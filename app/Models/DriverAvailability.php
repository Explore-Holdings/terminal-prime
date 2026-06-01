<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DriverAvailability extends Model
{
    protected $fillable = [
        'driver_id',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
        'working_shift',
        'airport_pickups',
        'airport_dropoffs',
        'tours',
        'long_distance_travel',
        'overnight_tours',
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }
}