<?php

namespace App\Observers;

use App\Models\Trip;
use App\Models\Driver;

class TripObserver
{
    /**
     * Handle the Trip "updating" event.
     *
     * When a trip's status changes to 'Completed', increment the
     * driver's session_id so they move to the next session round.
     */
    public function updating(Trip $trip): void
    {
        // Only act when status is changing TO 'Completed'
        if ($trip->isDirty('status') && $trip->status === 'Completed') {
            $driver = Driver::find($trip->driver_id);

            if ($driver && $driver->session_id !== null) {
                $driver->update([
                    'session_id' => $driver->session_id + 1,
                ]);
            }
        }
    }
}
