<?php

namespace App\Http\Controllers;

use App\Models\Agent;
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

            'vehicles' => Vehicle::with(['driver.languages', 'pictures'])
                ->whereHas('driver', fn ($q) =>
                    $q->where('status', 'On Duty')
                    ->whereDoesntHave('trips', fn ($t) =>
                        $t->where('status', '==', 'Completed')
                    )
                )
                ->latest()
                ->get(),

            'createdCustomerId' => session()->pull('created_customer_id'),
            'invoicePath' => session()->pull('invoice_path'),
        ]);
    }
}