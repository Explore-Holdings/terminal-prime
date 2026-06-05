<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use App\Models\Customer;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use App\Mail\CustomerInvoiceMail;

class CustomerController extends Controller
{
    public function index()
    {
        return Inertia::render('Counter/Index', [
            'pendingAgents' => Agent::with('user')
                ->where('status', 'Pending')
                ->latest()
                ->get(),

            'vehicles' => Vehicle::with(['driver.languages', 'pictures'])
                ->latest()
                ->get(),

            'createdCustomerId' => session()->pull('created_customer_id'),
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

        $agent = Agent::findOrFail($request->agent_id);

        $data['customer_code'] = $this->generateCustomerCode();

        $data['passport_image'] = $agent->customer_passport;

        $data['name'] = $data['name'] ?: $agent->name;
        $data['dropoff_location'] = $data['dropoff_location'] ?: $agent->dropoff_location;
        $data['passenger_count'] = $data['passenger_count'] ?: $agent->passenger_count;
        $data['remarks'] = $data['remarks'] ?: $agent->remarks;
        $data['status'] = $data['status'] ?? 'New';
        $data['created_by'] = Auth::id();

        $customer = Customer::create($data);

        $agent->update([
            'status' => 'Approved',
        ]);

        return redirect()
            ->route('counter.index')
            ->with('success', 'Customer created successfully.')
            ->with('created_customer_id', $customer->id);
    }

    public function update(Request $request, Customer $customer)
    {
        $data = $request->validate([
            'agent_id' => 'required|exists:agents,id',
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'whatsapp_number' => 'nullable|string|max:30',
            'country' => 'nullable|string|max:100',
            'mobile_number' => 'nullable|string|max:30',
            'passport_image' => 'nullable|image|max:4096',
            'dropoff_location' => 'nullable|string|max:255',
            'passenger_count' => 'required|integer|min:1',
            'language_preference' => 'nullable|string|max:100',
            'status' => 'required|string|max:50',
            'remarks' => 'nullable|string',
        ]);

        if ($request->hasFile('passport_image')) {
            if ($customer->passport_image && Storage::disk('public')->exists($customer->passport_image)) {
                Storage::disk('public')->delete($customer->passport_image);
            }

            $data['passport_image'] = $request->file('passport_image')
                ->store('customers/passports', 'public');
        }

        $customer->update($data);

        return back()->with('success', 'Customer updated successfully.');
    }

    public function destroy(Customer $customer)
    {
        $customer->delete();

        return back()->with('success', 'Customer deleted successfully.');
    }

    private function generateCustomerCode()
    {
        $lastCustomer = Customer::withTrashed()
            ->where('customer_code', 'REGEXP', '^CUS-[0-9]{5}$')
            ->orderByRaw("CAST(SUBSTRING(customer_code, 5) AS UNSIGNED) DESC")
            ->first();

        $nextNumber = $lastCustomer
            ? ((int) substr($lastCustomer->customer_code, 4)) + 1
            : 1;

        return 'CUS-' . str_pad($nextNumber, 5, '0', STR_PAD_LEFT);
    }

    public function savePayment(Request $request, Customer $customer)
    {
        $validationRules = [
            'currency' => 'required|string|max:10',
            'price' => 'required|numeric|min:0',
            'payment_method' => 'required|in:Cash,POS',
            'transaction_id' => 'nullable|string|max:100',
            'card_number' => 'nullable|string|max:50',
        ];

        if ($request->payment_method === 'Cash') {
            $validationRules['payment_notes'] = 'required|array|min:1';
            $validationRules['payment_notes.*.amount'] = 'required|numeric|min:0.01';
            $validationRules['payment_notes.*.count'] = 'required|integer|min:1';
        }

        if ($request->payment_method === 'POS') {
            $validationRules['transaction_id'] = 'required|string|max:100';
            $validationRules['card_number'] = 'required|string|max:50';
        }

        $data = $request->validate($validationRules);

        $paidAmount = 0;

        if ($data['payment_method'] === 'Cash') {
            $paidAmount = collect($data['payment_notes'])->sum(function ($item) {
                return ((float) $item['amount']) * ((int) $item['count']);
            });

            if (round((float) $paidAmount, 2) !== round((float) $data['price'], 2)) {
                return back()->withErrors([
                    'payment_notes' => 'Cash note total must match the price.',
                ]);
            }

            $customer->update([
                'payment_method' => 'Cash',
                'payment_notes' => $data['payment_notes'],
                'transaction_id' => null,
                'card_number' => null,
                'paid_amount' => $paidAmount,
                'payment_status' => 'Paid',
            ]);
        }

        if ($data['payment_method'] === 'POS') {
            $paidAmount = (float) $data['price'];

            $customer->update([
                'payment_method' => 'POS',
                'payment_notes' => null,
                'transaction_id' => $data['transaction_id'],
                'card_number' => $data['card_number'],
                'paid_amount' => $paidAmount,
                'payment_status' => 'Paid',
            ]);
        }

        $customer->agent()->update([
            'new_currency' => $data['currency'],
            'new_price' => $data['price'],
            'currency_updated_by' => auth()->id(),
        ]);

        $customer->load('agent.user');

        $invoiceNumber = 'INV-' . str_pad($customer->id, 5, '0', STR_PAD_LEFT);

        $customer->update([
            'invoice_number' => $invoiceNumber,
        ]);

        $customer->refresh()->load('agent.user');

        $pdf = Pdf::loadView('invoices.customer-invoice', [
            'customer' => $customer,
            'currency' => $data['currency'],
            'price' => $data['price'],
            'paidAmount' => $paidAmount,
        ]);

        $invoicePath = 'invoices/' . $invoiceNumber . '.pdf';

        Storage::disk('public')->put($invoicePath, $pdf->output());

        $customer->update([
            'invoice_path' => $invoicePath,
        ]);

        if (!empty($customer->email)) {

            Mail::to($customer->email)
                ->send(
                    new CustomerInvoiceMail(
                        $customer,
                        $invoiceNumber
                    )
                );

        }

        return redirect()
        ->route('counter.index')
        ->with('success', 'Payment saved and invoice generated successfully.')
        ->with('invoice_path', $invoicePath);
    }
}