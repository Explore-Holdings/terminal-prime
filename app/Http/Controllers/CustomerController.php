<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use App\Models\Customer;
use App\Mail\CustomerInvoiceMail;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use App\Models\Trip;
use Illuminate\Support\Facades\DB;

class CustomerController extends Controller
{
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
        $rules = [
            'currency' => 'required|string|max:10',
            'price' => 'required|numeric|min:0',
            'payment_method' => 'required|in:Cash,POS',
            'transaction_id' => 'nullable|string|max:100',
            'card_number' => 'nullable|string|max:50',
        ];

        if ($request->payment_method === 'Cash') {
            $rules['payment_notes'] = 'required|array|min:1';
            $rules['payment_notes.*.amount'] = 'required|numeric|min:0.01';
            $rules['payment_notes.*.count'] = 'required|integer|min:1';
        }

        if ($request->payment_method === 'POS') {
            $rules['transaction_id'] = 'required|string|max:100';
            $rules['card_number'] = 'required|string|max:50';
        }

        $data = $request->validate($rules);

        $paidAmount = $data['payment_method'] === 'Cash'
            ? collect($data['payment_notes'])->sum(fn ($n) => (float) $n['amount'] * (int) $n['count'])
            : (float) $data['price'];

        if (round($paidAmount, 2) !== round((float) $data['price'], 2)) {
            return back()->withErrors([
                'payment_notes' => 'Cash note total must match the price.',
            ]);
        }

        $customer->update([
            'payment_method' => $data['payment_method'],
            'payment_notes' => $data['payment_method'] === 'Cash' ? $data['payment_notes'] : null,
            'transaction_id' => $data['payment_method'] === 'POS' ? $data['transaction_id'] : null,
            'card_number' => $data['payment_method'] === 'POS' ? $data['card_number'] : null,
            'paid_amount' => $paidAmount,
            'payment_status' => 'Paid',
        ]);

        $customer->agent()->update([
            'new_currency' => $data['currency'],
            'new_price' => $data['price'],
            'currency_updated_by' => auth()->id(),
        ]);

        $invoiceNumber = 'INV-' . str_pad($customer->id, 5, '0', STR_PAD_LEFT);
        $invoicePath = "invoices/{$invoiceNumber}.pdf";

        $customer->update(['invoice_number' => $invoiceNumber]);
        $customer->refresh()->load('agent.user');

        $pdf = Pdf::loadView('invoices.customer-invoice', [
            'customer' => $customer,
            'currency' => $data['currency'],
            'price' => $data['price'],
            'paidAmount' => $paidAmount,
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
            Trip::create([
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