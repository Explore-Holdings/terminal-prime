<?php

namespace App\Http\Controllers;

use App\Models\CustomerChat;
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
        $agentId = $request->query('agent_id', 'all');
        $dateFilter = $request->query('date_filter', 'all');
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        $selectedId = $request->query('chat_id');

        $query = CustomerChat::query()
            ->with(['agent:id,name,email', 'messageRecord']);

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($agentId && $agentId !== 'all') {
            $query->where('agent_id', $agentId);
        }

        if ($dateFilter === 'today') {
            $query->whereDate('created_at', today());
        } elseif ($dateFilter === 'yesterday') {
            $query->whereDate('created_at', today()->subDay());
        } elseif ($dateFilter === 'this_month') {
            $query->whereMonth('created_at', now()->month)
                  ->whereYear('created_at', now()->year);
        } elseif ($dateFilter === 'custom' && $startDate && $endDate) {
            $query->whereDate('created_at', '>=', $startDate)
                  ->whereDate('created_at', '<=', $endDate);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%")
                  ->orWhere('country', 'like', "%{$search}%")
                  ->orWhere('topic', 'like', "%{$search}%")
                  ->orWhereHas('agent', function ($agentQuery) use ($search) {
                      $agentQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $chats = $query->orderBy('updated_at', 'desc')->get();

        // Agents list for filter dropdown
        $agents = User::whereHas('role', function ($q) {
            $q->where('name', 'agent');
        })->orWhereIn('id', CustomerChat::distinct()->pluck('agent_id'))
          ->orderBy('name')
          ->get(['id', 'name', 'email']);

        // Stats summary - count total individual messages across JSON message records
        $totalMessages = 0;
        foreach (CustomerChatMessage::select('message')->cursor() as $rec) {
            $totalMessages += count($rec->decoded_messages);
        }

        $stats = [
            'total' => CustomerChat::count(),
            'continuing' => CustomerChat::where('status', 'continuing')->count(),
            'finished' => CustomerChat::where('status', 'finished')->count(),
            'totalMessages' => $totalMessages,
        ];

        return Inertia::render('Chats/Index', [
            'chats' => $chats,
            'agents' => $agents,
            'filters' => [
                'status' => $status,
                'search' => $search,
                'agent_id' => $agentId,
                'date_filter' => $dateFilter,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'chat_id' => $selectedId ? (int)$selectedId : null,
            ],
            'stats' => $stats,
        ]);
    }

    public function messages(CustomerChat $chat)
    {
        return response()->json([
            'chat' => $chat->load('agent:id,name,email', 'messageRecord'),
            'messages' => $chat->messages,
        ]);
    }

    public function storeMessage(Request $request, CustomerChat $chat)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:5000',
        ]);

        $user = $request->user();
        $senderName = $user ? $user->name : 'Agent';

        $message = CustomerChatMessage::appendMessage(
            $chat->id,
            'agent',
            $senderName,
            $validated['message']
        );

        $chat->touch(); // updates updated_at

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => $message,
            ]);
        }

        return redirect()->back()->with('success', 'Message sent successfully.');
    }

    public function updateStatus(Request $request, CustomerChat $chat)
    {
        $validated = $request->validate([
            'status' => 'required|in:continuing,finished',
        ]);

        $chat->update([
            'status' => $validated['status'],
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'chat' => $chat,
            ]);
        }

        return redirect()->back()->with('success', 'Chat status updated.');
    }
}
