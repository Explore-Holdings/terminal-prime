<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use App\Models\Customer;
use App\Models\TripFinance;
use App\Mail\CustomerInvoiceMail;
use App\Mail\CustomerSurveyMail;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use App\Models\Trip;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Driver;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Google\Auth\Credentials\ServiceAccountCredentials;
use Inertia\Inertia;

class CustomerController extends Controller
{

    public function index()
    {
        return Inertia::render('Customers/Index', [
            'customers' => Customer::with(['agent.user'])
                ->latest()
                ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'agent_id' => 'required|exists:agents,id',
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'mobile_number' => 'nullable|string|max:30',
            'whatsapp_number' => 'nullable|string|max:30',
            'country' => 'nullable|string|max:100',
            'dropoff_location' => 'nullable|string|max:255',
            'passenger_count' => 'required|integer|min:1',
            'language_preference' => 'nullable|string|max:100',
            'status' => 'nullable|string|max:50',
            'remarks' => 'nullable|string',
        ]);

        $agent = Agent::findOrFail($data['agent_id']);

        $customer = Customer::create([
            ...$data,
            'customer_code' => $this->generateCustomerCode(),
            'passport_image' => $agent->customer_passport,
            'name' => $data['name'] ?: $agent->name,
            'dropoff_location' => $data['dropoff_location'] ?: $agent->dropoff_location,
            'passenger_count' => $data['passenger_count'] ?: $agent->passenger_count,
            'remarks' => $data['remarks'] ?: $agent->remarks,
            'status' => $data['status'] ?? 'New',
            'created_by' => Auth::id(),
        ]);

        return redirect()
            ->route('counter.index')
            ->with('created_customer_id', $customer->id);
    }

    public function savePayment(Request $request, Customer $customer)
    {
        $data = $request->validate([
            'currency'                  => 'required|string|max:10',
            'price'                     => 'required|numeric|min:0',
            'payments'                  => 'required|array|min:1',
            'payments.*.method'         => 'required|in:Cash,POS,Bank Transfer,Online',
            'payments.*.currency'       => 'nullable|string|max:10',
            'payments.*.amount'         => 'required|numeric|min:0',
            'payments.*.transaction_id' => 'nullable|string|max:100',
            'payments.*.card_number'    => 'nullable|string|max:100',
            'payments.*.notes'          => 'nullable|array',
            'payments.*.notes.*.currency' => 'nullable|string|max:10',
            'payments.*.notes.*.amount'   => 'nullable|numeric|min:0.01',
            'payments.*.notes.*.count'    => 'nullable|integer|min:1',
        ]);

        $payments = collect($data['payments'])->map(function ($p) use ($data) {
            $payCur = $p['currency'] ?? $data['currency'];

            if ($p['method'] === 'Cash' && !empty($p['notes'])) {
                $amount = collect($p['notes'])
                    ->sum(function ($n) {
                        return (float) ($n['amount'] ?? 0) * (int) ($n['count'] ?? 0);
                    });

                $notes = collect($p['notes'])
                    ->map(fn ($n) => [
                        'amount'   => $n['amount'] ?? null,
                        'count'    => $n['count'] ?? null,
                        'currency' => $n['currency'] ?? $payCur,
                    ])
                    ->values()->all();
            } else {
                $amount = (float) ($p['amount'] ?? 0);
                $notes  = null;
            }

            return [
                'method'         => $p['method'],
                'currency'       => $payCur,
                'amount'         => round($amount, 2),
                'notes'          => $notes,
                'transaction_id' => $p['transaction_id'] ?? null,
                'card_number'    => $p['card_number'] ?? null,
            ];
        })->values();

        $paidAmount = $payments->sum('amount');

        if (round($paidAmount, 2) !== round((float) $data['price'], 2)) {
            return back()->withErrors([
                'payments' => 'Total paid (' . number_format($paidAmount, 2) .
                            ') must match the price (' . number_format($data['price'], 2) . ').',
            ]);
        }

        // Validate cash blocks have at least one note
        foreach ($payments as $p) {
            if ($p['method'] === 'Cash' && empty($p['notes'])) {
                return back()->withErrors([
                    'payments' => 'Cash payments require at least one note breakdown.',
                ]);
            }
        }

        // Build summary fields from the payments array
        $methods   = $payments->pluck('method')->unique()->implode(' + ');
        $firstPos  = $payments->firstWhere('method', 'POS');

        $customer->update([
            'payment_method' => $methods,                 
            'payment_notes'  => $payments->toArray(),     
            'transaction_id' => $firstPos['transaction_id'] ?? null,
            'card_number'    => $firstPos['card_number'] ?? null,
            'paid_amount'    => $paidAmount,
            'payment_status' => $paidAmount >= (float) $data['price'] ? 'Paid' : 'Partial',
        ]);

        $agent = $customer->agent;
        $agentUpdate = [
            'new_currency'        => $data['currency'],
            'new_price'           => $data['price'],
            'currency_updated_by' => auth()->id(),
        ];
        if ($agent->booking_type === 'Rent a Car') {
            $agentUpdate['status'] = 'Approved';
        }
        $agent->update($agentUpdate);

        $invoiceNumber = 'INV-' . str_pad($customer->id, 5, '0', STR_PAD_LEFT);
        $invoicePath   = "invoices/{$invoiceNumber}.pdf";

        $customer->update(['invoice_number' => $invoiceNumber]);
        $customer->refresh()->load('agent.user');

        $pdf = Pdf::loadView('invoices.customer-invoice', [
            'customer'   => $customer,
            'currency'   => $data['currency'],
            'price'      => $data['price'],
            'paidAmount' => $paidAmount,
            'payments'   => $payments,  
        ]);

        Storage::disk('public')->put($invoicePath, $pdf->output());

        $customer->update(['invoice_path' => $invoicePath]);

        if ($customer->email) {
            Mail::to($customer->email)
                ->queue(new CustomerInvoiceMail($customer, $invoiceNumber));
        }

        return redirect()
            ->route('counter.index')
            ->with('invoice_path', $invoicePath);
    }

