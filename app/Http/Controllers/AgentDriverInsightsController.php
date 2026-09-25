<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Inertia\Inertia;

class AgentDriverInsightsController extends Controller
{
    public function index()
    {
        $customers = Customer::with([
            'agent.user',
            'latestTrip.driver.vehicle',
            'latestTrip.tripFinance',
        ])
        ->latest()
        ->get();

        return Inertia::render('AgentDriverInsights/Index', [
            'customers' => $customers,
        ]);
    }
}
