<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use App\Models\Customer;
use App\Mail\CustomerInvoiceMail;
use App\Mail\CustomerSurveyMail;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use App\Models\Trip;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CustomerController extends Controller
{

    public function index()
    {
        return Inertia::render('Customers/Index', [
            'customers' => Customer::with(['agent.user'])
                ->latest()
                ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'agent_id' => 'required|exists:agents,id',
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'mobile_number' => 'nullable|string|max:30',
            'whatsapp_number' => 'nullable|string|max:30',
            'country' => 'nullable|string|max:100',
            'dropoff_location' => 'nullable|string|max:255',
            'passenger_count' => 'required|integer|min:1',
            'language_preference' => 'nullable|string|max:100',
            'status' => 'nullable|string|max:50',
            'remarks' => 'nullable|string',
        ]);

        $agent = Agent::findOrFail($data['agent_id']);

        $customer = Customer::create([
            ...$data,
            'customer_code' => $this->generateCustomerCode(),
            'passport_image' => $agent->customer_passport,
            'name' => $data['name'] ?: $agent->name,
            'dropoff_location' => $data['dropoff_location'] ?: $agent->dropoff_location,
            'passenger_count' => $data['passenger_count'] ?: $agent->passenger_count,
            'remarks' => $data['remarks'] ?: $agent->remarks,
            'status' => $data['status'] ?? 'New',
            'created_by' => Auth::id(),
        ]);

        return redirect()
            ->route('counter.index')
            ->with('created_customer_id', $customer->id);
    }

    public function savePayment(Request $request, Customer $customer)
    {
        $data = $request->validate([
            'currency'                  => 'required|string|max:10',
            'price'                     => 'required|numeric|min:0',
            'payments'                  => 'required|array|min:1',
            'payments.*.method'         => 'required|in:Cash,POS,Bank Transfer,Online',
            'payments.*.currency'       => 'nullable|string|max:10',
            'payments.*.amount'         => 'required|numeric|min:0',
            'payments.*.transaction_id' => 'nullable|string|max:100',
            'payments.*.card_number'    => 'nullable|string|max:100',
            'payments.*.notes'          => 'nullable|array',
            'payments.*.notes.*.currency' => 'nullable|string|max:10',
            'payments.*.notes.*.amount'   => 'nullable|numeric|min:0.01',
            'payments.*.notes.*.count'    => 'nullable|integer|min:1',
        ]);

        $payments = collect($data['payments'])->map(function ($p) use ($data) {
            $payCur = $p['currency'] ?? $data['currency'];

            if ($p['method'] === 'Cash' && !empty($p['notes'])) {
                $amount = collect($p['notes'])
                    ->sum(function ($n) {
                        return (float) ($n['amount'] ?? 0) * (int) ($n['count'] ?? 0);
                    });

                $notes = collect($p['notes'])
                    ->map(fn ($n) => [
                        'amount'   => $n['amount'] ?? null,
                        'count'    => $n['count'] ?? null,
                        'currency' => $n['currency'] ?? $payCur,
                    ])
                    ->values()->all();
            } else {
                $amount = (float) ($p['amount'] ?? 0);
                $notes  = null;
            }

            return [
                'method'         => $p['method'],
                'currency'       => $payCur,
                'amount'         => round($amount, 2),
                'notes'          => $notes,
                'transaction_id' => $p['transaction_id'] ?? null,
                'card_number'    => $p['card_number'] ?? null,
            ];
        })->values();

        $paidAmount = $payments->sum('amount');

        if (round($paidAmount, 2) !== round((float) $data['price'], 2)) {
            return back()->withErrors([
                'payments' => 'Total paid (' . number_format($paidAmount, 2) .
                            ') must match the price (' . number_format($data['price'], 2) . ').',
            ]);
        }

        // Validate cash blocks have at least one note
        foreach ($payments as $p) {
            if ($p['method'] === 'Cash' && empty($p['notes'])) {
                return back()->withErrors([
                    'payments' => 'Cash payments require at least one note breakdown.',
                ]);
            }
        }

        // Build summary fields from the payments array
        $methods   = $payments->pluck('method')->unique()->implode(' + ');
        $firstPos  = $payments->firstWhere('method', 'POS');

        $customer->update([
            'payment_method' => $methods,                 
            'payment_notes'  => $payments->toArray(),     
            'transaction_id' => $firstPos['transaction_id'] ?? null,
            'card_number'    => $firstPos['card_number'] ?? null,
            'paid_amount'    => $paidAmount,
            'payment_status' => $paidAmount >= (float) $data['price'] ? 'Paid' : 'Partial',
        ]);

        $customer->agent()->update([
            'new_currency'        => $data['currency'],
            'new_price'           => $data['price'],
            'currency_updated_by' => auth()->id(),
        ]);

        $invoiceNumber = 'INV-' . str_pad($customer->id, 5, '0', STR_PAD_LEFT);
        $invoicePath   = "invoices/{$invoiceNumber}.pdf";

        $customer->update(['invoice_number' => $invoiceNumber]);
        $customer->refresh()->load('agent.user');

        $pdf = Pdf::loadView('invoices.customer-invoice', [
            'customer'   => $customer,
            'currency'   => $data['currency'],
            'price'      => $data['price'],
            'paidAmount' => $paidAmount,
            'payments'   => $payments,  
        ]);

        Storage::disk('public')->put($invoicePath, $pdf->output());

        $customer->update(['invoice_path' => $invoicePath]);

        if ($customer->email) {
            Mail::to($customer->email)
                ->queue(new CustomerInvoiceMail($customer, $invoiceNumber));
        }

        return redirect()
            ->route('counter.index')
            ->with('invoice_path', $invoicePath);
    }

    public function assignTrip(Request $request, Customer $customer)
    {
        $data = $request->validate([
            'driver_id' => 'required|exists:drivers,id',
            'agent_id' => 'required|exists:agents,id',
            'remarks' => 'nullable|string',
        ]);

        DB::transaction(function () use ($data, $customer) {

            $trip = Trip::create([
                'driver_id' => $data['driver_id'],
                'customer_id' => $customer->id,
                'agent_id' => $data['agent_id'],
                'trip_assigned_at' => now(),
                'trip_assigned_by' => auth()->id(),
                'remarks' => $data['remarks'] ?? null,
                'status' => 'Assigned',
            ]);

            Agent::where('id', $data['agent_id'])->update([
                'status' => 'Approved',
            ]);

            $trip->load('customer');

            if (
                $trip->status === 'Assigned' &&
                $trip->customer?->email &&
                !$trip->survey_sent_at
            ) {
                Mail::to($trip->customer->email)
                    ->queue(new CustomerSurveyMail($trip));

                $trip->update([
                    'survey_sent_at' => now(),
                ]);
            }
        });

        return back()->with('success', 'Trip assigned successfully.');
    }

    private function generateCustomerCode()
    {
        $last = Customer::withTrashed()
            ->where('customer_code', 'REGEXP', '^CUS-[0-9]{5}$')
            ->orderByRaw("CAST(SUBSTRING(customer_code, 5) AS UNSIGNED) DESC")
            ->first();

        $next = $last ? ((int) substr($last->customer_code, 4)) + 1 : 1;

        return 'CUS-' . str_pad($next, 5, '0', STR_PAD_LEFT);
    }
}