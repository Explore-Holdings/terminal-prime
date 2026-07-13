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
        $range = $request->get('range', 'today');

        // 1. Fetch trips for the main report generator by reusing our helper
        $data = $this->getTripsByRange($request, $range);

        // 2. Fetch all handed over shift reports for the sidebar list
        $reports = UserLoginLog::with('user')
            ->whereNotNull('handed_over_at')
            ->latest('handed_over_at')
            ->get()
            ->map(function ($log) {
                $log->total_trips = Trip::where('trip_assigned_by', $log->user_id)
                    ->where('trip_assigned_at', '>=', $log->login_at)
                    ->where('trip_assigned_at', '<=', $log->logout_at ?? now())
                    ->count();

                // calculate session revenue
                $log->total_revenue = Trip::with('tripFinance')
                    ->where('trip_assigned_by', $log->user_id)
                    ->where('trip_assigned_at', '>=', $log->login_at)
                    ->where('trip_assigned_at', '<=', $log->logout_at ?? now())
                    ->get()
                    ->sum(fn($t) => $t->tripFinance?->total_amount ?? 0);

                return $log;
            });

        return Inertia::render('Reports/ManagerReports', [
            'trips' => $data['trips'],
            'reports' => $reports,
            'filters' => [
                'range' => $range,
                'from' => $request->get('from'),
                'to' => $request->get('to'),
            ],
        ]);
    }


    public function pdfTrips(Request $request)
    {
        $range = $request->get('range', 'today');
        $data = $this->getTripsByRange($request, $range);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.today-trips', [
            'trips' => $data['trips'],
            'date' => $data['date'],
            'title' => $data['title'],
            'is_print' => false,
        ]);

        $filename = str_replace(' ', '-', strtolower($data['title'])) . '-' . now()->format('Y-m-d') . '.pdf';
        return $pdf->download($filename);
    }

    public function printTrips(Request $request)
    {
        $range = $request->get('range', 'today');
        $data = $this->getTripsByRange($request, $range);

        return view('pdf.today-trips', [
            'trips' => $data['trips'],
            'date' => $data['date'],
            'title' => $data['title'],
            'is_print' => true,
        ]);
    }

    private function getTripsByRange(Request $request, string $range)
    {
        $query = Trip::with(['customer', 'driver.vehicle', 'tripFinance']);

        if ($range === 'today') {
            $query->where(function ($q) {
                $q->whereDate('trip_assigned_at', today())
                  ->orWhere(function ($sq) {
                      $sq->whereNull('trip_assigned_at')
                         ->whereDate('created_at', today());
                  });
            });
            $title = "Today's Trips Report";
            $dateStr = today()->format('M d, Y');
        } elseif ($range === 'week') {
            $start = now()->startOfWeek();
            $end = now()->endOfWeek();
            $query->where(function ($q) use ($start, $end) {
                $q->whereBetween('trip_assigned_at', [$start, $end])
                  ->orWhere(function ($sq) use ($start, $end) {
                      $sq->whereNull('trip_assigned_at')
                         ->whereBetween('created_at', [$start, $end]);
                  });
            });
            $title = "This Week's Trips Report";
            $dateStr = $start->format('M d, Y') . ' to ' . $end->format('M d, Y');
        } elseif ($range === 'month') {
            $query->where(function ($q) {
                $q->whereMonth('trip_assigned_at', now()->month)
                  ->whereYear('trip_assigned_at', now()->year)
                  ->orWhere(function ($sq) {
                      $sq->whereNull('trip_assigned_at')
                         ->whereMonth('created_at', now()->month)
                         ->whereYear('created_at', now()->year);
                  });
            });
            $title = "This Month's Trips Report";
            $dateStr = now()->format('F Y');
        } elseif ($range === 'custom') {
            $from = $request->get('from');
            $to = $request->get('to');
            if ($from && $to) {
                $query->where(function ($q) use ($from, $to) {
                    $q->whereBetween('trip_assigned_at', [
                        \Carbon\Carbon::parse($from)->startOfDay(),
                        \Carbon\Carbon::parse($to)->endOfDay()
                    ])->orWhere(function ($sq) use ($from, $to) {
                        $sq->whereNull('trip_assigned_at')
                           ->whereBetween('created_at', [
                               \Carbon\Carbon::parse($from)->startOfDay(),
                               \Carbon\Carbon::parse($to)->endOfDay()
                           ]);
                    });
                });
                $title = "Custom Date Trips Report";
                $dateStr = \Carbon\Carbon::parse($from)->format('M d, Y') . ' to ' . \Carbon\Carbon::parse($to)->format('M d, Y');
            } else {
                $title = "Custom Date Trips Report";
                $dateStr = "No Date Selected";
            }
        } else {
            $title = "Trips Report";
            $dateStr = today()->format('M d, Y');
        }

        return [
            'trips' => $query->latest('trip_assigned_at')->get(),
            'title' => $title,
            'date' => $dateStr,
        ];
    }
}
