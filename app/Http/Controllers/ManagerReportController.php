<?php

namespace App\Http\Controllers;

use App\Models\UserLoginLog;
use App\Models\Trip;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class ManagerReportController extends Controller
{
    public function index(Request $request)
    {
        $range = $request->get('range', 'today');

        $data = $this->getTripsByRange($request, $range);
        $paymentSummary = $this->buildPaymentSummary($data['trips']);
        $pettyCashReturns = $this->getPettyCashReturnsByRange($request, $range);

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
            'paymentSummary' => $paymentSummary,
            'reports' => $reports,
            'pettyCashReturns' => $pettyCashReturns,
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
        $paymentSummary = $this->buildPaymentSummary($data['trips']);
        $pettyCashReturns = $this->getPettyCashReturnsByRange($request, $range);

        $pdf = Pdf::loadView('pdf.today-trips', [
            'trips' => $data['trips'],
            'paymentSummary' => $paymentSummary,
            'pettyCashReturns' => $pettyCashReturns,
            'date' => $data['date'],
            'title' => $data['title'],
            'is_print' => false,
        ]);
        $pdf->getDomPDF()->set_option('isPhpEnabled', true);

        $filename = str_replace(' ', '-', strtolower($data['title'])) . '-' . now()->format('Y-m-d') . '.pdf';

        \App\Services\AuditLogger::logExport(
            'PDF_EXPORT',
            "Exported Trips Report to PDF ({$data['title']}, {$data['date']}, " . count($data['trips']) . " trips)",
            'trips',
            ['range' => $range, 'trips_count' => count($data['trips'])]
        );

        return $pdf->download($filename);
    }

    public function printTrips(Request $request)
    {
        $range = $request->get('range', 'today');
        $data = $this->getTripsByRange($request, $range);
        $paymentSummary = $this->buildPaymentSummary($data['trips']);
        $pettyCashReturns = $this->getPettyCashReturnsByRange($request, $range);

        \App\Services\AuditLogger::logExport(
            'PRINT_EXPORT',
            "Printed/Exported Trips Report ({$data['title']}, {$data['date']}, " . count($data['trips']) . " trips)",
            'trips',
            ['range' => $range, 'trips_count' => count($data['trips'])]
        );

        return view('pdf.today-trips', [
            'trips' => $data['trips'],
            'paymentSummary' => $paymentSummary,
            'pettyCashReturns' => $pettyCashReturns,
            'date' => $data['date'],
            'title' => $data['title'],
            'is_print' => true,
        ]);
    }

    private function getTripsByRange(Request $request, string $range)
    {
        $query = Trip::with(['customer', 'driver.vehicle', 'tripFinance', 'assignedBy']);

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
                        Carbon::parse($from)->startOfDay(),
                        Carbon::parse($to)->endOfDay()
                    ])->orWhere(function ($sq) use ($from, $to) {
                        $sq->whereNull('trip_assigned_at')
                           ->whereBetween('created_at', [
                               Carbon::parse($from)->startOfDay(),
                               Carbon::parse($to)->endOfDay()
                           ]);
                    });
                });
                $title = "Custom Date Trips Report";
                $dateStr = Carbon::parse($from)->format('M d, Y') . ' to ' . Carbon::parse($to)->format('M d, Y');
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

    private function getPettyCashReturnsByRange(Request $request, string $range)
    {
        $query = \App\Models\PettyCashReturn::with('customer');

        if ($range === 'today') {
            $query->whereDate('created_at', today());
        } elseif ($range === 'week') {
            $start = now()->startOfWeek();
            $end = now()->endOfWeek();
            $query->whereBetween('created_at', [$start, $end]);
        } elseif ($range === 'month') {
            $query->whereMonth('created_at', now()->month)
                  ->whereYear('created_at', now()->year);
        } elseif ($range === 'custom') {
            $from = $request->get('from');
            $to = $request->get('to');
            if ($from && $to) {
                $query->whereBetween('created_at', [
                    Carbon::parse($from)->startOfDay(),
                    Carbon::parse($to)->endOfDay()
                ]);
            }
        }

        return $query->latest('created_at')->get();
    }

    private function buildPaymentSummary($trips)
    {
        $byMethod = [];
        $currencies = [];
        $cashNotesMap = [];
        $posTransactions = [];

        foreach ($trips as $trip) {
            $customer = $trip->customer;
            if (!$customer) continue;

            $paymentNotes = $customer->payment_notes;
            if (is_string($paymentNotes)) {
                $paymentNotes = json_decode($paymentNotes, true);
            }

            if (!is_array($paymentNotes) || empty($paymentNotes)) {
                if ($customer->payment_method) {
                    $method = $customer->payment_method;
                    $paid = (float)($customer->paid_amount ?? 0);
                    $cur = $customer->agent?->currency ?? 'LKR';

                    if (!isset($byMethod[$method])) {
                        $byMethod[$method] = ['total' => 0, 'currencies' => [], 'count' => 0];
                    }
                    $byMethod[$method]['total'] += $paid;
                    $byMethod[$method]['count'] += 1;
                    $byMethod[$method]['currencies'][$cur] = ($byMethod[$method]['currencies'][$cur] ?? 0) + $paid;
                    $currencies[$cur] = ($currencies[$cur] ?? 0) + $paid;
                }
                continue;
            }

            foreach ($paymentNotes as $p) {
                $method = $p['method'] ?? 'Other';
                $currency = strtoupper($p['currency'] ?? 'LKR');
                $amount = (float)($p['amount'] ?? 0);

                if (!isset($byMethod[$method])) {
                    $byMethod[$method] = [
                        'total' => 0,
                        'currencies' => [],
                        'count' => 0,
                    ];
                }
                $byMethod[$method]['total'] += $amount;
                $byMethod[$method]['count'] += 1;
                $byMethod[$method]['currencies'][$currency] = ($byMethod[$method]['currencies'][$currency] ?? 0) + $amount;

                $currencies[$currency] = ($currencies[$currency] ?? 0) + $amount;

                if ($method === 'POS' || !empty($p['transaction_id']) || !empty($p['card_number'])) {
                    $posTransactions[] = [
                        'customer_name' => $customer->name,
                        'customer_code' => $customer->customer_code,
                        'method' => $method,
                        'amount' => $amount,
                        'currency' => $currency,
                        'transaction_id' => $p['transaction_id'] ?? $customer->transaction_id,
                        'card_number' => $p['card_number'] ?? $customer->card_number,
                    ];
                }

                if ($method === 'Cash' && !empty($p['notes']) && is_array($p['notes'])) {
                    foreach ($p['notes'] as $note) {
                        $noteVal = (float)($note['amount'] ?? 0);
                        $noteQty = (int)($note['count'] ?? 0);
                        $noteCur = strtoupper($note['currency'] ?? $currency);

                        if ($noteVal > 0 && $noteQty > 0) {
                            $key = $noteCur . '_' . $noteVal;
                            if (!isset($cashNotesMap[$key])) {
                                $cashNotesMap[$key] = [
                                    'currency' => $noteCur,
                                    'note_value' => $noteVal,
                                    'count' => 0,
                                    'total' => 0,
                                ];
                            }
                            $cashNotesMap[$key]['count'] += $noteQty;
                            $cashNotesMap[$key]['total'] += ($noteVal * $noteQty);
                        }
                    }
                }
            }
        }

        $cashNotes = array_values($cashNotesMap);
        usort($cashNotes, function ($a, $b) {
            if ($a['currency'] === $b['currency']) {
                return $b['note_value'] <=> $a['note_value'];
            }
            return strcmp($a['currency'], $b['currency']);
        });

        return [
            'byMethod' => $byMethod,
            'currencies' => $currencies,
            'cashNotes' => $cashNotes,
            'posTransactions' => $posTransactions,
            'totals' => [
                'trips_count' => count($trips),
                'total_amount' => $trips->sum(fn($t) => $t->tripFinance?->total_amount ?? 0),
                'driver_share' => $trips->sum(fn($t) => $t->tripFinance?->driver_share ?? 0),
                'agent_share' => $trips->sum(fn($t) => $t->tripFinance?->agent_share ?? 0),
                'balance' => $trips->sum(fn($t) => $t->tripFinance?->balance ?? 0),
            ],
        ];
    }
}
