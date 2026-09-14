<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PaymentSlip extends Model
{
    use HasFactory;

    protected $fillable = [
        'trip_finance_id',
        'slip_des',
        'slip_path',
        'uploaded_by',
        'status',
    ];

    public function tripFinance()
    {
        return $this->belongsTo(TripFinance::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
