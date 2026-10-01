<?php

namespace App\Http\Controllers;

use App\Models\Country;
use App\Models\Customer;
use App\Models\CustomerChat;
use App\Models\CustomerChatMessage;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerInquiryController extends Controller
{
    public function show(Request $request)
    {
        $agentQuery = $request->query('agent');
        $invoiceQuery = $request->query('invoice');

        // Fetch agents list
        $agents = User::whereHas('role', function ($q) {
            $q->where('name', 'agent');
        })->orderBy('name')
          ->get(['id', 'name', 'designation']);

        // Fetch country list
        $countries = Country::orderBy('country_name')->get(['id', 'country_name', 'country_code']);

        return Inertia::render('Customer/InquiryForm', [
            'agents' => $agents,
            'countries' => $countries,
            'preselectedAgentId' => $agentQuery ? (int)$agentQuery : null,
            'initialInvoice' => $invoiceQuery ? trim($invoiceQuery) : '',
        ]);
    }

    /**
     * Verify customer invoice from `customers` table.
     * Does NOT save anything into the database at this step.
     */
    public function verifyInvoice(Request $request)
    {
        $request->validate([
            'invoice_number' => 'required|string|max:50',
        ]);

        $raw = trim($request->input('invoice_number'));
        $upper = strtoupper($raw);

        // Build potential variants (e.g. 00001, INV-00001, 1, INV-1)
        $candidates = [$raw, $upper];
        if (!str_starts_with($upper, 'INV-')) {
            $numOnly = ltrim($upper, 'INV-');
            $candidates[] = 'INV-' . $numOnly;
            if (is_numeric($numOnly)) {
                $candidates[] = 'INV-' . str_pad($numOnly, 5, '0', STR_PAD_LEFT);
            }
        } else {
            $numPart = substr($upper, 4);
            if (is_numeric($numPart)) {
                $candidates[] = 'INV-' . str_pad($numPart, 5, '0', STR_PAD_LEFT);
                $candidates[] = 'INV-' . (int)$numPart;
            }
        }
        $candidates = array_values(array_unique($candidates));

        // Query customer by invoice_number (case-insensitive)
        $customer = Customer::whereIn('invoice_number', $candidates)
            ->orWhere(function ($q) use ($candidates) {
                foreach ($candidates as $cand) {
                    $q->orWhereRaw('LOWER(invoice_number) = ?', [strtolower($cand)]);
                }
            })
            ->with(['agent'])
            ->first();

        if (!$customer) {
            $displayInv = str_starts_with($upper, 'INV-') ? $upper : 'INV-' . $upper;
            return response()->json([
                'success' => false,
                'message' => "Invoice '{$displayInv}' was not found. Please verify your invoice number (e.g. INV-00001, INV-00002).",
            ], 404);
        }

        // Determine counter agent user ID
        $agentUserId = null;
        if ($customer->agent && $customer->agent->user_id) {
            $agentUserId = $customer->agent->user_id;
        }
        if (!$agentUserId) {
            $agentUserId = User::whereHas('role', fn($q) => $q->where('name', 'agent'))->value('id') ?? 1;
        }

        // Look for any existing continuing chat for this invoice (read-only lookup)
        $existingChat = CustomerChat::where('topic', 'like', "%{$customer->invoice_number}%")
            ->where('status', 'continuing')
            ->with(['messageRecord'])
            ->latest('updated_at')
            ->first();

        return response()->json([
            'success' => true,
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email ?: 'Not Provided',
                'phone' => $customer->whatsapp_number ?: ($customer->mobile_number ?: 'Not Provided'),
                'country' => $customer->country ?: 'Global',
                'invoice_number' => $customer->invoice_number,
                'dropoff_location' => $customer->dropoff_location,
                'agent_id' => $agentUserId,
            ],
            'existing_chat' => $existingChat,
        ]);
    }

    /**
     * Send a message from the customer portal WhatsApp UI.
     * Saves the chat and message to the database only when the message is sent.
     */
    public function sendMessage(Request $request)
    {
        $validated = $request->validate([
            'chat_id' => 'nullable|exists:customer_chats,id',
            'invoice_number' => 'required|string|max:50',
            'customer_name' => 'required|string|max:150',
            'customer_phone' => 'nullable|string|max:50',
            'country' => 'nullable|string|max:100',
            'agent_id' => 'nullable|integer',
            'message' => 'required|string|max:3000',
        ]);

        if (!empty($validated['chat_id'])) {
            $chat = CustomerChat::findOrFail($validated['chat_id']);

            $msg = CustomerChatMessage::appendMessage(
                $chat->id,
                'customer',
                $validated['customer_name'],
                $validated['message']
            );

            $chat->touch();

            return response()->json([
                'success' => true,
                'chat_id' => $chat->id,
                'message' => $msg,
            ]);
        }

        // First message: Create CustomerChat record in DB now
        $invoice = strtoupper(trim($validated['invoice_number']));
        if (!str_starts_with($invoice, 'INV-')) {
            $invoice = 'INV-' . $invoice;
        }
        $agentId = $validated['agent_id'] ?? null;
        if (!$agentId) {
            $agentId = User::whereHas('role', fn($q) => $q->where('name', 'agent'))->value('id') ?? 1;
        }

        $chat = CustomerChat::create([
            'agent_id' => $agentId,
            'customer_name' => $validated['customer_name'],
            'customer_phone' => $validated['customer_phone'] ?? null,
            'country' => $validated['country'] ?? 'Global',
            'country_code' => null,
            'country_flag' => '🌐',
            'topic' => 'Invoice #' . $invoice,
            'status' => 'continuing',
        ]);

        $msg = CustomerChatMessage::appendMessage(
            $chat->id,
            'customer',
            $validated['customer_name'],
            $validated['message']
        );

        return response()->json([
            'success' => true,
            'chat_id' => $chat->id,
            'message' => $msg,
        ]);
    }

    /**
     * Poll latest chat messages for real-time response inside WhatsApp UI.
     */
    public function getMessages(CustomerChat $chat)
    {
        return response()->json([
            'success' => true,
            'status' => $chat->status,
            'messages' => $chat->messages,
        ]);
    }

    /**
     * Legacy store method for standard form posts
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'agent_id' => 'required|exists:users,id',
            'customer_name' => 'required|string|max:150',
            'customer_phone' => 'nullable|string|max:50',
            'country' => 'required|string|max:100',
            'country_code' => 'nullable|string|max:10',
            'country_flag' => 'nullable|string|max:10',
            'topic' => 'required|string|max:255',
            'message' => 'required|string|max:3000',
        ]);

        $chat = CustomerChat::create([
            'agent_id' => $validated['agent_id'],
            'customer_name' => $validated['customer_name'],
            'customer_phone' => $validated['customer_phone'] ?? null,
            'country' => $validated['country'],
            'country_code' => $validated['country_code'] ?? null,
            'country_flag' => $validated['country_flag'] ?? '🌐',
            'topic' => $validated['topic'],
            'status' => 'continuing',
        ]);

        CustomerChatMessage::appendMessage(
            $chat->id,
            'customer',
            $validated['customer_name'],
            $validated['message']
        );

        return redirect()->route('customer-portal.show', [
            'success' => 1,
            'chat_id' => $chat->id,
        ])->with('success', 'Your inquiry has been submitted successfully to the counter agent.');
    }
}
