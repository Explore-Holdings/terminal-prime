<?php

namespace App\Http\Controllers;

use App\Models\Trip;
use App\Models\UserLoginLog;
use App\Models\TripFinance;
use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountantController extends Controller
{
    public function index(Request $request)
    {
        // Fetch all completed shift logs (handed over), ordered by most recent
        $shiftLogs = UserLoginLog::with('user')
            ->whereNotNull('logout_at')
            ->orderByDesc('login_at')
            ->get();

        // For each shift, gather trip and payment details
        $shifts = $shiftLogs->map(function ($log) {
            $trips = Trip::with(['customer', 'driver.vehicle', 'tripFinance'])
                ->where('trip_assigned_by', $log->user_id)
                ->where('trip_assigned_at', '>=', $log->login_at)
                ->where('trip_assigned_at', '<=', $log->logout_at)
                ->orderByDesc('trip_assigned_at')
                ->get();

            $paymentSummary = $this->buildPaymentSummary($trips);

            return [
                'id'              => $log->id,
                'shift_id'        => $log->shift_id,
                'user_name'       => $log->user->name ?? 'Unknown',
                'login_at'        => $log->login_at,
                'logout_at'       => $log->logout_at,
                'handed_over_at'  => $log->handed_over_at,
                'total_trips'     => $trips->count(),
                'total_revenue'   => $trips->sum(fn($t) => $t->tripFinance?->total_amount ?? 0),
                'total_driver_share' => $trips->sum(fn($t) => $t->tripFinance?->driver_share ?? 0),
                'total_agent_share'  => $trips->sum(fn($t) => $t->tripFinance?->agent_share ?? 0),
                'total_balance'   => $trips->sum(fn($t) => $t->tripFinance?->balance ?? 0),
                'trips'           => $trips,
                'payment_summary' => $paymentSummary,
            ];
        });

        return Inertia::render('Accountant/Index', [
            'shifts' => $shifts,
        ]);
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
                    $byMethod[$method] = ['total' => 0, 'currencies' => [], 'count' => 0];
                }
                $byMethod[$method]['total'] += $amount;
                $byMethod[$method]['count'] += 1;
                $byMethod[$method]['currencies'][$currency] = ($byMethod[$method]['currencies'][$currency] ?? 0) + $amount;
                $currencies[$currency] = ($currencies[$currency] ?? 0) + $amount;

                if ($method === 'POS' || !empty($p['transaction_id']) || !empty($p['card_number'])) {
                    $posTransactions[] = [
                        'customer_name'  => $customer->name,
                        'customer_code'  => $customer->customer_code,
                        'method'         => $method,
                        'amount'         => $amount,
                        'currency'       => $currency,
                        'transaction_id' => $p['transaction_id'] ?? $customer->transaction_id,
                        'card_number'    => $p['card_number'] ?? $customer->card_number,
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
                                    'currency'   => $noteCur,
                                    'note_value' => $noteVal,
                                    'count'      => 0,
                                    'total'      => 0,
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
            'byMethod'        => $byMethod,
            'currencies'      => $currencies,
            'cashNotes'       => $cashNotes,
            'posTransactions' => $posTransactions,
            'totals' => [
                'trips_count'  => count($trips),
                'total_amount' => $trips->sum(fn($t) => $t->tripFinance?->total_amount ?? 0),
                'driver_share' => $trips->sum(fn($t) => $t->tripFinance?->driver_share ?? 0),
                'agent_share'  => $trips->sum(fn($t) => $t->tripFinance?->agent_share ?? 0),
                'balance'      => $trips->sum(fn($t) => $t->tripFinance?->balance ?? 0),
            ],
        ];
    }
}
