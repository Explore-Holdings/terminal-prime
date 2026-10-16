<?php

namespace App\Http\Controllers;

use App\Models\AgentAttendance;
use App\Models\CounterStaffAttendance;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $staffAttendance = CounterStaffAttendance::with([
            'user' => function ($q) {
                $q->select('id', 'name', 'email', 'designation', 'role_id');
            }
        ])
        ->orderByDesc('attendance_date')
        ->orderByDesc('check_in_time')
        ->get();

        $agentAttendance = AgentAttendance::with([
            'user' => function ($q) {
                $q->select('id', 'name', 'email', 'agent_id', 'role_id');
            }
        ])
        ->orderByDesc('attendance_date')
        ->orderByDesc('check_in_time')
        ->get();

        // Calculate summary statistics
        $today = Carbon::today()->toDateString();

        $staffPresentCount = $staffAttendance->where('status', 'present')->count();
        $staffCompletedCount = $staffAttendance->where('status', 'completed')->count();
        $agentPresentCount = $agentAttendance->where('status', 'present')->count();
        $agentCompletedCount = $agentAttendance->where('status', 'completed')->count();

        $stats = [
            'totalStaffRecords' => $staffAttendance->count(),
            'totalAgentRecords' => $agentAttendance->count(),
            'activePresentCount' => $staffPresentCount + $agentPresentCount,
            'completedShiftsCount' => $staffCompletedCount + $agentCompletedCount,
            'uniqueStaff' => $staffAttendance->pluck('user_id')->unique()->count(),
            'uniqueAgents' => $agentAttendance->pluck('user_id')->unique()->count(),
        ];

        return Inertia::render('Attendance/Index', [
            'staffAttendance' => $staffAttendance,
            'agentAttendance' => $agentAttendance,
            'stats' => $stats,
        ]);
    }
}
