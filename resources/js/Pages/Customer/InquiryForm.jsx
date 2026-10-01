import { Head, useForm } from '@inertiajs/react';
import { useState, useMemo, useEffect, useRef } from 'react';
import {
    ShieldCheckIcon,
    UserCircleIcon,
    PhoneIcon,
    CheckCircleIcon,
    PaperAirplaneIcon,
    TagIcon,
    ChevronDownIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

export default function InquiryForm({
    agents = [],
    countries = [],
    preselectedAgentId = null,
    submittedChat = null,
}) {
    const [agentCodeInput, setAgentCodeInput] = useState(
        preselectedAgentId ? String(preselectedAgentId) : ''
    );

    // Country searchable dropdown state
    const [countrySearch, setCountrySearch] = useState('');
    const [isCountryOpen, setIsCountryOpen] = useState(false);
    const countryDropdownRef = useRef(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                countryDropdownRef.current &&
                !countryDropdownRef.current.contains(event.target)
            ) {
                setIsCountryOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Country flag helper: generates flag emoji from ISO 2-letter code
    const getCountryFlag = (code) => {
        if (!code || code.length !== 2) return '🌐';
        try {
            return code
                .toUpperCase()
                .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397));
        } catch {
            return '🌐';
        }
    };

    // Filtered countries list
    const filteredCountries = useMemo(() => {
        if (!countrySearch.trim()) return countries;
        const q = countrySearch.toLowerCase();
        return countries.filter(
            (c) =>
                (c.country_name || '').toLowerCase().includes(q) ||
                (c.country_code || '').toLowerCase().includes(q)
        );
    }, [countries, countrySearch]);

    // Match selected agent
    const selectedAgent = useMemo(() => {
        if (!agentCodeInput) return null;
        return (
            agents.find(
                (a) =>
                    String(a.id) === String(agentCodeInput).trim() ||
                    a.name.toLowerCase() === agentCodeInput.trim().toLowerCase()
            ) || null
        );
    }, [agents, agentCodeInput]);

    const form = useForm({
        agent_id: preselectedAgentId || '',
        customer_name: '',
        customer_phone: '',
        country: '',
        country_code: '',
        country_flag: '🌐',
        topic: 'Airport Taxi & Transfer',
        message: '',
    });

    // Synchronize agent_id with selected agent
    useEffect(() => {
        if (selectedAgent) {
            form.setData('agent_id', selectedAgent.id);
        } else {
            form.setData('agent_id', '');
        }
    }, [selectedAgent]);

    const handleSelectCountry = (countryItem) => {
        const flag = getCountryFlag(countryItem.country_code);
        form.setData((prev) => ({
            ...prev,
            country: countryItem.country_name,
            country_code: countryItem.country_code,
            country_flag: flag,
        }));
        setIsCountryOpen(false);
        setCountrySearch('');
    };

    const quickTopics = [
        '🚗 Taxi / Transfer',
        '🧳 Luggage / Lost',
        '✈️ Flight Assist',
        '🏨 Hotel & Tours',
        '💬 General Inquiry',
    ];

    const submit = (e) => {
        e.preventDefault();
        if (!selectedAgent) {
            form.setError(
                'agent_id',
                'Please enter your agent code or select an agent above to proceed.'
            );
            const el = document.getElementById('agent-identification-box');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        form.post('/customer-portal', {
            preserveScroll: true,
        });
    };

    // Success Screen (Compact)
    if (submittedChat) {
        return (
            <div
                className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-3"
                style={{ backgroundImage: "url('/assets/images/inquiry-bg.jpg')" }}
            >
                <Head title="Inquiry Received - Europcar" />

                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-5 sm:p-7 max-w-md w-full text-center border border-neutral-200">
                    <div className="flex flex-col items-center justify-center gap-1 mb-3">
                        <img
                            src="/assets/images/logo-europcar.png"
                            alt="Europcar Logo"
                            className="h-10 sm:h-11 object-contain"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                        <h2 className="text-lg font-black text-black">Europcar</h2>
                    </div>

                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2 shadow-inner">
                        <CheckCircleIcon className="w-8 h-8" />
                    </div>

                    <h1 className="text-xl font-black text-black">
                        Inquiry Received!
                    </h1>
                    <p className="text-xs font-semibold text-neutral-800 mt-0.5">
                        Transmitted to our Europcar airport counter team.
                    </p>

                    {/* Agent Confirmation Card */}
                    <div className="mt-3.5 p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-left">
                        <div className="flex items-center gap-2.5">
                            <div
                                style={{ backgroundColor: '#00853f', color: '#ffffff' }}
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-black shrink-0"
                            >
                                <ShieldCheckIcon className="w-6 h-6 text-white" />
                            </div>
                            <div className="min-w-0 truncate">
                                <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider block">
                                    Assigned Counter Agent
                                </span>
                                <h3 className="text-sm font-black text-black truncate">
                                    {submittedChat.agent?.name || 'Europcar Agent'}
                                </h3>
                                <p className="text-[11px] font-semibold text-neutral-700 truncate">
                                    {submittedChat.agent?.designation || 'Europcar Airport Specialist'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-neutral-200 space-y-1 text-xs text-neutral-800 font-semibold">
                            <div className="flex justify-between">
                                <span className="text-neutral-600">Customer:</span>
                                <span className="font-bold text-black">{submittedChat.customer_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-600">Topic:</span>
                                <span className="font-bold text-black">{submittedChat.topic}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-600">Country:</span>
                                <span className="font-bold text-black">
                                    {submittedChat.country_flag} {submittedChat.country}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Message Preview */}
                    {submittedChat.messages && submittedChat.messages.length > 0 && (
                        <div className="mt-2.5 p-2.5 bg-neutral-100/70 rounded-lg border border-neutral-200 text-left">
                            <span className="text-[10px] font-bold text-neutral-600 uppercase block">
                                Your Message:
                            </span>
                            <p className="text-xs font-semibold text-black italic line-clamp-3 mt-0.5">
                                "{submittedChat.messages[0].message}"
                            </p>
                        </div>
                    )}

                    <p className="text-[11px] font-bold text-neutral-700 mt-3">
                        Please proceed to our Europcar airport counter or keep your phone nearby.
                    </p>

                    <a
                        href="/customer-portal"
                        style={{ backgroundColor: '#00853f', color: '#ffffff' }}
                        className="mt-3.5 inline-block w-full py-2.5 px-4 font-black text-xs sm:text-sm rounded-xl transition-all shadow-md text-center hover:opacity-90"
                    >
                        Submit Another Inquiry
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-3 sm:p-4"
            style={{ backgroundImage: "url('/assets/images/inquiry-bg.jpg')" }}
        >
            <Head title="Europcar - Airport Counter Customer Assistance" />

            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl max-w-lg w-full border border-neutral-200">
                {/* Compact Header */}
                <div className="bg-white border-b border-neutral-200 py-3 px-4 sm:py-3.5 sm:px-5 flex items-center justify-between rounded-t-2xl shadow-xs">
                    <div className="flex items-center gap-2.5">
                        <img
                            src="/assets/images/logo-europcar.png"
                            alt="Europcar Logo"
                            className="h-8 sm:h-9 object-contain"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                        <div>
                            <h1 className="text-lg sm:text-xl font-black tracking-tight text-black leading-none">
                                Europcar
                            </h1>
                            <p className="text-[11px] font-bold text-neutral-700 leading-tight mt-0.5">
                                Airport Counter Assistance
                            </p>
                        </div>
                    </div>

                    <span
                        style={{ color: '#00853f', borderColor: '#a7f3d0' }}
                        className="px-2.5 py-0.5 rounded-full bg-emerald-100 border text-[10px] font-black uppercase tracking-wider"
                    >
                        Official Desk
                    </span>
                </div>

                {/* Compact Form Body */}
                <form onSubmit={submit} className="p-3.5 sm:p-4 space-y-2.5">
                    {/* 1. AGENT IDENTIFICATION BOX */}
                    <div
                        id="agent-identification-box"
                        className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-2.5 space-y-1.5"
                    >
                        <div className="flex items-center justify-between">
                            <label className="text-[11px] font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1">
                                <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-700" />
                                1. Counter Agent Identification
                            </label>
                            <span className="text-[10px] font-bold text-neutral-600">
                                From Card
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {/* Enter Agent Code / Number */}
                            <div>
                                <input
                                    type="text"
                                    value={agentCodeInput}
                                    onChange={(e) => {
                                        setAgentCodeInput(e.target.value);
                                        form.clearErrors('agent_id');
                                    }}
                                    placeholder="Enter Agent Code / ID"
                                    className="w-full px-2.5 py-1.5 text-xs font-bold text-black bg-white border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-600 outline-none"
                                />
                            </div>

                            {/* Or select from agent list */}
                            <div>
                                <select
                                    value={selectedAgent ? selectedAgent.id : ''}
                                    onChange={(e) => {
                                        setAgentCodeInput(e.target.value);
                                        form.clearErrors('agent_id');
                                    }}
                                    className="w-full px-2 py-1.5 text-xs font-bold text-black bg-white border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-600 outline-none cursor-pointer"
                                >
                                    <option value="">-- Select Agent --</option>
                                    {agents.map((ag) => (
                                        <option key={ag.id} value={ag.id}>
                                            #{ag.id} - {ag.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Verified Agent Confirmation Banner */}
                        {selectedAgent && (
                            <div className="p-1.5 px-2 bg-white rounded-lg border border-emerald-300 flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black shrink-0">
                                        <CheckCircleIcon className="w-4 h-4" />
                                    </div>
                                    <div className="truncate">
                                        <h4 className="text-xs font-black text-black truncate leading-tight">
                                            {selectedAgent.name}
                                        </h4>
                                        <p className="text-[10px] font-bold text-neutral-600 leading-tight">
                                            {selectedAgent.designation || 'Europcar Counter Agent'} • Agent #{selectedAgent.id}
                                        </p>
                                    </div>
                                </div>
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-950 border border-emerald-300 shrink-0">
                                    Verified
                                </span>
                            </div>
                        )}

                        {form.errors.agent_id && (
                            <p className="text-[11px] font-bold text-red-600">
                                {form.errors.agent_id}
                            </p>
                        )}
                    </div>

                    {/* 2. CUSTOMER DETAILS */}
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[11px] font-bold text-black mb-0.5">
                                    Your Name <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.data.customer_name}
                                    onChange={(e) => form.setData('customer_name', e.target.value)}
                                    placeholder="Enter Name"
                                    className="w-full px-2.5 py-1.5 text-xs font-semibold text-black bg-neutral-50 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-600 outline-none"
                                />
                                {form.errors.customer_name && (
                                    <p className="text-[10px] text-red-600 mt-0.5 font-bold">
                                        {form.errors.customer_name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-black mb-0.5">
                                    WhatsApp / Phone
                                </label>
                                <div className="relative">
                                    <PhoneIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-600" />
                                    <input
                                        type="tel"
                                        value={form.data.customer_phone}
                                        onChange={(e) => form.setData('customer_phone', e.target.value)}
                                        placeholder="Enter Number"
                                        className="w-full pl-8 pr-2.5 py-1.5 text-xs font-semibold text-black bg-neutral-50 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-600 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Searchable Country Dropdown */}
                        <div className="relative" ref={countryDropdownRef}>
                            <label className="block text-[11px] font-bold text-black mb-0.5">
                                Country of Origin / Passport <span className="text-red-600">*</span>
                            </label>

                            {/* Trigger Button */}
                            <button
                                type="button"
                                onClick={() => setIsCountryOpen(!isCountryOpen)}
                                className="w-full px-2.5 py-1.5 text-xs font-bold text-black bg-neutral-50 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-600 outline-none flex items-center justify-between text-left cursor-pointer"
                            >
                                <div className="flex items-center gap-2 truncate">
                                    <span className="text-base shrink-0">
                                        {form.data.country_flag || '🌐'}
                                    </span>
                                    <span className="truncate">
                                        {form.data.country
                                            ? `${form.data.country} (${form.data.country_code})`
                                            : 'Select Country'}
                                    </span>
                                </div>
                                <ChevronDownIcon
                                    className={`w-3.5 h-3.5 text-black transition-transform shrink-0 ${
                                        isCountryOpen ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>

                            {/* Dropdown Menu with Search Input */}
                            {isCountryOpen && (
                                <div
                                    className="absolute z-50 left-0 right-0 mt-1 bg-white border border-neutral-300 rounded-xl shadow-2xl animate-fadeIn"
                                    style={{
                                        maxHeight: '290px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        boxShadow: '0 12px 28px rgba(0, 0, 0, 0.22), 0 4px 10px rgba(0, 0, 0, 0.12)',
                                    }}
                                >
                                    {/* Search Input Box */}
                                    <div className="p-2 border-b border-neutral-200 bg-neutral-50 relative shrink-0">
                                        <MagnifyingGlassIcon className="w-3.5 h-3.5 absolute left-4 top-1/2 -translate-y-1/2 text-black" />
                                        <input
                                            type="text"
                                            autoFocus
                                            value={countrySearch}
                                            onChange={(e) => setCountrySearch(e.target.value)}
                                            placeholder="Type country name..."
                                            className="w-full pl-7 pr-7 py-1 text-xs font-bold text-black bg-white border border-neutral-300 rounded outline-none focus:ring-1 focus:ring-emerald-600"
                                        />
                                        {countrySearch && (
                                            <button
                                                type="button"
                                                onClick={() => setCountrySearch('')}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:text-neutral-700"
                                            >
                                                <XMarkIcon className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Scrollable Countries List with Explicit Height and Touch Action */}
                                    <div
                                        className="divide-y divide-neutral-100 flex-1 overflow-y-auto"
                                        style={{
                                            maxHeight: '210px',
                                            minHeight: '120px',
                                            overflowY: 'auto',
                                            WebkitOverflowScrolling: 'touch',
                                            overscrollBehavior: 'contain',
                                            touchAction: 'pan-y',
                                        }}
                                    >
                                        {filteredCountries.length === 0 ? (
                                            <div className="p-3 text-center text-xs font-bold text-neutral-600">
                                                No country matching "{countrySearch}"
                                            </div>
                                        ) : (
                                            filteredCountries.map((c) => {
                                                const flag = getCountryFlag(c.country_code);
                                                const isSelected = form.data.country === c.country_name;
                                                return (
                                                    <button
                                                        key={c.id}
                                                        type="button"
                                                        onClick={() => handleSelectCountry(c)}
                                                        style={{ touchAction: 'pan-y' }}
                                                        className={`w-full px-3 py-1.5 text-left text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                                                            isSelected
                                                                ? 'bg-emerald-50 text-emerald-950 font-black'
                                                                : 'hover:bg-neutral-100 text-black'
                                                        }`}
                                                    >
                                                        <span className="flex items-center gap-2 truncate">
                                                            <span className="text-sm">{flag}</span>
                                                            <span className="truncate">{c.country_name}</span>
                                                        </span>
                                                        <span className="text-[10px] font-semibold text-neutral-500 uppercase shrink-0">
                                                            {c.country_code}
                                                        </span>
                                                    </button>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            )}

                            {form.errors.country && (
                                <p className="text-[10px] text-red-600 mt-0.5 font-bold">
                                    {form.errors.country}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 3. INQUIRY TOPIC & MESSAGE */}
                    <div className="space-y-2">
                        {/* Quick Topic Pills */}
                        <div>
                            <label className="block text-[11px] font-bold text-black mb-1">
                                Topic:
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                                {quickTopics.map((top) => {
                                    const isSelected = form.data.topic === top;
                                    return (
                                        <button
                                            key={top}
                                            type="button"
                                            onClick={() => form.setData('topic', top)}
                                            style={
                                                isSelected
                                                    ? { backgroundColor: '#00853f', borderColor: '#00853f', color: '#ffffff' }
                                                    : { backgroundColor: '#f5f5f5', borderColor: '#d4d4d4', color: '#000000' }
                                            }
                                            className="px-2 py-1 rounded-md text-[11px] font-bold transition-all border cursor-pointer"
                                        >
                                            {top}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Initial Message */}
                        <div>
                            <label className="block text-[11px] font-bold text-black mb-0.5">
                                Inquiry Message <span className="text-red-600">*</span>
                            </label>
                            <textarea
                                required
                                rows={2}
                                value={form.data.message}
                                onChange={(e) => form.setData('message', e.target.value)}
                                placeholder="Enter Message"
                                className="w-full px-2.5 py-1.5 text-xs font-medium text-black bg-neutral-50 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-600 outline-none"
                            />
                            {form.errors.message && (
                                <p className="text-[10px] text-red-600 mt-0.5 font-bold">
                                    {form.errors.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Submit Button (Immediately follows the message with bold solid Europcar styling) */}
                    <button
                        type="submit"
                        disabled={form.processing}
                        style={{
                            backgroundColor: '#00853f',
                            color: '#ffffff',
                        }}
                        className="w-full py-3 px-4 font-black text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer hover:opacity-95 active:scale-[0.99] mt-2 text-white border-0"
                    >
                        {form.processing ? (
                            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                            <PaperAirplaneIcon className="w-4 h-4 text-white" />
                        )}
                        <span className="text-white font-black text-sm">
                            {selectedAgent
                                ? `Connect with ${selectedAgent.name}`
                                : 'Connect with Agent'}
                        </span>
                    </button>

                    {!selectedAgent && (
                        <div className="text-center p-2 rounded-lg bg-amber-50 border border-amber-200 mt-1">
                            <p className="text-[10px] font-bold text-amber-900">
                                👆 Please enter or select your Counter Agent above to connect
                            </p>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
