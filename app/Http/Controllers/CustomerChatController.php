<?php

namespace App\Http\Controllers;

use App\Models\CustomerChatMessage;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerChatController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->query('status', 'all');
        $search = $request->query('search');
        $agentFilter = $request->query('agent_id', 'all');
        $selectedId = $request->query('chat_id');

        // Query existing chat records from customer_chat_messages
        $query = CustomerChatMessage::query()->with('agent');

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($agentFilter && $agentFilter !== 'all') {
            $query->where('agent_id', $agentFilter);
        }

        $records = $query->orderBy('updated_at', 'desc')->get();

        $chats = $records->map(function ($rec) {
            $decoded = $rec->decoded_messages;
            $lastMsg = !empty($decoded) ? end($decoded) : null;
            $agent = $rec->agent;

            return [
                'id' => $rec->id,
                'agent_id' => $rec->agent_id,
                'customer_name' => 'Chat #' . $rec->id . ' (' . $rec->agent_id . ')',
                'customer_phone' => null,
                'country' => 'Counter Desk',
                'country_code' => 'LK',
                'country_flag' => '🇱🇰',
                'topic' => 'Inquiry - ' . $rec->agent_id,
                'status' => $rec->status, // 'continuing' or 'finished'
                'agent' => [
                    'id' => $agent ? $agent->id : null,
                    'name' => $agent ? $agent->name : $rec->agent_id,
                    'email' => $agent ? $agent->email : null,
                    'agent_id' => $rec->agent_id,
                ],
                'messages' => $decoded,
                'messages_count' => count($decoded),
                'last_message' => $lastMsg ? $lastMsg['message'] : 'No messages yet',
                'created_at' => $rec->created_at ? $rec->created_at->toISOString() : null,
                'updated_at' => $rec->updated_at ? $rec->updated_at->toISOString() : null,
            ];
        });

        if ($search) {
            $chats = $chats->filter(function ($c) use ($search) {
                $q = strtolower($search);
                return str_contains(strtolower($c['customer_name']), $q)
                    || str_contains(strtolower($c['agent_id']), $q)
                    || collect($c['messages'])->contains(fn($m) => str_contains(strtolower($m['message'] ?? ''), $q));
            })->values();
        }

        $agents = User::whereNotNull('agent_id')
            ->orderBy('agent_id')
            ->get(['id', 'name', 'email', 'agent_id']);

        $totalMessages = 0;
        foreach ($records as $rec) {
            $totalMessages += count($rec->decoded_messages);
        }

        $stats = [
            'total' => CustomerChatMessage::count(),
            'continuing' => CustomerChatMessage::where('status', 'continuing')->count(),
            'finished' => CustomerChatMessage::where('status', 'finished')->count(),
            'totalMessages' => $totalMessages,
        ];

        return Inertia::render('Chats/Index', [
            'chats' => $chats,
            'agents' => $agents,
            'filters' => [
                'status' => $status,
                'search' => $search,
                'agent_id' => $agentFilter,
                'chat_id' => $selectedId ? (int)$selectedId : null,
            ],
            'stats' => $stats,
        ]);
    }

    public function messages($chatId)
    {
        $chat = CustomerChatMessage::with('agent')->find($chatId);

        if (!$chat) {
            // Also check by agent_id
            $chat = CustomerChatMessage::with('agent')
                ->where('agent_id', $chatId)
                ->latest('id')
                ->first();
        }

        if (!$chat) {
            return response()->json(['error' => 'Chat record not found'], 404);
        }

        $agent = $chat->agent;
        $chatData = [
            'id' => $chat->id,
            'agent_id' => $chat->agent_id,
            'customer_name' => 'Chat #' . $chat->id . ' (' . $chat->agent_id . ')',
            'topic' => 'Inquiry - ' . $chat->agent_id,
            'status' => $chat->status,
            'agent' => [
                'id' => $agent ? $agent->id : null,
                'name' => $agent ? $agent->name : $chat->agent_id,
                'email' => $agent ? $agent->email : null,
                'agent_id' => $chat->agent_id,
            ],
            'messages' => $chat->decoded_messages,
        ];

        return response()->json([
            'chat' => $chatData,
            'messages' => $chat->decoded_messages,
            'status' => $chat->status,
        ]);
    }

    public function storeMessage(Request $request, $chatId)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:5000',
        ]);

        $chat = CustomerChatMessage::with('agent')->find($chatId);
        if (!$chat) {
            $chat = CustomerChatMessage::with('agent')
                ->where('agent_id', $chatId)
                ->where('status', 'continuing')
                ->latest('id')
                ->first();
        }

        if (!$chat) {
            return response()->json(['error' => 'Chat record not found'], 404);
        }

        $newMessage = CustomerChatMessage::appendMessage(
            $chat->agent_id,
            'agent',
            $validated['message'],
            $chat->id
        );

        $chat->refresh();

        $agent = $chat->agent;
        $chatData = [
            'id' => $chat->id,
            'agent_id' => $chat->agent_id,
            'customer_name' => 'Chat #' . $chat->id . ' (' . ($agent?->agent_id ?? 'Agent') . ')',
            'topic' => 'Inquiry - ' . ($agent?->agent_id ?? 'Counter Desk'),
            'status' => $chat->status,
            'agent' => [
                'id' => $agent ? $agent->id : null,
                'name' => $agent ? $agent->name : 'Agent',
                'email' => $agent ? $agent->email : null,
                'agent_id' => $agent?->agent_id,
            ],
            'messages' => $chat->decoded_messages,
        ];

        return response()->json([
            'success' => true,
            'message' => $newMessage,
            'messages' => $chat->decoded_messages,
            'chat' => $chatData,
        ]);
    }

    public function updateStatus(Request $request, $chatId)
    {
        $validated = $request->validate([
            'status' => 'required|in:continuing,finished',
        ]);

        $chat = CustomerChatMessage::find($chatId);
        if (!$chat) {
            $chat = CustomerChatMessage::where('agent_id', $chatId)
                ->where('status', 'continuing')
                ->latest('id')
                ->first();
        }

        if ($chat) {
            $chat->update(['status' => $validated['status']]);
        }

        return response()->json([
            'success' => true,
            'chat' => $chat,
        ]);
    }
}
