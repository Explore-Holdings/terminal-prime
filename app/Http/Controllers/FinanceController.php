<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use App\Models\Driver;
use App\Models\Finance;
use App\Models\Incentive;
use App\Models\RateSetting;
use App\Models\Trip;
use App\Models\TripFinance;
use App\Models\Expense;
use App\Models\Payout;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class FinanceController extends Controller
{
    public function index()
    {
        $trips = Trip::with([
            'customer.agent',
            'agent.user',
            'driver',
            'finance',
            'tripFinance.receiver',
        ])->latest()->get();

        $finances = TripFinance::with(['driver', 'agent.user'])->get();
        $rateSetting = RateSetting::where('is_active', true)->latest()->first();

        $payouts = Payout::with(['driver', 'agent.user', 'creator'])->latest()->get();

        $driverTotals = Driver::with(['incentives', 'payouts'])->get()->map(function ($driver) use ($finances) {
            $driverFinance = $finances->where('driver_id', $driver->id);
            $totalEarned = $driverFinance->sum('driver_share') + $driver->incentives->sum('amount');
            $totalPaid = $driver->payouts->sum('amount');

            return [
                'id' => $driver->id,
                'name' => $driver->full_name,
                'share_total' => $driverFinance->sum('driver_share'),
                'incentive_total' => $driver->incentives->sum('amount'),
                'grand_total' => $totalEarned,
                'total_paid' => $totalPaid,
                'balance' => $totalEarned - $totalPaid,
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

        $agentTotals = Agent::with(['user', 'incentives', 'payouts'])->get()->map(function ($agent) use ($finances) {
            $agentFinance = $finances->where('agent_id', $agent->id);
            $totalEarned = $agentFinance->sum('agent_share') + $agent->incentives->sum('amount');
            $totalPaid = $agent->payouts->sum('amount');

            return [
                'id' => $agent->id,
                'name' => $agent->user->name ?? $agent->name ?? '-',
                'share_total' => $agentFinance->sum('agent_share'),
                'incentive_total' => $agent->incentives->sum('amount'),
                'grand_total' => $totalEarned,
                'total_paid' => $totalPaid,
                'balance' => $totalEarned - $totalPaid,
            ];
        });

        $expenses = Expense::with('creator')->latest()->get();

        return Inertia::render('Finance/Index', [
            'trips' => $trips,
            'drivers' => Driver::select('id', 'full_name', 'registration_number', 'amount', 'due_date', 'payment_received', 'payment_method', 'payment_attachment', 'driver_status')->orderBy('full_name')->get(),
            'agents' => Agent::with('user')->latest()->get(),
            'driverTotals' => $driverTotals,
            'agentTotals' => $agentTotals,
            'incentives' => Incentive::with(['driver', 'agent.user'])->latest()->get(),
            'rateSetting' => $rateSetting,
            'expenses' => $expenses,
            'payouts' => $payouts,
        ]);
    }

    public function storePayout(Request $request)
    {
        $data = $request->validate([
            'person_type' => 'required|in:Driver,Agent',
            'driver_id' => 'nullable|required_if:person_type,Driver|exists:drivers,id',
            'agent_id' => 'nullable|required_if:person_type,Agent|exists:agents,id',
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'required|string|max:10',
            'remarks' => 'nullable|string',
        ]);

        Payout::create([
            'person_type' => $data['person_type'],
            'driver_id' => $data['person_type'] === 'Driver' ? $data['driver_id'] : null,
            'agent_id' => $data['person_type'] === 'Agent' ? $data['agent_id'] : null,
            'amount' => $data['amount'],
            'currency' => $data['currency'],
            'remarks' => $data['remarks'] ?? null,
            'created_by' => Auth::id(),
        ]);

        return back()->with('success', 'Payout recorded successfully.');
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

    public function markReceived(Request $request, Trip $trip)
    {
        $data = $request->validate([
            'total_amount'    => 'required|numeric|min:0',
            'driver_share'    => 'required|numeric|min:0',
            'agent_share'     => 'required|numeric|min:0',
            'balance'         => 'required|numeric',
            'received_amount' => 'required|numeric|min:0',
        ]);

        TripFinance::updateOrCreate(
            ['trip_id' => $trip->id],
            [
                'driver_id'       => $trip->driver_id,
                'agent_id'        => $trip->agent_id,
                'total_amount'    => $data['total_amount'],
                'driver_share'    => $data['driver_share'],
                'agent_share'     => $data['agent_share'],
                'balance'         => $data['balance'],
                'received'        => true,
                'received_amount' => $data['received_amount'],
                'received_by'     => Auth::id(),
                'received_at'     => now(),
            ]
        );

        $trip->update(['cash_received' => true]);

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

    public function updateIncentive(Request $request, Incentive $incentive)
    {
        $data = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'remarks' => 'nullable|string',
        ]);

        $incentive->update([
            'amount' => $data['amount'],
            'remarks' => $data['remarks'] ?? null,
        ]);

        return back();
    }

    public function destroyIncentive(Incentive $incentive)
    {
        $incentive->delete();
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
            if ($driver->payment_attachment && Storage::disk('public')->exists($driver->payment_attachment)) {
                Storage::disk('public')->delete($driver->payment_attachment);
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

    public function storeExpense(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'category' => 'nullable|string|max:100',
            'expense_date' => 'required|date',
            'remarks' => 'nullable|string',
        ]);

        Expense::create([
            ...$data,
            'created_by' => Auth::id(),
        ]);

        return back()->with('success', 'Expense created successfully.');
    }

    public function updateExpense(Request $request, Expense $expense)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'category' => 'nullable|string|max:100',
            'expense_date' => 'required|date',
            'remarks' => 'nullable|string',
        ]);

        $expense->update($data);

        return back()->with('success', 'Expense updated successfully.');
    }

    public function destroyExpense(Expense $expense)
    {
        $expense->update(['deleted_by' => Auth::id()]);
        $expense->delete();

        return back()->with('success', 'Expense deleted successfully.');
    }

    public function exportProfitLoss(Request $request)
    {
        $range = $request->query('range', 'all');
        $customStart = $request->query('custom_start');
        $customEnd = $request->query('custom_end');

        $tripsQuery = Trip::with(['customer', 'tripFinance'])->whereNotNull('trip_assigned_at');
        $expensesQuery = Expense::query();

        $startDate = null;
        $endDate = null;
        $dateLabel = 'All Time';

        if ($range === 'today') {
            $startDate = now()->startOfDay();
            $endDate = now()->endOfDay();
            $dateLabel = $startDate->format('d M Y');
        } elseif ($range === 'week') {
            $startDate = now()->startOfWeek();
            $endDate = now()->endOfWeek();
            $dateLabel = $startDate->format('d M Y') . ' to ' . $endDate->format('d M Y');
        } elseif ($range === 'month') {
            $startDate = now()->startOfMonth();
            $endDate = now()->endOfMonth();
            $dateLabel = $startDate->format('d M Y') . ' to ' . $endDate->format('d M Y');
        } elseif ($range === 'custom') {
            if ($customStart) {
                $startDate = \Carbon\Carbon::parse($customStart)->startOfDay();
                $endDate = $customEnd ? \Carbon\Carbon::parse($customEnd)->endOfDay() : $startDate->copy()->endOfDay();
                $dateLabel = $startDate->format('d M Y') . ' to ' . $endDate->format('d M Y');
            }
        }

        if ($startDate && $endDate) {
            $tripsQuery->whereBetween('trip_assigned_at', [$startDate, $endDate]);
            $expensesQuery->whereBetween('expense_date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')]);
        }

        $trips = $tripsQuery->get();
        $expenses = $expensesQuery->get();
        $rateSetting = \App\Models\RateSetting::first();
        $defaultDriverRate = $rateSetting ? $rateSetting->driver_rate : 0;
        $defaultAgentRate = $rateSetting ? $rateSetting->agent_rate : 0;

        $grossRevenue = 0;
        $driverPayouts = 0;
        $agentPayouts = 0;

        foreach ($trips as $trip) {
            $amount = floatval($trip->customer->paid_amount ?? 0);
            $grossRevenue += $amount;

            $tf = $trip->tripFinance;
            if ($tf && $tf->is_custom_rate) {
                $driverPayouts += floatval($tf->driver_share ?? 0);
                $agentPayouts += floatval($tf->agent_share ?? 0);
            } else {
                $driverPayouts += round($amount * $defaultDriverRate / 100);
                $agentPayouts += round($amount * $defaultAgentRate / 100);
            }
        }

        $netRevenue = $grossRevenue - $driverPayouts - $agentPayouts;
        $totalExpenses = $expenses->sum('amount');
        $netProfit = $netRevenue - $totalExpenses;
        $isProfit = $netProfit >= 0;
        
        $html = view('exports.profit_loss', compact(
            'dateLabel', 'trips', 'grossRevenue', 'driverPayouts', 
            'agentPayouts', 'netRevenue', 'expenses', 'totalExpenses', 
            'netProfit', 'isProfit'
        ))->render();

        return response($html)
            ->header('Content-Type', 'application/vnd.ms-excel')
            ->header('Content-Disposition', 'attachment; filename="Terminal_Prime_PnL_'.now()->format('Y-m-d').'.xls"');
    }
}