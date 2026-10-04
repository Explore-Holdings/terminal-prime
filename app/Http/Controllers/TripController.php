<?php

namespace App\Http\Controllers;

use App\Models\Trip;
use App\Models\Driver;
use App\Models\ShortTrip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TripController extends Controller
{
    public function index()
    {
        return Inertia::render('Trips/Index', [
            'trips' => Trip::with([
                'driver.vehicle',
                'customer',
                'agent.user',
                'shortTripBy',
                'selectionReasonBy',
            ])
            ->latest()
            ->get(),
        ]);
    }

    /**
     * Complete a trip and check in the driver.
     * Evaluates short trip queue retention vs progression rules.
     */
    public function checkIn(Request $request, Trip $trip)
    {
        $resultMessage = '';
        $queueResult = 'next_queue';

        DB::transaction(function () use ($trip, &$resultMessage, &$queueResult) {
            $trip->loadMissing('driver');
            $driver = $trip->driver;

            if (!$driver) {
                abort(404, 'Driver not found for this trip.');
            }

            // Mark trip completed
            $trip->update([
                'status'         => 'Completed',
                'trip_ended_at'  => now(),
                'trip_started_at'=> $trip->trip_started_at ?? now(),
            ]);

            $originalSession = $trip->original_session_id ?? $driver->session_id ?? 1;
            $driverSlot = $trip->original_slot_number;
            if ($driverSlot === null && preg_match('/\d+/', $driver->registration_number ?? '', $m)) {
                $driverSlot = (int) $m[0];
            }

            if ($trip->is_short_trip) {
                // Check if driver's number has passed
                $isPassed = $this->isDriverNumberPassed($driver, $trip, $originalSession, $driverSlot);

                if ($isPassed) {
                    $targetSession = $originalSession + 1;
                    $driver->update([
                        'session_id'    => $targetSession,
                        'duty_status'   => 'on_duty',
                        'checked_in_at' => now(),
                    ]);
                    $queueResult = 'next_queue';

                    ShortTrip::where('trip_id', $trip->id)->update([
                        'status'        => 'completed',
                        'queue_result'  => 'next_queue',
                        'checked_in_at' => now(),
                        'checked_in_by' => Auth::id(),
                    ]);

                    $slotText = $driverSlot !== null ? "#{$driverSlot}" : $driver->registration_number;
                    $resultMessage = "Short trip ended. Driver's queue number ({$slotText}) was passed, so the driver moved to Next Queue (Session {$targetSession}).";
                } else {
                    $driver->update([
                        'session_id'    => $originalSession,
                        'duty_status'   => 'on_duty',
                        'checked_in_at' => now(),
                    ]);
                    $queueResult = 'same_queue';

                    ShortTrip::where('trip_id', $trip->id)->update([
                        'status'        => 'completed',
                        'queue_result'  => 'same_queue',
                        'checked_in_at' => now(),
                        'checked_in_by' => Auth::id(),
                    ]);

                    $slotText = $driverSlot !== null ? "#{$driverSlot}" : $driver->registration_number;
                    $resultMessage = "Short trip ended. Driver's queue number ({$slotText}) was not passed, so the driver returned to the Same Queue (Session {$originalSession}).";
                }
            } else {
                // Normal trip: Driver goes to next queue as earlier
                $targetSession = ($trip->original_session_id ?? ($driver->session_id - 1)) + 1;
                $newSession = max($driver->session_id, $targetSession);
                $driver->update([
                    'session_id'    => $newSession,
                    'duty_status'   => 'on_duty',
                    'checked_in_at' => now(),
                ]);
                $queueResult = 'next_queue';

                $resultMessage = "Tour completed and driver checked in to Next Queue (Session {$newSession}).";
            }
        });

        if ($request->wantsJson()) {
            return response()->json([
                'success'      => true,
                'message'      => $resultMessage,
                'queue_result' => $queueResult,
            ]);
        }

        return back()->with('success', $resultMessage);
    }

    /**
     * Determine if the driver's turn/slot has passed in the session.
     */
    private function isDriverNumberPassed(Driver $driver, Trip $trip, int $originalSession, ?int $driverSlot): bool
    {
        if ($driverSlot === null) {
            return true;
        }

        // 1. Check if the active queue base session has advanced past originalSession
        $activeSessions = Driver::where('driver_status', 'Active')
            ->whereNotNull('session_id')
            ->where('session_id', '>', 0)
            ->pluck('session_id');
        $baseSession = $activeSessions->isNotEmpty() ? $activeSessions->min() : 1;

        if ($baseSession > $originalSession) {
            return true;
        }

        // 2. Check if any in-turn trip in this session was assigned to a driver whose slot > $driverSlot
        // after this trip was assigned
        $hasHigherSlotTrip = Trip::where('id', '!=', $trip->id)
            ->where(function ($q) use ($originalSession) {
                $q->where('original_session_id', $originalSession)
                  ->orWhereHas('driver', function ($dq) use ($originalSession) {
                      $dq->where('session_id', '>=', $originalSession);
                  });
            })
            ->where('trip_assigned_at', '>=', $trip->trip_assigned_at)
            ->whereNull('selection_reason')
            ->get()
            ->contains(function ($t) use ($driverSlot) {
                if (preg_match('/\d+/', $t->driver?->registration_number ?? '', $m)) {
                    return (int) $m[0] > $driverSlot;
                }
                return false;
            });

        return $hasHigherSlotTrip;
    }

    /**
     * Get separate short trips list.
     */
    public function shortTripsIndex()
    {
        $shortTrips = ShortTrip::with([
            'trip.customer',
            'trip.agent.user',
            'driver.vehicle',
            'assignedBy',
            'checkedInBy',
        ])
        ->latest('assigned_at')
        ->get();

        return response()->json($shortTrips);
    }
}