    public function assignTrip(Request $request, Customer $customer)
    {
        $data = $request->validate([
            'driver_id'      => 'required|exists:drivers,id',
            'agent_id'       => 'required|exists:agents,id',
            'remarks'        => 'nullable|string',
            'driver_rate'    => 'nullable|numeric|min:0|max:100',
            'agent_rate'     => 'nullable|numeric|min:0|max:100',
            'is_custom_rate' => 'nullable|boolean',
            'total_amount'   => 'nullable|numeric|min:0',
            'driver_share'   => 'nullable|numeric|min:0',
            'agent_share'    => 'nullable|numeric|min:0',
            'balance'        => 'nullable|numeric',
        ]);

        $trip = null;

        DB::transaction(function () use ($data, $customer, &$trip) {

            // ── Session Tracking: Initialize session_id for ALL drivers ──
            // When session_id is null (fresh start), session 1 applies to every
            // driver regardless of duty_status or check-in state.
            $driver = Driver::findOrFail($data['driver_id']);
            if ($driver->session_id === null) {
                Driver::whereNull('session_id')
                    ->update(['session_id' => 1]);
                $driver->refresh();
            }

            // ── Bump skipped drivers to next session ──
            // Extract slot number from assigned driver's registration_number.
            // All drivers with a lower slot number in the SAME session
            // are "skipped" and move to the next session — EXCEPT drivers
            // who are currently on an active trip (they'll be bumped by
            // TripObserver when their trip completes).
            $assignedSlot = null;
            if (preg_match('/\d+/', $driver->registration_number ?? '', $m)) {
                $assignedSlot = (int) $m[0];
            }

            if ($assignedSlot !== null && $driver->session_id !== null) {
                $currentSession = $driver->session_id;

                // IDs of drivers who currently have an active (non-completed) trip
                $onTripDriverIds = Trip::whereNotIn('status', ['Completed', 'Cancelled'])
                    ->pluck('driver_id')
                    ->toArray();

                // Get all drivers in the same session with a lower slot number
                // who are NOT currently on a trip
                $skippedDrivers = Driver::where('session_id', $currentSession)
                    ->where('id', '!=', $driver->id)
                    ->whereNotIn('id', $onTripDriverIds)
                    ->get()
                    ->filter(function ($d) use ($assignedSlot) {
                        if (preg_match('/\d+/', $d->registration_number ?? '', $m)) {
                            return (int) $m[0] < $assignedSlot;
                        }
                        return false;
                    });

                if ($skippedDrivers->isNotEmpty()) {
                    Driver::whereIn('id', $skippedDrivers->pluck('id'))
                        ->update(['session_id' => $currentSession + 1]);
                }
            }

            $trip = Trip::create([
                'driver_id'        => $data['driver_id'],
                'customer_id'      => $customer->id,
                'agent_id'         => $data['agent_id'],
                'trip_assigned_at' => now(),
                'trip_assigned_by' => auth()->id(),
                'remarks'          => $data['remarks'] ?? null,
                'status'           => 'Assigned',
            ]);

            // Update agent status
            $agent = Agent::findOrFail($data['agent_id']);
            $agent->update([
                'status' => 'Approved',
            ]);

            $totalAmount = (float) ($data['total_amount'] ?? 0);
            $driverRate  = (float) ($data['driver_rate'] ?? 0);
            $agentRate   = (float) ($data['agent_rate'] ?? 0);

            $driverShare = isset($data['driver_share'])
                ? round((float) $data['driver_share'])
                : round($totalAmount * $driverRate / 100);

            $agentShare = isset($data['agent_share'])
                ? round((float) $data['agent_share'])
                : round($totalAmount * $agentRate / 100);

            $balance = isset($data['balance'])
                ? round((float) $data['balance'])
                : round($totalAmount - $driverShare - $agentShare);

            TripFinance::create([
                'trip_id'        => $trip->id,
                'driver_id'      => $data['driver_id'],
                'agent_id'       => $data['agent_id'],
                'agent_user_id'  => $agent->user_id,
                'driver_rate'    => $driverRate,
                'agent_rate'     => $agentRate,
                'is_custom_rate' => (bool) ($data['is_custom_rate'] ?? false),
                'total_amount'   => $totalAmount,
                'driver_share'   => $driverShare,
                'agent_share'    => $agentShare,
                'balance'        => $balance,
                'received'       => false,
            ]);
        });

        /*
        |--------------------------------------------------------------------------
        | Send Push Notification (After Transaction)
        |--------------------------------------------------------------------------
        */

        $driver = Driver::find($data['driver_id']);

        $user = User::where('driver_id', $data['driver_id'])
            ->whereNotNull('fcm_token')
            ->first();

        if ($user) {

            $notifResult = self::sendFcmNotification(
                token: $user->fcm_token,
                title: '🚗 New Trip Assigned!',
                body: "{$customer->name}·{$customer->dropoff_location} · {$customer->passenger_count} pax",
                data: [
                    'trip_id' => (string) $trip->id,
                    'type'    => 'trip_assigned',
                ]
            );

            Log::info('[FCM] Notification sent', [
                'driver'  => optional($driver)->full_name,
                'trip_id' => $trip->id,
                'success' => $notifResult,
            ]);

        } else {

            Log::warning('[FCM] No FCM token found', [
                'driver_id' => $data['driver_id'],
            ]);
        }

        return back()->with('success', 'Trip assigned successfully.');
    }

