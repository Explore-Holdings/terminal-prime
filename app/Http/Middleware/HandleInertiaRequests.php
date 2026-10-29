<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        if ($user) {
            $user->loadMissing('role');
        }

        return [
            ...parent::share($request),

            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => strtolower(trim($user->role?->name ?? '')),
                    'role_id' => $user->role_id,
                    'permissions' => $user->role?->permissions ?? [],
                    'isExecutiveStaff' => str_contains(strtolower($user->role?->name ?? ''), 'executive'),
                ] : null,
            ],
            'pendingAttendanceCount' => \Illuminate\Support\Facades\DB::table('agent_checkin_requests')->where('status', 'pending')->count(),
            'pendingFinanceCount' => \App\Models\PettyCashRequest::where('status', 'Pending')->count(),
            'pendingAccountantSlipsCount' => (function () {
                $approved = \App\Models\TripFinance::where('accountant_approved', true)
                    ->with('paymentSlips')
                    ->get();
                return $approved->filter(function ($tf) {
                    if (!$tf->paymentSlips || $tf->paymentSlips->isEmpty()) return true;
                    return $tf->paymentSlips->some(fn($s) => $s->status !== 'completed');
                })->count();
            })(),
            'accountantPendingApprovalsCount' => (function () {
                $trips = \App\Models\TripFinance::where('received', true)->where('accountant_approved', false)->count();
                $outsource = \App\Models\OutsourceVehicle::where('received', true)->where('accountant_approved', false)->count();
                $rentals = \App\Models\Customer::where('finance_received', true)
                    ->where('accountant_approved', false)
                    ->whereHas('agent', fn($q) => $q->where('booking_type', 'Rent a Car'))
                    ->count();
                return $trips + $outsource + $rentals;
            })(),
            'accountantPendingSlipsCount' => \App\Models\PaymentSlip::where('status', 'pending')->count(),
            'accountantTotalBadgeCount' => (function () {
                $trips = \App\Models\TripFinance::where('received', true)->where('accountant_approved', false)->count();
                $outsource = \App\Models\OutsourceVehicle::where('received', true)->where('accountant_approved', false)->count();
                $rentals = \App\Models\Customer::where('finance_received', true)
                    ->where('accountant_approved', false)
                    ->whereHas('agent', fn($q) => $q->where('booking_type', 'Rent a Car'))
                    ->count();
                $unapproved = $trips + $outsource + $rentals;
                $pendingSlips = \App\Models\PaymentSlip::where('status', 'pending')->count();
                return $unapproved + $pendingSlips;
            })(),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'invoice_path' => fn () => $request->session()->get('invoice_path'),
                'created_customer_id' => fn () => $request->session()->get('created_customer_id'),
                'created_agent_id' => fn () => $request->session()->get('created_agent_id'),
                'agent' => fn () => $request->session()->get('agent'),
            ],
        ];
    }
}
