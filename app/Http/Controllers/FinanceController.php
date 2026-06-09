<?php

namespace App\Http\Controllers;

use App\Models\Finance;
use App\Models\Trip;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FinanceController extends Controller
{
    public function index()
    {
        $trips = Trip::with([
            'customer',
            'agent.user',
            'driver',
            'finance',
        ])
            ->latest()
            ->get();

        return Inertia::render('Finance/Index', [
            'trips' => $trips,
        ]);
    }

    public function store(Request $request, Trip $trip)
    {
        $data = $request->validate([
            'driver_amount' => 'required|numeric|min:0',
            'agent_amount' => 'required|numeric|min:0',
            'company_amount' => 'required|numeric|min:0',
            'expense_amount' => 'nullable|numeric|min:0',
            'remarks' => 'nullable|string',
        ]);

        $customer = $trip->customer;

        Finance::updateOrCreate(
            ['trip_id' => $trip->id],
            [
                'customer_id' => $trip->customer_id,
                'agent_id' => $trip->agent_id,
                'driver_id' => $trip->driver_id,
                'currency' => $customer->agent->new_currency ?? $customer->agent->currency ?? 'LKR',
                'trip_amount' => $customer->paid_amount ?? 0,
                'driver_amount' => $data['driver_amount'],
                'agent_amount' => $data['agent_amount'],
                'company_amount' => $data['company_amount'],
                'expense_amount' => $data['expense_amount'] ?? 0,
                'status' => 'Settled',
                'remarks' => $data['remarks'] ?? null,
                'created_by' => auth()->id(),
            ]
        );

        return back()->with('success', 'Finance record saved.');
    }
}