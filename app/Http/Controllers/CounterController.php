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

            'vehicles' => Vehicle::with('driver', 'driver.languages', 'pictures')
                ->latest()
                ->get(),

            'createdCustomerId' => session('created_customer_id'),
            'invoicePath' => session('invoice_path'),
        ]);
    }
}