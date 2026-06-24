<?php

namespace App\Http\Controllers\Api\Reports;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TripStatusController extends Controller
{
    // Real trip statuses: Pending, Assigned, Accepted, On Route, Picked Up, Completed, Cancelled
    // Grouped for the dashboard donut into: completed | cancelled | pending | in_progress
    private const STATUS_MAP = [
        'Completed'  => 'completed',
        'Cancelled'  => 'cancelled',
        'Pending'    => 'pending',
        'Assigned'   => 'in_progress',
        'Accepted'   => 'in_progress',
        'On Route'   => 'in_progress',
        'Picked Up'  => 'in_progress',
    ];

    public function index(Request $request)
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
