<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PaymentSlip extends Model
{
    use HasFactory;

    protected $fillable = [
        'trip_finance_id',
        'outsource_vehicle_id',
        'customer_id',
        'slip_des',
        'slip_path',
        'uploaded_by',
        'status',
    ];

    public function tripFinance()
    {
        return $this->belongsTo(TripFinance::class);
    }

    public function outsourceVehicle()
    {
        return $this->belongsTo(OutsourceVehicle::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
