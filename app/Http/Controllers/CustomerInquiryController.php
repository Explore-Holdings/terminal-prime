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
     * No invoice numbers required - directly displays WhatsApp UI.
     * Isolates chats so another customer visiting will not see old chats from other customers.
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

        // Fallback: check if numeric user id was passed
        if (!$agent && is_numeric($cleanAgentId)) {
            $agent = User::where('id', (int)$cleanAgentId)->whereNotNull('agent_id')->first();
        }

        // Fallback: get first available agent
        if (!$agent) {
            $agent = User::whereNotNull('agent_id')->orderBy('agent_id')->first();
        }

        if (!$agent) {
            abort(404, 'No counter agent found.');
        }

        $assignedAgentId = $agent->agent_id;

        // Check if this specific customer already has an active ongoing chat ID in this session/query
        $activeChatId = $request->query('chat_id') ?: $request->session()->get("customer_chat_{$assignedAgentId}");

        $chatRecord = null;
        if ($activeChatId) {
            $chatRecord = CustomerChatMessage::where('id', (int)$activeChatId)
                ->where('agent_id', $assignedAgentId)
                ->first();
        }

        $messages = $chatRecord ? $chatRecord->decoded_messages : [];

        return Inertia::render('Customer/InquiryForm', [
            'agent' => [
                'id' => $agent->id,
                'name' => $agent->name,
                'agent_id' => $agent->agent_id,
                'designation' => $agent->designation ?: 'Airport Counter Agent',
                'email' => $agent->email,
            ],
            'initialChatId' => $chatRecord ? $chatRecord->id : null,
            'initialMessages' => $messages,
            'status' => $chatRecord ? $chatRecord->status : 'ongoing',
        ]);
    }

    /**
     * Send a customer message from the WhatsApp UI.
     * If chat_id is provided, appends to that specific customer's chat.
     * If no chat_id or chat was finished, creates a new chat record in customer_chat_messages.
     */
    public function sendMessage(Request $request)
    {
        $validated = $request->validate([
            'agent_id' => 'required|string|max:50',
            'chat_id' => 'nullable|integer',
            'message' => 'required|string|max:5000',
        ]);

        $agentId = strtoupper(trim($validated['agent_id']));
        $chatId = !empty($validated['chat_id']) ? (int)$validated['chat_id'] : null;
        $text = trim($validated['message']);

        if (empty($text)) {
            return response()->json(['success' => false, 'message' => 'Message cannot be empty'], 422);
        }

        $result = CustomerChatMessage::appendToChat(
            $agentId,
            'customer',
            $text,
            $chatId
        );

        // Store this customer's active chat id in their session
        $request->session()->put("customer_chat_{$agentId}", $result['chat_id']);

        return response()->json([
            'success' => true,
            'chat_id' => $result['chat_id'],
            'message' => $result['message'],
            'status' => $result['status'],
            'messages' => $result['messages'],
        ]);
    }

    /**
     * Poll latest chat messages for a specific chat ID.
     * Ensures each customer only receives updates for their own chat session.
     */
    public function getMessages(Request $request, string $agentId, ?int $chatId = null)
    {
        $cleanId = strtoupper(trim($agentId));
        $resolvedChatId = $chatId ?: $request->query('chat_id') ?: $request->session()->get("customer_chat_{$cleanId}");

        if (!$resolvedChatId) {
            return response()->json([
                'success' => true,
                'agent_id' => $cleanId,
                'chat_id' => null,
                'status' => 'ongoing',
                'messages' => [],
            ]);
        }

        $chat = CustomerChatMessage::where('id', (int)$resolvedChatId)
            ->where('agent_id', $cleanId)
            ->first();

        return response()->json([
            'success' => true,
            'agent_id' => $cleanId,
            'chat_id' => $chat ? $chat->id : null,
            'status' => $chat ? $chat->status : 'ongoing',
            'messages' => $chat ? $chat->decoded_messages : [],
        ]);
    }
}
