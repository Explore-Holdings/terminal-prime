<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Driver extends Model
{
    protected $fillable = [
        'registration_number',
        'registration_date',
        'registration_status',
        'first_name',
        'last_name',
        'full_name',
        'nic_number',
        'passport_number',
        'date_of_birth',
        'gender',
        'nationality',
        'marital_status',
        'mobile_number',
        'whatsapp_number',
        'alternative_contact_number',
        'email',
        'permanent_address',
        'current_address',
        'city',
        'driver_photo',
        'previous_employer',
        'previous_tourism_experience',
        'accident_history',
        'traffic_violation_history',
        'driver_status',
    ];

    public function emergencyContact()
    {
        return $this->hasOne(EmergencyContact::class);
    }

    public function drivingLicense()
    {
        return $this->hasOne(DrivingLicense::class);
    }

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class);
    }

    public function bankDetail()
    {
        return $this->hasOne(BankDetail::class);
    }

    public function documents()
    {
        return $this->hasOne(DriverDocument::class);
    }

    public function adminVerification()
    {
        return $this->hasOne(AdminVerification::class);
    }

    public function languages()
    {
        return $this->hasMany(DriverLanguage::class);
    }

    public function serviceCategories()
    {
        return $this->belongsToMany(ServiceCategory::class,
            'driver_service_categories'
        );
    }

    public function availability()
    {
        return $this->hasOne(DriverAvailability::class);
    }

    public function technologyInfo()
    {
        return $this->hasOne(TechnologyInfo::class);
    }

    public function tourismCompliance()
    {
        return $this->hasOne(TourismCompliance::class);
    }

    public function license()
    {
        return $this->hasOne(DrivingLicense::class);
    }

    public function vehicle()
    {
        return $this->hasOne(Vehicle::class);
    }

}