<?php

namespace App\Http\Controllers;

use App\Models\Country;
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

        // Fetch only users with the 'agent' role
        $agents = User::whereHas('role', function ($q) {
            $q->where('name', 'agent');
        })->orderBy('name')
          ->get(['id', 'name', 'designation']);

        // Fetch country list
        $countries = Country::orderBy('country_name')->get(['id', 'country_name', 'country_code']);

        // If a chat was just submitted
        $submittedChat = null;
        if ($request->query('success') && $request->query('chat_id')) {
            $submittedChat = CustomerChat::with(['agent:id,name,designation', 'messages'])
                ->find($request->query('chat_id'));
        }

        return Inertia::render('Customer/InquiryForm', [
            'agents' => $agents,
            'countries' => $countries,
            'preselectedAgentId' => $agentQuery ? (int)$agentQuery : null,
            'submittedChat' => $submittedChat,
        ]);
    }

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

        CustomerChatMessage::create([
            'chat_id' => $chat->id,
            'sender' => 'customer',
            'sender_name' => $validated['customer_name'],
            'message' => $validated['message'],
            'created_at' => now(),
        ]);

        return redirect()->route('inquiry.show', [
            'success' => 1,
            'chat_id' => $chat->id,
        ])->with('success', 'Your inquiry has been submitted successfully to the counter agent.');
    }
}
