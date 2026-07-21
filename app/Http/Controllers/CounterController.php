<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use App\Models\Trip;
use App\Models\Country;
use App\Models\Vehicle;
use App\Models\RateSetting;
use App\Models\LocationVehiclePrice;
use App\Models\DriverLanguage;
use App\Models\UserLoginLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;

class CounterController extends Controller
{
    public function index()
    {
        return Inertia::render('Counter/Index', [
            'pendingAgents' => Agent::with('user')
                ->where('status', 'Pending')
                ->latest()
                ->get(),

            'ongoingTrips' => Trip::with(['driver', 'customer', 'agent','driver.vehicle',])
                ->where('status', '!=', 'Completed')
                ->latest()
                ->get(),

            'vehicles' => Vehicle::with([
                    'driver.languages',
                    'pictures',
                    'driver.trips' => function ($q) {
                        $q->where('status', '!=', 'Completed');
                    }
                ])
                ->select('vehicles.*')
                ->join('drivers', 'drivers.id', '=', 'vehicles.driver_id')
                ->where('drivers.driver_status', 'Active')
                ->orderByRaw("
                    CASE
                        WHEN drivers.duty_status = 'on_duty' THEN 0
                        ELSE 1
                    END
                ")
                ->orderBy('drivers.checked_in_at', 'asc')
                ->get(),
                
            'createdCustomerId' => session()->pull('created_customer_id'),
            'invoicePath' => session()->pull('invoice_path'),

            'countries' => Country::orderBy('country_name')->get(),

            'rateSetting' => RateSetting::where('is_active', true)->latest()->first(),

            'locationVehiclePrices' => LocationVehiclePrice::orderBy('city')->get(),

            'vehicleRates' => DB::table('vehicle_rates')->get(),

            'dbLanguages' => DriverLanguage::select('language_name')
                ->distinct()
                ->whereNotNull('language_name')
                ->where('language_name', '!=', '')
                ->orderBy('language_name')
                ->pluck('language_name'),

            'myTrips' => Trip::with(['driver.vehicle', 'customer', 'agent.user', 'tripFinance'])
                ->where('trip_assigned_by', Auth::id())
                ->latest('trip_assigned_at')
                ->get(),
        ]);
    }

    public function checkout(Request $request)
    {
        $userId = Auth::id();
        if (!$userId) {
            return redirect()->route('login');
        }

        $log = UserLoginLog::where('user_id', $userId)
            ->whereNull('logout_at')
            ->latest('login_at')
            ->first();

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if ($log) {
            $log->update(['logout_at' => now()]);
            $logId = $log->id;
        } else {
            $newLog = UserLoginLog::create([
                'user_id' => $userId,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'login_at' => now()->subHours(1),
                'logout_at' => now(),
            ]);
            $logId = $newLog->id;
        }

        return redirect()->route('counter.checkout-summary', $logId);
    }

    public function checkoutSummary(UserLoginLog $userLoginLog)
    {
        $user = $userLoginLog->user;

        $trips = Trip::with(['customer', 'driver.vehicle', 'tripFinance'])
            ->where('trip_assigned_by', $userLoginLog->user_id)
            ->where('trip_assigned_at', '>=', $userLoginLog->login_at)
            ->where('trip_assigned_at', '<=', $userLoginLog->logout_at ?? now())
            ->latest()
            ->get();

        $paymentSummary = $this->buildPaymentSummary($trips);

        return Inertia::render('Counter/CheckoutSummary', [
            'log' => $userLoginLog,
            'user' => $user,
            'trips' => $trips,
            'paymentSummary' => $paymentSummary,
        ]);
    }

    public function handover(UserLoginLog $userLoginLog)
    {
        $userLoginLog->update([
            'handed_over_at' => now(),
        ]);

        return back()->with('success', 'Handover to manager registered successfully.');
    }

    public function downloadPdf(UserLoginLog $userLoginLog)
    {
        $user = $userLoginLog->user;

        $trips = Trip::with(['customer', 'driver.vehicle', 'tripFinance'])
            ->where('trip_assigned_by', $userLoginLog->user_id)
            ->where('trip_assigned_at', '>=', $userLoginLog->login_at)
            ->where('trip_assigned_at', '<=', $userLoginLog->logout_at ?? now())
            ->latest()
            ->get();

        $paymentSummary = $this->buildPaymentSummary($trips);

        $pdf = Pdf::loadView('pdf.checkout-summary', [
            'log' => $userLoginLog,
            'user' => $user,
            'trips' => $trips,
            'paymentSummary' => $paymentSummary,
        ]);
        $pdf->getDomPDF()->set_option('isPhpEnabled', true);

        return $pdf->download('checkout-summary-' . $userLoginLog->id . '.pdf');
    }

    private function buildPaymentSummary($trips)
    {
        $byMethod = [];
        $currencies = [];
        $cashNotesMap = [];
        $posTransactions = [];

        foreach ($trips as $trip) {
            $customer = $trip->customer;
            if (!$customer) continue;

            $paymentNotes = $customer->payment_notes;
            if (is_string($paymentNotes)) {
                $paymentNotes = json_decode($paymentNotes, true);
            }

            if (!is_array($paymentNotes) || empty($paymentNotes)) {
                if ($customer->payment_method) {
                    $method = $customer->payment_method;
                    $paid = (float)($customer->paid_amount ?? 0);
                    $cur = $customer->agent?->currency ?? 'LKR';

                    if (!isset($byMethod[$method])) {
                        $byMethod[$method] = ['total' => 0, 'currencies' => [], 'count' => 0];
                    }
                    $byMethod[$method]['total'] += $paid;
                    $byMethod[$method]['count'] += 1;
                    $byMethod[$method]['currencies'][$cur] = ($byMethod[$method]['currencies'][$cur] ?? 0) + $paid;
                    $currencies[$cur] = ($currencies[$cur] ?? 0) + $paid;
                }
                continue;
            }

            foreach ($paymentNotes as $p) {
                $method = $p['method'] ?? 'Other';
                $currency = strtoupper($p['currency'] ?? 'LKR');
                $amount = (float)($p['amount'] ?? 0);

                if (!isset($byMethod[$method])) {
                    $byMethod[$method] = [
                        'total' => 0,
                        'currencies' => [],
                        'count' => 0,
                    ];
                }
                $byMethod[$method]['total'] += $amount;
                $byMethod[$method]['count'] += 1;
                $byMethod[$method]['currencies'][$currency] = ($byMethod[$method]['currencies'][$currency] ?? 0) + $amount;

                $currencies[$currency] = ($currencies[$currency] ?? 0) + $amount;

                if ($method === 'POS' || !empty($p['transaction_id']) || !empty($p['card_number'])) {
                    $posTransactions[] = [
                        'customer_name' => $customer->name,
                        'customer_code' => $customer->customer_code,
                        'method' => $method,
                        'amount' => $amount,
                        'currency' => $currency,
                        'transaction_id' => $p['transaction_id'] ?? $customer->transaction_id,
                        'card_number' => $p['card_number'] ?? $customer->card_number,
                    ];
                }

                if ($method === 'Cash' && !empty($p['notes']) && is_array($p['notes'])) {
                    foreach ($p['notes'] as $note) {
                        $noteVal = (float)($note['amount'] ?? 0);
                        $noteQty = (int)($note['count'] ?? 0);
                        $noteCur = strtoupper($note['currency'] ?? $currency);

                        if ($noteVal > 0 && $noteQty > 0) {
                            $key = $noteCur . '_' . $noteVal;
                            if (!isset($cashNotesMap[$key])) {
                                $cashNotesMap[$key] = [
                                    'currency' => $noteCur,
                                    'note_value' => $noteVal,
                                    'count' => 0,
                                    'total' => 0,
                                ];
                            }
                            $cashNotesMap[$key]['count'] += $noteQty;
                            $cashNotesMap[$key]['total'] += ($noteVal * $noteQty);
                        }
                    }
                }
            }
        }

        $cashNotes = array_values($cashNotesMap);
        usort($cashNotes, function ($a, $b) {
            if ($a['currency'] === $b['currency']) {
                return $b['note_value'] <=> $a['note_value'];
            }
            return strcmp($a['currency'], $b['currency']);
        });

        return [
            'byMethod' => $byMethod,
            'currencies' => $currencies,
            'cashNotes' => $cashNotes,
            'posTransactions' => $posTransactions,
            'totals' => [
                'trips_count' => count($trips),
                'total_amount' => $trips->sum(fn($t) => $t->tripFinance?->total_amount ?? 0),
                'driver_share' => $trips->sum(fn($t) => $t->tripFinance?->driver_share ?? 0),
                'agent_share' => $trips->sum(fn($t) => $t->tripFinance?->agent_share ?? 0),
                'balance' => $trips->sum(fn($t) => $t->tripFinance?->balance ?? 0),
            ],
        ];
    }
}