<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $fillable = [
        'driver_id',
        'registration_number',
        'vehicle_type',
        'brand',
        'model',
        'vehicle_year',
        'color',
        'seating_capacity',
        'luggage_capacity',
        'fuel_type',
        'transmission_type',
        'ownership_type',
        'ownership_confirmation_letter',
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function features()
    {
        return $this->hasOne(VehicleFeature::class);
    }

    public function documents()
    {
        return $this->hasOne(VehicleDocument::class);
    }

    public function pictures()
    {
        return $this->hasOne(VehiclePicture::class);
    }
}
