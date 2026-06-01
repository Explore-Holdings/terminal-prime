<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleFeature extends Model
{
    protected $fillable = [
        'vehicle_id',
        'air_conditioned',
        'wifi_available',
        'gps_enabled',
        'child_seat_available',
        'wheelchair_accessible',
        'pet_friendly',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
