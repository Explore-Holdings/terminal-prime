<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TourismCompliance extends Model
{
    protected $table = 'tourism_compliance';

    protected $fillable = [
        'driver_id',
        'tourism_registration_number',
        'sltda_registered_driver',
        'tourist_driving_license_copy',
        'tourism_authority_permit_copy',
        'airport_access_permit',
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }
}