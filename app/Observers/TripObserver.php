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
            if (empty($trip->survey_sent_at)) {
                try {
                    $trip->loadMissing(['customer', 'driver.vehicle']);
                    if ($trip->customer && !empty($trip->customer->email)) {
                        $email = trim($trip->customer->email);
                        if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
                            \Illuminate\Support\Facades\Mail::to($email)
                                ->send(new \App\Mail\CustomerSurveyMail($trip));

                            $trip->survey_sent_at = now();
                        }
                    }
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::error("Failed to send customer survey in TripObserver for trip {$trip->id}: " . $e->getMessage());
                }
            }
        }
    }
}
