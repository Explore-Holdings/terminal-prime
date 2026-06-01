<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DrivingLicense extends Model
{
    protected $fillable = [
        'driver_id',
        'license_number',
        'license_type',
        'issue_date',
        'expiry_date',
        'years_of_experience',
        'tourist_license_available',
        'tourist_license_number',
        'tourist_issue_date',
        'tourist_expiry_date',
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }
}
