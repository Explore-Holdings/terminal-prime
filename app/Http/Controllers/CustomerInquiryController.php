<?php

namespace App\Http\Controllers;

use App\Models\CustomerChatMessage;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerInquiryController extends Controller
{
    /**
     * Show public WhatsApp chat portal for a specific agent (e.g. /customerPortal/AGNT-1).
     * If an agent is not found, does NOT fallback to a default agent.
     */
    public function show(Request $request, $agentId = null)
    {
        // If agentId not specified in route, redirect to first agent
        if (empty($agentId)) {
            $defaultAgent = User::whereNotNull('agent_id')->orderBy('agent_id')->first();
            if ($defaultAgent && $defaultAgent->agent_id) {
                return redirect()->to('/customerPortal/' . $defaultAgent->agent_id);
            }
        }

        $cleanAgentId = strtoupper(trim((string)$agentId));

        // Find agent by agent_id (e.g. AGNT-1)
        $agent = User::where('agent_id', $cleanAgentId)->first();

        // Fallback check if numeric user id was passed
        if (!$agent && is_numeric($cleanAgentId)) {
            $agent = User::where('id', (int)$cleanAgentId)->whereNotNull('agent_id')->first();
        }

        // If agent does not exist, do NOT fallback to a default agent!
        if (!$agent) {
            return Inertia::render('Customer/InquiryForm', [
                'agentNotFound' => true,
                'requestedAgentId' => $cleanAgentId,
                'agent' => null,
                'initialChatId' => null,
                'initialMessages' => [],
                'status' => 'not_found',
            ]);
        }

        $agentFk = $agent->id;

        // Check if this specific customer already has an active continuing chat ID in this session/query
        $activeChatId = $request->query('chat_id') ?: $request->session()->get("customer_chat_{$agentFk}");

        $chatRecord = null;
        if ($activeChatId) {
            $chatRecord = CustomerChatMessage::where('id', (int)$activeChatId)
                ->where('agent_id', $agentFk)
                ->first();
        }

        $messages = $chatRecord ? $chatRecord->decoded_messages : [];

        return Inertia::render('Customer/InquiryForm', [
            'agentNotFound' => false,
            'agent' => [
                'id' => $agent->id, // FK
                'name' => $agent->name,
                'agent_id' => $agent->agent_id, // AGNT-1
                'designation' => $agent->designation ?: 'Airport Counter Agent',
                'email' => $agent->email,
            ],
            'initialChatId' => $chatRecord ? $chatRecord->id : null,
            'initialMessages' => $messages,
            'status' => $chatRecord ? $chatRecord->status : 'continuing',
        ]);
    }

    /**
     * Send a customer message from the WhatsApp UI.
     * Saves agent_id as a foreign key referencing users.id (not as string AGNT-1).
     */
    public function sendMessage(Request $request)
    {
        $validated = $request->validate([
            'agent_id' => 'required',
            'chat_id' => 'nullable|integer',
            'message' => 'required|string|max:5000',
        ]);

        $rawAgent = trim((string)$validated['agent_id']);

        // Look up agent to obtain the primary key (FK)
        $agent = User::where('agent_id', strtoupper($rawAgent))
            ->orWhere('id', is_numeric($rawAgent) ? (int)$rawAgent : 0)
            ->first();

        if (!$agent) {
            return response()->json(['success' => false, 'message' => 'Agent not found'], 404);
        }

        $chatId = !empty($validated['chat_id']) ? (int)$validated['chat_id'] : null;
        $text = trim($validated['message']);

        if (empty($text)) {
            return response()->json(['success' => false, 'message' => 'Message cannot be empty'], 422);
        }

        // Store with foreign key $agent->id (integer)
        $result = CustomerChatMessage::appendToChat(
            $agent->id, // FK referencing users.id
            'customer',
            $text,
            $chatId
        );

        // Store this customer's active chat id in session by agent FK
        $request->session()->put("customer_chat_{$agent->id}", $result['chat_id']);

        return response()->json([
            'success' => true,
            'chat_id' => $result['chat_id'],
            'agent_id' => $agent->id,
            'agent_code' => $agent->agent_id,
            'message' => $result['message'],
            'status' => $result['status'],
            'messages' => $result['messages'],
        ]);
    }

    /**
     * Poll latest chat messages for a specific chat ID.
     */
    public function getMessages(Request $request, string $agentIdentifier, ?int $chatId = null)
    {
        $clean = strtoupper(trim($agentIdentifier));
        $agent = User::where('agent_id', $clean)
            ->orWhere('id', is_numeric($clean) ? (int)$clean : 0)
            ->first();

        if (!$agent) {
            return response()->json(['success' => false, 'message' => 'Agent not found'], 404);
        }

        $resolvedChatId = $chatId ?: $request->query('chat_id') ?: $request->session()->get("customer_chat_{$agent->id}");

        if (!$resolvedChatId) {
            return response()->json([
                'success' => true,
                'agent_id' => $agent->id,
                'agent_code' => $agent->agent_id,
                'chat_id' => null,
                'status' => 'continuing',
                'messages' => [],
            ]);
        }

        $chat = CustomerChatMessage::where('id', (int)$resolvedChatId)
            ->where('agent_id', $agent->id)
            ->first();

        return response()->json([
            'success' => true,
            'agent_id' => $agent->id,
            'agent_code' => $agent->agent_id,
            'chat_id' => $chat ? $chat->id : null,
            'status' => $chat ? $chat->status : 'continuing',
            'messages' => $chat ? $chat->decoded_messages : [],
        ]);
    }
}
