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
use App\Models\TripFinance;
use App\Models\Expense;
use App\Models\Payout;
use App\Models\Finance;
use App\Models\Customer;
use App\Models\CustomerSurvey;
use App\Models\User;
use App\Models\Driver;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;

class CounterController extends Controller
{
    public function dssIndex(Request $request)
    {
        $filter = $request->query('filter', 'today');
        
        if ($filter === 'this_week') {
            $startDate = now()->startOfWeek();
        } elseif ($filter === 'this_month') {
            $startDate = now()->startOfMonth();
        } elseif ($filter === 'this_year') {
            $startDate = now()->startOfYear();
        } elseif ($filter === 'all_time') {
            $startDate = now()->subYears(50);
        } else {
            $startDate = now()->startOfDay();
        }

        // 1. Shift & Cash
        $currentShiftLog = UserLoginLog::where('user_id', Auth::id())
            ->whereNull('logout_at')
            ->latest('login_at')
            ->first();

        $totalCashCollected = 0;
        $handedOverCash = 0;
        $cashInHand = 0;
        $shiftTrips = collect();

        if ($currentShiftLog) {
            $shiftTrips = TripFinance::with(['trip.customer', 'driver', 'agentUser'])
                ->whereHas('trip', function ($q) use ($currentShiftLog) {
                    $q->where('trip_assigned_by', Auth::id())
                      ->where('trip_assigned_at', '>=', $currentShiftLog->login_at);
                })
                ->latest()
                ->get();
            
            $totalCashCollected = $shiftTrips->sum('total_amount');
            $handedOverCash = $shiftTrips->sum('received_amount');
            $cashInHand = $totalCashCollected - $handedOverCash;
        }

        $staffOnShift = UserLoginLog::whereNull('logout_at')->distinct('user_id')->count('user_id');

        // 2. Trips & Fleet
        $activeTripsCount = Trip::where('status', '!=', 'Completed')->count();
        $completedTodayCount = Trip::where('status', 'Completed')->where('trip_ended_at', '>=', $startDate)->count();
        $availableDriversCount = Driver::where('driver_status', 'Active')
            ->where('duty_status', 'on_duty')
            ->whereDoesntHave('trips', function ($q) {
                $q->where('status', '!=', 'Completed');
            })->count();
        $offDutyDriversCount = Driver::where('duty_status', 'off_duty')->count();
        $suspendedDriversCount = Driver::where('driver_status', 'Suspended')->count();
        $suspendedDriversList = Driver::where('driver_status', 'Suspended')->get();

        // 3. Finance & Accounting
        $totalRevenueToday = TripFinance::where('created_at', '>=', $startDate)->sum('total_amount');
        $pendingPayouts = TripFinance::sum('balance');
        $totalExpensesToday = Expense::where('expense_date', '>=', $startDate)->sum('amount');
        $netProfit = $totalRevenueToday - $totalExpensesToday; 
        
        $recentFinancialTransactions = TripFinance::with(['trip.customer', 'driver'])
            ->latest()
            ->limit(10)
            ->get();

        // 4. Customers, Surveys & Users
        $totalCustomers = Customer::count();
        $newTodayCustomers = Customer::where('created_at', '>=', $startDate)->count();
        $surveysCollected = CustomerSurvey::count();
        $avgSatisfaction = CustomerSurvey::avg('journey_rating') ?? 0;
        $activeSystemUsers = User::count();

        $vehicles = Vehicle::with([
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
            ->orderByRaw("COALESCE(drivers.session_id, 0) ASC")
            ->orderBy('drivers.checked_in_at', 'asc')
            ->get();

        $ongoingTrips = Trip::with(['driver.vehicle', 'customer', 'agent.user'])
            ->where('status', '!=', 'Completed')
            ->latest()
            ->get();

        return Inertia::render('DSS/Index', [
            'metrics' => [
                'totalCashCollected' => $totalCashCollected,
                'handedOverCash' => $handedOverCash,
                'cashInHand' => $cashInHand,
                'staffOnShift' => $staffOnShift,
                'shiftTrips' => $shiftTrips,

                'activeTripsCount' => $activeTripsCount,
                'completedTodayCount' => $completedTodayCount,
                'availableDriversCount' => $availableDriversCount,
                'offDutyDriversCount' => $offDutyDriversCount,
                'suspendedDriversCount' => $suspendedDriversCount,
                'suspendedDriversList' => $suspendedDriversList,

                'totalRevenueToday' => $totalRevenueToday,
                'pendingPayouts' => $pendingPayouts,
                'totalExpensesToday' => $totalExpensesToday,
                'netProfit' => $netProfit,
                'recentFinancialTransactions' => $recentFinancialTransactions,

                'totalCustomers' => $totalCustomers,
                'newTodayCustomers' => $newTodayCustomers,
                'surveysCollected' => $surveysCollected,
                'avgSatisfaction' => round((float)$avgSatisfaction, 1),
                'activeSystemUsers' => $activeSystemUsers,
                'onlineNow' => $staffOnShift,
            ],
            'vehicles' => $vehicles,
            'ongoingTrips' => $ongoingTrips,
            'filter' => $filter,
        ]);
    }

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
                ->orderByRaw("COALESCE(drivers.session_id, 0) ASC")
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
            $shiftId = 'SHIFT-' . str_pad($log->id, 2, '0', STR_PAD_LEFT);
            $log->update([
                'logout_at' => now(),
                'shift_id' => $shiftId,
            ]);
            $logId = $log->id;
        } else {
            $newLog = UserLoginLog::create([
                'user_id' => $userId,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'login_at' => now()->subHours(1),
                'logout_at' => now(),
            ]);
            $shiftId = 'SHIFT-' . str_pad($newLog->id, 2, '0', STR_PAD_LEFT);
            $newLog->update(['shift_id' => $shiftId]);
            $logId = $newLog->id;
        }

        return redirect()->route('counter.checkout-summary', $logId);
    }

    public function reorderSession(Request $request)
    {
        $request->validate([
            'driver_ids' => 'required|array',
            'driver_ids.*' => 'integer|exists:drivers,id',
            'target_session' => 'required|integer|min:1',
        ]);

        // Exclude drivers who currently have an active (non-completed) trip
        $onTripDriverIds = Trip::whereNotIn('status', ['Completed', 'Cancelled'])
            ->pluck('driver_id')
            ->toArray();

        \App\Models\Driver::whereIn('id', $request->driver_ids)
            ->whereNotIn('id', $onTripDriverIds)
            ->update(['session_id' => $request->target_session]);

        return back()->with('success', 'Session reordered successfully.');
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