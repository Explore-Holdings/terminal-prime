<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleDocument extends Model
{
    protected $fillable = [
        'vehicle_id',
        'registration_book',
        'insurance_certificate',
        'revenue_license',
        'emission_test_certificate',
        'driving_license_copy',
        'insurance_expiry_date',
        'revenue_license_expiry_date',
        'emission_test_expiry_date',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
