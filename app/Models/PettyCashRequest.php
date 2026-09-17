<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PettyCashRequest extends Model
{
    protected $fillable = [
        'shift_id',
        'balance_amount',
        'needed_amount',
        'status',
        'requested_by',
        'approved_by',
        'approved_at',
    ];

    public function requestedBy()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
