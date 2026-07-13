<?php

namespace App\Http\Controllers;

use App\Models\UserLoginLog;
use App\Models\Trip;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ManagerReportController extends Controller
{
    public function index(Request $request)
    {
        $filter = $request->get('filter', 'all');

        $query = UserLoginLog::with('user')
            ->whereNotNull('handed_over_at');

        if ($filter === 'today') {
            $query->whereDate('handed_over_at', today());
        } elseif ($filter === 'week') {
            $query->whereBetween('handed_over_at', [now()->startOfWeek(), now()->endOfWeek()]);
        } elseif ($filter === 'month') {
            $query->whereMonth('handed_over_at', now()->month)
                  ->whereYear('handed_over_at', now()->year);
        }

        $reports = $query->latest('handed_over_at')->get()->map(function ($log) {
            $trips = Trip::with('tripFinance')
                ->where('trip_assigned_by', $log->user_id)
                ->where('trip_assigned_at', '>=', $log->login_at)
                ->where('trip_assigned_at', '<=', $log->logout_at ?? now())
                ->get();

            $log->total_trips = $trips->count();
            $log->total_revenue = $trips->sum(fn($t) => $t->tripFinance?->total_amount ?? 0);
            return $log;
        });

        return Inertia::render('Reports/ManagerReports', [
            'reports' => $reports,
            'filters' => [
                'filter' => $filter,
            ],
        ]);
    }

    public function pdfTodayTrips()
    {
        $trips = Trip::with(['customer', 'driver.vehicle', 'tripFinance'])
            ->where(function ($q) {
                $q->whereDate('trip_assigned_at', today())
                  ->orWhere(function ($sq) {
                      $sq->whereNull('trip_assigned_at')
                         ->whereDate('created_at', today());
                  });
            })
            ->latest()
            ->get();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.today-trips', [
            'trips' => $trips,
            'date' => today()->format('M d, Y'),
            'is_print' => false,
        ]);

        return $pdf->download('today-trips-report-' . today()->format('Y-m-d') . '.pdf');
    }

    public function printTodayTrips()
    {
        $trips = Trip::with(['customer', 'driver.vehicle', 'tripFinance'])
            ->where(function ($q) {
                $q->whereDate('trip_assigned_at', today())
                  ->orWhere(function ($sq) {
                      $sq->whereNull('trip_assigned_at')
                         ->whereDate('created_at', today());
                  });
            })
            ->latest()
            ->get();

        return view('pdf.today-trips', [
            'trips' => $trips,
            'date' => today()->format('M d, Y'),
            'is_print' => true,
        ]);
    }
}
