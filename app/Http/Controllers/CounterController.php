<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use App\Models\Trip;
use App\Models\Country;
use App\Models\Vehicle;
use App\Models\RateSetting;
use App\Models\LocationVehiclePrice;
use App\Models\UserLoginLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

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

            'vehicles' => Vehicle::with(['driver.languages', 'pictures'])
                ->select('vehicles.*')
                ->join('drivers', 'drivers.id', '=', 'vehicles.driver_id')
                ->where('drivers.duty_status', 'on_duty')
                ->whereDoesntHave('driver.trips', fn ($t) =>
                    $t->where('status', '!=', 'Completed')
                )
                ->orderBy('drivers.checked_in_at', 'asc')
                ->get(),

            'createdCustomerId' => session()->pull('created_customer_id'),
            'invoicePath' => session()->pull('invoice_path'),

            'countries' => Country::orderBy('country_name')->get(),

            'rateSetting' => RateSetting::where('is_active', true)->latest()->first(),

            'locationVehiclePrices' => LocationVehiclePrice::orderBy('city')->get(),
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

        return Inertia::render('Counter/CheckoutSummary', [
            'log' => $userLoginLog,
            'user' => $user,
            'trips' => $trips,
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

        $pdf = Pdf::loadView('pdf.checkout-summary', [
            'log' => $userLoginLog,
            'user' => $user,
            'trips' => $trips,
        ]);

        return $pdf->download('checkout-summary-' . $userLoginLog->id . '.pdf');
    }
}