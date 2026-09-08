<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportsHubController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────────
    //  Inertia page
    // ─────────────────────────────────────────────────────────────────────────
    public function index()
    {
        return Inertia::render('ReportsHub/Index');
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Shared date-range helper
    // ─────────────────────────────────────────────────────────────────────────
    private function dateRange(Request $request): array
    {
        $range = $request->get('range', 'today');
        $now   = now();

        if ($range === 'custom') {
            return [
                Carbon::parse($request->get('from'))->startOfDay(),
                Carbon::parse($request->get('to'))->endOfDay(),
            ];
        }

        return match ($range) {
            'today' => [$now->copy()->startOfDay(), $now->copy()->endOfDay()],
            'week'  => [$now->copy()->subDays(6)->startOfDay(), $now->copy()->endOfDay()],
            'month' => [$now->copy()->subDays(29)->startOfDay(), $now->copy()->endOfDay()],
            default => [$now->copy()->startOfDay(), $now->copy()->endOfDay()],
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  1. Trips Report
    // ─────────────────────────────────────────────────────────────────────────
    public function trips(Request $request)
    {
        try {
            [$from, $to] = $this->dateRange($request);

            $rows = DB::table('trips as t')
                ->leftJoin('customers as c', 'c.id', '=', 't.customer_id')
                ->leftJoin('agents as a', 'a.id', '=', 't.agent_id')
                ->leftJoin('drivers as d', 'd.id', '=', 't.driver_id')
                ->leftJoin('users as u', 'u.id', '=', 't.trip_assigned_by')
                ->whereNull('a.deleted_at')
                ->where(function ($q) use ($from, $to) {
                    $q->whereBetween('t.trip_assigned_at', [$from, $to])
                      ->orWhere(function ($sq) use ($from, $to) {
                          $sq->whereNull('t.trip_assigned_at')
                             ->whereBetween('t.created_at', [$from, $to]);
                      });
                })
                ->select([
                    't.id',
                    't.status',
                    DB::raw('COALESCE(t.trip_assigned_at, t.created_at) as date'),
                    'c.name as customer_name',
                    'c.customer_code',
                    DB::raw("CONCAT(d.first_name, ' ', d.last_name) as driver_name"),
                    'd.registration_number',
                    DB::raw('COALESCE(c.dropoff_location, a.dropoff_location) as destination'),
                    DB::raw('COALESCE(a.new_price, a.price) as amount'),
                    DB::raw('COALESCE(a.new_currency, a.currency) as currency'),
                    'c.payment_method',
                    'u.name as assigned_by',
                ])
                ->orderByDesc(DB::raw('COALESCE(t.trip_assigned_at, t.created_at)'))
                ->get();

            return response()->json(['data' => $rows, 'total' => $rows->count()]);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Failed to load trips report: ' . $e->getMessage()], 500);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  2. Revenue Report
    // ─────────────────────────────────────────────────────────────────────────
    public function revenue(Request $request)
    {
        try {
            [$from, $to] = $this->dateRange($request);

            $rows = DB::table('agents as a')
                ->join('trips as t', 't.agent_id', '=', 'a.id')
                ->leftJoin('customers as c', 'c.id', '=', 't.customer_id')
                ->whereNull('a.deleted_at')
                ->whereBetween('a.created_at', [$from, $to])
                ->select([
                    't.id as trip_id',
                    DB::raw('DATE(a.created_at) as date'),
                    'c.name as customer_name',
                    'c.customer_code',
                    'c.payment_method',
                    DB::raw('COALESCE(a.new_price, a.price) as amount'),
                    DB::raw('COALESCE(a.new_currency, a.currency) as currency'),
                    't.status',
                    DB::raw('COALESCE(c.dropoff_location, a.dropoff_location) as destination'),
                ])
                ->orderByDesc('a.created_at')
                ->get();

            $totalRevenue = $rows->where('status', 'Completed')->sum('amount');

            return response()->json([
                'data'          => $rows,
                'total'         => $rows->count(),
                'total_revenue' => $totalRevenue,
            ]);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Failed to load revenue report.'], 500);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  3. Drivers Report
    // ─────────────────────────────────────────────────────────────────────────
    public function drivers(Request $request)
    {
        try {
            [$from, $to] = $this->dateRange($request);

            $rows = DB::table('drivers as d')
                ->leftJoin('trips as t', function ($j) use ($from, $to) {
                    $j->on('t.driver_id', '=', 'd.id')
                      ->where(function ($q) use ($from, $to) {
                          $q->whereBetween('t.trip_assigned_at', [$from, $to])
                            ->orWhere(function ($sq) use ($from, $to) {
                                $sq->whereNull('t.trip_assigned_at')
                                   ->whereBetween('t.created_at', [$from, $to]);
                            });
                      });
                })
                ->leftJoin('agents as a', function ($j) {
                    $j->on('a.id', '=', 't.agent_id')->whereNull('a.deleted_at');
                })
                ->leftJoin('trip_finances as tf', 'tf.trip_id', '=', 't.id')
                ->select([
                    'd.id',
                    DB::raw("CONCAT(d.first_name, ' ', d.last_name) as driver_name"),
                    'd.registration_number',
                    'd.mobile_number',
                    'd.driver_status',
                    'd.duty_status',
                    DB::raw('COUNT(DISTINCT t.id) as trips_count'),
                    DB::raw('SUM(CASE WHEN t.status = "Completed" THEN 1 ELSE 0 END) as completed_trips'),
                    DB::raw('SUM(tf.driver_share) as total_earnings'),
                ])
                ->groupBy('d.id', 'd.first_name', 'd.last_name', 'd.registration_number', 'd.mobile_number', 'd.driver_status', 'd.duty_status')
                ->orderByDesc('trips_count')
                ->get();

            return response()->json(['data' => $rows, 'total' => $rows->count()]);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Failed to load drivers report.'], 500);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  4. Customers Report
    // ─────────────────────────────────────────────────────────────────────────
    public function customers(Request $request)
    {
        try {
            [$from, $to] = $this->dateRange($request);

            $rows = DB::table('customers as c')
                ->leftJoin('trips as t', function ($j) use ($from, $to) {
                    $j->on('t.customer_id', '=', 'c.id')
                      ->where(function ($q) use ($from, $to) {
                          $q->whereBetween('t.trip_assigned_at', [$from, $to])
                            ->orWhere(function ($sq) use ($from, $to) {
                                $sq->whereNull('t.trip_assigned_at')
                                   ->whereBetween('t.created_at', [$from, $to]);
                            });
                      });
                })
                ->leftJoin('agents as a', function ($j) {
                    $j->on('a.id', '=', 't.agent_id')->whereNull('a.deleted_at');
                })
                ->whereNull('c.deleted_at')
                ->whereBetween('c.created_at', [$from, $to])
                ->select([
                    'c.id',
                    'c.customer_code',
                    'c.name as customer_name',
                    'c.whatsapp_number',
                    'c.status',
                    'c.payment_method',
                    DB::raw('COALESCE(c.dropoff_location, a.dropoff_location) as destination'),
                    DB::raw('COUNT(DISTINCT t.id) as trips_count'),
                    DB::raw('SUM(CASE WHEN t.status = "Completed" THEN COALESCE(a.new_price, a.price) ELSE 0 END) as total_spent'),
                    DB::raw('COALESCE(a.new_currency, a.currency, "LKR") as currency'),
                    'c.created_at',
                ])
                ->groupBy(
                    'c.id', 'c.customer_code', 'c.name', 'c.whatsapp_number',
                    'c.status', 'c.payment_method', 'c.dropoff_location',
                    'a.dropoff_location', 'a.new_currency', 'a.currency', 'c.created_at'
                )
                ->orderByDesc('c.created_at')
                ->get();

            return response()->json(['data' => $rows, 'total' => $rows->count()]);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Failed to load customers report.'], 500);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  5. Finance Report
    // ─────────────────────────────────────────────────────────────────────────
    public function finance(Request $request)
    {
        try {
            [$from, $to] = $this->dateRange($request);

            // Trip finances
            $tripFinances = DB::table('trip_finances as tf')
                ->leftJoin('trips as t', 't.id', '=', 'tf.trip_id')
                ->leftJoin('drivers as d', 'd.id', '=', 'tf.driver_id')
                ->leftJoin('customers as c', 'c.id', '=', 't.customer_id')
                ->whereBetween('tf.created_at', [$from, $to])
                ->select([
                    'tf.id',
                    DB::raw('"Trip Finance" as type'),
                    'c.name as reference',
                    'c.customer_code',
                    DB::raw("CONCAT(d.first_name, ' ', d.last_name) as driver_name"),
                    'tf.total_amount as amount',
                    'tf.driver_share',
                    'tf.agent_share',
                    'tf.balance',
                    'tf.created_at as date',
                    't.status as status',
                ])
                ->orderByDesc('tf.created_at')
                ->get();

            // Payouts
            $payouts = DB::table('payouts as p')
                ->leftJoin('drivers as d', 'd.id', '=', 'p.driver_id')
                ->whereBetween('p.created_at', [$from, $to])
                ->select([
                    'p.id',
                    DB::raw('"Payout" as type'),
                    DB::raw("CONCAT(d.first_name, ' ', d.last_name) as reference"),
                    DB::raw('NULL as customer_code'),
                    DB::raw("CONCAT(d.first_name, ' ', d.last_name) as driver_name"),
                    'p.amount',
                    DB::raw('NULL as driver_share'),
                    DB::raw('NULL as agent_share'),
                    DB::raw('NULL as balance'),
                    'p.created_at as date',
                    DB::raw('"Paid" as status'),
                ])
                ->get();

            // Expenses
            $expenses = DB::table('expenses as e')
                ->whereBetween('e.created_at', [$from, $to])
                ->select([
                    'e.id',
                    DB::raw('"Expense" as type'),
                    'e.title as reference',
                    DB::raw('NULL as customer_code'),
                    DB::raw('NULL as driver_name'),
                    'e.amount',
                    DB::raw('NULL as driver_share'),
                    DB::raw('NULL as agent_share'),
                    DB::raw('NULL as balance'),
                    'e.created_at as date',
                    DB::raw('"Recorded" as status'),
                ])
                ->get();

            $allRows = $tripFinances->concat($payouts)->concat($expenses)
                ->sortByDesc('date')->values();

            return response()->json(['data' => $allRows, 'total' => $allRows->count()]);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Failed to load finance report.'], 500);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  6. Counter Sessions Report
    // ─────────────────────────────────────────────────────────────────────────
    public function sessions(Request $request)
    {
        try {
            [$from, $to] = $this->dateRange($request);

            $rows = DB::table('user_login_logs as l')
                ->leftJoin('users as u', 'u.id', '=', 'l.user_id')
                ->whereBetween('l.login_at', [$from, $to])
                ->select([
                    'l.id',
                    'u.name as agent_name',
                    'l.login_at',
                    'l.logout_at',
                    'l.handed_over_at',
                    DB::raw('TIMESTAMPDIFF(MINUTE, l.login_at, COALESCE(l.logout_at, NOW())) as duration_minutes'),
                ])
                ->orderByDesc('l.login_at')
                ->get();

            return response()->json(['data' => $rows, 'total' => $rows->count()]);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Failed to load sessions report.'], 500);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  7. Survey Report
    // ─────────────────────────────────────────────────────────────────────────
    public function surveys(Request $request)
    {
        try {
            [$from, $to] = $this->dateRange($request);

            $rows = DB::table('customer_surveys as s')
                ->leftJoin('trips as t', 't.id', '=', 's.trip_id')
                ->leftJoin('customers as c', 'c.id', '=', 't.customer_id')
                ->leftJoin('drivers as d', 'd.id', '=', 't.driver_id')
                ->whereBetween('s.created_at', [$from, $to])
                ->select([
                    's.id',
                    'c.name as customer_name',
                    'c.customer_code',
                    DB::raw("CONCAT(d.first_name, ' ', d.last_name) as driver_name"),
                    't.status as trip_status',
                    's.journey_rating as overall_rating',
                    's.driver_rating',
                    DB::raw('CASE WHEN s.vehicle_was_clean = 1 THEN 5 ELSE 1 END as vehicle_rating'),
                    DB::raw('CASE WHEN s.driver_was_polite = 1 THEN 5 ELSE 1 END as service_rating'),
                    's.comments',
                    's.created_at as submitted_at',
                ])
                ->orderByDesc('s.created_at')
                ->get();

            $avgRating = $rows->avg('overall_rating');

            return response()->json([
                'data'       => $rows,
                'total'      => $rows->count(),
                'avg_rating' => $avgRating ? round($avgRating, 1) : null,
            ]);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Failed to load surveys report.'], 500);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  8. Manager / Shift Report
    // ─────────────────────────────────────────────────────────────────────────
    public function manager(Request $request)
    {
        try {
            [$from, $to] = $this->dateRange($request);

            $rows = DB::table('trips as t')
                ->leftJoin('users as u', 'u.id', '=', 't.trip_assigned_by')
                ->leftJoin('customers as c', 'c.id', '=', 't.customer_id')
                ->leftJoin('agents as a', function ($j) {
                    $j->on('a.id', '=', 't.agent_id')->whereNull('a.deleted_at');
                })
                ->leftJoin('trip_finances as tf', 'tf.trip_id', '=', 't.id')
                ->where(function ($q) use ($from, $to) {
                    $q->whereBetween('t.trip_assigned_at', [$from, $to])
                      ->orWhere(function ($sq) use ($from, $to) {
                          $sq->whereNull('t.trip_assigned_at')
                             ->whereBetween('t.created_at', [$from, $to]);
                      });
                })
                ->select([
                    'u.id as user_id',
                    'u.name as agent_name',
                    DB::raw('COUNT(t.id) as total_trips'),
                    DB::raw('SUM(CASE WHEN t.status = "Completed" THEN 1 ELSE 0 END) as completed_trips'),
                    DB::raw('SUM(CASE WHEN t.status = "Cancelled" THEN 1 ELSE 0 END) as cancelled_trips'),
                    DB::raw('SUM(tf.total_amount) as total_revenue'),
                    DB::raw('SUM(tf.driver_share) as driver_share'),
                    DB::raw('SUM(tf.agent_share) as agent_share'),
                    DB::raw('MIN(COALESCE(t.trip_assigned_at, t.created_at)) as first_trip'),
                    DB::raw('MAX(COALESCE(t.trip_assigned_at, t.created_at)) as last_trip'),
                ])
                ->groupBy('u.id', 'u.name')
                ->orderByDesc('total_trips')
                ->get();

            return response()->json(['data' => $rows, 'total' => $rows->count()]);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Failed to load manager report.'], 500);
        }
    }
}
