import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import {
    Send,
    Check,
    CheckCheck,
    Search,
    FileText,
    User,
    Phone,
    Mail,
    Globe,
    Building2,
    Sparkles,
    RotateCcw,
    Smile,
    Paperclip,
    ShieldCheck,
    MessageSquare,
    ArrowRight,
    Clock,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    Info,
} from 'lucide-react';

export default function InquiryForm({ initialInvoice = '' }) {
    // Step 1: Invoice lookup state with hardcoded "INV-" prefix
    const cleanInitial = (initialInvoice || '').trim().replace(/^INV-?/i, '');
    const [invoiceNumber, setInvoiceNumber] = useState(cleanInitial);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState(null);

    // Step 2: Verified customer & WhatsApp chat state
    const [verified, setVerified] = useState(false);
    const [customer, setCustomer] = useState(null);
    const [chatId, setChatId] = useState(null);
    const [chatStatus, setChatStatus] = useState('continuing');
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [showCustomerDetails, setShowCustomerDetails] = useState(true);

    const messagesEndRef = useRef(null);
    const pollTimerRef = useRef(null);

    // Auto-scroll chat to bottom
    const scrollToBottom = (behavior = 'smooth') => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior });
        }
    };

    useEffect(() => {
        if (verified) {
            scrollToBottom('auto');
        }
    }, [verified, messages]);

    // Polling for incoming agent messages when a chat session is active
    useEffect(() => {
        if (verified && chatId && chatStatus !== 'finished') {
            pollTimerRef.current = setInterval(async () => {
                try {
                    const res = await axios.get(`/customer-portal/chat-messages/${chatId}`);
                    if (res.data?.success && Array.isArray(res.data.messages)) {
                        setMessages(res.data.messages);
                        if (res.data.status) {
                            setChatStatus(res.data.status);
                        }
                    }
                } catch (err) {
                    console.error('Polling error:', err);
                }
            }, 3500);
        }

        return () => {
            if (pollTimerRef.current) {
                clearInterval(pollTimerRef.current);
                pollTimerRef.current = null;
            }
        };
    }, [verified, chatId, chatStatus]);

    // Handle Invoice Verification (Does NOT save to DB)
    const handleVerifyInvoice = async (e) => {
        if (e) e.preventDefault();
        const cleanedNum = invoiceNumber.trim().replace(/^INV-?/i, '');
        if (!cleanedNum) {
            setVerifyError('Please enter your invoice number digits (e.g. 00001).');
            return;
        }

        const fullInvoice = 'INV-' + cleanedNum;
        setIsVerifying(true);
        setVerifyError(null);

        try {
            const res = await axios.post('/customer-portal/verify-invoice', {
                invoice_number: fullInvoice,
            });

            if (res.data?.success && res.data.customer) {
                setCustomer(res.data.customer);
                setVerified(true);

                // If this invoice already had a continuing chat, load it
                if (res.data.existing_chat) {
                    setChatId(res.data.existing_chat.id);
                    setChatStatus(res.data.existing_chat.status || 'continuing');
                    setMessages(res.data.existing_chat.messages || []);
                } else {
                    setChatId(null);
                    setMessages([]);
                }
            } else {
                setVerifyError('Could not verify this invoice. Please check and try again.');
            }
        } catch (err) {
            const errorMsg =
                err.response?.data?.message ||
                `Invoice "INV-${cleanedNum}" was not found in our records. Please verify the invoice number (e.g. INV-00001, INV-00002).`;
            setVerifyError(errorMsg);
        } finally {
            setIsVerifying(false);
        }
    };

    // Auto-verify if initial invoice provided via query param
    useEffect(() => {
        if (cleanInitial.length > 0) {
            const timer = setTimeout(() => {
                handleVerifyInvoice();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, []);

    // Reset back to invoice entry
    const handleReset = () => {
        if (pollTimerRef.current) {
            clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
        }
        setVerified(false);
        setCustomer(null);
        setChatId(null);
        setMessages([]);
        setMessageText('');
        setVerifyError(null);
    };

    // Send Customer Message (Saves to DB on first message & subsequent messages)
    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        const text = messageText.trim();
        if (!text || isSending || !customer) return;

        setIsSending(true);

        // Optimistically add customer message for instantaneous WhatsApp feel
        const tempMsg = {
            id: 'temp-' + Date.now(),
            sender: 'customer',
            sender_name: customer.name,
            message: text,
            created_at: new Date().toISOString(),
            isPending: true,
        };
        setMessages((prev) => [...prev, tempMsg]);
        setMessageText('');

        try {
            const res = await axios.post('/customer-portal/send-message', {
                chat_id: chatId,
                invoice_number: customer.invoice_number,
                customer_name: customer.name,
                customer_phone: customer.phone !== 'Not Provided' ? customer.phone : null,
                country: customer.country,
                agent_id: customer.agent_id,
                message: text,
            });

            if (res.data?.success) {
                if (res.data.chat_id) {
                    setChatId(res.data.chat_id);
                }
                // Replace temp message with server saved message
                setMessages((prev) =>
                    prev.map((m) => (m.id === tempMsg.id ? res.data.message : m))
                );
            }
        } catch (err) {
            console.error('Failed to send message:', err);
            // Revert optimistic message
            setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
            alert('Failed to send message. Please check your internet connection.');
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
            <Head title={verified ? `Chat - Europcar Customer Portal (${customer?.invoice_number})` : 'Customer Portal - Europcar Airport Counter'} />

            {/* MAIN CONTENT CONTAINER */}
            <div className="relative z-10 w-full max-w-2xl my-auto">

                {/* ═══════════════════════════════════════════════════════════════════
                    STEP 1: INVOICE ENTRY ONLY (Customer enters ONLY Invoice Number)
                   ═══════════════════════════════════════════════════════════════════ */}
                {!verified && (
                    <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/60 overflow-hidden transition-all duration-300 max-w-lg mx-auto">
                        {/* Header Banner */}
                        <div className="bg-gradient-to-r from-[#00853f] via-[#009b49] to-[#016832] px-5 py-4 sm:px-6 sm:py-5 text-white text-center relative overflow-hidden">
                            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
                            <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-emerald-400/20 rounded-full blur-xl pointer-events-none" />

                            <div className="flex justify-center mb-2">
                                <div className="bg-white px-3.5 py-1.5 rounded-xl shadow-md border border-white/60 flex items-center gap-2">
                                    <img
                                        src="/assets/images/logo-europcar.png"
                                        alt="Europcar"
                                        className="h-5 sm:h-6 w-auto object-contain"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                    <span className="text-[11px] font-black tracking-wider text-[#00853f] uppercase">
                                        Airport Counter
                                    </span>
                                </div>
                            </div>

                            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                                Customer Assistance Portal
                            </h1>
                            <p className="text-emerald-100 text-xs mt-1 max-w-md mx-auto font-medium">
                                Connect directly with our on-duty airport counter agents via live chat.
                            </p>
                        </div>

                        {/* Invoice Verification Form */}
                        <div className="p-5 sm:p-6">
                            <form onSubmit={handleVerifyInvoice} className="space-y-3.5">
                                <div>
                                    <label
                                        htmlFor="invoice_number_input"
                                        className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
                                    >
                                        <FileText className="w-4 h-4 text-[#00853f]" />
                                        Enter Your Invoice Number
                                    </label>

                                    {/* Hardcoded "INV-" Prefix + Input */}
                                    <div className="flex rounded-2xl border-2 border-neutral-300 focus-within:border-[#00853f] focus-within:ring-4 focus-within:ring-[#00853f]/20 overflow-hidden bg-white shadow-sm transition-all">
                                        <div className="bg-[#00853f] text-white px-4 sm:px-5 flex items-center justify-center font-mono font-black text-base sm:text-lg tracking-wider select-none shrink-0 shadow-inner">
                                            INV-
                                        </div>

                                        <div className="relative flex-1">
                                            <input
                                                id="invoice_number_input"
                                                type="text"
                                                value={invoiceNumber}
                                                onChange={(e) => {
                                                    // Automatically strip 'INV-' or 'INV' if pasted or typed
                                                    const val = e.target.value.toUpperCase().replace(/^INV-?/i, '').replace(/[^0-9A-Z]/g, '');
                                                    setInvoiceNumber(val);
                                                    setVerifyError(null);
                                                }}
                                                placeholder="00001"
                                                autoFocus
                                                autoComplete="off"
                                                className="w-full text-lg sm:text-xl font-mono font-bold tracking-widest px-4 py-2.5 sm:py-3 text-neutral-900 placeholder:text-neutral-300 outline-none bg-transparent"
                                            />
                                            {invoiceNumber && (
                                                <button
                                                    type="button"
                                                    onClick={() => setInvoiceNumber('')}
                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 w-6 h-6 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors font-bold text-sm cursor-pointer"
                                                    title="Clear"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Error alert banner */}
                                {verifyError && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700 animate-fadeIn">
                                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold">Verification Failed</p>
                                            <p className="mt-0.5 leading-relaxed">{verifyError}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Submit button */}
                                <button
                                    type="submit"
                                    disabled={isVerifying || !invoiceNumber.trim()}
                                    className="w-full py-3 px-5 rounded-2xl bg-[#00853f] hover:bg-[#006f34] active:bg-[#005a2a] text-white font-bold text-sm sm:text-base tracking-wide shadow-md shadow-[#00853f]/30 hover:shadow-lg hover:shadow-[#00853f]/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                                >
                                    {isVerifying ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Verifying Invoice Details...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Verify & Open Live Chat</span>
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Trust badges footer */}
                            <div className="mt-4 pt-3.5 border-t border-neutral-100 flex items-center justify-center gap-5 text-[11px] text-neutral-400 font-medium">
                                <span className="flex items-center gap-1.5">
                                    <ShieldCheck className="w-3.5 h-3.5 text-[#00853f]" />
                                    Instant Verification
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <MessageSquare className="w-3.5 h-3.5 text-[#00853f]" />
                                    Direct Counter Desk
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-[#00853f]" />
                                    24/7 Assistance
                                </span>
                            </div>
                        </div>
                    </div>
                )}


                {/* ═══════════════════════════════════════════════════════════════════
                    STEP 2: WHATSAPP UI CHAT BOX + VERIFIED DETAILS BADGE
                   ═══════════════════════════════════════════════════════════════════ */}
                {verified && customer && (
                    <div className="flex flex-col gap-2.5">

                        {/* VERIFIED CUSTOMER DETAILS CARD (Read-only summary) */}
                        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/60 p-3.5 sm:p-4 text-neutral-800 transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                        Verified Customer Details
                                    </span>
                                    <span className="text-[11px] font-bold text-neutral-500 font-mono">
                                        #{customer.invoice_number}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowCustomerDetails(!showCustomerDetails)}
                                        className="text-[11px] text-neutral-500 hover:text-neutral-800 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                    >
                                        {showCustomerDetails ? (
                                            <>
                                                <span>Hide</span>
                                                <ChevronUp className="w-3.5 h-3.5" />
                                            </>
                                        ) : (
                                            <>
                                                <span>Show</span>
                                                <ChevronDown className="w-3.5 h-3.5" />
                                            </>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        title="Look up another invoice"
                                        className="text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg border border-red-200 transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                        <RotateCcw className="w-3 h-3" />
                                        <span>Change Invoice</span>
                                    </button>
                                </div>
                            </div>

                            {/* Collapsible Customer Info Grid */}
                            {showCustomerDetails && (
                                <div className="mt-3 pt-3 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs animate-fadeIn">
                                    {/* Name */}
                                    <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100 flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#00853f] flex items-center justify-center shrink-0">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Customer Name</span>
                                            <span className="font-bold text-neutral-800 truncate block text-sm">{customer.name}</span>
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100 flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Contact Phone</span>
                                            <span className="font-bold text-neutral-800 truncate block text-sm font-mono">{customer.phone}</span>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100 flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Email Address</span>
                                            <span className="font-bold text-neutral-800 truncate block text-xs">{customer.email}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ─── WHATSAPP UI CHAT CONTAINER ─── */}
                        <div className="bg-[#efeae2] rounded-3xl shadow-2xl border border-white/60 overflow-hidden flex flex-col h-[560px] sm:h-[620px] transition-all relative">

                            {/* 1. WHATSAPP HEADER */}
                            <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between shadow-md z-10">
                                <div className="flex items-center gap-3">
                                    {/* Counter Avatar with online pulse */}
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-inner overflow-hidden border-2 border-white/80">
                                            <Building2 className="w-5 h-5 text-[#00853f]" />
                                        </div>
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#25D366] border-2 border-[#075E54] rounded-full" />
                                    </div>

                                    {/* Agent Title & Status */}
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-sm sm:text-base font-bold tracking-tight text-white leading-tight">
                                                Europcar Counter Desk
                                            </h2>
                                            <span className="text-[10px] bg-white/20 text-emerald-100 px-1.5 py-0.2 rounded font-semibold">
                                                Official
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-emerald-100/90 flex items-center gap-1 font-medium">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] inline-block animate-ping" />
                                            <span>Online • Replying in minutes</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <span className="text-[10px] text-emerald-200 block font-mono font-bold">
                                        {customer.invoice_number}
                                    </span>
                                    <span className="text-[9px] text-emerald-200/75 block">
                                        Terminal 1 Desk
                                    </span>
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

                                {/* Security Notice Pill */}
                                <div className="flex justify-center">
                                    <div className="bg-[#ffeecd] text-[#54656f] text-[10.5px] px-3.5 py-1.5 rounded-xl shadow-xs border border-[#ffdf9e] max-w-sm text-center flex items-center gap-1.5 font-medium">
                                        <ShieldCheck className="w-3.5 h-3.5 text-[#00853f] shrink-0" />
                                        <span>
                                            Verified session for <strong>{customer.name}</strong> ({customer.invoice_number}). Messages route directly to counter staff.
                                        </span>
                                    </div>
                                </div>

                                {/* Default Welcome Bubble from Counter Agent */}
                                <div className="flex justify-start animate-fadeIn">
                                    <div className="bg-white text-neutral-800 rounded-2xl rounded-tl-xs px-3.5 py-2.5 max-w-[85%] sm:max-w-[75%] shadow-sm border border-neutral-200/70 text-xs sm:text-sm space-y-1">
                                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#075E54]">
                                            <span>Europcar Airport Counter</span>
                                            <span className="text-[10px] text-neutral-400 font-normal">• Verified Desk</span>
                                        </div>
                                        <p className="leading-relaxed">
                                            Hello <strong>{customer.name}</strong>! 👋 Welcome to Europcar Airport Counter Support.
                                        </p>
                                        <p className="leading-relaxed text-neutral-600 text-xs">
                                            We have confirmed your invoice <strong>#{customer.invoice_number}</strong>. How may our airport counter team assist you today?
                                        </p>
                                        <div className="flex justify-end pt-0.5">
                                            <span className="text-[10px] text-neutral-400">Desk Assistant</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Render Actual Chat Messages from Server */}
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
                                                        {msg.sender_name || 'Agent'}
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

                                <div ref={messagesEndRef} />
                            </div>

                            {/* 3. QUICK CHIPS / SUGGESTION PILLS */}
                            <div className="bg-[#f0f2f5] border-t border-neutral-200/80 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 shrink-0 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-[#00853f]" />
                                    Quick:
                                </span>
                                {[
                                    '📍 Where is the counter desk?',
                                    '🕒 Flight delayed / arriving late',
                                    '📄 Need rental agreement copy',
                                    '🧳 Luggage assistance at gate',
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

                            {/* 4. WHATSAPP BOTTOM INPUT BAR */}
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
                                        className="w-full bg-white text-neutral-900 placeholder:text-neutral-400 text-xs sm:text-sm px-4 py-2.5 rounded-full border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#00853f]/30 focus:border-[#00853f] transition-all shadow-inner"
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
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
