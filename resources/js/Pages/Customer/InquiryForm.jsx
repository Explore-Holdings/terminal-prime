import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import {
    Send,
    CheckCheck,
    Building2,
    Sparkles,
    PlusCircle,
    RotateCcw,
} from 'lucide-react';

export default function InquiryForm({ agent = {}, initialMessages = [], initialChatId = null, status = 'ongoing' }) {
    const agentId = agent?.agent_id || 'AGNT-1';
    const agentName = agent?.name || 'Counter Agent';

    // Per-customer chat ID: each customer has their own chat ID stored in localStorage & session
    const [chatId, setChatId] = useState(() => {
        if (initialChatId) return initialChatId;
        try {
            const stored = localStorage.getItem(`customer_chat_${agentId}`);
            return stored ? parseInt(stored, 10) : null;
        } catch {
            return null;
        }
    });

    const [messages, setMessages] = useState(initialMessages || []);
    const [messageText, setMessageText] = useState('');
    const [chatStatus, setChatStatus] = useState(status || 'ongoing');
    const [isSending, setIsSending] = useState(false);

    const messagesEndRef = useRef(null);
    const pollTimerRef = useRef(null);

    // Auto-scroll chat to bottom
    const scrollToBottom = (behavior = 'smooth') => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior });
        }
    };

    useEffect(() => {
        scrollToBottom('auto');
    }, [messages]);

    // On initial mount: if customer has a stored chatId from earlier, load their ongoing messages
    useEffect(() => {
        if (chatId && (!initialMessages || initialMessages.length === 0)) {
            axios.get(`/customer-portal/messages/${agentId}?chat_id=${chatId}`)
                .then((res) => {
                    if (res.data?.success && Array.isArray(res.data.messages) && res.data.messages.length > 0) {
                        setMessages(res.data.messages);
                        if (res.data.status) setChatStatus(res.data.status);
                    }
                })
                .catch(() => {});
        }
    }, [chatId, agentId]);

    // Polling for incoming agent replies for this specific customer's chat session
    useEffect(() => {
        if (!agentId || !chatId) return;

        pollTimerRef.current = setInterval(async () => {
            try {
                const res = await axios.get(`/customer-portal/messages/${agentId}?chat_id=${chatId}`);
                if (res.data?.success && Array.isArray(res.data.messages)) {
                    setMessages(res.data.messages);
                    if (res.data.status) {
                        setChatStatus(res.data.status);
                    }
                }
            } catch (err) {
                // Background polling handled silently
            }
        }, 3500);

        return () => {
            if (pollTimerRef.current) {
                clearInterval(pollTimerRef.current);
                pollTimerRef.current = null;
            }
        };
    }, [agentId, chatId]);

    // Start a fresh new chat session
    const handleStartNewChat = () => {
        if (pollTimerRef.current) {
            clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
        }
        try {
            localStorage.removeItem(`customer_chat_${agentId}`);
        } catch {}
        setChatId(null);
        setMessages([]);
        setChatStatus('ongoing');
        setMessageText('');
    };

    // Send Customer Message
    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        const text = messageText.trim();
        if (!text || isSending) return;

        setIsSending(true);

        // Optimistically add customer message for instantaneous WhatsApp feel
        const tempMsg = {
            id: 'temp-' + Date.now(),
            sender: 'customer',
            message: text,
            created_at: new Date().toISOString(),
            isPending: true,
        };
        setMessages((prev) => [...prev, tempMsg]);
        setMessageText('');

        try {
            const res = await axios.post('/customer-portal/send-message', {
                agent_id: agentId,
                chat_id: chatId,
                message: text,
            });

            if (res.data?.success) {
                if (res.data.chat_id) {
                    setChatId(res.data.chat_id);
                    try {
                        localStorage.setItem(`customer_chat_${agentId}`, res.data.chat_id);
                    } catch {}
                }
                if (res.data.status) {
                    setChatStatus(res.data.status);
                }
                if (Array.isArray(res.data.messages)) {
                    setMessages(res.data.messages);
                } else if (res.data.message) {
                    setMessages((prev) =>
                        prev.map((m) => (m.id === tempMsg.id ? res.data.message : m))
                    );
                }
            }
        } catch (err) {
            console.error('Failed to send message:', err);
            // Revert optimistic message on failure
            setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
            alert('Failed to send message. Please check your internet connection and try again.');
        } finally {
            setIsSending(false);
        }
    };

    // Handle Quick Suggestion Chip Click
    const handleQuickPrompt = (promptText) => {
        setMessageText(promptText);
    };

    // Format timestamp nicely for WhatsApp style (e.g. 10:45 AM)
    const formatTime = (isoString) => {
        if (!isoString) return '';
        try {
            const raw = String(isoString);
            const normalized = raw.includes('T') ? raw : raw.replace(' ', 'T');
            const date = new Date(normalized);
            if (isNaN(date.getTime())) return '';
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return '';
        }
    };

    return (
        <div
            className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center p-2 sm:p-4 font-sans selection:bg-[#00853f] selection:text-white relative"
            style={{
                backgroundImage: "url('/assets/images/inquiry-bg.jpg')",
            }}
        >
            <Head title={`WhatsApp Chat - ${agentName} (${agentId})`} />

            {/* MAIN CONTENT CONTAINER */}
            <div className="relative z-10 w-full max-w-2xl my-auto">
                {/* ─── WHATSAPP UI CHAT CONTAINER ─── */}
                <div className="bg-[#efeae2] rounded-3xl shadow-2xl border border-white/60 overflow-hidden flex flex-col transition-all duration-300 relative h-[600px] sm:h-[660px]">

                    {/* 1. WHATSAPP HEADER */}
                    <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between shadow-md z-10">
                        <div className="flex items-center gap-3">
                            {/* Counter Avatar with online pulse */}
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-inner overflow-hidden border-2 border-white/80">
                                    <Building2 className="w-5 h-5 text-[#00853f]" />
                                </div>
                                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#075E54] ${chatStatus === 'finished' ? 'bg-neutral-400' : 'bg-[#25D366]'}`} />
                            </div>

                            {/* Agent Title & Status */}
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-sm sm:text-base font-bold tracking-tight text-white leading-tight">
                                        {agentName}
                                    </h2>
                                    <span className="text-[10px] bg-white/20 text-emerald-100 px-1.5 py-0.5 rounded font-mono font-bold tracking-wider">
                                        {agentId}
                                    </span>
                                </div>
                                <p className="text-[11px] text-emerald-100/90 flex items-center gap-1 font-medium mt-0.5">
                                    <span className={`w-1.5 h-1.5 rounded-full inline-block ${chatStatus === 'finished' ? 'bg-neutral-300' : 'bg-[#25D366] animate-ping'}`} />
                                    <span>{chatStatus === 'finished' ? 'Finished' : 'Online • Replying in minutes'}</span>
                                </p>
                            </div>
                        </div>

                        {/* Right Brand Badge & New Chat Option */}
                        <div className="flex items-center gap-2">
                            {chatId && (
                                <button
                                    type="button"
                                    onClick={handleStartNewChat}
                                    title="Start a new chat inquiry"
                                    className="text-[10px] bg-white/15 hover:bg-white/25 active:scale-95 text-emerald-100 font-semibold px-2 py-1 rounded-lg border border-white/20 flex items-center gap-1 transition-all cursor-pointer"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>New Chat</span>
                                </button>
                            )}

                            <div className="text-right flex flex-col items-end">
                                <div className="bg-white px-2.5 py-1 rounded-xl shadow-sm border border-white/80 flex items-center gap-1.5">
                                    <img
                                        src="/assets/images/logo-europcar.png"
                                        alt="Europcar"
                                        className="h-3.5 sm:h-4 w-auto object-contain block"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                    <span className="text-[10px] font-black text-[#00853f] tracking-wider uppercase">
                                        Counter
                                    </span>
                                </div>
                                <span className="text-[9px] text-emerald-200/90 mt-0.5 block font-medium">
                                    Terminal 1 Desk
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 2. CHAT MESSAGES BODY (WhatsApp wallpaper pattern) */}
                    <div
                        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 relative"
                        style={{
                            backgroundImage: `radial-gradient(#c9c3b8 0.75px, transparent 0.75px), radial-gradient(#c9c3b8 0.75px, #efeae2 0.75px)`,
                            backgroundSize: '30px 30px',
                            backgroundPosition: '0 0, 15px 15px',
                        }}
                    >
                        {/* Date pill */}
                        <div className="flex justify-center my-1">
                            <span className="bg-white/90 backdrop-blur-xs text-neutral-600 font-semibold text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs border border-neutral-200">
                                Today
                            </span>
                        </div>

                        {/* Default Welcome Bubble from Agent */}
                        <div className="flex justify-start animate-fadeIn">
                            <div className="bg-white text-neutral-800 rounded-2xl rounded-tl-xs px-3.5 py-2.5 max-w-[85%] sm:max-w-[75%] shadow-sm border border-neutral-200/70 text-xs sm:text-sm space-y-1">
                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#075E54]">
                                    <span>{agentName}</span>
                                    <span className="text-[10px] text-neutral-400 font-normal">• {agentId}</span>
                                </div>
                                <p className="leading-relaxed">
                                    Hello, how can I assist you today?
                                </p>
                                <div className="flex justify-end pt-0.5">
                                    <span className="text-[10px] text-neutral-400">{agentName}</span>
                                </div>
                            </div>
                        </div>

                        {/* Render Actual Chat Messages for this session */}
                        {messages.map((msg, idx) => {
                            const isCustomer = msg.sender === 'customer';
                            return (
                                <div
                                    key={msg.id || idx}
                                    className={`flex ${isCustomer ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                                >
                                    <div
                                        className={`rounded-2xl px-3.5 py-2 max-w-[85%] sm:max-w-[75%] shadow-sm text-xs sm:text-sm relative leading-relaxed ${
                                            isCustomer
                                                ? 'bg-[#d9fdd3] text-neutral-900 rounded-tr-xs border border-[#c2f3b8]'
                                                : 'bg-white text-neutral-800 rounded-tl-xs border border-neutral-200/70'
                                        }`}
                                    >
                                        {!isCustomer && (
                                            <div className="text-[11px] font-bold text-[#075E54] mb-0.5">
                                                {agentName}
                                            </div>
                                        )}

                                        <p className="whitespace-pre-wrap break-words">{msg.message}</p>

                                        <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-neutral-500">
                                            <span>{formatTime(msg.created_at)}</span>
                                            {isCustomer && (
                                                <CheckCheck className={`w-3.5 h-3.5 ${msg.isPending ? 'text-neutral-400' : 'text-[#53bdeb]'}`} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Finished Status Banner */}
                        {chatStatus === 'finished' && (
                            <div className="flex justify-center my-2 animate-fadeIn">
                                <div className="bg-neutral-100 border border-neutral-300 text-neutral-600 text-xs px-3.5 py-2 rounded-xl text-center shadow-xs">
                                    <p className="font-semibold text-neutral-700">This chat has been marked as finished.</p>
                                    <button
                                        type="button"
                                        onClick={handleStartNewChat}
                                        className="mt-1 text-[#00853f] hover:underline font-bold text-[11px] flex items-center justify-center gap-1 mx-auto cursor-pointer"
                                    >
                                        <PlusCircle className="w-3.5 h-3.5" />
                                        <span>Click here to start a new chat</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* 3. BOTTOM SECTION: QUICK CHIPS & INPUT BAR OR FINISHED NOTICE */}
                    {chatStatus === 'finished' ? (
                        <div className="bg-[#f0f2f5] px-4 py-3 border-t border-neutral-200 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="w-2.5 h-2.5 rounded-full bg-neutral-400 shrink-0" />
                                <span className="text-xs text-neutral-600 font-medium truncate">
                                    This chat is finished.
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleStartNewChat}
                                className="px-4 py-2 bg-[#00853f] hover:bg-[#007035] active:scale-95 text-white font-bold text-xs rounded-full shadow-sm flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                            >
                                <PlusCircle className="w-4 h-4" />
                                <span>Start New Chat</span>
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* QUICK CHIPS / SUGGESTION PILLS */}
                            <div className="bg-[#f0f2f5] border-t border-neutral-200/80 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 shrink-0 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-[#00853f]" />
                                    Quick:
                                </span>
                                {[
                                    '🗺️ Need to plan a tour in Sri Lanka',
                                    '📋 Need a customized tour itinerary',
                                    '🚗 Vehicles available for rent in Sri Lanka',
                                    '🚐 Private van & driver for island tour',
                                    '🏖️ Popular tourist attractions & day trips',
                                ].map((prompt) => (
                                    <button
                                        key={prompt}
                                        type="button"
                                        onClick={() => handleQuickPrompt(prompt)}
                                        className="px-2.5 py-1 bg-white hover:bg-neutral-100 active:scale-95 text-neutral-700 text-[11px] font-medium rounded-full shadow-2xs border border-neutral-300 shrink-0 transition-all cursor-pointer"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>

                            {/* WHATSAPP BOTTOM INPUT BAR */}
                            <form
                                onSubmit={handleSendMessage}
                                className="bg-[#f0f2f5] px-3 py-2 sm:px-4 sm:py-2.5 flex items-center gap-2 border-t border-neutral-200"
                            >
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        placeholder="Type a message..."
                                        disabled={isSending}
                                        autoFocus
                                        className="w-full bg-white text-neutral-900 placeholder:text-neutral-400 text-xs sm:text-sm px-4 py-2.5 rounded-full border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#00853f]/30 focus:border-[#00853f] transition-all shadow-inner disabled:bg-neutral-100 disabled:cursor-not-allowed"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={!messageText.trim() || isSending}
                                    className="w-10 h-10 rounded-full bg-[#00853f] hover:bg-[#007035] active:bg-[#005a2a] text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
                                    title="Send Message"
                                >
                                    {isSending ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4 translate-x-0.5" />
                                    )}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