    private static function sendFcmNotification(
        string $token,
        string $title,
        string $body,
        array  $data = []
    ): bool {
        try {
            // ── Get OAuth2 access token from service account ──
            $credentialsPath = storage_path('app/firebase/service-account.json');

            $credentials = new ServiceAccountCredentials(
                'https://www.googleapis.com/auth/firebase.messaging',
                json_decode(file_get_contents($credentialsPath), true)
            );

            $token_data  = $credentials->fetchAuthToken();
            $accessToken = $token_data['access_token'];

            // ── Get Firebase project ID from service account ──
            $serviceAccount = json_decode(
                file_get_contents($credentialsPath), true);
            $projectId = $serviceAccount['project_id'];

            // ── Build FCM v1 API request ──
            $url = "https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send";

            $payload = [
                'message' => [
                    'token' => $token,
                    'notification' => [
                        'title' => $title,
                        'body'  => $body,
                    ],
                    'data' => array_map('strval', $data),
                    'android' => [
                        'priority' => 'high',
                        'notification' => [
                            'sound'        => 'default',
                            'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
                            'channel_id'   => 'trip_channel',
                        ],
                    ],
                    'apns' => [
                        'payload' => [
                            'aps' => [
                                'sound' => 'default',
                                'badge' => 1,
                            ],
                        ],
                    ],
                ],
            ];

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$accessToken}",
                'Content-Type'  => 'application/json',
            ])->post($url, $payload);

            Log::info('[FCM] Response', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);

            return $response->successful();

        } catch (\Exception $e) {
            Log::error('[FCM] Error: ' . $e->getMessage());
            return false;
        }
    }

    private function generateCustomerCode()
    {
        $last = Customer::withTrashed()
            ->where('customer_code', 'REGEXP', '^CUS-[0-9]{5}$')
            ->orderByRaw("CAST(SUBSTRING(customer_code, 5) AS UNSIGNED) DESC")
            ->first();

        $next = $last ? ((int) substr($last->customer_code, 4)) + 1 : 1;

        return 'CUS-' . str_pad($next, 5, '0', STR_PAD_LEFT);
    }

    public function assignExternalVehicle(Request $request, Customer $customer)
    {
        $data = $request->validate([
            'external_vehicle_id'    => 'required',
            'external_vehicle_reg'   => 'required',
            'external_vehicle_make'  => 'required',
            'external_vehicle_model' => 'required',
            'external_company_id'    => 'required',
            'external_company_name'  => 'required',
            'start_date'             => 'required|date',
            'end_date'               => 'required|date',
        ]);

        $agent = $customer->agent;
        
        if (!$agent) {
            return back()->withErrors(['agent' => 'Agent booking not found for this customer.']);
        }

        // Generate TP-XXX booking number
        $lastBooking = \App\Models\Agent::whereNotNull('external_vehicle_id')
            ->where('booking_number', 'REGEXP', '^TP-[0-9]+$')
            ->orderByRaw("CAST(SUBSTRING(booking_number, 4) AS UNSIGNED) DESC")
            ->first();

        $nextNum = $lastBooking ? ((int) substr($lastBooking->booking_number, 3)) + 1 : 1;
        $bookingNumber = 'TP-' . str_pad($nextNum, 3, '0', STR_PAD_LEFT);

        $agent->update([
            'status' => 'Approved',
            'booking_number'         => $bookingNumber,
            'external_vehicle_id'    => $data['external_vehicle_id'],
            'external_vehicle_reg'   => $data['external_vehicle_reg'],
            'external_vehicle_make'  => $data['external_vehicle_make'],
            'external_vehicle_model' => $data['external_vehicle_model'],
            'external_company_name'  => $data['external_company_name'],
            'rent_start_date'        => $data['start_date'],
            'rent_end_date'          => $data['end_date'],
        ]);

        // Sync to FMS rentals table
        try {
            $fmsUrl = env('FMS_API_URL', 'http://127.0.0.1:9000/api');
            $syncSecret = env('FMS_SYNC_SECRET', '');

            \Illuminate\Support\Facades\Http::withHeaders([
                'X-SYNC-SECRET' => $syncSecret,
            ])->post("{$fmsUrl}/rental-sync", [
                'booking_number' => $bookingNumber,
                'vehicle_id'     => (int) $data['external_vehicle_id'],
                'company_id'     => (int) $data['external_company_id'],
                'driver_name'    => $customer->name ?? 'N/A',
                'arrival_date'   => $data['start_date'],
                'departure_date' => $data['end_date'],
                'passengers'     => (int) ($agent->passenger_count ?? 1),
                'status'         => 'booked',
                'created_by'     => auth()->id(),
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('FMS rental sync failed: ' . $e->getMessage());
        }

        return back()->with('success', 'External vehicle assigned successfully.');
    }
}