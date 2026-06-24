<?php

namespace App\Http\Controllers\Api\Reports;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RecentTripsController extends Controller
{
    public function index(Request $request)
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
