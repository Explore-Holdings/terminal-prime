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

        // Calculate totals across all received finances
        $totalRecords = TripFinance::where('received', true)->count();
        $totalReceived = TripFinance::where('received', true)->sum('received_amount');

        // Fetch paginated trip finances that have been received
        $receivedFinances = TripFinance::with([
            'trip.customer',
            'trip.driver.vehicle',
            'trip.agent.user',
            'receiver', // User who marked it as received
            'approver',
            'paymentSlips'
        ])
        ->where('received', true)
        ->when($search, function ($query, $search) {
            $query->where(function($q) use ($search) {
                $q->whereHas('trip', function ($tq) use ($search) {
                    $tq->where('id', 'like', "%{$search}%")
                       ->orWhereHas('customer', function ($cq) use ($search) {
                           $cq->where('name', 'like', "%{$search}%");
                       });
                })->orWhere('trip_id', 'like', "%{$search}%");
            });
        })
        ->orderByDesc('received_at')
        ->paginate(15)
        ->withQueryString();

        return Inertia::render('Accountant/Index', [
            'receivedFinances' => $receivedFinances,
            'totalRecords' => $totalRecords,
            'totalReceived' => (float)$totalReceived,
            'filters' => $request->only('search'),
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
}

