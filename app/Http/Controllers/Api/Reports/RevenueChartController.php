<?php

namespace App\Http\Controllers\Api\Reports;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RevenueChartController extends Controller
{
    public function index(Request $request)
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
}
