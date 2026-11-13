<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AgentAttendance;
use App\Models\CounterStaffAttendance;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // Always return JSON validation errors, including clients without an Accept header.
        $request->headers->set('Accept', 'application/json');
        $filters = $request->validate([
            'user_id' => ['sometimes', 'integer', 'min:1'],
            'attendance_date' => ['sometimes', 'date_format:Y-m-d'],
            'per_page' => ['sometimes', 'integer', 'between:1,100'],
            'agent_page' => ['sometimes', 'integer', 'min:1'],
            'staff_page' => ['sometimes', 'integer', 'min:1'],
        ]);

        $data = [];
        foreach ([
            'agent_attendance' => [AgentAttendance::class, 'agent_page'],
            'counter_staff_attendance' => [CounterStaffAttendance::class, 'staff_page'],
        ] as $key => [$model, $pageName]) {
            $query = $model::query()->select([
                'id', 'user_id', 'attendance_date', 'check_in_time', 'check_out_time', 'created_at', 'updated_at',
            ])->with('user:id,name');

            foreach (['user_id', 'attendance_date'] as $field) {
                if (isset($filters[$field])) {
                    $query->where($field, $filters[$field]);
                }
            }

            $data[$key] = $query->orderByDesc('attendance_date')->orderByDesc('check_in_time')->orderByDesc('id')
                ->paginate($filters['per_page'] ?? 50, ['*'], $pageName)
                ->withQueryString()
                ->through(fn (Model $attendance) => [
                    'user_id' => $attendance->user_id,
                    'user_name' => $attendance->user?->name,
                    'attendance_date' => $attendance->attendance_date?->format('Y-m-d'),
                    'check_in_time' => $attendance->check_in_time?->toIso8601String(),
                    'check_out_time' => $attendance->check_out_time?->toIso8601String(),
                    'created_at' => $attendance->created_at?->toIso8601String(),
                    'updated_at' => $attendance->updated_at?->toIso8601String(),
                ]);
        }

        return response()->json($data);
    }
}
