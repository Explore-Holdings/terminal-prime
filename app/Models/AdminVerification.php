<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminVerification extends Model
{
    protected $fillable = [
        'driver_id',
        'nic_verified',
        'driving_license_verified',
        'tourist_license_verified',
        'vehicle_ownership_verified',
        'vehicle_documents_verified',
        'insurance_verified',
        'no_objection_letter_verified',
        'vehicle_photos_approved',
        'tourism_registration_verified',
        'driver_approved',
        'remarks',
        'approved_by',
        'approval_date',
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

        public function approvedByUser()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
