<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TripFinance extends Model
{
    use HasFactory;

    protected $fillable = [
        'trip_id',
        'driver_id',
        'agent_id',
        'driver_rate',
        'agent_rate',
        'is_custom_rate',
        'total_amount',
        'driver_share',
        'agent_share',
        'balance',
        'received',
        'received_amount',
        'received_by',
        'received_at',
    ];

    protected $casts = [
        'driver_rate'     => 'decimal:2',
        'agent_rate'      => 'decimal:2',
        'is_custom_rate'  => 'boolean',
        'total_amount'    => 'decimal:2',
        'driver_share'    => 'decimal:2',
        'agent_share'     => 'decimal:2',
        'balance'         => 'decimal:2',
        'received'        => 'boolean',
        'received_amount' => 'decimal:2',
        'received_at'     => 'datetime',
    ];

    public function trip(): BelongsTo
    {
        return $this->belongsTo(Trip::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class);
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    // Helper: mark as received

    public function markAsReceived(int $userId, ?float $amount = null): void
    {
        $this->update([
            'received'        => true,
            'received_amount' => $amount ?? $this->total_amount,
            'received_by'     => $userId,
            'received_at'     => now(),
        ]);
    }
}