import { Head } from '@inertiajs/react';
import { useState, useMemo, useEffect, useRef } from 'react';
import axios from 'axios';
import AppSidebarLayout from '@/Layouts/AppSidebarLayout';
import {
    ChatBubbleLeftRightIcon,
    MagnifyingGlassIcon,
    PhoneIcon,
    UserCircleIcon,
    ArrowPathIcon,
    TagIcon,
    ShieldCheckIcon,
    UserIcon,
    CalendarIcon,
    XMarkIcon,
    GlobeAltIcon,
    FunnelIcon,
} from '@heroicons/react/24/outline';

export default function Index({ chats: initialChats = [], agents = [], filters = {}, stats = {} }) {
    const [chats, setChats] = useState(initialChats);
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [agentFilter, setAgentFilter] = useState(filters.agent_id || 'all');
    const [dateFilter, setDateFilter] = useState(filters.date_filter || 'all'); // 'all', 'today', 'yesterday', 'this_month', 'custom'
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [selectedChatId, setSelectedChatId] = useState(
        filters.chat_id || (initialChats.length > 0 ? initialChats[0].id : null)
    );
    const [isRefreshing, setIsRefreshing] = useState(false);
    const messagesEndRef = useRef(null);

    // Sync state if initialChats changes
    useEffect(() => {
        setChats(initialChats);
        if (!selectedChatId && initialChats.length > 0) {
            setSelectedChatId(initialChats[0].id);
        }
    }, [initialChats]);

    // Active selected chat object
    const activeChat = useMemo(() => {
        return chats.find((c) => c.id === selectedChatId) || null;
    }, [chats, selectedChatId]);

    // Helper to check date matches
    const isDateMatch = (dateStr) => {
        if (!dateStr || dateFilter === 'all') return true;
        const itemDate = new Date(dateStr);
        if (isNaN(itemDate.getTime())) return true;

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        if (dateFilter === 'today') {
            return itemDate >= startOfToday && itemDate <= endOfToday;
        }

        if (dateFilter === 'yesterday') {
            const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
            const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
            return itemDate >= startOfYesterday && itemDate <= endOfYesterday;
        }

        if (dateFilter === 'this_month') {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            return itemDate >= startOfMonth && itemDate <= endOfMonth;
        }

        if (dateFilter === 'custom') {
            if (startDate) {
                const s = new Date(startDate);
                s.setHours(0, 0, 0, 0);
                if (itemDate < s) return false;
            }
            if (endDate) {
                const e = new Date(endDate);
                e.setHours(23, 59, 59, 999);
                if (itemDate > e) return false;
            }
            return true;
        }

        return true;
    };

    // Filtered chats list (applying status, agent, date range, search)
    const filteredChats = useMemo(() => {
        return chats.filter((c) => {
            // Status filter
            if (statusFilter !== 'all' && c.status !== statusFilter) {
                return false;
            }
            // Agent filter
            if (agentFilter !== 'all' && String(c.agent_id) !== String(agentFilter)) {
                return false;
            }
            // Date filter (based on chat created_at or updated_at)
            const chatDate = c.created_at || c.updated_at;
            if (!isDateMatch(chatDate)) {
                return false;
            }
            // Search query across customer name, phone, country, topic, agent name, message contents
            if (search.trim()) {
                const query = search.toLowerCase();
                const matchName = (c.customer_name || '').toLowerCase().includes(query);
                const matchPhone = (c.customer_phone || '').toLowerCase().includes(query);
                const matchCountry = (c.country || '').toLowerCase().includes(query);
                const matchTopic = (c.topic || '').toLowerCase().includes(query);
                const matchAgent = (c.agent?.name || '').toLowerCase().includes(query);
                const matchMessages = (c.messages || []).some((m) =>
                    (m.message || '').toLowerCase().includes(query)
                );
                return matchName || matchPhone || matchCountry || matchTopic || matchAgent || matchMessages;
            }
            return true;
        });
    }, [chats, statusFilter, agentFilter, dateFilter, startDate, endDate, search]);

    // Keep active chat in sync if current selected chat is filtered out
    useEffect(() => {
        if (filteredChats.length > 0) {
            const stillVisible = filteredChats.some((c) => c.id === selectedChatId);
            if (!stillVisible) {
                setSelectedChatId(filteredChats[0].id);
            }
        }
    }, [filteredChats, selectedChatId]);

    // Scroll chat to bottom when active chat changes
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [activeChat?.id, activeChat?.messages?.length]);

    // Background auto-polling active chat so incoming customer messages show up in real-time
    useEffect(() => {
        if (!selectedChatId) return;

        const interval = setInterval(async () => {
            try {
                const res = await axios.get(`/chats/${selectedChatId}/messages`);
                if (res.data?.chat) {
                    setChats((prev) =>
                        prev.map((c) => {
                            if (c.id === selectedChatId) {
                                return {
                                    ...c,
                                    ...res.data.chat,
                                    status: res.data.status || res.data.chat.status || c.status,
                                    messages: res.data.messages || [],
                                    messages_count: (res.data.messages || []).length,
                                };
                            }
                            return c;
                        })
                    );
                }
            } catch (err) {
                // Background poll failure silently handled
            }
        }, 3500);

        return () => clearInterval(interval);
    }, [selectedChatId]);

    // Manual refresh active chat messages from backend
    const refreshActiveChat = async (chatId) => {
        if (!chatId) return;
        setIsRefreshing(true);
        try {
            const res = await axios.get(`/chats/${chatId}/messages`);
            if (res.data?.chat) {
                setChats((prev) =>
                    prev.map((c) => {
                        if (c.id === chatId) {
                            return {
                                ...c,
                                ...res.data.chat,
                                status: res.data.status || res.data.chat.status || c.status,
                                messages: res.data.messages || [],
                                messages_count: (res.data.messages || []).length,
                            };
                        }
                        return c;
                    })
                );
            }
        } catch (error) {
            console.error('Failed to refresh messages', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    // Date/time formatters (handles ISO string and MySQL space-separated format)
    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        try {
            const raw = String(dateStr);
            const normalized = raw.includes('T') ? raw : raw.replace(' ', 'T');
            const d = new Date(normalized);
            if (isNaN(d.getTime())) return '';
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return '';
        }
    };

    const formatFullDateTime = (dateStr) => {
        if (!dateStr) return '';
        try {
            const raw = String(dateStr);
            const normalized = raw.includes('T') ? raw : raw.replace(' ', 'T');
            const d = new Date(normalized);
            if (isNaN(d.getTime())) return raw;
            return `${d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } catch {
            return String(dateStr);
        }
    };

    const clearFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setAgentFilter('all');
        setDateFilter('all');
        setStartDate('');
        setEndDate('');
    };

    const hasActiveFilters = search || statusFilter !== 'all' || agentFilter !== 'all' || dateFilter !== 'all';

    return (
        <AppSidebarLayout title="Customer Chats">
            <Head title="Customer Chats" />

            <div className="space-y-4">
                {/* 1. Header & Filter Toolbar Card */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-200 space-y-4">
                    {/* Top Row: Title & Stats */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-700">
                                <ChatBubbleLeftRightIcon className="w-7 h-7" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-black tracking-tight">
                                    Customer Chats
                                </h1>
                                <p className="text-sm font-semibold text-black mt-0.5">
                                    Airport customer inquiries and communications with assigned agents
                                </p>
                            </div>
                        </div>

                        {/* Top Statistics Badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-1.5 flex items-center gap-2">
                                <span className="text-xs font-bold text-black uppercase">Total:</span>
                                <span className="text-sm font-black text-black">{chats.length}</span>
                            </div>
                            <div className="bg-emerald-50 border border-emerald-300 rounded-xl px-3 py-1.5 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                                <span className="text-xs font-bold text-emerald-950 uppercase">Continuing:</span>
                                <span className="text-sm font-black text-emerald-950">
                                    {chats.filter((c) => c.status === 'continuing').length}
                                </span>
                            </div>
                            <div className="bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5 flex items-center gap-2">
                                <span className="text-xs font-bold text-black uppercase">Finished:</span>
                                <span className="text-sm font-black text-black">
                                    {chats.filter((c) => c.status === 'finished').length}
                                </span>
                            </div>
                            <div className="bg-blue-50 border border-blue-300 rounded-xl px-3 py-1.5 flex items-center gap-2">
                                <span className="text-xs font-bold text-blue-950 uppercase">Showing:</span>
                                <span className="text-sm font-black text-blue-950">{filteredChats.length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Filter Controls Row: Perfectly Aligned H-10 Controls */}
                    <div className="pt-3 border-t border-neutral-200 flex flex-wrap items-center gap-3">
                        {/* 1. Search Bar */}
                        <div className="relative flex-1 min-w-[240px]">
                            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-black" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search customer, phone, topic, message..."
                                className="w-full h-10 pl-10 pr-9 text-sm font-medium text-black placeholder:text-neutral-500 bg-neutral-50 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:text-neutral-700"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* 2. Status Filter */}
                        <div className="relative w-40 shrink-0">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full h-10 px-3 text-sm font-bold text-black bg-neutral-50 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all cursor-pointer"
                            >
                                <option value="all">Status: All</option>
                                <option value="continuing">🟢 Continuing</option>
                                <option value="finished">⚪ Finished</option>
                            </select>
                        </div>

                        {/* 3. Agent Filter */}
                        <div className="relative w-48 shrink-0">
                            <select
                                value={agentFilter}
                                onChange={(e) => setAgentFilter(e.target.value)}
                                className="w-full h-10 px-3 text-sm font-bold text-black bg-neutral-50 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all cursor-pointer"
                            >
                                <option value="all">Agent: All Agents</option>
                                {agents.map((ag) => (
                                    <option key={ag.id} value={ag.id}>
                                        Agent: {ag.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 4. Date Filter Select */}
                        <div className="relative w-44 shrink-0">
                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-full h-10 px-3 text-sm font-bold text-black bg-neutral-50 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all cursor-pointer"
                            >
                                <option value="all">Date: All Time</option>
                                <option value="today">📅 Today</option>
                                <option value="yesterday">📅 Yesterday</option>
                                <option value="this_month">📅 This Month</option>
                                <option value="custom">🗓️ Custom Range</option>
                            </select>
                        </div>

                        {/* 5. Custom Date Pickers (Inline when Custom is selected) */}
                        {dateFilter === 'custom' && (
                            <div className="flex items-center gap-2 bg-blue-50/80 px-3 h-10 rounded-xl border border-blue-200">
                                <span className="text-xs font-bold text-black">From:</span>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="h-7 px-2 text-xs font-bold text-black bg-white border border-neutral-300 rounded outline-none focus:ring-1 focus:ring-blue-600"
                                />
                                <span className="text-xs font-bold text-black">To:</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="h-7 px-2 text-xs font-bold text-black bg-white border border-neutral-300 rounded outline-none focus:ring-1 focus:ring-blue-600"
                                />
                            </div>
                        )}

                        {/* 6. Reset Filters Button */}
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="h-10 px-3 rounded-xl text-xs font-black text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-all flex items-center gap-1.5 shrink-0"
                            >
                                <XMarkIcon className="w-4 h-4" />
                                <span>Reset Filters</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* 2. Main 2-Column Chat Split Layout (Full Alignment) */}
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden flex flex-col lg:flex-row h-[720px]">
                    {/* Left Column: Chat Conversation List */}
                    <div className="w-full lg:w-96 xl:w-[420px] shrink-0 border-r border-neutral-200 flex flex-col h-full bg-neutral-50/50">
                        {/* Left Column Header (Exact h-16 alignment with right column header) */}
                        <div className="h-16 px-4 border-b border-neutral-200 bg-white flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-black">Inquiries & Chats</span>
                                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-neutral-100 text-black border border-neutral-300">
                                    {filteredChats.length}
                                </span>
                            </div>
                            <span className="text-xs font-bold text-neutral-700">
                                {statusFilter === 'all' ? 'All Statuses' : statusFilter === 'continuing' ? 'Active' : 'Finished'}
                            </span>
                        </div>

                        {/* Chat List Scroll Area */}
                        <div className="flex-1 overflow-y-auto divide-y divide-neutral-200">
                            {filteredChats.length === 0 ? (
                                <div className="p-8 text-center">
                                    <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto text-neutral-400 stroke-1" />
                                    <p className="mt-3 text-sm font-bold text-black">No chats match filters</p>
                                    <p className="mt-1 text-xs text-neutral-700 font-semibold">
                                        Try adjusting your search query, agent, or date filter.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="mt-3 inline-block text-xs font-black text-blue-700 hover:underline"
                                    >
                                        Reset All Filters
                                    </button>
                                </div>
                            ) : (
                                filteredChats.map((chat) => {
                                    const isSelected = chat.id === selectedChatId;
                                    const latestMsg =
                                        chat.latest_message ||
                                        (chat.messages && chat.messages[chat.messages.length - 1]);
                                    const isContinuing = chat.status === 'continuing';

                                    return (
                                        <button
                                            key={chat.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedChatId(chat.id);
                                                refreshActiveChat(chat.id);
                                            }}
                                            className={`w-full text-left p-4 transition-all relative flex flex-col gap-2 ${
                                                isSelected
                                                    ? 'bg-blue-50/90 border-l-4 border-l-blue-600'
                                                    : 'hover:bg-neutral-100/70 border-l-4 border-l-transparent'
                                            }`}
                                        >
                                            {/* Item Top: Flag + Name + Time + Status */}
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <span className="text-xl shrink-0" title={chat.country}>
                                                        {chat.country_flag || '🌐'}
                                                    </span>
                                                    <div className="truncate">
                                                        <h3 className="text-sm font-black text-black truncate leading-tight">
                                                            {chat.customer_name}
                                                        </h3>
                                                        <span className="text-xs font-bold text-neutral-900">
                                                            {chat.country}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end shrink-0 gap-1">
                                                    <span className="text-[11px] font-bold text-neutral-800">
                                                        {formatTime(chat.updated_at || chat.created_at)}
                                                    </span>
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                            isContinuing
                                                                ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                                                                : 'bg-slate-200 text-slate-900 border border-slate-300'
                                                        }`}
                                                    >
                                                        {isContinuing && (
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                                                        )}
                                                        {chat.status}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Topic pill */}
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-black">
                                                <TagIcon className="w-3.5 h-3.5 text-neutral-700 shrink-0" />
                                                <span className="truncate">{chat.topic || 'General Airport Inquiry'}</span>
                                            </div>

                                            {/* Last message preview */}
                                            <p className="text-xs font-medium text-black line-clamp-1 italic">
                                                {latestMsg ? (
                                                    <span>
                                                        <strong className="text-black font-bold">
                                                            {latestMsg.sender === 'agent' ? 'Agent: ' : 'Customer: '}
                                                        </strong>
                                                        {latestMsg.message}
                                                    </span>
                                                ) : (
                                                    'No messages logged'
                                                )}
                                            </p>

                                            {/* Item Footer: Agent name & message count */}
                                            <div className="flex items-center justify-between text-[11px] font-bold text-neutral-800 pt-1 border-t border-neutral-200/60 mt-0.5">
                                                <div className="flex items-center gap-1 truncate text-black font-bold">
                                                    <UserCircleIcon className="w-3.5 h-3.5 text-neutral-800 shrink-0" />
                                                    <span className="truncate">
                                                        Agent: {chat.agent?.name || `Agent #${chat.agent_id}`}
                                                    </span>
                                                </div>
                                                <span className="bg-neutral-200 text-black px-1.5 py-0.5 rounded text-[10px] font-black">
                                                    {chat.messages_count ?? chat.messages?.length ?? 0} msgs
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Right Column: Full Chat View (Read-Only Conversation View) */}
                    <div className="flex-1 flex flex-col h-full bg-white min-w-0">
                        {activeChat ? (
                            <>
                                {/* Right Column Header (Exact h-16 alignment with left column header) */}
                                <div className="h-16 px-5 border-b border-neutral-200 bg-white flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-xl shrink-0">
                                            {activeChat.country_flag || '🌐'}
                                        </div>
                                        <div className="truncate">
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-base font-black text-black truncate leading-tight">
                                                    {activeChat.customer_name}
                                                </h2>
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider shrink-0 ${
                                                        activeChat.status === 'continuing'
                                                            ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                                                            : 'bg-slate-200 text-slate-900 border border-slate-300'
                                                    }`}
                                                >
                                                    {activeChat.status === 'continuing' && (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                                                    )}
                                                    {activeChat.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-neutral-800 truncate mt-0.5">
                                                <span>{activeChat.country}</span>
                                                {activeChat.customer_phone && (
                                                    <>
                                                        <span className="text-neutral-400">•</span>
                                                        <span className="flex items-center gap-1 text-black">
                                                            <PhoneIcon className="w-3 h-3 text-neutral-700" />
                                                            {activeChat.country_code ? `(${activeChat.country_code}) ` : ''}
                                                            {activeChat.customer_phone}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action button (Refresh conversation only) */}
                                    <div className="flex items-center gap-2 shrink-0 ml-3">
                                        <button
                                            type="button"
                                            onClick={() => refreshActiveChat(activeChat.id)}
                                            disabled={isRefreshing}
                                            title="Refresh conversation"
                                            className="p-2 text-black hover:bg-neutral-100 border border-neutral-300 rounded-xl transition-all"
                                        >
                                            <ArrowPathIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
                                        </button>
                                    </div>
                                </div>

                                {/* Agent assignment & Topic info sub-bar */}
                                <div className="h-10 px-5 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs text-black font-semibold shrink-0">
                                    <div className="flex items-center gap-2 truncate">
                                        <ShieldCheckIcon className="w-4 h-4 text-blue-700 shrink-0" />
                                        <span className="truncate">
                                            Assigned Agent: <strong className="text-black font-black">{activeChat.agent?.name || `Agent #${activeChat.agent_id}`}</strong>
                                            {activeChat.agent?.email && ` (${activeChat.agent.email})`}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0 text-[11px] font-bold text-neutral-800">
                                        <span className="text-blue-950 font-black bg-blue-100/80 px-2 py-0.5 rounded">
                                            {activeChat.topic || 'General Airport Inquiry'}
                                        </span>
                                        <span>Started {formatFullDateTime(activeChat.created_at)}</span>
                                    </div>
                                </div>

                                {/* Message Stream (Full History View) */}
                                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-neutral-100/40">
                                    {(!activeChat.messages || activeChat.messages.length === 0) ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                                                <ChatBubbleLeftRightIcon className="w-8 h-8" />
                                            </div>
                                            <h4 className="text-base font-black text-black">No Messages in this Chat</h4>
                                            <p className="text-xs font-semibold text-neutral-800 mt-1 max-w-sm">
                                                This inquiry is registered in the database, but contains no chat messages.
                                            </p>
                                        </div>
                                    ) : (
                                        activeChat.messages.map((msg, index) => {
                                            const isAgent = msg.sender === 'agent';
                                            return (
                                                <div
                                                    key={msg.id || index}
                                                    className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}
                                                >
                                                    {/* Sender header */}
                                                    <div className="flex items-center gap-1.5 mb-1 px-1">
                                                        {isAgent ? (
                                                            <>
                                                                <span className="text-[11px] font-bold text-neutral-700">
                                                                    {formatFullDateTime(msg.created_at)}
                                                                </span>
                                                                <span className="text-xs font-black text-blue-900">
                                                                    {msg.sender_name || 'Agent'}
                                                                </span>
                                                                <span className="p-0.5 rounded-full bg-blue-100 text-blue-800">
                                                                    <ShieldCheckIcon className="w-3.5 h-3.5" />
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="p-0.5 rounded-full bg-neutral-200 text-neutral-900">
                                                                    <UserIcon className="w-3.5 h-3.5" />
                                                                </span>
                                                                <span className="text-xs font-black text-black">
                                                                    {msg.sender_name || activeChat.customer_name}
                                                                </span>
                                                                <span className="text-[11px] font-bold text-neutral-700">
                                                                    {formatFullDateTime(msg.created_at)}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>

                                                    {/* Message bubble */}
                                                    <div
                                                        className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 shadow-sm text-sm leading-relaxed ${
                                                            isAgent
                                                                ? 'bg-[#0f1d45] text-white rounded-tr-none font-medium'
                                                                : 'bg-white text-black border border-neutral-300 rounded-tl-none font-semibold'
                                                        }`}
                                                    >
                                                        <p className="whitespace-pre-wrap break-words">
                                                            {msg.message}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Read-Only Transcript Viewer Footer */}
                                <div className="h-12 px-5 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs font-medium text-neutral-600 shrink-0">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2.5 h-2.5 rounded-full ${activeChat.status === 'continuing' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                                        <span className="font-bold text-neutral-800">
                                            Read-Only Transcript Viewer
                                        </span>
                                        <span className="text-neutral-300">|</span>
                                        <span className="text-neutral-500">Customer & Support Desk Conversation History</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Status:</span>
                                        <span
                                            className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                                                activeChat.status === 'continuing'
                                                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                                                    : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                            }`}
                                        >
                                            {activeChat.status === 'continuing' ? 'Continuing' : 'Finished'}
                                        </span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                                <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
                                    <ChatBubbleLeftRightIcon className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-black text-black">Select a Chat to View</h3>
                                <p className="text-sm font-semibold text-neutral-800 mt-2 max-w-md">
                                    Choose an inquiry from the list on the left to read the full conversation transcript between customer and agent.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
