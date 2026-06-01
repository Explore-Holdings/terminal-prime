<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DriverDocument extends Model
{
    protected $fillable = [
        'driver_id',
        'nic_copy',
        'passport_copy',
        'driver_photo',
        'driving_license_copy',
        'tourist_driving_license_copy',
        'no_objection_letter',
        'police_clearance_certificate',
        'medical_fitness_certificate',
        'tourism_authority_registration',
        'airport_permit',
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }
}
