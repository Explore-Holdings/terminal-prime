<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehiclePicture extends Model
{
    protected $fillable = [
        'vehicle_id',
        'front_view',
        'rear_view',
        'left_side_view',
        'right_side_view',
        'front_interior_view',
        'passenger_seating_area',
        'dashboard_view',
        'luggage_compartment_view',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
