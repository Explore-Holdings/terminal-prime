<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use App\Models\Trip;
use App\Models\Vehicle;
use Inertia\Inertia;

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
        ]);
    }
}