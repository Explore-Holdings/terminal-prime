<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use App\Models\Customer;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

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
        $data = $request->validate([
            'currency' => 'required|string|max:10',
            'price' => 'required|numeric|min:0',
            'payment_method' => 'required|in:Cash',
            'payment_notes' => 'required|array|min:1',
            'payment_notes.*.note' => 'required|numeric|min:1',
            'payment_notes.*.count' => 'required|integer|min:0',
        ]);

        $total = collect($data['payment_notes'])->sum(function ($item) {
            return ((float) $item['note']) * ((int) $item['count']);
        });

        if ((float) $total !== (float) $data['price']) {
            return back()->withErrors([
                'payment_notes' => 'Cash note total must match the price.',
            ]);
        }

        $customer->update([
            'payment_method' => $data['payment_method'],
            'payment_notes' => $data['payment_notes'],
            'paid_amount' => $total,
            'payment_status' => 'Paid',
        ]);

        $customer->agent()->update([
            'new_currency' => $data['currency'],
            'new_price' => $data['price'],
            'currency_updated_by' => auth()->id(),
        ]);

        return back()->with('success', 'Payment saved successfully.');
    }
}