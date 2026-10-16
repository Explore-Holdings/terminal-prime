<?php

namespace App\Http\Controllers;

use App\Models\Trip;
use App\Models\Driver;
use App\Models\ShortTrip;
use App\Models\OutsourceVehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class TripController extends Controller
{
    public function index()
    {
        $regularTrips = Trip::with([
            'driver.vehicle',
            'customer',
            'agent.user',
            'shortTripBy',
            'selectionReasonBy',
            'tripFinance',
        ])
        ->latest()
        ->get()
        ->map(function ($trip) {
            $hasInvoice = !empty($trip->invoice_path)
                || !empty($trip->invoice_generated_at)
                || (file_exists(storage_path("app/public/trip_invoices/{$trip->id}")) && count(glob(storage_path("app/public/trip_invoices/{$trip->id}/*.pdf"))) > 0);
            $trip->has_invoice = (bool) $hasInvoice;
            return $trip;
        });

        $outsourceTrips = OutsourceVehicle::with([
            'customer',
            'agent.user',
            'creator',
        ])
        ->latest()
        ->get()
        ->map(function ($ov) {
            $hasInvoice = !empty($ov->invoice_path)
                || !empty($ov->invoice_generated_at)
                || (file_exists(storage_path("app/public/trip_invoices/OV-{$ov->id}")) && count(glob(storage_path("app/public/trip_invoices/OV-{$ov->id}/*.pdf"))) > 0);

            return [
                'id' => 'OV-' . $ov->id,
                'outsource_id' => $ov->id,
                'is_outsource' => true,
                'has_invoice' => (bool) $hasInvoice,
                'invoice_path' => $ov->invoice_path,
                'invoice_generated_at' => $ov->invoice_generated_at ? $ov->invoice_generated_at->toIso8601String() : null,
                'driver' => [
                    'first_name' => 'Outside Driver',
                    'last_name' => '',
                    'full_name' => 'Outside Driver (' . $ov->vehicle_number . ')',
                    'mobile_number' => $ov->mobile_number,
                    'is_outside' => true,
                    'vehicle' => [
                        'registration_number' => $ov->vehicle_number,
                        'brand' => 'Outside',
                        'model' => 'Vehicle',
                    ],
                ],
                'customer' => $ov->customer,
                'agent' => $ov->agent,
                'trip_assigned_at' => $ov->created_at ? $ov->created_at->toIso8601String() : null,
                'created_at' => $ov->created_at ? $ov->created_at->toIso8601String() : null,
                'status' => 'Outsourced',
                'selection_reason' => 'Outsource Vehicle: ' . $ov->vehicle_number,
                'is_short_trip' => false,
                'price' => $ov->price,
                'advance_payment' => $ov->advance_payment,
            ];
        });

        $trips = $regularTrips->concat($outsourceTrips)->sortByDesc(function ($item) {
            if ($item instanceof Trip) {
                return $item->created_at ? $item->created_at->timestamp : 0;
            }
            return isset($item['created_at']) ? strtotime($item['created_at']) : 0;
        })->values();

        return Inertia::render('Trips/Index', [
            'trips' => $trips,
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

    /**
     * Generate and stream trip / driver invoice PDF (Tours & Transfers only, not Rent a Car).
     */
    public function downloadInvoice(Trip $trip)
    {
        $trip->loadMissing([
            'driver.vehicle',
            'customer',
            'agent.user',
            'tripFinance',
        ]);

        $agent = $trip->agent;
        $bookingType = strtolower(trim($agent->booking_type ?? ''));

        // Does not apply to Rent a Car
        if ($bookingType === 'rent a car' || str_contains($bookingType, 'rent')) {
            abort(404, 'Invoices are only generated for Tours and Transfers.');
        }

        $isTour = ($bookingType === 'tour' || $bookingType === 'tours' || !empty($agent->tour_destinations));

        // Check if outside vehicle
        $outsourceVehicle = OutsourceVehicle::where('customer_id', $trip->customer_id)
            ->orWhere('agent_id', $trip->agent_id)
            ->first();
        $isOutsource = !empty($outsourceVehicle) || !empty($agent->external_vehicle_reg);

        $tourDestinations = '';
        if ($agent && !empty($agent->tour_destinations)) {
            $rawDest = $agent->tour_destinations;
            if (is_array($rawDest)) {
                $tourDestinations = implode(' → ', array_filter($rawDest));
            } elseif (is_string($rawDest)) {
                $trimmed = trim($rawDest);
                if ((str_starts_with($trimmed, '[') && str_ends_with($trimmed, ']')) || (str_starts_with($trimmed, '{') && str_ends_with($trimmed, '}'))) {
                    $decoded = json_decode($trimmed, true);
                    if (is_array($decoded)) {
                        $tourDestinations = implode(' → ', array_filter($decoded));
                    } else {
                        $tourDestinations = $trimmed;
                    }
                } else {
                    $tourDestinations = $trimmed;
                }
            }
        }
        if ($isTour && empty($tourDestinations)) {
            $tourDestinations = $trip->customer?->dropoff_location ?: ($agent->dropoff_location ?: '');
        }

        $driver = $trip->driver;
        $vehicle = $driver?->vehicle;

        $vehicleReg = $outsourceVehicle?->vehicle_number
            ?: ($agent?->external_vehicle_reg
            ?: ($vehicle?->registration_number
            ?: ($driver?->vehicle_registration_number ?: '-')));

        $vehicleModel = $isOutsource
            ? ($agent?->external_vehicle_make ?: 'Outside Vehicle')
            : trim(($vehicle?->brand ?? '') . ' ' . ($vehicle?->model ?? ''));

        $firstAndLast = trim(($driver?->first_name ?? '') . ' ' . ($driver?->last_name ?? ''));
        $driverName = $isOutsource
            ? 'Outside Driver'
            : ($firstAndLast ?: ($driver?->full_name ?: '-'));

        $driverContact = $isOutsource
            ? ($outsourceVehicle?->mobile_number ?: '-')
            : ($driver?->mobile_number ?: ($driver?->whatsapp_number ?: '-'));

        // Amount given to the driver
        $driverPayout = 0;
        $dailyRate = null;
        $driverRatePercent = null;
        $outsourceAdvance = 0;

        if ($isOutsource && $outsourceVehicle) {
            $driverPayout = (float) $outsourceVehicle->price;
            $outsourceAdvance = (float) ($outsourceVehicle->advance_payment ?? 0);
        } elseif ($trip->tripFinance && (float) $trip->tripFinance->driver_share > 0) {
            $driverPayout = (float) $trip->tripFinance->driver_share;
            $driverRatePercent = (float) ($trip->tripFinance->driver_rate ?? 0);
            if ($isTour && !empty($agent->driver_rate)) {
                $dailyRate = (float) $agent->driver_rate;
            } elseif ($isTour && !empty($agent->days) && (int) $agent->days > 0) {
                $dailyRate = round($driverPayout / (int) $agent->days);
            }
        } elseif ($isTour && !empty($agent->driver_rate)) {
            $dailyRate = (float) $agent->driver_rate;
            $days = max(1, (int) ($agent->days ?: 1));
            $driverPayout = $dailyRate * $days;
        } elseif ($isTour && !empty($agent->price)) {
            $driverPayout = (float) $agent->price;
        } elseif (!empty($agent->price)) {
            $driverPayout = (float) $agent->price * 0.8;
        }

        $invoiceNumber = 'TRIP-INV-' . str_pad($trip->id, 5, '0', STR_PAD_LEFT);

        $pdf = Pdf::loadView('invoices.trip-invoice', [
            'tripNumber'        => $trip->id,
            'invoiceNumber'     => $invoiceNumber,
            'bookingType'       => $agent->booking_type ?? ($isTour ? 'Tour' : 'Transfer'),
            'isTour'            => $isTour,
            'isOutsource'       => $isOutsource,
            'tourDestinations'  => $tourDestinations,
            'dropoffLocation'   => $trip->customer?->dropoff_location ?: ($agent->dropoff_location ?: '-'),
            'vehicleReg'        => $vehicleReg,
            'vehicleModel'      => $vehicleModel,
            'driverName'        => $driverName,
            'driverContact'     => $driverContact,
            'dispatchDate'      => $trip->trip_assigned_at ?: $trip->created_at,
            'days'              => $agent->days ?? null,
            'status'            => $trip->status ?? 'Assigned',
            'driverPayout'      => $driverPayout,
            'dailyRate'         => $dailyRate,
            'driverRatePercent' => $driverRatePercent,
            'outsourceAdvance'  => $outsourceAdvance,
        ]);

        // Save invoice in trip_invoices/{trip_id} folder
        $tripInvoiceDir = storage_path("app/public/trip_invoices/{$trip->id}");
        if (!file_exists($tripInvoiceDir)) {
            mkdir($tripInvoiceDir, 0755, true);
        }
        $savedFile = "{$tripInvoiceDir}/{$invoiceNumber}.pdf";
        try {
            $pdf->save($savedFile);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Failed to save trip invoice PDF: " . $e->getMessage());
        }

        $trip->update([
            'invoice_path'         => "/storage/trip_invoices/{$trip->id}/{$invoiceNumber}.pdf",
            'invoice_generated_at' => now(),
        ]);

        return $pdf->stream("{$invoiceNumber}.pdf");
    }

    /**
     * Generate and stream outsource vehicle invoice PDF.
     */
    public function downloadOutsourceInvoice(OutsourceVehicle $outsourceVehicle)
    {
        $outsourceVehicle->loadMissing(['customer', 'agent.user', 'creator']);
        $agent = $outsourceVehicle->agent;
        $bookingType = strtolower(trim($agent->booking_type ?? ''));

        if ($bookingType === 'rent a car' || str_contains($bookingType, 'rent')) {
            abort(404, 'Invoices are only generated for Tours and Transfers.');
        }

        $isTour = ($bookingType === 'tour' || $bookingType === 'tours' || !empty($agent->tour_destinations));

        $tourDestinations = '';
        if ($agent && !empty($agent->tour_destinations)) {
            $rawDest = $agent->tour_destinations;
            if (is_array($rawDest)) {
                $tourDestinations = implode(' → ', array_filter($rawDest));
            } elseif (is_string($rawDest)) {
                $trimmed = trim($rawDest);
                if ((str_starts_with($trimmed, '[') && str_ends_with($trimmed, ']')) || (str_starts_with($trimmed, '{') && str_ends_with($trimmed, '}'))) {
                    $decoded = json_decode($trimmed, true);
                    if (is_array($decoded)) {
                        $tourDestinations = implode(' → ', array_filter($decoded));
                    } else {
                        $tourDestinations = $trimmed;
                    }
                } else {
                    $tourDestinations = $trimmed;
                }
            }
        }
        if ($isTour && empty($tourDestinations)) {
            $tourDestinations = $outsourceVehicle->customer?->dropoff_location ?: ($agent->dropoff_location ?: '');
        }

        $invoiceNumber = 'TRIP-INV-OV' . str_pad($outsourceVehicle->id, 4, '0', STR_PAD_LEFT);

        $pdf = Pdf::loadView('invoices.trip-invoice', [
            'tripNumber'        => 'OV-' . $outsourceVehicle->id,
            'invoiceNumber'     => $invoiceNumber,
            'bookingType'       => $agent->booking_type ?? ($isTour ? 'Tour' : 'Transfer'),
            'isTour'            => $isTour,
            'isOutsource'       => true,
            'tourDestinations'  => $tourDestinations,
            'dropoffLocation'   => $outsourceVehicle->customer?->dropoff_location ?: ($agent->dropoff_location ?: '-'),
            'vehicleReg'        => $outsourceVehicle->vehicle_number,
            'vehicleModel'      => $agent->external_vehicle_make ?: 'Outside Vehicle',
            'driverName'        => 'Outside Driver',
            'driverContact'     => $outsourceVehicle->mobile_number ?: '-',
            'dispatchDate'      => $outsourceVehicle->created_at,
            'days'              => $agent->days ?? null,
            'status'            => 'Outsourced',
            'driverPayout'      => (float) $outsourceVehicle->price,
            'dailyRate'         => null,
            'driverRatePercent' => null,
            'outsourceAdvance'  => (float) ($outsourceVehicle->advance_payment ?? 0),
        ]);

        // Save invoice in trip_invoices/OV-{id} folder
        $outsourceInvoiceDir = storage_path("app/public/trip_invoices/OV-{$outsourceVehicle->id}");
        if (!file_exists($outsourceInvoiceDir)) {
            mkdir($outsourceInvoiceDir, 0755, true);
        }
        $savedFile = "{$outsourceInvoiceDir}/{$invoiceNumber}.pdf";
        try {
            $pdf->save($savedFile);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Failed to save outsource invoice PDF: " . $e->getMessage());
        }

        $outsourceVehicle->update([
            'invoice_path'         => "/storage/trip_invoices/OV-{$outsourceVehicle->id}/{$invoiceNumber}.pdf",
            'invoice_generated_at' => now(),
        ]);

        return $pdf->stream("{$invoiceNumber}.pdf");
    }
}