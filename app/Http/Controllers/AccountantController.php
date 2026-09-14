<?php

namespace App\Http\Controllers;

use App\Models\Trip;
use App\Models\UserLoginLog;
use App\Models\TripFinance;
use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountantController extends Controller
{
    public function index(Request $request)
    {
        // Fetch all trip finances that have been received
        $receivedFinances = TripFinance::with([
            'trip.customer',
            'trip.driver.vehicle',
            'trip.agent.user',
            'receiver' // User who marked it as received
        ])
        ->where('received', true)
        ->orderByDesc('received_at')
        ->get();

        return Inertia::render('Accountant/Index', [
            'receivedFinances' => $receivedFinances,
        ]);
    }
}

