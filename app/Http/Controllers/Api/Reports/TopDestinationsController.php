<?php

namespace App\Http\Controllers\Api\Reports;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TopDestinationsController extends Controller
{
    public function index(Request $request)
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
