<?php

namespace App\Http\Controllers;

use App\Models\Trip;
use App\Models\UserLoginLog;
use App\Models\TripFinance;
use App\Models\Customer;
use App\Models\OutsourceVehicle;
use App\Models\PaymentSlip;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;

class AccountantController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $range = $request->input('range', 'all');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        if ($range === 'today') {
            $startDate = now()->startOfDay()->toDateTimeString();
            $endDate = now()->endOfDay()->toDateTimeString();
        } elseif ($range === 'week') {
            $startDate = now()->startOfWeek()->toDateTimeString();
            $endDate = now()->endOfWeek()->toDateTimeString();
        } elseif ($range === 'month') {
            $startDate = now()->startOfMonth()->toDateTimeString();
            $endDate = now()->endOfMonth()->toDateTimeString();
        } elseif ($range === 'custom') {
            $startDate = $startDate ? \Carbon\Carbon::parse($startDate)->startOfDay()->toDateTimeString() : null;
            $endDate = $endDate ? \Carbon\Carbon::parse($endDate)->endOfDay()->toDateTimeString() : null;
        } elseif ($range === 'all') {
            $startDate = null;
            $endDate = null;
        }

        // 1. Trip Finances (Trips received from counter manager)
        $tripFinances = TripFinance::with([
            'trip.customer.agent.user',
            'trip.driver.vehicle',
            'trip.agent.user',
            'agentUser',
            'receiver',
            'approver',
            'paymentSlips.uploader',
        ])
        ->where('received', true)
        ->when($startDate, fn($q) => $q->where('received_at', '>=', $startDate))
        ->when($endDate, fn($q) => $q->where('received_at', '<=', $endDate))
        ->get();

        // 2. Outsource Vehicles received from counter manager
        $outsourceVehicles = OutsourceVehicle::with([
            'customer.agent.user',
            'agent.user',
            'creator',
            'receiver',
            'approver',
            'paymentSlips.uploader',
        ])
        ->where('received', true)
        ->when($startDate, fn($q) => $q->where('received_at', '>=', $startDate))
        ->when($endDate, fn($q) => $q->where('received_at', '<=', $endDate))
        ->get();

        // 3. Rent a Car Bookings received from counter manager
        $rentACarBookings = Customer::with([
            'agent.user',
            'financeReceiver',
            'approver',
            'paymentSlips.uploader',
        ])
        ->where('finance_received', true)
        ->whereHas('agent', fn($q) => $q->where('booking_type', 'Rent a Car'))
        ->when($startDate, fn($q) => $q->where('finance_received_at', '>=', $startDate))
        ->when($endDate, fn($q) => $q->where('finance_received_at', '<=', $endDate))
        ->get();

        // Normalize into unified accountant records
        $items = collect();
        $seenCustomerIds = $tripFinances->pluck('trip.customer_id')->merge($outsourceVehicles->pluck('customer_id'))->filter()->unique();

        foreach ($tripFinances as $tf) {
            $customer = $tf->trip?->customer;
            $agentName = $customer?->agent?->user?->name ?? $tf->trip?->agent?->user?->name ?? $tf->agentUser?->name ?? '-';
            $bookingType = $customer?->agent?->booking_type ?? $tf->trip?->agent?->booking_type ?? 'Transfer';
            $items->push([
                'id' => $tf->id,
                'trip_id' => $tf->trip_id,
                'type' => 'trip',
                'display_id' => '#' . $tf->trip_id,
                'type_badge' => $bookingType ?: 'Transfer',
                'customer_name' => $customer?->name ?? '-',
                'customer_code' => $customer?->customer_code ?? '',
                'agent_name' => $agentName,
                'vehicle_info' => $tf->trip?->driver?->vehicle?->registration_number ?? ($tf->trip?->driver ? $tf->trip->driver->full_name : '-'),
                'payment_notes' => $customer?->payment_notes ?? [],
                'receiver_name' => $tf->receiver?->name ?? 'System',
                'received_amount' => (float)$tf->received_amount,
                'received_at' => $tf->received_at ? $tf->received_at->toIso8601String() : null,
                'accountant_approved' => (bool)$tf->accountant_approved,
                'approver_name' => $tf->approver?->name,
                'payment_slips' => $tf->paymentSlips ?? [],
                'has_slips' => ($tf->paymentSlips && $tf->paymentSlips->count() > 0),
                'pending_slips_count' => $tf->paymentSlips ? $tf->paymentSlips->where('status', 'pending')->count() : 0,
            ]);
        }

        foreach ($outsourceVehicles as $ov) {
            $customer = $ov->customer;
            $agentName = $ov->agent?->user?->name ?? $ov->creator?->name ?? '-';
            $items->push([
                'id' => $ov->id,
                'trip_id' => null,
                'type' => 'outside_vehicle',
                'display_id' => 'OV-' . $ov->id,
                'type_badge' => 'Outside Vehicle',
                'customer_name' => $customer?->name ?? '-',
                'customer_code' => $customer?->customer_code ?? '',
                'agent_name' => $agentName,
                'vehicle_info' => $ov->vehicle_number ?: ($ov->mobile_number ? 'Mob: ' . $ov->mobile_number : 'Outside Vehicle'),
                'payment_notes' => $customer?->payment_notes ?? [],
                'receiver_name' => $ov->receiver?->name ?? 'System',
                'received_amount' => (float)($ov->received_amount ?? $ov->price ?? 0),
                'received_at' => $ov->received_at ? $ov->received_at->toIso8601String() : ($ov->created_at ? $ov->created_at->toIso8601String() : null),
                'accountant_approved' => (bool)$ov->accountant_approved,
                'approver_name' => $ov->approver?->name,
                'payment_slips' => $ov->paymentSlips ?? [],
                'has_slips' => ($ov->paymentSlips && $ov->paymentSlips->count() > 0),
                'pending_slips_count' => $ov->paymentSlips ? $ov->paymentSlips->where('status', 'pending')->count() : 0,
            ]);
        }

        foreach ($rentACarBookings as $rc) {
            if ($seenCustomerIds->contains($rc->id)) continue;
            $agentName = $rc->agent?->user?->name ?? '-';
            $items->push([
                'id' => $rc->id,
                'trip_id' => null,
                'type' => 'rent_a_car',
                'display_id' => 'RC-' . $rc->id,
                'type_badge' => 'Rent a Car',
                'customer_name' => $rc->name ?? '-',
                'customer_code' => $rc->customer_code ?? '',
                'agent_name' => $agentName,
                'vehicle_info' => $rc->agent?->external_vehicle_reg ?: 'Rent a Car',
                'payment_notes' => $rc->payment_notes ?? [],
                'receiver_name' => $rc->financeReceiver?->name ?? 'System',
                'received_amount' => (float)($rc->finance_received_amount ?? $rc->paid_amount ?? 0),
                'received_at' => $rc->finance_received_at ? $rc->finance_received_at->toIso8601String() : ($rc->created_at ? $rc->created_at->toIso8601String() : null),
                'accountant_approved' => (bool)$rc->accountant_approved,
                'approver_name' => $rc->approver?->name,
                'payment_slips' => $rc->paymentSlips ?? [],
                'has_slips' => ($rc->paymentSlips && $rc->paymentSlips->count() > 0),
                'pending_slips_count' => $rc->paymentSlips ? $rc->paymentSlips->where('status', 'pending')->count() : 0,
            ]);
        }

        // Metrics across all received records
        $totalRecords = $items->count();
        $totalReceived = (float)$items->sum('received_amount');
        $pendingApprovalsCount = $items->where('accountant_approved', false)->count();
        $pendingSlipsCount = PaymentSlip::where('status', 'pending')->count();
        $pendingSlipsTripsCount = $items->where('pending_slips_count', '>', 0)->count();

        // Status filter
        $status = $request->input('status', 'all');
        if ($status === 'pending_slips') {
            $items = $items->where('pending_slips_count', '>', 0);
        } elseif ($status === 'pending_approval') {
            $items = $items->where('accountant_approved', false);
        } elseif ($status === 'approved') {
            $items = $items->where('accountant_approved', true);
        }

        // Search filter
        if ($search) {
            $q = strtolower(trim($search));
            $items = $items->filter(function ($item) use ($q) {
                return str_contains(strtolower($item['display_id']), $q)
                    || str_contains(strtolower($item['customer_name']), $q)
                    || str_contains(strtolower($item['agent_name']), $q)
                    || str_contains(strtolower($item['vehicle_info']), $q)
                    || str_contains(strtolower($item['type_badge']), $q);
            });
        }

        // Sort latest received first
        $items = $items->sortByDesc('received_at')->values();

        // Paginate
        $page = Paginator::resolveCurrentPage('page') ?: 1;
        $perPage = 15;
        $pagedItems = $items->slice(($page - 1) * $perPage, $perPage)->values();
        $receivedFinances = new LengthAwarePaginator($pagedItems, $items->count(), $perPage, $page, [
            'path' => Paginator::resolveCurrentPath(),
            'query' => $request->query(),
        ]);

        return Inertia::render('Accountant/Index', [
            'receivedFinances' => $receivedFinances,
            'totalRecords' => $totalRecords,
            'totalReceived' => (float)$totalReceived,
            'pendingApprovalsCount' => $pendingApprovalsCount,
            'pendingSlipsCount' => $pendingSlipsCount,
            'pendingSlipsTripsCount' => $pendingSlipsTripsCount,
            'filters' => $request->only('search', 'range', 'start_date', 'end_date', 'status'),
        ]);
    }

    public function approve(Request $request, TripFinance $tripFinance)
    {
        $tripFinance->update([
            'accountant_approved' => true,
            'approved_by' => auth()->id(),
        ]);

        return back();
    }

    public function approveOutsource(Request $request, OutsourceVehicle $outsourceVehicle)
    {
        $outsourceVehicle->update([
            'accountant_approved' => true,
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        return back();
    }

    public function approveCustomer(Request $request, Customer $customer)
    {
        $customer->update([
            'accountant_approved' => true,
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        return back();
    }

    public function updateSlipStatus(Request $request, PaymentSlip $slip)
    {
        $request->validate([
            'status' => 'required|in:completed,incomplete,pending'
        ]);

        $slip->update(['status' => $request->status]);

        return back();
    }

    public function updateAllSlipsStatus(Request $request, TripFinance $tripFinance)
    {
        $request->validate([
            'status' => 'required|in:completed,incomplete,pending'
        ]);

        $tripFinance->paymentSlips()->update([
            'status' => $request->status,
        ]);

        return back()->with('success', 'Slips status updated successfully.');
    }

    public function updateAllOutsourceSlipsStatus(Request $request, OutsourceVehicle $outsourceVehicle)
    {
        $request->validate([
            'status' => 'required|in:completed,incomplete,pending'
        ]);

        $outsourceVehicle->paymentSlips()->update([
            'status' => $request->status,
        ]);

        return back()->with('success', 'Slips status updated successfully.');
    }

    public function updateAllCustomerSlipsStatus(Request $request, Customer $customer)
    {
        $request->validate([
            'status' => 'required|in:completed,incomplete,pending'
        ]);

        $customer->paymentSlips()->update([
            'status' => $request->status,
        ]);

        return back()->with('success', 'Slips status updated successfully.');
    }
}
