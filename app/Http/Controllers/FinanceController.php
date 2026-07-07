<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use App\Models\Driver;
use App\Models\Finance;
use App\Models\Incentive;
use App\Models\RateSetting;
use App\Models\Trip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class FinanceController extends Controller
{
    public function index()
    {
        $trips = Trip::with([
            'customer.agent',
            'agent.user',
            'driver',
            'finance',
        ])->latest()->get();

        $finances = Finance::with(['driver', 'agent.user'])->get();
        $rateSetting = RateSetting::where('is_active', true)->latest()->first();

        $driverTotals = Driver::with('incentives')->get()->map(function ($driver) use ($finances) {
            $driverFinance = $finances->where('driver_id', $driver->id);

            return [
                'id' => $driver->id,
                'name' => $driver->full_name,
                'share_total' => $driverFinance->sum('driver_amount'),
                'incentive_total' => $driver->incentives->sum('amount'),
                'grand_total' => $driverFinance->sum('driver_amount') + $driver->incentives->sum('amount'),
            ];
        });

        Driver::all()->each(function ($driver) {
            if ($driver->payment_received) {
                $driver->update([
                    'driver_status' => 'Active',
                ]);
            } elseif (
                $driver->due_date &&
                now()->gt(\Carbon\Carbon::parse($driver->due_date))
            ) {
                $driver->update([
                    'driver_status' => 'Suspended',
                ]);
            }
        });

        $agentTotals = Agent::with(['user', 'incentives'])->get()->map(function ($agent) use ($finances) {
            $agentFinance = $finances->where('agent_id', $agent->id);

            return [
                'id' => $agent->id,
                'name' => $agent->user->name ?? $agent->name ?? '-',
                'share_total' => $agentFinance->sum('agent_amount'),
                'incentive_total' => $agent->incentives->sum('amount'),
                'grand_total' => $agentFinance->sum('agent_amount') + $agent->incentives->sum('amount'),
            ];
        });

        return Inertia::render('Finance/Index', [
            'trips' => $trips,
            'drivers' => Driver::select('id', 'full_name', 'registration_number', 'amount', 'due_date', 'payment_received', 'payment_method', 'payment_attachment', 'driver_status')->orderBy('full_name')->get(),
            'agents' => Agent::with('user')->latest()->get(),
            'driverTotals' => $driverTotals,
            'agentTotals' => $agentTotals,
            'incentives' => Incentive::with(['driver', 'agent.user'])->latest()->get(),
            'rateSetting' => $rateSetting,
        ]);
    }

    public function storeRateSettings(Request $request)
    {
        $data = $request->validate([
            'agent_rate' => 'required|numeric|min:0|max:100',
            'driver_rate' => 'required|numeric|min:0|max:100',
        ]);

        RateSetting::updateOrCreate(
            ['is_active' => true],
            [
                'name' => 'Default',
                'agent_rate' => $data['agent_rate'],
                'driver_rate' => $data['driver_rate'],
                'is_active' => true,
            ]
        );

        return back();
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

        Finance::updateOrCreate(
            ['trip_id' => $trip->id],
            [
                'customer_id' => $trip->customer_id,
                'agent_id' => $trip->agent_id,
                'driver_id' => $trip->driver_id,
                'currency' => $trip->customer->agent->new_currency ?? $trip->customer->agent->currency ?? 'LKR',
                'trip_amount' => $trip->customer->paid_amount ?? 0,
                'driver_amount' => $data['driver_amount'],
                'agent_amount' => $data['agent_amount'],
                'company_amount' => $data['company_amount'],
                'expense_amount' => $data['expense_amount'] ?? 0,
                'status' => 'Settled',
                'remarks' => $data['remarks'] ?? null,
                'created_by' => Auth::id(),
            ]
        );

        return back();
    }

    public function storeIncentive(Request $request)
    {
        $data = $request->validate([
            'person_type' => 'required|in:Driver,Agent',
            'driver_id' => 'nullable|required_if:person_type,Driver|exists:drivers,id',
            'agent_id' => 'nullable|required_if:person_type,Agent|exists:agents,id',
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'required|string|max:10',
            'remarks' => 'nullable|string',
        ]);

        Incentive::create([
            'person_type' => $data['person_type'],
            'driver_id' => $data['person_type'] === 'Driver' ? $data['driver_id'] : null,
            'agent_id' => $data['person_type'] === 'Agent' ? $data['agent_id'] : null,
            'amount' => $data['amount'],
            'currency' => $data['currency'],
            'remarks' => $data['remarks'] ?? null,
            'created_by' => Auth::id(),
        ]);

        return back();
    }

    public function updateDriverPayment(Request $request, Driver $driver)
    {
        $data = $request->validate([
            'amount' => 'nullable|numeric|min:0',
            'due_date' => 'nullable|date',
            'payment_received' => 'nullable|boolean',
            'payment_method' => 'nullable|string|max:100',
            'payment_attachment' => 'nullable|file|max:10240', // max 10MB
        ]);

        $updateData = [
            'amount' => $data['amount'] ?? null,
            'due_date' => $data['due_date'] ?? null,
            'payment_received' => filter_var($data['payment_received'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'payment_method' => $data['payment_method'] ?? null,
        ];

        if ($request->hasFile('payment_attachment')) {
            // Delete old file if exists
            if ($driver->payment_attachment && \Illuminate\Support\Facades\Storage::disk('public')->exists($driver->payment_attachment)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($driver->payment_attachment);
            }

            $file = $request->file('payment_attachment');
            $extension = $file->getClientOriginalExtension();
            $fileName = "driver-" . $driver->id . "-payment-" . time() . "." . $extension;
            $path = $file->storeAs("driver_payments", $fileName, 'public');
            $updateData['payment_attachment'] = $path;
        }

        $driver->update($updateData);

        return back();
    }

    public function updateDriverStatus(Request $request, Driver $driver)
    {
        $data = $request->validate([
            'driver_status' => 'required|in:Active,Inactive,Suspended,Rejected',
        ]);

        $driver->update([
            'driver_status' => $data['driver_status']
        ]);

        return back();
    }
}