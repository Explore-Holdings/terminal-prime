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
use App\Models\OutsourceVehicle;
use App\Models\Customer;
use App\Models\PettyCashShiftLog;
use App\Models\PettyCashReturn;
use App\Models\PettyCashRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class FinanceController extends Controller
{
    public function index()
    {
        $trips = Trip::with([
            'customer.agent.user', 
            'agent.user',
            'driver.vehicle',
            'finance',
            'tripFinance.receiver',
            'tripFinance.paymentSlips.uploader',
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
                'first_name' => $driver->first_name,
                'last_name' => $driver->last_name,
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
                'first_name' => $agent->user->name ?? $agent->name ?? '',
                'last_name' => '',
                'share_total' => $agentFinance->sum('agent_share'),
                'incentive_total' => $agent->incentives->sum('amount'),
                'grand_total' => $totalEarned,
                'total_paid' => $totalPaid,
                'balance' => $totalEarned - $totalPaid,
            ];
        });

        $expenses = Expense::with('creator')->latest()->get();

        $pettyCashShiftLogs = PettyCashShiftLog::latest()->get();
        $pettyCashReturns = PettyCashReturn::with('customer')->latest()->get();
        $pettyCashBalance = DB::table('petty_cash')->where('id', 1)->value('amount') ?? 0;

        $pettyCashRequests = PettyCashRequest::with('requestedBy', 'approvedBy')->latest()->get();

        $outsourceVehicles = OutsourceVehicle::with([
            'customer',
            'agent.user',
            'creator',
            'receiver',
            'approver',
            'paymentSlips.uploader',
        ])->latest()->get()->map(function ($ov) {
            $hasInvoice = !empty($ov->invoice_path)
                || !empty($ov->invoice_generated_at)
                || (file_exists(storage_path("app/public/trip_invoices/OV-{$ov->id}")) && count(glob(storage_path("app/public/trip_invoices/OV-{$ov->id}/*.pdf"))) > 0);
            $ov->has_invoice = (bool) $hasInvoice;
            return $ov;
        });

        $rentACarBookings = Customer::with(['agent.user', 'financeReceiver', 'approver', 'paymentSlips.uploader'])
            ->whereHas('agent', fn ($query) => $query->where('booking_type', 'Rent a Car'))
            ->latest()
            ->get();

        return Inertia::render('Finance/Index', [
            'trips' => $trips,
            'drivers' => Driver::select('id', 'first_name', 'last_name', 'full_name', 'registration_number', 'amount', 'due_date', 'payment_received', 'payment_method', 'payment_attachment', 'driver_status')->orderBy('full_name')->get(),
            'agents' => Agent::with('user')->latest()->get(),
            'driverTotals' => $driverTotals,
            'agentTotals' => $agentTotals,
            'incentives' => Incentive::with(['driver', 'agent.user'])->latest()->get(),
            'rateSetting' => $rateSetting,
            'expenses' => $expenses,
            'payouts' => $payouts,
            'outsourceVehicles' => $outsourceVehicles,
            'rentACarBookings' => $rentACarBookings,
            'pettyCashShiftLogs' => $pettyCashShiftLogs,
            'pettyCashReturns' => $pettyCashReturns,
            'pettyCashBalance' => $pettyCashBalance,
            'pettyCashRequests' => $pettyCashRequests,
            'rentACarRates' => DB::table('rent_a_car_rates')
                ->select('id', 'vehicle_category', 'rate', 'updated_by', 'created_at', 'updated_at')
                ->orderBy('id')
                ->get(),
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

        $customer = $trip->customer;
        $agent = $customer ? $customer->agent : null;
        $originalCurrency = $agent ? ($agent->new_currency ?? $agent->currency ?? 'LKR') : 'LKR';
        $originalAmount = $customer ? $customer->paid_amount : 0;

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
                'original_currency' => $originalCurrency,
                'original_amount' => $originalAmount,
                'received_by'     => Auth::id(),
                'received_at'     => now(),
            ]
        );

        $trip->update(['cash_received' => true]);

        return back();
    }

    public function markOutsourceReceived(Request $request, OutsourceVehicle $outsourceVehicle)
    {
        $receivedAmount = $request->input('received_amount') !== null
            ? (float) $request->input('received_amount')
            : (float) ($outsourceVehicle->customer?->paid_amount ?? $outsourceVehicle->price);

        $outsourceVehicle->update([
            'received'        => true,
            'received_amount' => $receivedAmount,
            'received_by'     => Auth::id(),
            'received_at'     => now(),
        ]);

        return back();
    }

    public function markCustomerReceived(Request $request, Customer $customer)
    {
        $receivedAmount = $request->input('received_amount') !== null
            ? (float) $request->input('received_amount')
            : (float) ($customer->paid_amount ?? 0);

        $customer->update([
            'finance_received'        => true,
            'finance_received_amount' => $receivedAmount,
            'finance_received_by'     => Auth::id(),
            'finance_received_at'     => now(),
        ]);

        return back();
    }

    public function uploadSlips(Request $request, TripFinance $tripFinance)
    {
        // Prevent upload if slips have already been approved by accountant
        $existingSlips = $tripFinance->paymentSlips;
        if ($existingSlips->isNotEmpty() && $existingSlips->every(fn($s) => $s->status === 'completed')) {
            return back()->with('error', 'Payment slips have already been approved by the accountant. Further uploads are not permitted.');
        }

        $request->validate([
            'uploads' => 'required|array',
            'uploads.*.file' => 'required|file|max:10240',
            'uploads.*.description' => 'nullable|string',
        ]);

        foreach ($request->uploads as $upload) {
            if (isset($upload['file']) && $upload['file']->isValid()) {
                $path = $upload['file']->store("payment_slips/trip_{$tripFinance->trip_id}", 'public');

                \App\Models\PaymentSlip::create([
                    'trip_finance_id' => $tripFinance->id,
                    'slip_des' => $upload['description'] ?? null,
                    'slip_path' => $path,
                    'uploaded_by' => Auth::id(),
                    'status' => 'pending',
                ]);
            }
        }

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
        $rateSetting = RateSetting::first();
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

        \App\Services\AuditLogger::logExport(
            'EXCEL_EXPORT',
            "Exported Profit & Loss Excel Report (Range: {$range}, Period: {$dateLabel}, Gross: LKR " . number_format($grossRevenue, 2) . ")",
            'finance',
            [
                'range'         => $range,
                'date_label'    => $dateLabel,
                'trips_count'   => count($trips),
                'gross_revenue' => $grossRevenue,
                'net_profit'    => $netProfit,
            ]
        );

        return response($html)
            ->header('Content-Type', 'application/vnd.ms-excel')
            ->header('Content-Disposition', 'attachment; filename="Terminal_Prime_PnL_'.now()->format('Y-m-d').'.xls"');
    }

    public function approvePettyCashRequest(Request $request, $id)
    {
        $pcRequest = PettyCashRequest::findOrFail($id);

        if ($pcRequest->status === 'Pending') {
            $pcRequest->update([
                'status' => 'Approved',
                'approved_by' => Auth::id(),
                'approved_at' => now(),
            ]);

            // Reset the actual till balance
            DB::table('petty_cash')->update(['amount' => 100000.00]);
        }

        return back()->with('success', 'Petty cash request approved and till replenished.');
    }

    public function storePettyCashRequest(Request $request)
    {
        $request->validate([
            'shift_id' => 'required|string',
            'balance_amount' => 'required|numeric',
            'needed_amount' => 'required|numeric',
        ]);

        $existing = PettyCashRequest::where('shift_id', $request->shift_id)->first();
        if ($existing) {
            return back()->with('info', 'Replenishment request already submitted for this shift.');
        }

        PettyCashRequest::create([
            'shift_id' => $request->shift_id,
            'balance_amount' => $request->balance_amount,
            'needed_amount' => $request->needed_amount,
            'status' => 'Pending',
            'requested_by' => Auth::id(),
        ]);

        return back()->with('success', 'Petty cash replenishment request submitted to Finance.');
    }

    public function storeRentACarRate(Request $request)
    {
        $data = $request->validate([
            'vehicle_category' => 'required|string|max:100',
            'rate' => 'required|numeric|min:0',
        ]);

        $user = Auth::user();
        $updatedBy = $user ? ($user->name ?? $user->email ?? 'User #' . $user->id) : 'Admin';

        // If category already exists, update its rate, otherwise insert
        $existing = DB::table('rent_a_car_rates')
            ->where('vehicle_category', trim($data['vehicle_category']))
            ->first();

        if ($existing) {
            DB::table('rent_a_car_rates')->where('id', $existing->id)->update([
                'rate' => $data['rate'],
                'updated_by' => $updatedBy,
                'updated_at' => now(),
            ]);
            $id = $existing->id;
        } else {
            $id = DB::table('rent_a_car_rates')->insertGetId([
                'vehicle_category' => trim($data['vehicle_category']),
                'rate' => $data['rate'],
                'updated_by' => $updatedBy,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Rent a Car rate saved successfully.',
                'rate' => DB::table('rent_a_car_rates')->where('id', $id)->first(),
            ]);
        }

        return back()->with('success', 'Rent a Car rate saved successfully.');
    }

    public function updateRentACarRate(Request $request, $id)
    {
        $data = $request->validate([
            'vehicle_category' => 'nullable|string|max:100',
            'rate' => 'required|numeric|min:0',
        ]);

        $user = Auth::user();
        $updatedBy = $user ? ($user->name ?? $user->email ?? 'User #' . $user->id) : 'Admin';

        $updateData = [
            'rate' => $data['rate'],
            'updated_by' => $updatedBy,
            'updated_at' => now(),
        ];
        if (!empty($data['vehicle_category'])) {
            $updateData['vehicle_category'] = trim($data['vehicle_category']);
        }

        DB::table('rent_a_car_rates')->where('id', $id)->update($updateData);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Rent a Car rate updated successfully.',
                'rate' => DB::table('rent_a_car_rates')->where('id', $id)->first(),
            ]);
        }

        return back()->with('success', 'Rent a Car rate updated successfully.');
    }

    public function destroyRentACarRate(Request $request, $id)
    {
        DB::table('rent_a_car_rates')->where('id', $id)->delete();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Rent a Car rate removed successfully.',
            ]);
        }

        return back()->with('success', 'Rent a Car rate removed successfully.');
    }

    public function uploadOutsourceSlips(Request $request, OutsourceVehicle $outsourceVehicle)
    {
        $existingSlips = $outsourceVehicle->paymentSlips;
        if ($existingSlips->isNotEmpty() && $existingSlips->every(fn($s) => $s->status === 'completed')) {
            return back()->with('error', 'Payment slips have already been approved by the accountant. Further uploads are not permitted.');
        }

        $request->validate([
            'uploads' => 'required|array',
            'uploads.*.file' => 'required|file|max:10240',
            'uploads.*.description' => 'nullable|string',
        ]);

        foreach ($request->uploads as $upload) {
            if (isset($upload['file']) && $upload['file']->isValid()) {
                $path = $upload['file']->store("payment_slips/outsource_{$outsourceVehicle->id}", 'public');

                \App\Models\PaymentSlip::create([
                    'outsource_vehicle_id' => $outsourceVehicle->id,
                    'slip_des' => $upload['description'] ?? null,
                    'slip_path' => $path,
                    'uploaded_by' => Auth::id(),
                    'status' => 'pending',
                ]);
            }
        }

        return back();
    }

    public function uploadCustomerSlips(Request $request, Customer $customer)
    {
        $existingSlips = $customer->paymentSlips;
        if ($existingSlips->isNotEmpty() && $existingSlips->every(fn($s) => $s->status === 'completed')) {
            return back()->with('error', 'Payment slips have already been approved by the accountant. Further uploads are not permitted.');
        }

        $request->validate([
            'uploads' => 'required|array',
            'uploads.*.file' => 'required|file|max:10240',
            'uploads.*.description' => 'nullable|string',
        ]);

        foreach ($request->uploads as $upload) {
            if (isset($upload['file']) && $upload['file']->isValid()) {
                $path = $upload['file']->store("payment_slips/customer_{$customer->id}", 'public');

                \App\Models\PaymentSlip::create([
                    'customer_id' => $customer->id,
                    'slip_des' => $upload['description'] ?? null,
                    'slip_path' => $path,
                    'uploaded_by' => Auth::id(),
                    'status' => 'pending',
                ]);
            }
        }

        return back();
    }
}