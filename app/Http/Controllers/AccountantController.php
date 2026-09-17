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
        } elseif ($range === 'all') {
            $startDate = null;
            $endDate = null;
        }

        // Base queries for totals
        $totalRecordsQuery = TripFinance::where('received', true);
        $totalReceivedQuery = TripFinance::where('received', true);

        if ($startDate) {
            $totalRecordsQuery->where('received_at', '>=', $startDate);
            $totalReceivedQuery->where('received_at', '>=', $startDate);
        }
        if ($endDate) {
            $totalRecordsQuery->where('received_at', '<=', $endDate);
            $totalReceivedQuery->where('received_at', '<=', $endDate);
        }

        // Status filter
        $status = $request->input('status', 'all');

        // Notification and status metrics
        $pendingApprovalsCount = TripFinance::where('received', true)->where('accountant_approved', false)->count();
        $pendingSlipsCount = \App\Models\PaymentSlip::where('status', 'pending')->count();
        $pendingSlipsTripsCount = TripFinance::whereHas('paymentSlips', fn($q) => $q->where('status', 'pending'))->count();

        // Calculate totals across all received finances
        $totalRecords = $totalRecordsQuery->count();
        $totalReceived = $totalReceivedQuery->sum('received_amount');

        // Fetch paginated trip finances that have been received
        $receivedFinances = TripFinance::with([
            'trip.customer.agent.user',
            'trip.driver.vehicle',
            'trip.agent.user',
            'agentUser',
            'receiver', // User who marked it as received
            'approver',
            'paymentSlips.uploader',
        ])
        ->where('received', true)
        ->when($status === 'pending_slips', function ($query) {
            $query->whereHas('paymentSlips', fn($sq) => $sq->where('status', 'pending'));
        })
        ->when($status === 'pending_approval', function ($query) {
            $query->where('accountant_approved', false);
        })
        ->when($status === 'approved', function ($query) {
            $query->where('accountant_approved', true);
        })
        ->when($search, function ($query, $search) {
            $query->where(function($q) use ($search) {
                $q->whereHas('trip', function ($tq) use ($search) {
                    $tq->where('id', 'like', "%{$search}%")
                       ->orWhereHas('customer', function ($cq) use ($search) {
                           $cq->where('name', 'like', "%{$search}%")
                              ->orWhereHas('agent.user', function ($auq) use ($search) {
                                  $auq->where('name', 'like', "%{$search}%");
                              });
                       })
                       ->orWhereHas('agent.user', function ($auq) use ($search) {
                           $auq->where('name', 'like', "%{$search}%");
                       });
                })
                ->orWhereHas('agentUser', function ($auq) use ($search) {
                    $auq->where('name', 'like', "%{$search}%");
                })
                ->orWhere('trip_id', 'like', "%{$search}%");
            });
        })
        ->when($startDate, function ($query) use ($startDate) {
            $query->where('received_at', '>=', $startDate);
        })
        ->when($endDate, function ($query) use ($endDate) {
            $query->where('received_at', '<=', $endDate);
        })
        ->orderByDesc('received_at')
        ->paginate(15)
        ->withQueryString();

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

    public function updateSlipStatus(Request $request, \App\Models\PaymentSlip $slip)
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
}

