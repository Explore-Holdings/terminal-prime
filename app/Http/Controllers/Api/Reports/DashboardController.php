<?php

namespace App\Http\Controllers\Api\Reports;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
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

    // Sum of effective agent price for completed trips in a date window.
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
            default => [$now->copy()->subDays(6)->startOfDay(), $now->copy()->endOfDay()],
        };
    }
}
