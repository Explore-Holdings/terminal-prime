<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportsController extends Controller
{
    public function index()
    {
        return Inertia::render('Reports/Index');
    }

    public function dashboard(Request $request)
    {
        try {
            $request->validate([
                'range' => 'nullable|in:today,week,month,custom',
                'from'  => 'nullable|date',
                'to'    => 'nullable|date',
            ]);

            [$from, $to] = $this->getDateRange($request);

            // ── Revenue ──────────────────────────────────────────────────────
            // Revenue = effective agent price for completed trips in the period.
            // agents table holds price; trips table holds status.
            $revenueInPeriod = $this->revenueQuery($from, $to);

            // Revenue today is always "today" regardless of the filter.
            $revenueToday = $this->revenueQuery(
                now()->startOfDay(),
                now()->endOfDay(),
            );

            // Previous equivalent period for change-% calculation.
            $periodDays = max(1, (int) $from->diffInDays($to)) + 1;
            $prevFrom   = $from->copy()->subDays($periodDays);
            $prevTo     = $from->copy()->subSecond();

            $prevRevenue = $this->revenueQuery($prevFrom, $prevTo);
            $revenueChangePct = $prevRevenue > 0
                ? round(($revenueInPeriod - $prevRevenue) / $prevRevenue * 100, 1)
                : ($revenueInPeriod > 0 ? 100.0 : 0.0);

            // ── Trip counts ───────────────────────────────────────────────────
            $totalTrips = DB::table('trips')
                ->whereBetween('created_at', [$from, $to])
                ->count();

            $prevTrips = DB::table('trips')
                ->whereBetween('created_at', [$prevFrom, $prevTo])
                ->count();

            $tripsChangePct = $prevTrips > 0
                ? round(($totalTrips - $prevTrips) / $prevTrips * 100, 1)
                : ($totalTrips > 0 ? 100.0 : 0.0);

            // ── Average distance ──────────────────────────────────────────────
            // distance_km lives on the agents (booking) table.
            $avgDistance = DB::table('agents as a')
                ->join('trips as t', 't.agent_id', '=', 'a.id')
                ->whereNull('a.deleted_at')
                ->whereBetween('t.created_at', [$from, $to])
                ->avg('a.distance_km');

            // ── Driver availability ───────────────────────────────────────────
            $onDutyCount  = DB::table('drivers')
                ->whereIn('duty_status', ['on_duty', 'on_trip'])
                ->count();

            $offDutyCount = DB::table('drivers')
                ->where('duty_status', 'off_duty')
                ->count();

            return response()->json([
                'revenue_today'          => (float) $revenueToday,
                'revenue_in_period'      => (float) $revenueInPeriod,
                'revenue_change_pct'     => $revenueChangePct,
                'total_trips'            => $totalTrips,
                'trips_change_pct'       => $tripsChangePct,
                'active_drivers'         => $onDutyCount,
                'avg_distance_km'        => $avgDistance !== null ? round((float) $avgDistance, 1) : 0,
                'driver_on_duty_count'   => $onDutyCount,
                'driver_off_duty_count'  => $offDutyCount,
            ]);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Failed to load dashboard data.'], 500);
        }
    }

    public function recentTrips(Request $request)
    {
        try {
            $request->validate([
                'range'    => 'nullable|in:today,week,month,custom',
                'from'     => 'nullable|date',
                'to'       => 'nullable|date',
                'page'     => 'nullable|integer|min:1',
                'per_page' => 'nullable|integer|min:1|max:100',
            ]);

            [$from, $to] = $this->getDateRange($request);
            $perPage     = (int) $request->get('per_page', 10);

            // Join trips → customers (for name, dropoff_location) → agents (for price, currency, distance)
            $paginated = DB::table('trips as t')
                ->join('customers as c', 'c.id', '=', 't.customer_id')
                ->join('agents as a', 'a.id', '=', 't.agent_id')
                ->whereNull('a.deleted_at')
                ->whereNull('c.deleted_at')
                ->whereBetween('t.created_at', [$from, $to])
                ->select([
                    't.id',
                    't.status',
                    't.created_at',
                    'c.name',
                    DB::raw('COALESCE(c.dropoff_location, a.dropoff_location) as dropoff_location'),
                    'a.distance_km',
                    DB::raw('COALESCE(a.new_currency, a.currency) as currency'),
                    DB::raw('COALESCE(a.new_price, a.price) as price'),
                ])
                ->orderByDesc('t.created_at')
                ->paginate($perPage);

            return response()->json([
                'data'         => $paginated->items(),
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'total'        => $paginated->total(),
            ]);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Failed to load recent trips.'], 500);
        }
    }

    public function revenueChart(Request $request)
    {
        try {
            $request->validate([
                'range' => 'nullable|in:week,month',
            ]);

            $range    = $request->get('range', 'week');
            $isWeekly = $range === 'week';
            $now      = now();

            [$from, $to] = $isWeekly
                ? [$now->copy()->subDays(6)->startOfDay(), $now->copy()->endOfDay()]
                : [$now->copy()->subDays(27)->startOfDay(), $now->copy()->endOfDay()];

            if ($isWeekly) {
                $rows = DB::table('agents as a')
                    ->join('trips as t', 't.agent_id', '=', 'a.id')
                    ->whereNull('a.deleted_at')
                    ->whereBetween('a.created_at', [$from, $to])
                    ->selectRaw("
                        DATE(a.created_at) as day,
                        SUM(CASE WHEN t.status = 'Completed' THEN COALESCE(a.new_price, a.price) ELSE 0 END) as revenue,
                        SUM(CASE WHEN t.status = 'Cancelled' THEN COALESCE(a.new_price, a.price) ELSE 0 END) as cancelled_value
                    ")
                    ->groupByRaw('DATE(a.created_at)')
                    ->orderBy('day')
                    ->get()
                    ->keyBy('day');

                // Fill every day in the range (zero for missing days).
                $data = [];
                for ($i = 6; $i >= 0; $i--) {
                    $date  = $now->copy()->subDays($i);
                    $key   = $date->toDateString();
                    $label = $date->format('D, M j');
                    $row   = $rows->get($key);
                    $data[] = [
                        'label'           => $label,
                        'revenue'         => (float) ($row->revenue ?? 0),
                        'cancelled_value' => (float) ($row->cancelled_value ?? 0),
                    ];
                }
            } else {
                // Monthly: 4 rolling weeks, grouped by YEARWEEK.
                $rows = DB::table('agents as a')
                    ->join('trips as t', 't.agent_id', '=', 'a.id')
                    ->whereNull('a.deleted_at')
                    ->whereBetween('a.created_at', [$from, $to])
                    ->selectRaw("
                        YEARWEEK(a.created_at, 1) as yw,
                        MIN(DATE(a.created_at))   as week_start,
                        MAX(DATE(a.created_at))   as week_end,
                        SUM(CASE WHEN t.status = 'Completed' THEN COALESCE(a.new_price, a.price) ELSE 0 END) as revenue,
                        SUM(CASE WHEN t.status = 'Cancelled' THEN COALESCE(a.new_price, a.price) ELSE 0 END) as cancelled_value
                    ")
                    ->groupByRaw('YEARWEEK(a.created_at, 1)')
                    ->orderBy('yw')
                    ->get();

                $data = $rows->map(fn ($r) => [
                    'label'           => date('M j', strtotime($r->week_start))
                        . '–'
                        . date('M j', strtotime($r->week_end)),
                    'revenue'         => (float) $r->revenue,
                    'cancelled_value' => (float) $r->cancelled_value,
                ])->values()->all();
            }

            return response()->json($data);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Failed to load revenue chart data.'], 500);
        }
    }

    public function topDestinations(Request $request)
    {
        try {
            $request->validate([
                'range' => 'nullable|in:today,week,month,custom',
                'from'  => 'nullable|date',
                'to'    => 'nullable|date',
                'limit' => 'nullable|integer|min:1|max:20',
            ]);

            [$from, $to] = $this->getDateRange($request);
            $limit       = (int) $request->get('limit', 5);

            // dropoff_location lives on the agents (booking) table.
            $rows = DB::table('agents as a')
                ->join('trips as t', 't.agent_id', '=', 'a.id')
                ->whereNull('a.deleted_at')
                ->whereNotNull('a.dropoff_location')
                ->where('a.dropoff_location', '!=', '')
                ->whereBetween('a.created_at', [$from, $to])
                ->selectRaw("
                    a.dropoff_location,
                    COUNT(t.id) as trip_count,
                    SUM(CASE WHEN t.status = 'Completed' THEN COALESCE(a.new_price, a.price) ELSE 0 END) as total_revenue,
                    AVG(a.distance_km) as avg_distance_km
                ")
                ->groupBy('a.dropoff_location')
                ->orderByDesc('trip_count')
                ->limit($limit)
                ->get();

            $data = $rows->values()->map(fn ($row, $i) => [
                'rank'             => $i + 1,
                'dropoff_location' => $row->dropoff_location,
                'trip_count'       => (int) $row->trip_count,
                'total_revenue'    => (float) $row->total_revenue,
                'avg_distance_km'  => $row->avg_distance_km !== null
                    ? round((float) $row->avg_distance_km, 1)
                    : 0,
            ])->all();

            return response()->json($data);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Failed to load top destinations data.'], 500);
        }
    }

        private const STATUS_MAP = [
        'Completed'  => 'completed',
        'Cancelled'  => 'cancelled',
        'Pending'    => 'pending',
        'Assigned'   => 'in_progress',
        'Accepted'   => 'in_progress',
        'On Route'   => 'in_progress',
        'Picked Up'  => 'in_progress',
    ];

    public function tripStatus(Request $request)
    {
                try {
            $request->validate([
                'range' => 'nullable|in:today,week,month,custom',
                'from'  => 'nullable|date',
                'to'    => 'nullable|date',
            ]);

            [$from, $to] = $this->getDateRange($request);

            $rows = DB::table('trips')
                ->whereBetween('created_at', [$from, $to])
                ->selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->get();

            // Aggregate into 4 canonical groups.
            $grouped = ['completed' => 0, 'cancelled' => 0, 'pending' => 0, 'in_progress' => 0];
            foreach ($rows as $row) {
                $group = self::STATUS_MAP[$row->status] ?? 'in_progress';
                $grouped[$group] += (int) $row->count;
            }

            $total = array_sum($grouped);

            $data = collect($grouped)->map(fn ($count, $status) => [
                'status'     => $status,
                'count'      => $count,
                'percentage' => $total > 0 ? round($count / $total * 100) : 0,
            ])->values()->all();

            return response()->json($data);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Failed to load trip status data.'], 500);
        }
    }

    private function revenueQuery(Carbon $from, Carbon $to): float
    {
        return (float) DB::table('agents as a')
            ->join('trips as t', 't.agent_id', '=', 'a.id')
            ->whereNull('a.deleted_at')
            ->where('t.status', 'Completed')
            ->whereBetween('a.created_at', [$from, $to])
            ->sum(DB::raw('COALESCE(a.new_price, a.price)'));
    }

    private function getDateRange(Request $request): array
    {
        $range = $request->get('range', 'week');
        $now = now();

        if ($range === 'custom') {
            return [
                Carbon::parse($request->get('from'))->startOfDay(),
                Carbon::parse($request->get('to'))->endOfDay(),
            ];
        }

        return match ($range) {
            'today' => [$now->copy()->startOfDay(), $now->copy()->endOfDay()],
            'week' => [$now->copy()->subDays(6)->startOfDay(), $now->copy()->endOfDay()],
            'month' => [$now->copy()->subDays(29)->startOfDay(), $now->copy()->endOfDay()],
            default => [$now->copy()->subDays(6)->startOfDay(), $now->copy()->endOfDay()],
        };
    }
}