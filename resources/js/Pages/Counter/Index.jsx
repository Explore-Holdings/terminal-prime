import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useEffect, useState, useMemo, useRef } from 'react';
import { ArrowLeft, UserPlus, CreditCard, Car, Users, CarFront, Trash2, X, ClipboardList, RefreshCw, Clock, ChevronDown, Search, Check } from 'lucide-react';
import DataTable from 'react-data-table-component';

const CURRENCY_TO_COUNTRY = {
    LKR: 'lk', USD: 'us', EUR: 'eu', GBP: 'gb', AUD: 'au', CAD: 'ca', INR: 'in', AED: 'ae', CNY: 'cn', JPY: 'jp',
    RUB: 'ru', SAR: 'sa', SGD: 'sg', CHF: 'ch', SEK: 'se', NOK: 'no', ZAR: 'za', THB: 'th', MYR: 'my', KRW: 'kr',
    NZD: 'nz', BRL: 'br', MXN: 'mx', EGP: 'eg', OMR: 'om', QAR: 'qa', KWD: 'kw', BHD: 'bh', JOD: 'jo', TUR: 'tr',
    IDR: 'id', PHP: 'ph', VND: 'vn', PKR: 'pk', BDT: 'bd', HKD: 'hk', TWD: 'tw', PLN: 'pl', CZK: 'cz', HUF: 'hu',
    DKK: 'dk', ILS: 'il', ARS: 'ar', CLP: 'cl', COP: 'co', PEN: 'pe', KZT: 'kz', UAH: 'ua', NGN: 'ng', KES: 'ke',
};

const getCurrencyFlagUrl = (currency) => {
    if (!currency) return null;
    const code = currency.toUpperCase();
    const country = CURRENCY_TO_COUNTRY[code] || code.substring(0, 2).toLowerCase();
    return `https://flagcdn.com/w40/${country}.png`;
};

function SearchableCurrencySelect({ label, value, onChange, options = [], className = '' }) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = useMemo(() => {
        if (!search.trim()) return options;
        const q = search.toLowerCase();
        return options.filter(c => c.toLowerCase().includes(q));
    }, [options, search]);

    const flagUrl = getCurrencyFlagUrl(value);

    return (
        <div className={`relative ${isOpen ? 'z-[100]' : 'z-10'} ${className}`} ref={containerRef}>
            {label && <label className="label">{label}</label>}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="input text-left flex justify-between items-center bg-white border border-gray-300 rounded-lg px-2.5 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            >
                <span className="flex items-center gap-2 truncate">
                    {flagUrl && (
                        <img 
                            src={flagUrl} 
                            alt={value} 
                            className="w-5 h-3.5 object-cover rounded-xs border border-gray-200 shrink-0 shadow-xs" 
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    )}
                    <span>{value || 'Select'}</span>
                </span>
                <ChevronDown size={14} className={`transition-transform text-gray-500 shrink-0 ml-1 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-[100] left-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-2xl p-2 space-y-2 max-h-60 overflow-hidden flex flex-col">
                    <div className="relative shrink-0">
                        <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
                        <input
                            type="text"
                            autoFocus
                            placeholder="Search currency..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full text-xs border border-gray-200 rounded-md pl-8 pr-2 py-1.5 focus:outline-none focus:border-blue-500 font-semibold"
                        />
                    </div>
                    <div className="overflow-y-auto flex-1 space-y-0.5 max-h-44 pr-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((c) => {
                                const optionFlagUrl = getCurrencyFlagUrl(c);
                                return (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => {
                                            onChange(c);
                                            setIsOpen(false);
                                            setSearch('');
                                        }}
                                        className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-bold transition flex items-center justify-between ${
                                            c === value ? 'bg-blue-50 text-blue-700 font-extrabold' : 'hover:bg-gray-100 text-gray-700'
                                        }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            {optionFlagUrl && (
                                                <img 
                                                    src={optionFlagUrl} 
                                                    alt={c} 
                                                    className="w-5 h-3.5 object-cover rounded-xs border border-gray-200 shrink-0 shadow-xs" 
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            )}
                                            <span>{c}</span>
                                        </span>
                                        {c === value && <Check size={13} className="text-blue-700 shrink-0" />}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="p-2 text-center text-xs text-gray-400 font-medium">
                                No currency found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const convertCurrencyAmount = (amount, fromCur, toCur, rates) => {
    const amt = Number(amount || 0);
    if (!amt) return 0;
    if (!fromCur || !toCur) return amt;
    const from = fromCur.toLowerCase();
    const to = toCur.toLowerCase();
    if (from === to) return amt;
    if (!rates) return amt;
    const rateFrom = rates[from];
    const rateTo = rates[to];
    if (!rateFrom || !rateTo) return amt;
    return (amt / rateFrom) * rateTo;
};

const convertToLkr = (amount, currency, rates) => {
    if (!rates || !currency || currency.toUpperCase() === 'LKR') return null;
    const lkrVal = convertCurrencyAmount(amount, currency, 'LKR', rates);
    if (lkrVal === Number(amount || 0) && currency.toUpperCase() !== 'LKR') return null;
    return lkrVal;
};

const getAmountInLkr = (amount, currency, rates) => {
    const fromCurrency = currency ?? 'LKR';
    return convertCurrencyAmount(amount, fromCurrency, 'LKR', rates);
};

const formatToLkrString = (amount, currency, rates) => {
    const converted = convertToLkr(amount, currency, rates);
    if (converted === null) return null;
    return `LKR ${Math.round(converted).toLocaleString()}`;
};

const getVehicleSlotNumber = (v) => {
    if (!v) return null;
    const reg = v.driver?.registration_number ?? v.registration_number ?? '';
    const match = reg.match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
};

const getNextInLineVehicle = (vehiclesList, ongoingTripsList, lastReorderedAt = null) => {
    const activeSessions = (vehiclesList ?? []).map(v => v.driver?.session_id).filter(s => s !== null && s !== undefined && s > 0);
    const baseSessionId = activeSessions.length > 0 ? Math.min(...activeSessions) : 1;

    // Only consider vehicles in the current queue (never consider the waiting queue)
    const available = (vehiclesList ?? []).filter((v) => {
        const isOnDuty = v.driver?.duty_status === 'on_duty';
        const hasOngoingTrip = v.driver?.trips && v.driver.trips.length > 0;
        const isCurrentSession = (v.driver?.session_id ?? 0) <= baseSessionId;
        return isOnDuty && !hasOngoingTrip && isCurrentSession;
    });

    if (available.length === 0) return null;

    // Sort by session_id first, then by slot number
    const sorted = [...available].sort((a, b) => {
        const sessionA = a.driver?.session_id ?? 0;
        const sessionB = b.driver?.session_id ?? 0;
        if (sessionA !== sessionB) return sessionA - sessionB;

        const slotA = getVehicleSlotNumber(a) ?? 999;
        const slotB = getVehicleSlotNumber(b) ?? 999;
        return slotA - slotB;
    });

    // Build lookup of driver sessions from active vehicles list
    const vehicleSessionMap = {};
    (vehiclesList ?? []).forEach(v => {
        if (v.driver?.id) {
            vehicleSessionMap[v.driver.id] = v.driver.session_id ?? baseSessionId;
        }
    });

    // Only consider the last trip assigned from the CURRENT QUEUE (never a waiting queue trip)
    // Ignore out-of-turn assignments (trips with selection_reason) so they don't advance the pointer
    // If reordered, ignore trips assigned before the reorder so the queue restarts from the first in-duty driver
    const lastCurrentQueueTrip = (ongoingTripsList ?? []).find((t) => {
        const tripTimeStr = t.trip_assigned_at || t.created_at;
        if (lastReorderedAt && tripTimeStr) {
            const tripTime = new Date(tripTimeStr).getTime();
            const reorderTime = new Date(lastReorderedAt).getTime();
            if (tripTime < reorderTime) {
                return false;
            }
        }
        const driverId = t.driver_id ?? t.driver?.id;
        const sid = vehicleSessionMap[driverId] ?? (t.driver?.session_id ?? 0);
        return sid > 0 && sid <= baseSessionId && !t.selection_reason;
    });

    const lastAssignedDriver = lastCurrentQueueTrip?.driver;
    const lastSlotNumber = getVehicleSlotNumber(lastAssignedDriver) ?? 0;

    if (lastSlotNumber > 0) {
        // Find next vehicle in the current queue with a higher slot number than the last assigned current-queue slot
        const nextVehicles = sorted.filter(
            (v) => (getVehicleSlotNumber(v) ?? 0) > lastSlotNumber
        );
        if (nextVehicles.length > 0) {
            return nextVehicles[0];
        }
    }

    return sorted[0];
};

const LANGUAGE_COLOR_PALETTES = [
    { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', dot: '#3b82f6', activeBg: 'bg-blue-600 text-white' },
    { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', dot: '#10b981', activeBg: 'bg-emerald-600 text-white' },
    { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', dot: '#f59e0b', activeBg: 'bg-amber-600 text-white' },
    { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300', dot: '#14b8a6', activeBg: 'bg-teal-600 text-white' },
    { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300', dot: '#a855f7', activeBg: 'bg-purple-600 text-white' },
    { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300', dot: '#f43f5e', activeBg: 'bg-rose-600 text-white' },
    { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300', dot: '#6366f1', activeBg: 'bg-indigo-600 text-white' },
    { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-300', dot: '#06b6d4', activeBg: 'bg-cyan-600 text-white' },
    { bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-300', dot: '#8b5cf6', activeBg: 'bg-violet-600 text-white' },
    { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-300', dot: '#0284c7', activeBg: 'bg-sky-600 text-white' },
    { bg: 'bg-lime-100', text: 'text-lime-800', border: 'border-lime-300', dot: '#84cc16', activeBg: 'bg-lime-600 text-white' },
    { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300', dot: '#ec4899', activeBg: 'bg-pink-600 text-white' },
    { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', dot: '#f97316', activeBg: 'bg-orange-600 text-white' },
    { bg: 'bg-fuchsia-100', text: 'text-fuchsia-800', border: 'border-fuchsia-300', dot: '#d946ef', activeBg: 'bg-fuchsia-600 text-white' },
];

const getLanguageStyle = (langName) => {
    if (!langName) return LANGUAGE_COLOR_PALETTES[0];
    const str = String(langName).trim().toLowerCase();
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % LANGUAGE_COLOR_PALETTES.length;
    return LANGUAGE_COLOR_PALETTES[index];
};

function LanguageBadge({ language, className = '', size = 'md', active = false, onClick = null, count = null }) {
    const style = getLanguageStyle(language);
    const isSmall = size === 'sm';
    
    return (
        <span
            onClick={onClick}
            className={`inline-flex items-center gap-1 rounded-full border font-medium transition ${
                isSmall ? 'px-1.5 py-0.2 text-[10px]' : 'px-2.5 py-0.5 text-xs'
            } ${
                active ? style.activeBg + ' border-transparent shadow-sm scale-105 font-bold' : `${style.bg} ${style.text} ${style.border}`
            } ${onClick ? 'cursor-pointer hover:opacity-90 hover:scale-105 select-none' : ''} ${className}`}
        >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: active ? '#ffffff' : style.dot }} />
            <span>{language}</span>
            {count !== null && (
                <span className={`text-[9px] px-1 rounded-full font-bold ml-0.5 ${active ? 'bg-white/30 text-white' : 'bg-black/10 text-current'}`}>
                    {count}
                </span>
            )}
        </span>
    );
}

export default function Index({ pendingAgents = [], ongoingTrips = [], vehicles = [], countries = [], rateSetting = null, locationVehiclePrices = [], vehicleRates = [], dbLanguages = [], myTrips = [], serviceCategories = [], lastReorderedAt = null, pettyCash = 0, shortTrips = [] }) {
    const { auth } = usePage().props;
    const currentUserId = auth?.user?.id;
    const [showModal, setShowModal] = useState(false);
    const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);
    const [checkoutInput, setCheckoutInput] = useState('');
    const [activeTab, setActiveTab] = useState('customer');
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [createdCustomerId, setCreatedCustomerId] = useState(null);
    const [invoicePath, setInvoicePath] = useState(null);
    const [paymentEnabledAgentId, setPaymentEnabledAgentId] = useState(null);
    const [vehicleEnabledAgentId, setVehicleEnabledAgentId] = useState(null);
    const [eurRates, setEurRates] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [showReorderModal, setShowReorderModal] = useState(false);
    const [reorderSaving, setReorderSaving] = useState(false);
    const [reorderInput, setReorderInput] = useState('');
    const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    const [showShortTripsModal, setShowShortTripsModal] = useState(false);

    const [searchMyTrips, setSearchMyTrips] = useState('');

    const filteredMyTrips = useMemo(() => {
        return myTrips.filter((trip) => {
            const text = [
                trip.id,
                trip.customer?.name,
                trip.customer?.customer_code,
                trip.driver?.first_name,
                trip.driver?.last_name,
                trip.driver?.vehicle?.registration_number,
                trip.status,
            ].join(' ').toLowerCase();

            return text.includes(searchMyTrips.toLowerCase());
        });
    }, [myTrips, searchMyTrips]);

    useEffect(() => {
        fetch('https://latest.currency-api.pages.dev/v1/currencies/eur.json')
            .then(res => res.json())
            .then(data => {
                if (data && data.eur) {
                    setEurRates(data.eur);
                }
            })
            .catch(err => console.error('Failed to fetch currency rates:', err));
    }, []);

    useEffect(() => {
        let isFetching = false;
        const interval = setInterval(() => {
            if (isFetching) return;
            isFetching = true;
            router.reload({
                only: ['pendingAgents', 'vehicles', 'ongoingTrips', 'myTrips', 'lastReorderedAt', 'pettyCash'],
                preserveScroll: true,
                preserveState: true,
                onFinish: () => {
                    isFetching = false;
                },
                onSuccess: () => setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
            });
        }, 500); // 500ms for near-instant real-time sync without request stacking

        return () => clearInterval(interval);
    }, []);

    const customerForm = useForm({
        agent_id: '',
        name: '',
        email: '',
        mobile_number: '',
        whatsapp_number: '',
        country: '',
        dropoff_location: '',
        passenger_count: 1,
        language_preference: '',
        status: 'New',
        remarks: '',
    });

    const paymentForm = useForm({
        currency: 'LKR',
        price: 0,
        payments: [{
            method: 'Cash',
            currency: 'LKR',
            amount: 0,
            notes: [{ amount: '', count: '', currency: 'LKR' }],
        }],
    });

    const resetCustomerForm = (agent) => {
        customerForm.setData({
            agent_id: agent.id,
            name: agent.name ?? '',
            email: '',
            mobile_number: '',
            whatsapp_number: '',
            country: '',
            dropoff_location: agent.dropoff_location ?? '',
            passenger_count: agent.passenger_count ?? 1,
            luggage_count: agent.luggage_count ?? 0,
            language_preference: '',
            status: 'New',
            remarks: agent.remarks ?? '',
        });

        paymentForm.setData({
            currency: agent.currency ?? 'LKR',
            price: agent.price ?? 0,
            payments: [{
                method: 'Cash',
                currency: agent.currency ?? 'LKR',
                amount: 0,
                notes: [{ amount: '', count: '', currency: agent.currency ?? 'LKR' }],
            }],
        });

        const existingCust = agent.customers?.length ? agent.customers[agent.customers.length - 1] : (agent.customer || null);
        if (existingCust?.id) {
            setCreatedCustomerId(existingCust.id);
            setPaymentEnabledAgentId(agent.id);
            if (existingCust.invoice_path) {
                setInvoicePath(existingCust.invoice_path);
                setVehicleEnabledAgentId(agent.id);
            }
        } else {
            setCreatedCustomerId(null);
            setInvoicePath(null);
        }
    };

    const [processingAgentId, setProcessingAgentId] = useState(null);

    // Is a specific agent locked by another staff member?
    const isAgentLockedByOther = (agent) => {
        return Boolean(agent.processing_by && String(agent.processing_by) !== String(currentUserId));
    };

    const openModal = (agent, tab = 'customer') => {
        if (isAgentLockedByOther(agent)) {
            alert(`This customer is already being processed by ${agent.processor?.name || 'another staff member'}.`);
            return;
        }

        const isNewAgent = selectedAgent?.id !== agent.id;

        setSelectedAgent(agent);
        setProcessingAgentId(agent.id);

        // Lock customer in database immediately for all users
        router.post('/counter/lock-customer', { agent_id: agent.id }, {
            preserveState: true,
            preserveScroll: true,
        });

        if (tab === 'customer' || isNewAgent) {
            resetCustomerForm(agent);
        }

        setActiveTab(tab);
        setShowModal(true);
    };

    const closeModal = () => {
        const agentToUnlockId = selectedAgent?.id || processingAgentId;
        setShowModal(false);
        setProcessingAgentId(null);
        setSelectedAgent(null);

        // Unlock customer in database immediately for all users
        router.post('/counter/unlock-customer', { agent_id: agentToUnlockId }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const saveCustomer = (e) => {
        e.preventDefault();

        customerForm.post('/customers', {
            preserveScroll: true,
            preserveState: true,
            onSuccess: (page) => {
                const id = page.props.createdCustomerId || page.props.flash?.created_customer_id || selectedAgent?.customers?.[selectedAgent.customers.length - 1]?.id;

                if (id) {
                    setCreatedCustomerId(id);
                }
                setPaymentEnabledAgentId(selectedAgent.id);
                setActiveTab('payment');
            },
        });
    };

    const nextInLineVehicle = getNextInLineVehicle(vehicles, ongoingTrips, lastReorderedAt);
    const nextInLineSlotNumber = getVehicleSlotNumber(nextInLineVehicle);

    const isVehicleOnTrip = (v) => {
        if (!v?.driver) return false;
        const driverId = v.driver.id;
        if (v.driver.duty_status === 'on_trip') return true;
        if (v.driver.trips && v.driver.trips.length > 0) return true;
        if (ongoingTrips && ongoingTrips.some(t => t.driver_id === driverId || t.driver?.id === driverId)) return true;
        return false;
    };

    const activeSessions = vehicles.map(v => v.driver?.session_id).filter(s => s !== null && s !== undefined && s > 0);
    const baseSessionId = activeSessions.length > 0 ? Math.min(...activeSessions) : 1;

    const waitingQueueVehicles = useMemo(() => {
        const list = [];
        vehicles.forEach((v) => {
            const reg = v.driver?.registration_number ?? v.registration_number ?? '';
            const match = reg.match(/\d+/);
            const num = match ? parseInt(match[0], 10) : NaN;

            const sid = v.driver?.session_id ?? null;
            if (sid !== null && sid > baseSessionId) {
                list.push({ vehicle: v, originalSlot: num, sessionId: sid });
            }
        });

        return list.sort((a, b) => {
            const slotA = !isNaN(a.originalSlot) ? a.originalSlot : 999;
            const slotB = !isNaN(b.originalSlot) ? b.originalSlot : 999;
            if (slotA !== slotB) {
                return slotA - slotB;
            }
            return (a.sessionId || 0) - (b.sessionId || 0);
        });
    }, [vehicles, baseSessionId, ongoingTrips]);

    const hasCheckedInCurrentQueue = vehicles.some(v => (v.driver?.session_id || 0) <= baseSessionId && v.driver?.duty_status === 'on_duty' && !isVehicleOnTrip(v));

    return (
        <>
            <Head title="Counter" />

            <div className="min-h-screen bg-gray-100 p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Counter</h1>
                        <p className="text-gray-500 mt-1">Airport counter customer handling</p>
                    </div>

                    <div className="flex gap-3 items-center">
                        <div className="flex items-center mr-2">
                            <span className="flex items-center text-[13px] font-medium text-gray-500 bg-white px-3 py-2 rounded-l-lg shadow-sm border border-gray-200 border-r-0">
                                <Clock size={15} className="mr-1.5 text-gray-400" /> 
                                Last updated: {lastUpdated}
                            </span>
                            <button 
                                type="button"
                                onClick={() => router.reload({ only: ['vehicles', 'pendingAgents', 'ongoingTrips', 'myTrips', 'lastReorderedAt'], onSuccess: () => setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) })}
                                className="flex items-center text-[13px] font-medium text-gray-600 bg-white px-3 py-2 rounded-r-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                <RefreshCw size={14} className="mr-1.5 text-gray-500" />
                                Refresh
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowShortTripsModal(true)}
                            className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-300 text-amber-900 px-3.5 py-2 rounded-lg hover:bg-amber-100 font-semibold text-xs transition shadow-sm"
                            title="View all Short Tours and who gave them"
                        >
                            <span>⚡ Short Tours</span>
                            <span className="bg-amber-500 text-white font-black text-[10px] px-1.5 py-0.2 rounded-full">
                                {shortTrips.length}
                            </span>
                        </button>
                        <style>{`@keyframes blink-checkout { 0%, 100% { outline: 2px solid #dc2626; outline-offset: 2px; } 50% { outline: 2px solid transparent; outline-offset: 2px; } }`}</style>
                        <button
                            type="button"
                            onClick={() => {
                                setCheckoutInput('');
                                setShowCheckoutConfirm(true);
                            }}
                            className="inline-flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 font-semibold"
                            style={{ animation: 'blink-checkout 1.2s ease-in-out infinite' }}
                        >
                            🛑 Checkout
                        </button>
                        <Link href="/dashboard" className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-slate-800" >
                            <ArrowLeft size={18} />
                            Back
                        </Link>
                    </div>
                </div>

                <Section title="Pending Customers" icon={<Users className="text-blue-700" size={22} />}>
                    {pendingAgents.length ? (
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {pendingAgents.map((agent) => {
                                const lockedByOther = isAgentLockedByOther(agent);
                                const lockedByName = lockedByOther ? (agent.processor?.name || 'Staff') : null;
                                const isThisCardDisabled = lockedByOther || (showModal && selectedAgent?.id === agent.id) || (processingAgentId === agent.id);

                                return (
                                    <CustomerCard 
                                        key={agent.id} 
                                        agent={agent} 
                                        onOpen={openModal} 
                                        paymentEnabled={paymentEnabledAgentId === agent.id} 
                                        vehicleEnabled={vehicleEnabledAgentId === agent.id} 
                                        isCustomerDisabled={isThisCardDisabled}
                                        isLockedByOther={lockedByOther}
                                        lockedByName={lockedByName}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <Empty text="No pending customers found." />
                    )}
                </Section>

                <Section 
                    title={
                        <div className="flex items-center gap-3">
                            <span>Vehicles Checked In ({vehicles.filter(v => v.driver?.duty_status === 'on_duty').length} On Duty / {vehicles.length} Registered)</span>
                            <button 
                                type="button"
                                onClick={() => router.reload({ only: ['vehicles', 'pendingAgents', 'ongoingTrips', 'myTrips', 'lastReorderedAt'], onSuccess: () => setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) })}
                                className="p-1.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-lg shadow-sm transition flex items-center"
                                title="Refresh Data"
                            >
                                <RefreshCw size={14} className="opacity-75" />
                            </button>
                        </div>
                    } 
                    icon={<CarFront className="text-green-700" size={22} />}
                >
                    <div className="flex gap-4 items-start">
                        {/* Left Side: Next In Line Square Card */}
                        <div className="flex flex-col gap-2 shrink-0">
                            <div 
                                className="w-[180px] h-[180px] border border-emerald-200 rounded-xl bg-emerald-50/50 flex flex-col items-center justify-between p-4 shadow-sm relative overflow-hidden cursor-pointer hover:bg-emerald-100/60 transition"
                                onClick={() => nextInLineVehicle && setSelectedVehicle({ ...nextInLineVehicle, _slotNumber: nextInLineSlotNumber })}
                                title={nextInLineVehicle ? "Click to view next vehicle details" : ""}
                            >
                                {/* Decorative badge */}
                                <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg tracking-wider uppercase">
                                    Next
                                </div>
                                
                                <div className="text-center w-full mt-2">
                                    <span className="text-[11px] uppercase tracking-wider text-emerald-800 font-bold block mb-1">
                                        Next In Line
                                    </span>
                                    <div className="h-[1px] w-8 bg-emerald-200 mx-auto"></div>
                                </div>

                                {nextInLineVehicle ? (
                                    <>
                                        <div className="text-5xl font-black text-emerald-700 my-1.5">
                                            {nextInLineSlotNumber ?? '-'}
                                        </div>
                                        <div className="text-center w-full min-w-0">
                                            <p className="text-xs font-bold text-gray-800 truncate px-1">
                                                {nextInLineVehicle.driver?.first_name ?? 'Driver'}
                                            </p>
                                            <p className="text-[10px] text-gray-500 font-medium truncate">
                                                {nextInLineVehicle.registration_number ?? '-'}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center flex-1">
                                        <span className="text-3xl text-gray-300">--</span>
                                        <p className="text-[10px] text-gray-400 mt-1 font-medium text-center leading-tight">
                                            No on-duty vehicle queue
                                        </p>
                                    </div>
                                )}
                            </div>

                            {waitingQueueVehicles.length > 0 && (
                                <button 
                                    onClick={() => { setShowReorderModal(true); setReorderInput(''); }}
                                    disabled={hasCheckedInCurrentQueue}
                                    className={`w-full py-1.5 text-white text-xs font-bold rounded-lg shadow-sm transition ${hasCheckedInCurrentQueue ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                                    title={hasCheckedInCurrentQueue ? "Cannot reorder while there are checked-in drivers in the current queue" : "Reorder waiting queue drivers to current queue"}
                                >
                                    Reorder Queue
                                </button>
                            )}
                        </div>

                        <div className="flex-1">
                            <div className="max-h-[420px] overflow-y-auto pb-4 pr-2 space-y-4">
                                {(() => {
                                    const vehicleMap = {};

                                    vehicles.forEach((v) => {
                                        const reg = v.driver?.registration_number ?? v.registration_number ?? '';
                                        const match = reg.match(/\d+/);
                                        const num = match ? parseInt(match[0], 10) : NaN;
                                        if (!isNaN(num) && num >= 1 && num <= 95) {
                                            vehicleMap[num] = v;
                                        }
                                    });

                                    return (
                                        <>
                                            {/* Current Queue */}
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="bg-slate-700 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                                                        Current Queue
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {Array.from({ length: 95 }, (_, i) => {
                                                        const slotNum = i + 1;
                                                        const vehicle = vehicleMap[slotNum] ?? null;
                                                        if (!vehicle) return null; 
                                                        const isMoved = vehicle?.driver?.session_id > baseSessionId;
                                                        
                                                        return (
                                                            <VehicleSlot
                                                                key={`main-slot-${slotNum}`}
                                                                vehicle={vehicle}
                                                                number={slotNum}
                                                                selectedLanguageFilter={null}
                                                                selectedVehicleTypeFilter={null}
                                                                allVehicleTypes={[]}
                                                                isMovedToNextQueue={isMoved}
                                                                onClick={(v) => !isMoved && setSelectedVehicle(v ? { ...v, _slotNumber: slotNum } : null)}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Waiting Queue */}
                                            {waitingQueueVehicles.length > 0 && (
                                                <div className="mt-5 border-t border-gray-200 pt-4">
                                                    <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-2.5">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                                                                Waiting Queue
                                                            </span>
                                                            <span className="text-[10px] text-amber-700 font-medium">
                                                                {waitingQueueVehicles.length} driver{waitingQueueVehicles.length !== 1 ? 's' : ''} waiting
                                                            </span>
                                                        </div>
                                                        {(() => {
                                                            const vanItems = waitingQueueVehicles.filter(item => (item.vehicle?.vehicle_type ?? '').toLowerCase().includes('van'));
                                                            const carItems = waitingQueueVehicles.filter(item => !(item.vehicle?.vehicle_type ?? '').toLowerCase().includes('van'));
                                                            const hasBoth = carItems.length > 0 && vanItems.length > 0;
                                                            return (
                                                                <div className={`grid gap-2.5 items-start ${hasBoth ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                                                                    {carItems.length > 0 && (
                                                                        <div className="bg-white/70 rounded-lg p-2 border border-amber-200/70 shadow-2xs">
                                                                            <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-amber-100">
                                                                                <span className="text-[11px]">🚗</span>
                                                                                <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Car ({carItems.length})</span>
                                                                            </div>
                                                                            <div className="flex flex-wrap gap-1.5">
                                                                                {carItems.map((item) => (
                                                                                    <VehicleSlot
                                                                                        key={`waiting-car-${item.vehicle.id ?? item.originalSlot}-${item.sessionId}`}
                                                                                        vehicle={item.vehicle}
                                                                                        number={item.originalSlot}
                                                                                        selectedLanguageFilter={null}
                                                                                        selectedVehicleTypeFilter={null}
                                                                                        allVehicleTypes={[]}
                                                                                        onClick={(v) => setSelectedVehicle(v ? { ...v, _slotNumber: item.originalSlot } : null)}
                                                                                    />
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {vanItems.length > 0 && (
                                                                        <div className="bg-white/70 rounded-lg p-2 border border-amber-200/70 shadow-2xs">
                                                                            <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-amber-100">
                                                                                <span className="text-[11px]">🚐</span>
                                                                                <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Van ({vanItems.length})</span>
                                                                            </div>
                                                                            <div className="flex flex-wrap gap-1.5">
                                                                                {vanItems.map((item) => (
                                                                                    <VehicleSlot
                                                                                        key={`waiting-van-${item.vehicle.id ?? item.originalSlot}-${item.sessionId}`}
                                                                                        vehicle={item.vehicle}
                                                                                        number={item.originalSlot}
                                                                                        selectedLanguageFilter={null}
                                                                                        selectedVehicleTypeFilter={null}
                                                                                        allVehicleTypes={[]}
                                                                                        onClick={(v) => setSelectedVehicle(v ? { ...v, _slotNumber: item.originalSlot } : null)}
                                                                                    />
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Right Side: Vehicle Details Side Panel */}
                        <div className="w-[280px] shrink-0 border border-gray-200 rounded-xl bg-gray-50 flex flex-col shadow-sm max-h-[420px] overflow-hidden">
                            {selectedVehicle ? (
                                <div className="flex flex-col h-full">
                                    {/* Image Header */}
                                    <div className="relative h-[200px] w-full bg-gray-200 shrink-0 rounded-t-xl overflow-hidden">
                                        {/* Slot Number - Top Left */}
                                        <div className="absolute top-2 left-2 bg-blue-700 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full z-10 shadow-lg border border-blue-500">
                                            Slot {selectedVehicle._slotNumber}
                                        </div>

                                        {/* Languages - Top Right */}
                                        <div className="absolute top-2 right-2 flex flex-wrap gap-1 z-10 justify-end max-w-[150px]">
                                            {selectedVehicle.driver?.languages?.map((l) => (
                                                <LanguageBadge key={l.id || l.language_name} language={l.language_name} size="sm" />
                                            ))}
                                        </div>

                                        <ImageBox
                                            path={selectedVehicle.pictures?.front_view ?? selectedVehicle.front_view}
                                            className="w-full h-full object-cover"
                                        />

                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none"></div>

                                        {/* Content overlaid on image */}
                                        <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between gap-2 pointer-events-none">
                                            
                                            {/* Driver & Reg Details */}
                                            <div className="text-white pl-1 drop-shadow-md flex-1 min-w-0">
                                                <p className="text-[14px] font-bold leading-tight truncate">
                                                    {(selectedVehicle.driver?.first_name ?? '') || 'Driver'}
                                                </p>
                                                <p className="text-[11px] text-gray-200 font-medium flex items-center gap-1.5 mt-0.5">
                                                    <span className="truncate">{selectedVehicle.driver?.mobile_number ?? '-'}</span>
                                                    {/* <span className="opacity-50">|</span>
                                                    <span className="text-yellow-300 font-bold tracking-wide">{selectedVehicle.registration_number ?? '-'}</span> */}
                                                </p>
                                                <p className="text-[11px] text-gray-200 font-medium flex items-center gap-1.5 mt-0.5">
                                                    {/* <span className="truncate">{selectedVehicle.driver?.mobile_number ?? '-'}</span>
                                                    <span className="opacity-50">|</span> */}
                                                    <span className="text-yellow-300 font-bold tracking-wide">{selectedVehicle.registration_number ?? '-'}</span>
                                                </p>
                                            </div>

                                            {/* Vehicle Info Transparent Card */}
                                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-1.5 text-white shadow-sm shrink-0 min-w-[110px]">
                                                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px]">
                                                    <div>
                                                        {/* <span className="opacity-70 text-[8px] uppercase tracking-wider block">Type</span> */}
                                                        <div className="font-bold truncate" title={selectedVehicle.vehicle_type}>{selectedVehicle.vehicle_type ?? '-'}</div>
                                                    </div>
                                                    <div>
                                                        {/* <span className="opacity-70 text-[8px] uppercase tracking-wider block">Model</span> */}
                                                        <div className="font-bold truncate" title={`${selectedVehicle.brand ?? '-'} ${selectedVehicle.model ?? ''}`}>
                                                            {selectedVehicle.brand ?? '-'} {selectedVehicle.model ?? ''}
                                                        </div>
                                                    </div>
                                                    <div className="col-span-2 border-t border-white/20 pt-1 mt-0.5 flex justify-between items-center">
                                                        <div className="flex items-center gap-1">
                                                            <span title="Passengers">👥</span>
                                                            <span className="font-bold">: {selectedVehicle.seating_capacity ?? '-'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span title="Luggage">🧳</span>
                                                            <span className="font-bold">: {selectedVehicle.luggage_capacity ?? '-'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gray-400">
                                    <Car size={32} className="mb-2 opacity-50" />
                                    <p className="text-xs font-medium">No Vehicle Selected</p>
                                    <p className="text-[10px] mt-1">Click a slot from the grid on the left to view details</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Section>

                <Section
                    title={
                        <div className="flex flex-wrap items-center gap-3">
                            <span>Tours</span>

                            <div className="flex flex-wrap items-center gap-4 text-[11px]">
                                <div className="flex items-center gap-1">
                                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                    <span>Assigned</span>
                                </div>

                                <div className="flex items-center gap-1">
                                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                                    <span>Accepted</span>
                                </div>

                                <div className="flex items-center gap-1">
                                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                    <span>In Progress</span>
                                </div>

                                <div className="flex items-center gap-1">
                                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                    <span>Completed</span>
                                </div>
                            </div>
                        </div>
                    }
                    icon={<Car className="text-orange-700" size={22} />}
                    actions={
                        <Link href="/trips" className="ml-auto bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700" >
                            View Tours
                        </Link>
                    }
                >
                    {ongoingTrips.length ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                            {ongoingTrips.map((trip) => (
                                <TripCard key={trip.id} trip={trip} />
                            ))}
                        </div>
                    ) : (
                        <Empty text="No ongoing tours found." />
                    )}
                </Section>

                {/* ── My Trips ── */}
                <Section
                    title={
                        <div className="flex items-center gap-3">
                            <span>My Tours</span>
                            <span className="bg-slate-700 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                                {myTrips.length}
                            </span>
                        </div>
                    }
                    icon={<ClipboardList className="text-slate-700" size={22} />}
                    actions={
                        myTrips.length > 0 && (
                            <input
                                type="text"
                                placeholder="Search my tours..."
                                className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm w-64 focus:ring-1 focus:ring-slate-400 focus:border-slate-400 font-normal"
                                value={searchMyTrips}
                                onChange={(e) => setSearchMyTrips(e.target.value)}
                            />
                        )
                    }
                >
                    {myTrips.length ? (
                        <div className="border border-slate-200 rounded-lg overflow-hidden shadow-xs">
                            <DataTable
                                columns={[
                                    {
                                        name: 'Trip #',
                                        selector: row => row.id,
                                        sortable: true,
                                        width: '100px',
                                        cell: row => (
                                            <div className="py-1">
                                                <span className="font-bold text-slate-900">#{row.id}</span>
                                                {row.is_short_trip ? (
                                                    <span className="block mt-0.5 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded px-1 py-0.5 text-center leading-tight">
                                                        ⚡ Short
                                                    </span>
                                                ) : null}
                                            </div>
                                        ),
                                    },
                                    {
                                        name: 'Driver',
                                        selector: row => (row.driver?.first_name || row.driver?.last_name) ? `${row.driver?.first_name ?? ''} ${row.driver?.last_name ?? ''}`.trim() : '-',
                                        sortable: true,
                                        cell: row => {
                                            const driverName = (row.driver?.first_name || row.driver?.last_name)
                                                ? `${row.driver?.first_name ?? ''} ${row.driver?.last_name ?? ''}`.trim()
                                                : '-';
                                            return (
                                                <div className="py-1">
                                                    <div className="font-medium text-slate-800">{driverName}</div>
                                                    <div className="text-[10px] text-slate-500">{row.driver?.mobile_number ?? '-'}</div>
                                                </div>
                                            );
                                        },
                                    },
                                    {
                                        name: 'Vehicle',
                                        selector: row => row.driver?.vehicle?.registration_number ?? '-',
                                        sortable: true,
                                        width: '130px',
                                        cell: row => (
                                            <span className="font-mono text-[11px] font-semibold text-slate-700">
                                                {row.driver?.vehicle?.registration_number ?? '-'}
                                            </span>
                                        ),
                                    },
                                    {
                                        name: 'Customer',
                                        selector: row => row.customer?.name ?? '-',
                                        sortable: true,
                                        cell: row => (
                                            <div className="py-1">
                                                <div className="font-medium text-slate-800">{row.customer?.name ?? '-'}</div>
                                                <div className="text-[10px] text-slate-500">{row.customer?.customer_code ?? ''}</div>
                                            </div>
                                        ),
                                    },
                                    {
                                        name: 'Assigned At',
                                        selector: row => row.trip_assigned_at ?? '',
                                        sortable: true,
                                        cell: row => (
                                            <span className="text-slate-600 whitespace-nowrap text-[11px]">
                                                {row.trip_assigned_at ? new Date(row.trip_assigned_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}
                                            </span>
                                        ),
                                    },
                                    {
                                        name: 'Total',
                                        selector: row => Number(row.trip_finance?.total_amount ?? 0),
                                        sortable: true,
                                        right: true,
                                        cell: row => (
                                            <span className="font-semibold text-slate-800 whitespace-nowrap">
                                                LKR {Math.round(Number(row.trip_finance?.total_amount ?? 0)).toLocaleString()}
                                            </span>
                                        ),
                                    },
                                    {
                                        name: 'Status',
                                        selector: row => row.status ?? '',
                                        sortable: true,
                                        center: true,
                                        cell: row => {
                                            const status = row.status ?? 'Unknown';
                                            const badgeCls = {
                                                Assigned: 'bg-red-100 text-red-700 border-red-200',
                                                Accepted: 'bg-amber-100 text-amber-700 border-amber-200',
                                                In_Progress: 'bg-blue-100 text-blue-700 border-blue-200',
                                                Completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                                                Cancelled: 'bg-gray-100 text-gray-700 border-gray-200',
                                            }[status] ?? 'bg-slate-100 text-slate-700 border-slate-200';

                                            return (
                                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeCls}`}>
                                                    {status}
                                                </span>
                                            );
                                        },
                                    },
                                ]}
                                data={filteredMyTrips}
                                pagination
                                paginationPerPage={10}
                                paginationRowsPerPageOptions={[10, 20, 50, 100]}
                                highlightOnHover
                                striped
                                responsive
                                customStyles={{
                                    headCells: {
                                        style: {
                                            fontWeight: 700,
                                            backgroundColor: '#f1f5f9',
                                            color: '#1e293b',
                                            fontSize: '11px',
                                            textTransform: 'uppercase',
                                        },
                                    },
                                    rows: {
                                        style: {
                                            minHeight: '48px',
                                        },
                                    },
                                }}
                            />
                        </div>
                    ) : (
                        <Empty text="You haven't assigned any tours yet." />
                    )}
                </Section>

            </div>

            {showModal && selectedAgent && (
                <Modal activeTab={activeTab} setActiveTab={setActiveTab} agent={selectedAgent} customerForm={customerForm} paymentForm={paymentForm} saveCustomer={saveCustomer} customerId={createdCustomerId} invoicePath={invoicePath} setInvoicePath={setInvoicePath} vehicles={vehicles} ongoingTrips={ongoingTrips} countries={countries} setVehicleEnabledAgentId={setVehicleEnabledAgentId} onClose={closeModal} rateSetting={rateSetting} locationVehiclePrices={locationVehiclePrices} vehicleRates={vehicleRates} eurRates={eurRates} dbLanguages={dbLanguages} lastReorderedAt={lastReorderedAt} pettyCash={pettyCash} shortTrips={shortTrips} />
            )}

            {showCheckoutConfirm && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Confirm Checkout</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Are you sure you want to checkout and end your current shift? This will summarize your shift tours and take you to the handover page.
                        </p>

                        <div className="mb-5">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                Please type <span className="font-bold select-none text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">CHECKOUT</span> to confirm:
                            </label>
                            <input
                                type="text"
                                placeholder="Type CHECKOUT..."
                                value={checkoutInput}
                                onChange={(e) => setCheckoutInput(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 mt-1"
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowCheckoutConfirm(false)}
                                className="px-4 py-2 border rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            {checkoutInput.trim().toUpperCase() !== 'CHECKOUT' ? (
                                <button
                                    disabled
                                    className="px-4 py-2 bg-red-300 text-white rounded-lg text-sm font-semibold cursor-not-allowed opacity-75"
                                >
                                    Confirm Checkout
                                </button>
                            ) : (
                                <Link
                                    href="/counter/checkout"
                                    method="post"
                                    as="button"
                                    onClick={() => setShowCheckoutConfirm(false)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition"
                                >
                                    Confirm Checkout
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {showReorderModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Reorder Queue</h2>
                            <button onClick={() => setShowReorderModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Move waiting queue drivers into the current queue.
                        </p>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Type <strong>REORDER</strong> to confirm
                            </label>
                            <input
                                type="text"
                                value={reorderInput}
                                onChange={e => setReorderInput(e.target.value)}
                                onPaste={e => e.preventDefault()}
                                onCopy={e => e.preventDefault()}
                                placeholder="REORDER"
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm select-none"
                                autoComplete="off"
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowReorderModal(false)}
                                className="px-4 py-2 border rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setReorderSaving(true);
                                    router.post('/counter/reorder-session', {
                                        driver_ids: waitingQueueVehicles.map(item => item.vehicle.driver?.id).filter(Boolean),
                                        target_session: baseSessionId
                                    }, {
                                        preserveState: true,
                                        preserveScroll: true,
                                        onFinish: () => {
                                            setReorderSaving(false);
                                            setShowReorderModal(false);
                                        }
                                    });
                                }}
                                disabled={reorderSaving || waitingQueueVehicles.length === 0 || reorderInput.trim().toUpperCase() !== 'REORDER'}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                            >
                                {reorderSaving ? 'Saving...' : 'Save Reorder'}
                            </button>
                        </div>
                    </div>
                </div>
            )}



            {/* Short Trips Audit Log Modal */}
            {showShortTripsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
                        <div className="p-5 bg-gradient-to-r from-amber-600 to-orange-600 text-white flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <span className="text-2xl">⚡</span>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">Short Tours Log & Queue Audit</h3>
                                    <p className="text-xs text-white/80">
                                        Track authorized short tours, assignees, and queue placement outcomes
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowShortTripsModal(false)}
                                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center text-lg transition"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-5 flex-1 overflow-y-auto">
                            {shortTrips && shortTrips.length > 0 ? (
                                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider font-semibold text-[10px]">
                                            <tr>
                                                <th className="py-2.5 px-3">Tour #</th>
                                                <th className="py-2.5 px-3">Driver & Vehicle</th>
                                                <th className="py-2.5 px-3">Orig Queue</th>
                                                <th className="py-2.5 px-3">Assigned By</th>
                                                <th className="py-2.5 px-3">Assigned At</th>
                                                <th className="py-2.5 px-3">Status</th>
                                                <th className="py-2.5 px-3">Queue Result</th>
                                                <th className="py-2.5 px-3">Checked In By</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {shortTrips.map((st) => {
                                                const driverName = st.driver ? `${st.driver.first_name || ''} ${st.driver.last_name || ''}`.trim() : '-';
                                                const assignedByName = st.assigned_by?.name ?? `User #${st.assigned_by_id ?? '-'}`;
                                                const checkedInByName = st.checked_in_by?.name ?? (st.checked_in_by_id ? `User #${st.checked_in_by_id}` : '-');
                                                
                                                return (
                                                    <tr key={st.id} className="hover:bg-slate-50/80 transition">
                                                        <td className="py-2.5 px-3 font-bold text-slate-900">
                                                            #{st.trip_id}
                                                        </td>
                                                        <td className="py-2.5 px-3">
                                                            <div className="font-semibold text-slate-800">{driverName}</div>
                                                            <div className="font-mono text-[10px] text-slate-500">
                                                                {st.driver?.vehicle?.registration_number ?? '-'}
                                                            </div>
                                                        </td>
                                                        <td className="py-2.5 px-3 text-slate-700">
                                                            <span className="font-medium">Session #{st.session_id}</span>
                                                            <span className="block text-[10px] text-slate-400">Slot {st.slot_number ?? '-'}</span>
                                                        </td>
                                                        <td className="py-2.5 px-3 text-slate-700">
                                                            <span className="font-medium">{assignedByName}</span>
                                                        </td>
                                                        <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                                                            {st.assigned_at ? new Date(st.assigned_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}
                                                        </td>
                                                        <td className="py-2.5 px-3">
                                                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                                st.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                                                                st.status === 'cancelled' ? 'bg-gray-100 text-gray-700' :
                                                                'bg-amber-100 text-amber-800'
                                                            }`}>
                                                                {st.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-2.5 px-3">
                                                            {st.queue_result === 'same_queue' ? (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                                    <span>✓</span> Same Queue
                                                                </span>
                                                            ) : st.queue_result === 'next_queue' ? (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                                                                    <span>→</span> Next Queue
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-400 italic text-[11px]">Pending Return</span>
                                                            )}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-slate-700">
                                                            <div>{checkedInByName}</div>
                                                            {st.checked_in_at && (
                                                                <div className="text-[10px] text-slate-400 whitespace-nowrap">
                                                                    {new Date(st.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-slate-400">
                                    <span className="text-4xl block mb-2">⚡</span>
                                    <p className="font-semibold text-slate-600">No short tours recorded yet</p>
                                    <p className="text-xs text-slate-400 mt-1">Short tours assigned at the counter will appear here with full audit history.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-xs text-slate-500">
                                Showing recent short tours (Max 1 short tour per driver per session)
                            </span>
                            <button
                                type="button"
                                onClick={() => setShowShortTripsModal(false)}
                                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function CustomerCard({ agent, onOpen, paymentEnabled, vehicleEnabled, isCustomerDisabled, isLockedByOther, lockedByName }) {
    const isPaymentActive = paymentEnabled || Boolean(agent.customers?.length > 0);
    const isVehicleActive = vehicleEnabled || Boolean(agent.customers?.some(c => c.invoice_path));

    return (
        <div className="min-w-[280px] border rounded-lg bg-gray-50 p-3 shadow-sm">
            <h3 className="flex justify-between font-semibold text-sm">
                <span className="truncate">{agent.name ?? 'Customer'}</span>
                {agent.distance_km != null && agent.distance_km !== '' && (
                    <span className="text-red-600 font-bold">{agent.distance_km} KM</span>
                )}
            </h3>

            <div className="flex items-center justify-between gap-2 mt-1">
                <p className="text-xs text-gray-600 truncate flex-1 min-w-0">
                    {agent.passenger_count ?? 0} Pax : {agent.luggage_count ?? 0} Luggage : {agent.dropoff_location ?? '-'}
                </p>
                {agent.booking_type && (
                    <span className="shrink-0 text-[10px] bg-blue-50 text-black-900 px-1.5 py-0.5 rounded font-medium border border-blue-100 uppercase tracking-wide">
                        {agent.booking_type}
                    </span>
                )}
            </div>

            <div className="flex gap-1 mt-3">
                <CardButton 
                    color="blue" 
                    disabled={isCustomerDisabled} 
                    onClick={() => onOpen(agent, 'customer')} 
                    icon={<UserPlus size={13} />}
                    title={isLockedByOther ? `Being processed by ${lockedByName}` : (isCustomerDisabled ? 'A customer is currently being processed' : 'Process Customer')}
                >
                    {isLockedByOther ? `In Process (${lockedByName})` : 'Customer'}
                </CardButton>

                <CardButton color="blue" disabled={true} icon={<CreditCard size={13} />} >
                    Payment
                </CardButton>

                {agent.booking_type !== 'Rent a Car' && (
                    <CardButton color="blue" disabled={true} icon={<Car size={13} />} >
                        Vehicle
                    </CardButton>
                )}
            </div>
        </div>
    );
}

function Modal({
    activeTab,
    setActiveTab,
    agent,
    customerForm,
    paymentForm,
    saveCustomer,
    customerId,
    invoicePath,
    setInvoicePath,
    vehicles,
    ongoingTrips = [],
    setVehicleEnabledAgentId,
    onClose,
    countries,
    rateSetting,
    locationVehiclePrices = [],
    vehicleRates = [],
    eurRates,
    dbLanguages = [],
    lastReorderedAt = null,
    pettyCash = 0,
    shortTrips = [],
}) {
    const effectiveCustomerId = customerId || agent?.customers?.[agent.customers.length - 1]?.id || agent?.customer?.id || null;
    const effectiveInvoicePath = invoicePath || agent?.customers?.[agent.customers.length - 1]?.invoice_path || null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-bold">Pending Customer Process</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex border-b">
                    <TabButton active={activeTab === 'customer'} onClick={() => setActiveTab('customer')}>
                        Customer
                    </TabButton>

                    <TabButton active={activeTab === 'payment'} disabled={!effectiveCustomerId} onClick={() => setActiveTab('payment')} >
                        Payment
                    </TabButton>

                    {agent.booking_type !== 'Rent a Car' ? (
                        <TabButton active={activeTab === 'vehicle'} disabled={!effectiveCustomerId} onClick={() => setActiveTab('vehicle')} >
                            Vehicle
                        </TabButton>
                    ) : (
                        <TabButton active={activeTab === 'rent_a_car_vehicle'} disabled={!effectiveCustomerId} onClick={() => setActiveTab('rent_a_car_vehicle')} >
                            External Vehicles
                        </TabButton>
                    )}
                </div>

                <div className="p-4 min-h-[500px]">
                    <div className={activeTab === 'customer' ? '' : 'hidden'}>
                        <CustomerTab agent={agent} countries={countries} form={customerForm} onSubmit={saveCustomer} eurRates={eurRates} dbLanguages={dbLanguages} onClose={onClose} />
                    </div>

                    <div className={activeTab === 'payment' ? '' : 'hidden'}>
                        {effectiveCustomerId && (
                            <PaymentTab agent={agent} customerId={effectiveCustomerId} form={paymentForm} invoicePath={effectiveInvoicePath} setInvoicePath={setInvoicePath} setActiveTab={setActiveTab} setVehicleEnabledAgentId={setVehicleEnabledAgentId} onClose={onClose} pettyCash={pettyCash} eurRates={eurRates} />
                        )}
                    </div>

                    {agent.booking_type !== 'Rent a Car' ? (
                        <div className={activeTab === 'vehicle' ? '' : 'hidden'}>
                            <VehicleTab vehicles={vehicles} ongoingTrips={ongoingTrips} customerId={effectiveCustomerId} agent={agent} onClose={onClose} rateSetting={rateSetting} paymentForm={paymentForm} locationVehiclePrices={locationVehiclePrices} vehicleRates={vehicleRates} eurRates={eurRates} dbLanguages={dbLanguages} customerForm={customerForm} invoicePath={effectiveInvoicePath} lastReorderedAt={lastReorderedAt} shortTrips={shortTrips} />
                        </div>
                    ) : (
                        <div className={activeTab === 'rent_a_car_vehicle' ? '' : 'hidden'}>
                            <RentACarVehicleTab agent={agent} customerId={effectiveCustomerId} onClose={onClose} invoicePath={effectiveInvoicePath} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function CustomerTab({ agent, form, onSubmit, countries, eurRates, dbLanguages = [], onClose }) {
    return (
        <form onSubmit={onSubmit} className="space-y-5">
            <div className="rounded-lg bg-slate-50 border p-4 flex gap-4">
                <ImageBox path={agent.customer_passport} className="w-32 h-24" />
                <div className="text-sm">
                    <p className="font-bold">Agent : {agent.user?.name ?? '-'}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="font-bold text-red-900">
                            Price : {agent.currency ?? 'USD'} {Number(agent.price ?? 0).toLocaleString()}
                        </span>
                        {(() => {
                            const lkrVal = formatToLkrString(agent.price, agent.currency, eurRates);
                            return lkrVal ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                                    ≈ {lkrVal}
                                </span>
                            ) : null;
                        })()}
                    </div>
                    <p className="text-gray-500 mt-1">Dropoff : {agent.dropoff_location ?? '-'}</p>
                    <p className="text-gray-500">Remarks : {agent.remarks ?? '-'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                <Field label="Customer Name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} error={form.errors.name} />
                <Field label="Email" type="email" placeholder="Enter Email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} error={form.errors.email} />
                <Field label="WhatsApp" type="tel" pattern="^\+?[0-9]{7,15}$" placeholder="Enter WhatsApp Number" value={form.data.whatsapp_number} onChange={(e) => { const val = e.target.value.replace(/[^0-9+]/g, ''); form.setData('whatsapp_number', val); }} error={form.errors.whatsapp_number} />
                <div>
                    <label className="label">Country</label>

                    <input
                        type="text"
                        list="countries-list"
                        className="input"
                        value={form.data.country || ''}
                        onChange={(e) => form.setData('country', e.target.value)}
                        placeholder="Search country..."
                    />

                    <datalist id="countries-list">
                        {countries.map((country) => (
                            <option
                                key={country.id}
                                value={country.country_name}
                            />
                        ))}
                    </datalist>

                    {form.errors.country && (
                        <p className="text-red-600 text-sm mt-1">
                            {form.errors.country}
                        </p>
                    )}
                </div>
                <Field label="Dropoff Location" value={form.data.dropoff_location} onChange={(e) => form.setData('dropoff_location', e.target.value)} error={form.errors.dropoff_location} />
                <Field label="Passenger Count" type="number" value={form.data.passenger_count} onChange={(e) => form.setData('passenger_count', e.target.value)} error={form.errors.passenger_count} />
                <Field label="Luggage Count" type="number" value={form.data.luggage_count} onChange={(e) => form.setData('luggage_count', e.target.value)} error={form.errors.luggage_count} />

                <div>
                    <label className="label">Language Preference</label>

                    <input
                        type="text"
                        list="language-list"
                        className="input"
                        value={form.data.language_preference || ''}
                        onChange={(e) =>
                            form.setData('language_preference', e.target.value)
                        }
                        placeholder="Select or type language"
                    />

                    <datalist id="language-list">
                        {(dbLanguages || []).map((lang) => (
                            <option key={lang} value={lang} />
                        ))}
                    </datalist>
                </div>
            </div>

            <div>
                <label className="label">Remarks</label>
                <textarea className="input" rows="2" value={form.data.remarks} onChange={(e) => form.setData('remarks', e.target.value)} />
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 bg-white hover:bg-gray-50 transition"
                >
                    Cancel
                </button>
                <button 
                    disabled={form.processing || !form.data.name?.trim() || !form.data.email?.trim() || !form.data.whatsapp_number?.trim()} 
                    className="bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold disabled:opacity-50"
                >
                    {form.processing ? 'Saving...' : 'Save Customer & Continue'}
                </button>
            </div>
        </form>
    );
}

function PaymentTab({
    agent, customerId, form, invoicePath,
    setInvoicePath, setActiveTab, setVehicleEnabledAgentId, onClose, pettyCash = 0, eurRates
}) {
    const CURRENCIES = useMemo(() => {
        const defaultCurrencies = ['LKR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'INR', 'AED', 'CNY', 'JPY'];
        if (!eurRates) return defaultCurrencies;
        const apiKeys = Object.keys(eurRates).map(c => c.toUpperCase()).sort();
        return Array.from(new Set([...defaultCurrencies, ...apiKeys]));
    }, [eurRates]);

    const payments = form.data.payments ?? [];

    const methodNativeAmount = (p) => {
        if (p.method !== 'Cash') {
            return Number(p.amount || 0);
        }
        return (p.notes ?? []).reduce((total, note) => {
            return total + (Number(note.amount || 0) * Number(note.count || 0));
        }, 0);
    };

    const methodConvertedAmount = (p, targetCurrency, rates) => {
        if (p.method !== 'Cash') {
            const payCur = p.currency ?? targetCurrency;
            return convertCurrencyAmount(p.amount || 0, payCur, targetCurrency, rates);
        }
        return (p.notes ?? []).reduce((total, note) => {
            const noteCur = note.currency ?? p.currency ?? targetCurrency;
            const noteVal = Number(note.amount || 0) * Number(note.count || 0);
            return total + convertCurrencyAmount(noteVal, noteCur, targetCurrency, rates);
        }, 0);
    };

    const grandTotal = payments.reduce((s, p) => s + methodConvertedAmount(p, form.data.currency, eurRates), 0);
    const price = Number(form.data.price || 0);
    const balanced = Number(grandTotal.toFixed(2)) >= Number(price.toFixed(2));
    const canSubmit = !form.processing && balanced && payments.length > 0;

    const setPayments = (next) => form.setData('payments', next);

    const updatePayment = (i, key, val) => {
        const next = [...payments];
        next[i] = { ...next[i], [key]: val };
        setPayments(next);
    };

    const changeMethod = (i, method) => {
        const next = [...payments];
        const currency = next[i].currency ?? form.data.currency;
        next[i] = method === 'Cash'
            ? { method, currency, amount: 0, notes: [{ amount: '', count: '', currency }] }
            : { method, currency, amount: '', transaction_id: '', card_number: '' };
        setPayments(next);
    };

    const addPayment = () =>
        setPayments([...payments, {
            method: 'Cash',
            currency: form.data.currency,
            amount: 0,
            notes: [{ amount: '', count: '', currency: form.data.currency }],
        }]);

    const removePayment = (i) => setPayments(payments.filter((_, x) => x !== i));

    const updateNote = (pi, ni, key, val) => {
        const next = [...payments];
        const notes = [...next[pi].notes];
        notes[ni] = { ...notes[ni], [key]: val };
        next[pi] = { ...next[pi], notes };
        setPayments(next);
    };

    const addNote = (pi) => {
        const next = [...payments];
        const payCur = next[pi].currency ?? form.data.currency;
        next[pi] = { ...next[pi], notes: [...next[pi].notes, { amount: '', count: '', currency: payCur }] };
        setPayments(next);
    };

    const removeNote = (pi, ni) => {
        const next = [...payments];
        next[pi] = { ...next[pi], notes: next[pi].notes.filter((_, x) => x !== ni) };
        setPayments(next);
    };

    const targetCustomerId = customerId || agent?.customers?.[agent.customers.length - 1]?.id || agent?.customer?.id;

    const savePayment = (e) => {
        e.preventDefault();
        if (!targetCustomerId) return alert('Please save customer first.');
        if (!balanced) return alert(`Total in ${form.data.currency} (${grandTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}) must be at least the price (${price.toLocaleString()}).`);

        const payload = payments.map((p) => ({
            ...p,
            currency: p.currency ?? form.data.currency,
            amount: methodNativeAmount(p),
            converted_amount: methodConvertedAmount(p, form.data.currency, eurRates),
            notes: p.method === 'Cash'
                ? (p.notes ?? []).map((n) => ({ ...n, currency: n.currency ?? p.currency ?? form.data.currency }))
                : null,
        }));

        const isRentACar = agent.booking_type === 'Rent a Car';
        setVehicleEnabledAgentId(agent.id);

        // Shift immediately to vehicle tab when clicked without waiting
        if (isRentACar) {
            setActiveTab('rent_a_car_vehicle');
        } else {
            setActiveTab('vehicle');
        }

        let returnedLkr = 0;
        if (grandTotal > price) {
            const rawLkr = getAmountInLkr(grandTotal - price, form.data.currency, eurRates);
            returnedLkr = Math.floor(rawLkr / 10) * 10;
        }

        form.transform((d) => ({ ...d, payments: payload, total_paid: grandTotal, returned_lkr: returnedLkr }));
        form.post(`/customers/${targetCustomerId}/payment`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: (page) => {
                const path = page.props.invoicePath ?? page.props.flash?.invoice_path ?? null;
                if (path) setInvoicePath(path);
                setVehicleEnabledAgentId(agent.id);
            },
            onError: () => {
                alert('Payment save failed.');
                setActiveTab('payment');
            },
        });
    };

    return (
        <form onSubmit={savePayment} className="space-y-4">
            {/* Top Bar: Title & Converter Link */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-gray-200 p-3.5 rounded-lg bg-white">
                <div>
                    <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                        <CreditCard size={18} className="text-gray-800" />
                        Process Payment
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">Select main currency, enter payment notes or card details.</p>
                </div>
                <a 
                    href={`/counter/converter?currency=${form.data.currency}&amount=${price}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-emerald-700 px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-xs"
                >
                    <span>View Rates & Converter</span>
                    <span className="bg-emerald-800 text-white px-2 py-0.5 rounded text-[10px] border border-emerald-500 font-mono">
                        {form.data.currency} {price.toLocaleString()}
                    </span>
                </a>
            </div>

            {/* Side-by-Side Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                {/* LEFT COLUMN: Inputs & Breakdown (8 cols) */}
                <div className="lg:col-span-7 space-y-4">
                    
                    {/* Main Currency & Price */}
                    <div className="border-2 border-black bg-white rounded-lg p-3.5 space-y-3 shadow-xs">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-black">Billing Currency & Required Price</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <SearchableCurrencySelect 
                                label="Main Currency" 
                                value={form.data.currency}
                                onChange={(newCur) => {
                                    const oldCur = form.data.currency;
                                    let newPrice = form.data.price;
                                    if (oldCur !== newCur && newPrice > 0 && eurRates) {
                                        const converted = convertCurrencyAmount(newPrice, oldCur, newCur, eurRates);
                                        newPrice = Math.round(converted * 100) / 100;
                                    }
                                    form.setData({
                                        ...form.data,
                                        currency: newCur,
                                        price: newPrice,
                                    });
                                }} 
                                options={CURRENCIES} 
                            />
                            <Field 
                                label="Total Price Required" 
                                type="number" 
                                value={form.data.price}
                                onChange={(e) => form.setData('price', e.target.value)} 
                            />
                        </div>
                    </div>

                    {/* Payment Breakdown */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800">Payment Methods</h4>
                            <span className="text-xs text-gray-500">{payments.length} method(s)</span>
                        </div>

                        {payments.map((p, pi) => {
                            const payCur = p.currency ?? form.data.currency;
                            const convertedAmt = methodConvertedAmount(p, form.data.currency, eurRates);
                            const nativeAmt = methodNativeAmount(p);

                            return (
                                <div key={pi} className="border border-gray-200 rounded-lg p-3.5 bg-white space-y-3">
                                    {/* Method Header Bar */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-gray-700">#{pi + 1}</span>
                                            <div className="w-36">
                                                <select 
                                                    className="input text-xs font-semibold py-1 border-gray-300" 
                                                    value={p.method}
                                                    onChange={(e) => changeMethod(pi, e.target.value)}
                                                >
                                                    <option value="Cash">💵 Cash</option>
                                                    <option value="POS">💳 POS (Card)</option>
                                                </select>
                                            </div>
                                            {p.method === 'POS' && (
                                                <div className="w-32">
                                                    <SearchableCurrencySelect
                                                        value={payCur}
                                                        onChange={(newCur) => updatePayment(pi, 'currency', newCur)}
                                                        options={CURRENCIES}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <span className="text-[11px] text-gray-400 block leading-none">Subtotal</span>
                                                <span className="text-xs font-bold text-gray-900">
                                                    {form.data.currency} {convertedAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                                {p.method === 'POS' && payCur !== form.data.currency && (
                                                    <span className="text-[10px] text-gray-500 block leading-none">
                                                        ({payCur} {nativeAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                                                    </span>
                                                )}
                                            </div>
                                            <button 
                                                type="button" 
                                                disabled={payments.length === 1}
                                                onClick={() => removePayment(pi)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 rounded transition disabled:opacity-30"
                                                title="Remove method"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Method Content */}
                                    {p.method === 'Cash' ? (
                                        <div className="space-y-2.5">
                                            <div className="space-y-2">
                                                {p.notes.map((n, ni) => {
                                                    const noteCur = n.currency ?? payCur;
                                                    const noteVal = Number(n.amount || 0) * Number(n.count || 0);
                                                    const noteConverted = convertCurrencyAmount(noteVal, noteCur, form.data.currency, eurRates);

                                                    return (
                                                        <div key={ni} className="border border-gray-200 p-2.5 rounded bg-gray-50/50 space-y-1.5">
                                                            <div className="grid grid-cols-12 gap-2 items-center">
                                                                <div className="col-span-4 sm:col-span-3">
                                                                    <SearchableCurrencySelect
                                                                        value={noteCur}
                                                                        onChange={(newCur) => updateNote(pi, ni, 'currency', newCur)}
                                                                        options={CURRENCIES}
                                                                    />
                                                                </div>
                                                                <div className="col-span-4 sm:col-span-4">
                                                                    <Field 
                                                                        placeholder="Note Value" 
                                                                        type="number" 
                                                                        value={n.amount}
                                                                        onChange={(e) => updateNote(pi, ni, 'amount', e.target.value)} 
                                                                    />
                                                                </div>
                                                                <div className="col-span-4 sm:col-span-5 flex items-center gap-1.5">
                                                                    <Field 
                                                                        placeholder="Qty" 
                                                                        type="number" 
                                                                        value={n.count}
                                                                        onChange={(e) => updateNote(pi, ni, 'count', e.target.value)} 
                                                                    />
                                                                    <button 
                                                                        type="button" 
                                                                        disabled={p.notes.length === 1}
                                                                        onClick={() => removeNote(pi, ni)}
                                                                        className="p-2 text-gray-400 hover:text-red-600 transition disabled:opacity-30 shrink-0"
                                                                        title="Remove note"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {noteCur !== form.data.currency && noteVal > 0 && (
                                                                <div className="text-[11px] text-gray-600 font-medium pt-0.5">
                                                                    ≈ {form.data.currency} {noteConverted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({noteCur} {noteVal.toLocaleString()} converted)
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <button 
                                                type="button" 
                                                onClick={() => addNote(pi)}
                                                className="text-xs font-semibold text-gray-700 hover:text-black border border-gray-300 hover:bg-gray-100 px-2.5 py-1 rounded transition"
                                            >
                                                + Add Note
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                                            <Field 
                                                label="POS Amount" 
                                                type="number" 
                                                value={p.amount}
                                                onChange={(e) => updatePayment(pi, 'amount', e.target.value)} 
                                            />
                                            <Field 
                                                label="Transaction ID" 
                                                value={p.transaction_id}
                                                onChange={(e) => updatePayment(pi, 'transaction_id', e.target.value)} 
                                            />
                                            <Field 
                                                label="Card Number (Last 4)" 
                                                value={p.card_number}
                                                onChange={(e) => updatePayment(pi, 'card_number', e.target.value)} 
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        <button 
                            type="button" 
                            onClick={addPayment}
                            className="w-full border-2 border-dashed border-red-500 hover:border-red-600 text-red-700 hover:bg-red-50 font-bold py-2 rounded-lg text-xs transition bg-white shadow-xs"
                        >
                            + Add Payment Method
                        </button>
                    </div>

                </div>

                {/* RIGHT COLUMN: Summary & Action Panel (5 cols) */}
                <div className="lg:col-span-5 border border-gray-200 bg-white rounded-lg p-4 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b border-gray-100 pb-2">
                        Payment Summary
                    </h4>

                    <div className="space-y-3 text-xs">
                        <div className="flex justify-between items-center py-1 border-b border-gray-100">
                            <span className="text-gray-600 font-medium">Required Amount:</span>
                            <span className="font-bold text-gray-900 text-sm">
                                {form.data.currency} {price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>

                        <div className="flex justify-between items-start py-1 border-b border-gray-100">
                            <div>
                                <span className="text-gray-600 font-medium block">Total Received:</span>
                                <span className={`text-[10px] font-bold ${balanced ? 'text-emerald-700' : 'text-red-600'}`}>
                                    {balanced ? '✓ Fully Covered' : `Shortage: ${form.data.currency} ${(price - grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                </span>
                            </div>
                            <span className="font-bold text-gray-900 text-sm">
                                {form.data.currency} {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>

                        <div className="flex justify-between items-start py-1 border-b border-gray-100">
                            <div>
                                <span className="text-gray-600 font-medium block">Change Due:</span>
                                {grandTotal > price && (
                                    <span className="text-[10px] font-bold text-amber-700 block">
                                        {(() => {
                                            const rawLkr = getAmountInLkr(grandTotal - price, form.data.currency, eurRates);
                                            const lkrVal = Math.floor(rawLkr / 10) * 10;
                                            return lkrVal ? `≈ LKR ${lkrVal.toLocaleString()}` : null;
                                        })()}
                                    </span>
                                )}
                            </div>
                            <span className="font-bold text-gray-900 text-sm">
                                {grandTotal > price 
                                    ? (form.data.currency === 'LKR'
                                        ? `LKR ${(Math.floor((grandTotal - price) / 10) * 10).toLocaleString()}`
                                        : `${form.data.currency} ${(grandTotal - price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
                                    : 'LKR 0.00'
                                }
                            </span>
                        </div>

                        <div className="flex justify-between items-center py-1 text-gray-500">
                            <span>Petty Cash Balance:</span>
                            <span className="font-semibold text-gray-800">LKR {Number(pettyCash).toLocaleString()}</span>
                        </div>
                    </div>

                    {form.errors.payments && <p className="text-red-600 text-xs font-bold">{form.errors.payments}</p>}

                    <div className="pt-2">
                        <button 
                            disabled={!canSubmit}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-lg font-bold text-xs disabled:opacity-40 transition shadow-xs"
                        >
                            {agent.booking_type === 'Rent a Car' ? 'Confirm Payment' : 'Continue to Vehicle Selection →'}
                        </button>
                    </div>
                </div>

            </div>
        </form>
    );
}

function VehicleTab({ vehicles, ongoingTrips = [], customerId, agent, onClose, rateSetting, paymentForm, locationVehiclePrices = [], vehicleRates = [], eurRates, dbLanguages = [], customerForm, invoicePath = null, lastReorderedAt = null, shortTrips = [] }) {
    const { auth } = usePage().props;
    const [confirmModal, setConfirmModal] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState(() => {
        const nextInLine = getNextInLineVehicle(vehicles, ongoingTrips, lastReorderedAt);
        if (nextInLine) {
            const slotNum = getVehicleSlotNumber(nextInLine);
            return { ...nextInLine, _slotNumber: slotNum };
        }
        return null;
    });
    const [selectionReason, setSelectionReason] = useState('');
    const [reasonModal, setReasonModal] = useState(null); // { vehicle, slotNumber, isWaitingQueue, reason: '' }
    const [rateMode, setRateMode] = useState('custom');
    const [selectedServiceCategoryFilter, setSelectedServiceCategoryFilter] = useState(null);
    const [customDriverShare, setCustomDriverShare] = useState('');
    const [customAgentShare, setCustomAgentShare] = useState('');
    const [selectedCityId, setSelectedCityId] = useState('');
    const [citySearch, setCitySearch] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [selectedLanguageFilter, setSelectedLanguageFilter] = useState(null);
    const [selectedVehicleTypeFilter, setSelectedVehicleTypeFilter] = useState(null);
    const [showFinalConfirm, setShowFinalConfirm] = useState(false);
    const [isShortTrip, setIsShortTrip] = useState(false);

    const driverHasShortTripInCurrentSession = useMemo(() => {
        const vehicle = confirmModal?.vehicle || selectedVehicle;
        if (!vehicle?.driver) return false;
        const currentSession = vehicle.driver.session_id || 1;
        return (shortTrips || []).some(st => 
            st.driver_id === vehicle.driver.id && 
            Number(st.session_id) === Number(currentSession)
        );
    }, [confirmModal, selectedVehicle, shortTrips]);

    const activeSessions = vehicles.map(v => v.driver?.session_id).filter(s => s !== null && s !== undefined && s > 0);
    const baseSessionId = activeSessions.length > 0 ? Math.min(...activeSessions) : 1;

    // Collect all unique languages from DB prop + vehicle driver languages
    const allowedLanguages = ['english', 'arabic', 'korean', 'chinese', 'tamil', 'hindi'];
    const allDbLanguages = Array.from(
        new Set([
            ...(dbLanguages || []),
            ...vehicles.flatMap(v => v.driver?.languages?.map(l => l.language_name) || [])
        ])
    ).filter(Boolean).filter(lang => allowedLanguages.includes(lang.toLowerCase()));

    const allVehicleTypes = Array.from(
        new Set(vehicles.map(v => v.vehicle_type).filter(Boolean))
    );

    const excludedServiceCategoryIds = [4, 8, 9, 10];
    const allServiceCategories = Array.from(
        new Map(
            vehicles
                .flatMap(v => v.driver?.service_categories ?? v.driver?.serviceCategories ?? [])
                .filter(category => category?.id && !excludedServiceCategoryIds.includes(category.id))
                .map(category => [category.id, category])
        ).values()
    );

    const customerPrefLang = customerForm?.data?.language_preference || agent?.language_preference || '';

    const totalAmount = Number(paymentForm?.data?.price ?? 0);
    const currentCurrency = paymentForm?.data?.currency ?? 'LKR';
    const totalAmountInLkr = getAmountInLkr(totalAmount, currentCurrency, eurRates);
    const defaultDriverRate = Number(rateSetting?.driver_rate ?? 0);
    const defaultAgentRate = Number(rateSetting?.agent_rate ?? 0);

    // Map vehicle_type string → column name in location_vehicle_prices
    const vehicleTypeMap = {
        'Sedan': 'sedan',
        'SUV': 'suv',
        'Van': 'van',
        'Luxury SUV': 'luxury_suv',
        'Luxury Sedan': 'luxury_sedan',
        'Mini Coach': 'mini_coach',
        'Economy': 'economy',
    };

    // Price rows filtered/mapped for the selected vehicle type
    const cityPrices = (() => {
        if (!confirmModal) return [];
        const col = vehicleTypeMap[confirmModal.vehicle?.vehicle_type];
        if (!col) return locationVehiclePrices.map(r => ({ ...r, price: null }));
        return locationVehiclePrices.map(r => ({ ...r, price: r[col] ?? null }));
    })();

    // Selected city price row
    const selectedCity = cityPrices.find(r => String(r.id) === String(selectedCityId)) ?? null;

    // Share calculations
    const useCustomRate = rateMode === 'custom';
    const isPerKmRate = rateMode === 'per_km';

    // Get current vehicle type rate for Per KM calculation
    const lookupType = confirmModal ? (vehicleTypeMap[confirmModal.vehicle?.vehicle_type] || '') : '';
    const vehicleRateObj = vehicleRates.find(r => r.vehicle_type === lookupType) ?? null;
    const vehicleRateValue = vehicleRateObj ? Number(vehicleRateObj.rate) : 0;

    const driverShare = isPerKmRate
        ? Math.round(Number(agent?.distance_km || 0) * vehicleRateValue * 1.5)
        : useCustomRate
            ? (selectedCity && selectedCity.price !== null ? Math.round(Number(selectedCity.price)) : 0)
            : Math.round((totalAmountInLkr * defaultDriverRate) / 100);

    const agentShare = isPerKmRate
        ? 0
        : useCustomRate
            ? 0
            : Math.round((totalAmountInLkr * defaultAgentRate) / 100);

    const isRateAssigned = Boolean(
        driverShare > 0 &&
        (
            rateMode === 'custom'
                ? (selectedCity && selectedCity.price !== null && Number(selectedCity.price) > 0)
                : rateMode === 'per_km'
                    ? (Number(agent?.distance_km || 0) > 0 && vehicleRateValue > 0)
                    : (defaultDriverRate > 0 && totalAmountInLkr > 0)
        )
    );

    const isOutOfTurnVehicle = (v) => {
        if (!v) return false;
        if (v.driver?.session_id > baseSessionId) return true;
        if (nextInLineVehicle && v.id !== nextInLineVehicle.id) return true;
        return false;
    };

    const handlePickVehicle = (v, slotNum, isWaiting = false) => {
        if (!v) return;

        // If driver is already on a trip or off duty, just select for viewing in the side panel
        if ((v.driver?.trips && v.driver.trips.length > 0) || v.driver?.duty_status === 'on_trip' || v.driver?.duty_status !== 'on_duty') {
            setSelectedVehicle({ ...v, _slotNumber: slotNum });
            return;
        }

        // If clicking Next In Line (and not in waiting queue)
        if (nextInLineVehicle && v.id === nextInLineVehicle.id && !(v.driver?.session_id > baseSessionId)) {
            setSelectedVehicle({ ...v, _slotNumber: slotNum });
            setSelectionReason('');
            return;
        }

        // Out of turn vehicle picked: open reason modal
        setReasonModal({
            vehicle: { ...v, _slotNumber: slotNum },
            slotNumber: slotNum,
            isWaitingQueue: isWaiting || (v.driver?.session_id > baseSessionId),
            reason: selectedVehicle?.id === v.id ? selectionReason : '',
        });
    };

    const openConfirm = (vehicle) => {
        if (isOutOfTurnVehicle(vehicle) && !selectionReason.trim()) {
            setReasonModal({
                vehicle,
                slotNumber: vehicle._slotNumber,
                isWaitingQueue: vehicle.driver?.session_id > baseSessionId,
                reason: '',
            });
            return;
        }
        setRateMode('custom');
        setCustomDriverShare('');
        setCustomAgentShare('');
        setSelectedCityId('');
        setCitySearch('');
        setIsShortTrip(false);
        setConfirmModal({ vehicle });
    };

    // Auto-select city based on agent's dropoff_location when confirm modal opens
    useEffect(() => {
        if (!confirmModal || cityPrices.length === 0) return;
        const dropoff = (agent?.dropoff_location ?? customerForm?.data?.dropoff_location ?? '').trim().toLowerCase();
        if (!dropoff) return;
        const match = cityPrices.find(r =>
            (r.city ?? '').toLowerCase() === dropoff ||
            (r.district ?? '').toLowerCase() === dropoff ||
            (r.city ?? '').toLowerCase().includes(dropoff) ||
            dropoff.includes((r.city ?? '').toLowerCase())
        );
        if (match) {
            setSelectedCityId(String(match.id));
        }
    }, [confirmModal, cityPrices.length]);

    const closeConfirm = () => setConfirmModal(null);

    const confirmAssign = () => {
        const vehicle = confirmModal.vehicle;
        const driverId = vehicle.driver_id ?? vehicle.driver?.id;

        if (!customerId) { alert('Customer not found.'); return; }
        if (!driverId) { alert('Driver not found for this vehicle.'); return; }
        if (!isRateAssigned) { alert('Please select a destination rate before assigning.'); return; }

        // Snapshot shares
        const finalDriverShare = isPerKmRate
            ? Math.round(Number(agent?.distance_km || 0) * vehicleRateValue * 1.5)
            : useCustomRate
                ? (selectedCity && selectedCity.price !== null ? Math.round(Number(selectedCity.price)) : 0)
                : Math.round((totalAmountInLkr * defaultDriverRate) / 100);
        const finalAgentShare = isPerKmRate
            ? 0
            : useCustomRate
                ? 0
                : Math.round((totalAmountInLkr * defaultAgentRate) / 100);
        const finalBalance = Math.round(totalAmountInLkr - finalDriverShare - finalAgentShare);

        const finalDriverRate = (useCustomRate || isPerKmRate) ? 0 : defaultDriverRate;
        const finalAgentRate = (useCustomRate || isPerKmRate) ? 0 : defaultAgentRate;

        // Open invoice on trip assignment
        const invoiceUrl = `/customers/${customerId}/invoice/pdf`;
        window.open(invoiceUrl, '_blank');

        setSubmitting(true);
        closeConfirm();
        setShowFinalConfirm(false);
        onClose();

        router.post(
            `/customers/${customerId}/assign-trip`,
            {
                driver_id: driverId,
                agent_id: agent.id,
                remarks: '',
                selection_reason: isOutOfTurnVehicle(vehicle) ? (selectionReason.trim() || null) : null,
                is_short_trip: isShortTrip,
                driver_rate: finalDriverRate,
                agent_rate: finalAgentRate,
                is_custom_rate: useCustomRate,
                total_amount: totalAmountInLkr,
                driver_share: finalDriverShare,
                agent_share: finalAgentShare,
                balance: finalBalance,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setSubmitting(false),
            }
        );
    };

    const nextInLineVehicle = getNextInLineVehicle(vehicles, ongoingTrips, lastReorderedAt);
    const nextInLineSlotNumber = getVehicleSlotNumber(nextInLineVehicle);

    return (
        <div>
            {/* Filters Bar */}
            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Languages Filter */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                            <span>🌐</span>
                            <span>Driver Languages</span>
                        </div>
                        {customerPrefLang && (
                            <div className="text-[9px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded-full flex items-center gap-1 font-bold">
                                <span>⭐ Customer Preference:</span>
                                <span className="uppercase">{customerPrefLang}</span>
                            </div>
                        )}
                    </div>
                    
                    {/* Compact 4 by 4 Grid */}
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                        <button
                            type="button"
                            onClick={() => setSelectedLanguageFilter(null)}
                            className={`px-1.5 py-1 text-[9px] rounded border transition font-medium ${
                                selectedLanguageFilter === null
                                    ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                            }`}
                        >
                            All Languages
                        </button>
                        {allDbLanguages.map((lang) => {
                            const count = vehicles.filter(v => v.driver?.languages?.some(l => l.language_name === lang)).length;
                            const style = getLanguageStyle(lang);
                            const activeClass = `${style.activeBg} border-transparent font-bold`;
                            const inactiveClass = `bg-white text-slate-700 ${style.border} hover:bg-slate-50`;
                            
                            return (
                                <button
                                    key={lang}
                                    type="button"
                                    onClick={() => setSelectedLanguageFilter(selectedLanguageFilter === lang ? null : lang)}
                                    className={`px-1.5 py-1 text-[9px] rounded border transition flex items-center justify-between gap-1 ${
                                        selectedLanguageFilter === lang ? activeClass : inactiveClass
                                    }`}
                                >
                                    <div className="flex items-center gap-1 truncate">
                                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: selectedLanguageFilter === lang ? '#ffffff' : style.dot }} />
                                        <span className="truncate">{lang}</span>
                                    </div>
                                    {count > 0 && (
                                        <span className={`text-[8px] px-1 rounded-full font-bold ${selectedLanguageFilter === lang ? 'bg-white/30' : 'bg-slate-100 text-slate-500'}`}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Vehicle Types Filter */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        <span>🚙</span>
                        <span>Vehicle Types</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                        <button
                            type="button"
                            onClick={() => setSelectedVehicleTypeFilter(null)}
                            className={`px-1.5 py-1 text-[9px] rounded border transition font-medium ${
                                selectedVehicleTypeFilter === null
                                    ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                            }`}
                        >
                            All Types
                        </button>
                        {allVehicleTypes.map((type, idx) => {
                            const count = vehicles.filter(v => v.vehicle_type === type).length;
                            const colors = ['border-purple-300 hover:bg-purple-50', 'border-emerald-300 hover:bg-emerald-50', 'border-orange-300 hover:bg-orange-50', 'border-pink-300 hover:bg-pink-50', 'border-cyan-300 hover:bg-cyan-50', 'border-rose-300 hover:bg-rose-50', 'border-indigo-300 hover:bg-indigo-50'];
                            const activeColors = ['bg-purple-600 text-white border-purple-600 font-bold', 'bg-emerald-600 text-white border-emerald-600 font-bold', 'bg-orange-600 text-white border-orange-600 font-bold', 'bg-pink-600 text-white border-pink-600 font-bold', 'bg-cyan-600 text-white border-cyan-600 font-bold', 'bg-rose-600 text-white border-rose-600 font-bold', 'bg-indigo-600 text-white border-indigo-600 font-bold'];
                            const dotColors = ['#9333ea', '#059669', '#ea580c', '#db2777', '#0891b2', '#e11d48', '#4f46e5'];
                            
                            const colorClass = selectedVehicleTypeFilter === type ? activeColors[idx % activeColors.length] : `bg-white text-slate-700 ${colors[idx % colors.length]}`;
                            const dotColor = selectedVehicleTypeFilter === type ? '#ffffff' : dotColors[idx % dotColors.length];

                            return (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setSelectedVehicleTypeFilter(selectedVehicleTypeFilter === type ? null : type)}
                                    className={`px-1.5 py-1 text-[9px] rounded border transition flex items-center justify-between gap-1 ${colorClass}`}
                                >
                                    <div className="flex items-center gap-1 truncate">
                                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
                                        <span className="truncate">{type}</span>
                                    </div>
                                    {count > 0 && (
                                        <span className={`text-[8px] px-1 rounded-full font-bold ${selectedVehicleTypeFilter === type ? 'bg-white/30' : 'bg-slate-100 text-slate-500'}`}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

            {/* Service Categories Filter */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 md:col-span-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    <span>●</span>
                    <span>Service Categories</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {[
                        { key: null, label: 'All Services', count: vehicles.length },
                        ...allServiceCategories.map(category => ({
                            key: category.id,
                            label: category.name,
                            count: vehicles.filter(vehicle =>
                                (vehicle.driver?.service_categories ?? vehicle.driver?.serviceCategories ?? [])
                                    .some(item => item.id === category.id)
                            ).length,
                        })),
                    ].map((option) => (
                        <button
                            key={option.key ?? 'all'}
                            type="button"
                            onClick={() => setSelectedServiceCategoryFilter(option.key)}
                            className={`px-1.5 py-1 text-[9px] rounded border transition flex items-center justify-between gap-1 ${
                                selectedServiceCategoryFilter === option.key
                                    ? 'bg-slate-800 text-white border-slate-800 font-bold'
                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                            }`}
                        >
                            <span className="truncate">{option.label}</span>
                            <span className={`text-[8px] px-1 rounded-full font-bold ${selectedServiceCategoryFilter === option.key ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                                {option.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
            </div>

            <div className="flex justify-between mb-3">
                <h3 className="font-bold text-lg">Select Vehicle</h3>
                <span className="text-sm text-gray-500">
                    {vehicles.filter(v => v.driver?.duty_status === 'on_duty').length} On Duty / {vehicles.length} Registered
                </span>
            </div>

            <div className="flex gap-4 items-start">
                {/* Left Side: Next In Line Square Card */}
                <div 
                    className="w-[180px] h-[180px] shrink-0 border border-emerald-200 rounded-xl bg-emerald-50/50 flex flex-col items-center justify-between p-4 shadow-sm relative overflow-hidden cursor-pointer hover:bg-emerald-100/60 transition"
                    onClick={() => {
                        if (nextInLineVehicle) {
                            setSelectedVehicle({ ...nextInLineVehicle, _slotNumber: nextInLineSlotNumber });
                            setSelectionReason('');
                        }
                    }}
                    title={nextInLineVehicle ? "Click to view next vehicle details" : ""}
                >
                    {/* Decorative badge */}
                    <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg tracking-wider uppercase">
                        Next
                    </div>
                    
                    <div className="text-center w-full mt-2">
                        <span className="text-[11px] uppercase tracking-wider text-emerald-800 font-bold block mb-1">
                            Next In Line
                        </span>
                        <div className="h-[1px] w-8 bg-emerald-200 mx-auto"></div>
                    </div>

                    {nextInLineVehicle ? (
                        <>
                            <div className="text-5xl font-black text-emerald-700 my-1.5">
                                {nextInLineSlotNumber ?? '-'}
                            </div>
                            <div className="text-center w-full min-w-0">
                                <p className="text-xs font-bold text-gray-800 truncate px-1">
                                    {nextInLineVehicle.driver?.first_name ?? 'Driver'}
                                </p>
                                <p className="text-[10px] text-gray-500 font-medium truncate">
                                    {nextInLineVehicle.registration_number ?? '-'}
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center flex-1">
                            <span className="text-3xl text-gray-300">--</span>
                            <p className="text-[10px] text-gray-400 mt-1 font-medium text-center leading-tight">
                                No on-duty vehicle queue
                            </p>
                        </div>
                    )}
                </div>

                {/* Middle Side: Vehicle Grid */}
                <div className="flex-1">
                    <div className="max-h-[420px] overflow-y-auto pb-4 pr-2 space-y-4">
                        {(() => {
                            const vehicleMap = {};
                            const waitingQueueVehicles = [];

                            vehicles.forEach((v) => {
                                const reg = v.driver?.registration_number ?? v.registration_number ?? '';
                                const match = reg.match(/\d+/);
                                const num = match ? parseInt(match[0], 10) : NaN;
                                if (!isNaN(num) && num >= 1 && num <= 95) {
                                    vehicleMap[num] = v;
                                }

                                const sid = v.driver?.session_id ?? null;
                                if (sid !== null && sid > baseSessionId) {
                                    waitingQueueVehicles.push({ vehicle: v, originalSlot: num, sessionId: sid });
                                }
                            });

                            waitingQueueVehicles.sort((a, b) => {
                                const slotA = !isNaN(a.originalSlot) ? a.originalSlot : 999;
                                const slotB = !isNaN(b.originalSlot) ? b.originalSlot : 999;
                                if (slotA !== slotB) {
                                    return slotA - slotB;
                                }
                                return (a.sessionId || 0) - (b.sessionId || 0);
                            });

                            return (
                                <>
                                    {/* Current Queue */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="bg-slate-700 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                                                Current Queue
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {Array.from({ length: 95 }, (_, i) => {
                                                const slotNum = i + 1;
                                                const vehicle = vehicleMap[slotNum] ?? null;
                                                if (!vehicle) return null; // Skip unregistered slots
                                                const isMoved = vehicle?.driver?.session_id > baseSessionId;
                                                
                                                return (
                                                    <VehicleSlot
                                                        key={`main-slot-${slotNum}`}
                                                        vehicle={vehicle}
                                                        number={slotNum}
                                                        selectedLanguageFilter={selectedLanguageFilter}
                                                        selectedVehicleTypeFilter={selectedVehicleTypeFilter}
                                                        selectedServiceCategoryFilter={selectedServiceCategoryFilter}
                                                        allServiceCategories={allServiceCategories}
                                                        baseSessionId={baseSessionId}
                                                        allVehicleTypes={allVehicleTypes}
                                                        isMovedToNextQueue={isMoved}
                                                        onClick={(v) => !isMoved && handlePickVehicle(v, slotNum, false)}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Waiting Queue */}
                                    {waitingQueueVehicles.length > 0 && (
                                        <div className="mt-5 border-t border-gray-200 pt-4">
                                            <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-2.5">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                                                        Waiting Queue
                                                    </span>
                                                    <span className="text-[10px] text-amber-700 font-medium">
                                                        {waitingQueueVehicles.length} driver{waitingQueueVehicles.length !== 1 ? 's' : ''} waiting
                                                    </span>
                                                </div>
                                                {(() => {
                                                    const vanItems = waitingQueueVehicles.filter(item => (item.vehicle?.vehicle_type ?? '').toLowerCase().includes('van'));
                                                    const carItems = waitingQueueVehicles.filter(item => !(item.vehicle?.vehicle_type ?? '').toLowerCase().includes('van'));
                                                    const hasBoth = carItems.length > 0 && vanItems.length > 0;
                                                    return (
                                                        <div className={`grid gap-2.5 items-start ${hasBoth ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                                                            {carItems.length > 0 && (
                                                                <div className="bg-white/70 rounded-lg p-2 border border-amber-200/70 shadow-2xs">
                                                                    <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-amber-100">
                                                                        <span className="text-[11px]">🚗</span>
                                                                        <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Car ({carItems.length})</span>
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-1.5">
                                                                        {carItems.map((item) => (
                                                                            <VehicleSlot
                                                                                key={`waiting-car-${item.vehicle.id ?? item.originalSlot}-${item.sessionId}`}
                                                                                vehicle={item.vehicle}
                                                                                number={item.originalSlot}
                                                                                selectedLanguageFilter={selectedLanguageFilter}
                                                                                selectedVehicleTypeFilter={selectedVehicleTypeFilter}
                                                                                        selectedServiceCategoryFilter={selectedServiceCategoryFilter}
                                                                                        allServiceCategories={allServiceCategories}
                                                                                        baseSessionId={baseSessionId}
                                                                                allVehicleTypes={allVehicleTypes}
                                                                                onClick={(v) => handlePickVehicle(v, item.originalSlot, true)}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {vanItems.length > 0 && (
                                                                <div className="bg-white/70 rounded-lg p-2 border border-amber-200/70 shadow-2xs">
                                                                    <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-amber-100">
                                                                        <span className="text-[11px]">🚐</span>
                                                                        <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Van ({vanItems.length})</span>
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-1.5">
                                                                        {vanItems.map((item) => (
                                                                            <VehicleSlot
                                                                                key={`waiting-van-${item.vehicle.id ?? item.originalSlot}-${item.sessionId}`}
                                                                                vehicle={item.vehicle}
                                                                                number={item.originalSlot}
                                                                                selectedLanguageFilter={selectedLanguageFilter}
                                                                                selectedVehicleTypeFilter={selectedVehicleTypeFilter}
                                                                                        selectedServiceCategoryFilter={selectedServiceCategoryFilter}
                                                                                        allServiceCategories={allServiceCategories}
                                                                                        baseSessionId={baseSessionId}
                                                                                allVehicleTypes={allVehicleTypes}
                                                                                onClick={(v) => handlePickVehicle(v, item.originalSlot, true)}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </div>

                {/* Right Side: Vehicle Details Side Panel */}
                <div className="w-[280px] shrink-0 border border-gray-200 rounded-xl bg-gray-50 flex flex-col shadow-sm max-h-[420px] overflow-hidden">
                    {selectedVehicle ? (
                        <div className="flex flex-col h-full">
                            {/* Image Header */}
                            <div className="relative h-[200px] w-full bg-gray-200 shrink-0 rounded-t-xl overflow-hidden">
                                {/* Slot Number - Top Left */}
                                <div className="absolute top-2 left-2 bg-blue-700 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full z-10 shadow-lg border border-blue-500">
                                    Slot {selectedVehicle._slotNumber}
                                </div>

                                {/* Languages - Top Right */}
                                <div className="absolute top-2 right-2 flex flex-wrap gap-1 z-10 justify-end max-w-[150px]">
                                    {selectedVehicle.driver?.languages?.map((l) => (
                                        <LanguageBadge key={l.id || l.language_name} language={l.language_name} size="sm" />
                                    ))}
                                </div>

                                <ImageBox
                                    path={selectedVehicle.pictures?.front_view ?? selectedVehicle.front_view}
                                    className="w-full h-full object-cover"
                                />

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none"></div>

                                {/* Content overlaid on image */}
                                <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between gap-2 pointer-events-none">
                                    
                                    {/* Driver & Reg Details */}
                                    <div className="text-white pl-1 drop-shadow-md flex-1 min-w-0">
                                        <p className="text-[14px] font-bold leading-tight truncate">
                                            {(selectedVehicle.driver?.first_name ?? '') || 'Driver'}
                                        </p>
                                        <p className="text-[11px] text-gray-200 font-medium flex items-center gap-1.5 mt-0.5">
                                            <span className="truncate">{selectedVehicle.driver?.mobile_number ?? '-'}</span>
                                            {/* <span className="opacity-50">|</span>
                                            <span className="text-yellow-300 font-bold tracking-wide">{selectedVehicle.registration_number ?? '-'}</span> */}
                                        </p>
                                        <p className="text-[11px] text-gray-200 font-medium flex items-center gap-1.5 mt-0.5">
                                            {/* <span className="truncate">{selectedVehicle.driver?.mobile_number ?? '-'}</span> */}
                                            {/* <span className="opacity-50">|</span> */}
                                            <span className="text-yellow-300 font-bold tracking-wide">{selectedVehicle.registration_number ?? '-'}</span>
                                        </p>
                                    </div>

                                    {/* Vehicle Info Transparent Card */}
                                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-1.5 text-white shadow-sm shrink-0 min-w-[110px]">
                                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px]">
                                            <div>
                                                {/* <span className="opacity-70 text-[8px] uppercase tracking-wider block">Type</span> */}
                                                <div className="font-bold truncate" title={selectedVehicle.vehicle_type}>{selectedVehicle.vehicle_type ?? '-'}</div>
                                            </div>
                                            <div>
                                                {/* <span className="opacity-70 text-[8px] uppercase tracking-wider block">Model</span> */}
                                                <div className="font-bold truncate" title={`${selectedVehicle.brand ?? '-'} ${selectedVehicle.model ?? ''}`}>
                                                    {selectedVehicle.brand ?? '-'} {selectedVehicle.model ?? ''}
                                                </div>
                                            </div>
                                            <div className="col-span-2 border-t border-white/20 pt-1 mt-0.5 flex justify-between items-center">
                                                <div className="flex items-center gap-1">
                                                    <span title="Passengers">👥</span>
                                                    <span className="font-bold">: {selectedVehicle.seating_capacity ?? '-'}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span title="Luggage">🧳</span>
                                                    <span className="font-bold">: {selectedVehicle.luggage_capacity ?? '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Details Body */}
                            <div className="p-3 space-y-3 overflow-y-auto flex-1 bg-white">
                                {isOutOfTurnVehicle(selectedVehicle) && (
                                    <div className="p-2.5 rounded-lg border border-gray-200 bg-gray-50 text-[11px] text-gray-700">
                                        <div className="flex items-center justify-between font-semibold mb-1">
                                            <span>Out of Queue Selection</span>
                                            <button
                                                type="button"
                                                onClick={() => setReasonModal({
                                                    vehicle: selectedVehicle,
                                                    slotNumber: selectedVehicle._slotNumber,
                                                    isWaitingQueue: selectedVehicle.driver?.session_id > baseSessionId,
                                                    reason: selectionReason,
                                                })}
                                                className="text-blue-600 underline text-[10px] hover:text-blue-800"
                                            >
                                                {selectionReason ? 'Edit Reason' : 'Add Reason'}
                                            </button>
                                        </div>
                                        {selectionReason ? (
                                            <p className="text-gray-600 line-clamp-2">"{selectionReason}"</p>
                                        ) : (
                                            <p className="text-gray-500">Reason required before assignment</p>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <span className="text-[10px] text-gray-500 font-semibold uppercase block mb-1">Languages ({selectedVehicle.driver?.languages?.length || 0})</span>
                                    <div className="bg-white border rounded p-2 min-h-[36px]">
                                        {selectedVehicle.driver?.languages?.length > 0 ? (
                                            <div className="flex flex-wrap gap-1.5">
                                                {selectedVehicle.driver.languages.map((l) => (
                                                    <LanguageBadge key={l.id || l.language_name} language={l.language_name} size="sm" />
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-gray-400 italic">No languages listed</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Footer */}
                            <div className="p-3 pt-0 bg-white shrink-0 space-y-2">
                                {selectedVehicle.driver?.trips && selectedVehicle.driver.trips.length > 0 ? (
                                    <button 
                                        type="button" 
                                        disabled 
                                        className="w-full py-2 bg-gray-100 text-gray-400 rounded-lg text-[12px] font-bold cursor-not-allowed flex items-center justify-center gap-1.5 border"
                                    >
                                        🚗 Currently on a Tour
                                    </button>
                                ) : (
                                    <button 
                                        type="button" 
                                        disabled={selectedVehicle.driver?.duty_status !== 'on_duty'}
                                        onClick={() => openConfirm(selectedVehicle)} 
                                        className="w-full py-2 bg-blue-700 text-white rounded-lg text-[12px] font-bold hover:bg-blue-800 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                                    >
                                        {selectedVehicle.driver?.duty_status !== 'on_duty' ? (
                                            <>Off Duty</>
                                        ) : (
                                            <>Assign Tour</>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gray-400">
                            <Car size={32} className="mb-2 opacity-50" />
                            <p className="text-xs font-medium">No Vehicle Selected</p>
                            <p className="text-[10px] mt-1">Click a slot from the grid on the left to view details</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Confirmation Modal ── */}
            {confirmModal && (
                <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-4 py-3 text-white">
                            <h3 className="text-base font-bold flex items-center gap-2">
                                <Car size={18} />
                                Confirm Vehicle Assignment
                            </h3>
                            <p className="text-xs text-blue-100 mt-0.5">
                                {confirmModal.vehicle.driver?.full_name ?? 'Driver'} — {confirmModal.vehicle.registration_number ?? ''} &nbsp;·&nbsp; {confirmModal.vehicle.vehicle_type ?? ''}
                            </p>
                        </div>

                        <div className="p-4 space-y-3">
                            {/* Out-of-turn reason notification */}
                            {isOutOfTurnVehicle(confirmModal.vehicle) && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-700">
                                    <div className="flex items-center justify-between font-semibold mb-1">
                                        <span>Reason for Out-of-Line Selection</span>
                                        <button
                                            type="button"
                                            onClick={() => setReasonModal({
                                                vehicle: confirmModal.vehicle,
                                                slotNumber: confirmModal.vehicle._slotNumber,
                                                isWaitingQueue: confirmModal.vehicle.driver?.session_id > baseSessionId,
                                                reason: selectionReason,
                                            })}
                                            className="text-blue-600 underline text-[11px] hover:text-blue-800"
                                        >
                                            Edit Reason
                                        </button>
                                    </div>
                                    <p className="text-gray-600">
                                        {selectionReason ? `"${selectionReason}"` : <span className="text-red-500">No reason provided</span>}
                                    </p>
                                </div>
                            )}

                            {/* Trip amount */}
                            <div className="bg-gray-50 rounded-lg border p-3 flex justify-between items-center">
                                <span className="text-xs font-medium text-gray-600">Trip Amount</span>
                                <div className="text-right">
                                    <span className="text-xl font-black text-gray-900 block">
                                        {paymentForm?.data?.currency ?? 'LKR'} {totalAmount.toLocaleString()}
                                    </span>
                                    {(() => {
                                        const cur = paymentForm?.data?.currency ?? 'LKR';
                                        const lkrVal = formatToLkrString(totalAmount, cur, eurRates);
                                        return lkrVal ? (
                                            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 inline-block mt-1">
                                                ≈ {lkrVal}
                                            </span>
                                        ) : null;
                                    })()}
                                </div>
                            </div>

                            {/* Short Trip Checkbox */}
                            <div className={`p-3 rounded-lg border transition ${isShortTrip ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-300' : 'bg-gray-50 border-gray-200'}`}>
                                <label className={`flex items-start gap-2.5 ${driverHasShortTripInCurrentSession ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                                    <input
                                        type="checkbox"
                                        checked={isShortTrip}
                                        disabled={driverHasShortTripInCurrentSession}
                                        onChange={(e) => setIsShortTrip(e.target.checked)}
                                        className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-gray-300 cursor-pointer disabled:cursor-not-allowed"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-1.5 font-bold text-xs text-gray-800">
                                            <span>⚡ Short Trip</span>
                                            {isShortTrip && (
                                                <span className="text-[10px] bg-amber-200 text-amber-900 font-semibold px-1.5 py-0.2 rounded-full">
                                                    Queue Protection Active
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                                            If the driver returns before their queue turn has passed, they will return to the current queue. Only 1 short trip permitted per driver in this session.
                                        </p>
                                        {driverHasShortTripInCurrentSession && (
                                            <p className="text-[11px] text-red-600 font-semibold mt-1">
                                                ⚠️ This driver has already received a short trip in this session (Max 1 short trip per session).
                                            </p>
                                        )}
                                    </div>
                                </label>
                            </div>

                            {/* Rate mode radio buttons */}
                            <div>
                                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Rate Type</p>
                                <div className="grid grid-cols-1 gap-2">
                                    {/* Standard Rate - commented out */}
                                    {/* <label className={`flex flex-col items-center gap-1 rounded-lg border-2 p-2 cursor-pointer transition ${rateMode === 'standard' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input
                                            type="radio"
                                            name="rateMode"
                                            value="standard"
                                            checked={rateMode === 'standard'}
                                            onChange={() => setRateMode('standard')}
                                            className="sr-only"
                                        />
                                        <span className={`text-lg ${rateMode === 'standard' ? 'text-blue-700' : 'text-gray-400'}`}>📊</span>
                                        <span className={`text-[11px] font-semibold ${rateMode === 'standard' ? 'text-blue-700' : 'text-gray-600'}`}>Standard Rate</span>
                                        <span className="text-[9px] text-gray-400">Based on % rates</span>
                                    </label> */}

                                    {/* Custom Rate */}
                                    <label className={`flex flex-col items-center gap-1 rounded-lg border-2 p-2 cursor-pointer transition ${rateMode === 'custom' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input
                                            type="radio"
                                            name="rateMode"
                                            value="custom"
                                            checked={rateMode === 'custom'}
                                            onChange={() => setRateMode('custom')}
                                            className="sr-only"
                                        />
                                        <span className={`text-lg ${rateMode === 'custom' ? 'text-orange-600' : 'text-gray-400'}`}>🏙️</span>
                                        <span className={`text-[11px] font-semibold ${rateMode === 'custom' ? 'text-orange-600' : 'text-gray-600'}`}>Custom Rate</span>
                                        <span className="text-[9px] text-gray-400">City-based pricing</span>
                                    </label>

                                    {/* Per KM Rate - commented out */}
                                    {/* <label className={`flex flex-col items-center gap-1 rounded-lg border-2 p-2 cursor-pointer transition ${rateMode === 'per_km' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input
                                            type="radio"
                                            name="rateMode"
                                            value="per_km"
                                            checked={rateMode === 'per_km'}
                                            onChange={() => setRateMode('per_km')}
                                            className="sr-only"
                                        />
                                        <span className={`text-lg ${rateMode === 'per_km' ? 'text-purple-600' : 'text-gray-400'}`}>📍</span>
                                        <span className={`text-[11px] font-semibold ${rateMode === 'per_km' ? 'text-purple-600' : 'text-gray-600'}`}>Per KM Rate</span>
                                        <span className="text-[9px] text-gray-400">Distance-based pricing</span>
                                    </label> */}
                                </div>
                            </div>

                            {/* Panel: Standard Rate - commented out */}
                            {/* {rateMode === 'standard' && (
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex justify-between items-center text-xs">
                                    <span className="text-blue-600 font-semibold uppercase tracking-wide">Driver Rate ({defaultDriverRate}%)</span>
                                    <div className="text-right">
                                        <span className="font-bold text-blue-700 block">
                                            Driver Share: LKR {driverShare.toLocaleString()}
                                        </span>
                                        {(() => {
                                            const lkrVal = formatToLkrString(driverShare, 'LKR', eurRates);
                                            return lkrVal ? (
                                                <span className="text-[10px] text-blue-600 font-semibold block mt-0.5">
                                                    ≈ {lkrVal}
                                                </span>
                                            ) : null;
                                        })()}
                                    </div>
                                </div>
                            )} */}

                            {/* Panel: Custom Rate — city picker */}
                            {rateMode === 'custom' && (
                                <div className="space-y-2">
                                    <p className="text-xs text-orange-700 bg-orange-50 rounded-lg px-2.5 py-1.5 font-medium">
                                        Select the destination city to load the price for this vehicle type ({confirmModal.vehicle.vehicle_type ?? 'Unknown'}).
                                    </p>

                                    {cityPrices.length === 0 ? (
                                        <p className="text-xs text-gray-500 text-center py-3">No city prices available.</p>
                                    ) : (
                                        <>
                                            {/* Search bar */}
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none text-xs">🔍</span>
                                                <input
                                                    type="text"
                                                    placeholder="Search city, district or province…"
                                                    value={citySearch}
                                                    onChange={e => setCitySearch(e.target.value)}
                                                    className="w-full pl-8 pr-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                                                />
                                                {citySearch && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setCitySearch('')}
                                                        className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600 text-xs"
                                                    >✕</button>
                                                )}
                                            </div>

                                            <div className="max-h-[102px] overflow-y-auto rounded-lg border divide-y">
                                                {cityPrices
                                                    .filter(row => {
                                                        const q = citySearch.trim().toLowerCase();
                                                        if (!q) return true;
                                                        return (
                                                            (row.city ?? '').toLowerCase().includes(q) ||
                                                            (row.district ?? '').toLowerCase().includes(q) ||
                                                            (row.province ?? '').toLowerCase().includes(q)
                                                        );
                                                    })
                                                    .map((row) => (
                                                        <button
                                                            key={row.id}
                                                            type="button"
                                                            onClick={() => setSelectedCityId(String(row.id))}
                                                            className={`w-full flex items-center justify-between px-3 py-1.5 text-left transition ${String(selectedCityId) === String(row.id) ? 'bg-orange-50 border-l-4 border-l-orange-500' : 'hover:bg-gray-50'}`}
                                                        >
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-800">{row.city}</p>
                                                                <p className="text-[10px] text-gray-400">{row.district}{row.province ? ` · ${row.province}` : ''}{row.zone ? ` · Zone ${row.zone}` : ''}</p>
                                                            </div>
                                                            <span className={`text-xs font-bold ${row.price !== null ? 'text-orange-600' : 'text-gray-400'}`}>
                                                                {row.price !== null ? `LKR ${Number(row.price).toLocaleString()}` : 'N/A'}
                                                            </span>
                                                        </button>
                                                    ))}
                                                {cityPrices.filter(row => {
                                                    const q = citySearch.trim().toLowerCase();
                                                    if (!q) return false;
                                                    return !(
                                                        (row.city ?? '').toLowerCase().includes(q) ||
                                                        (row.district ?? '').toLowerCase().includes(q) ||
                                                        (row.province ?? '').toLowerCase().includes(q)
                                                    );
                                                }).length === cityPrices.length && (
                                                        <p className="text-xs text-gray-400 text-center py-3">No results for "{citySearch}"</p>
                                                    )}
                                            </div>
                                        </>
                                    )}

                                    {selectedCity && selectedCity.price !== null && (
                                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-2.5 flex justify-between items-center text-xs">
                                            <span className="font-semibold text-orange-700">Selected: {selectedCity.city}</span>
                                            <div className="text-right">
                                                <span className="font-bold text-orange-700 block">
                                                    LKR {Number(selectedCity.price).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Panel: Per KM Rate details - commented out */}
                            {/* {rateMode === 'per_km' && (
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-2.5 space-y-1.5 text-xs">
                                    <div className="flex justify-between items-center">
                                        <span className="text-purple-700 font-medium">Distance</span>
                                        <span className="font-bold text-purple-900">{Number(agent?.distance_km || 0)} KM</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-purple-700 font-medium">Rate per KM for {confirmModal.vehicle.vehicle_type}</span>
                                        <span className="font-bold text-purple-900">LKR {vehicleRateValue.toLocaleString()}</span>
                                    </div>
                                    <div className="border-t border-purple-200 pt-1.5 flex justify-between items-center">
                                        <span className="font-bold text-purple-800">Driver : </span>
                                        <div className="text-right">
                                            <span className="font-bold text-purple-900 block">
                                                LKR {driverShare.toLocaleString()}
                                            </span>
                                            {(() => {
                                                const lkrVal = formatToLkrString(driverShare, 'LKR', eurRates);
                                                return lkrVal ? (
                                                    <span className="text-[10px] text-purple-650 font-semibold block mt-0.5">
                                                        ≈ {lkrVal}
                                                    </span>
                                                ) : null;
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            )} */}
                        </div>

                        {/* Rate Warning if not assigned */}
                        {!isRateAssigned && (
                            <div className="px-4 pb-2">
                                <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1 text-center font-medium">
                                    ⚠️ Please select a destination city with a valid rate to enable assignment.
                                </p>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="flex gap-2 px-4 pb-4">
                            <button
                                type="button"
                                onClick={closeConfirm}
                                className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={submitting || !isRateAssigned}
                                onClick={() => setShowFinalConfirm(true)}
                                className="flex-1 py-2 rounded-lg bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                title={!isRateAssigned ? "Please select a destination city with a valid rate" : ""}
                            >
                                {submitting ? 'Assigning...' : 'Confirm & Assign'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Final Confirmation Modal ── */}
            {showFinalConfirm && (
                <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
                        <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <Car size={26} />
                        </div>
                        <h3 className="text-[17px] font-extrabold text-gray-900 mb-1.5">Confirm Assignment</h3>
                        <p className="text-[13px] font-medium text-gray-500 mb-6">Do you want to proceed with this assignment?</p>
                        <div className="flex gap-3 justify-center">
                            <button
                                type="button"
                                onClick={() => setShowFinalConfirm(false)}
                                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={submitting || !isRateAssigned}
                                onClick={() => {
                                    setShowFinalConfirm(false);
                                    confirmAssign();
                                }}
                                className="px-5 py-2.5 rounded-lg bg-blue-700 text-white text-sm font-bold hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                            >
                                Yes, Proceed
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Out-of-Turn Reason Modal ── */}
            {reasonModal && (
                <div className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden border border-gray-200">
                        {/* Simple Header */}
                        <div className="px-5 py-3.5 border-b border-gray-200 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Vehicle Selection Reason</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Please provide a reason for picking this vehicle</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setReasonModal(null)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded transition"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Simple Vehicle Summary */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-700 space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Selected:</span>
                                    <span className="font-semibold text-gray-900">
                                        Slot {reasonModal.slotNumber} — {reasonModal.vehicle?.driver?.first_name ?? ''} {reasonModal.vehicle?.driver?.last_name ?? ''} ({reasonModal.vehicle?.registration_number ?? '-'})
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Next In Line:</span>
                                    <span className="text-gray-600">
                                        Slot {nextInLineSlotNumber ?? '-'} — {nextInLineVehicle?.driver?.first_name ?? 'None'} {nextInLineVehicle?.driver?.last_name ?? ''}
                                    </span>
                                </div>
                                {reasonModal.isWaitingQueue && (
                                    <div className="text-[11px] text-gray-500 pt-1 border-t border-gray-200">
                                        Selected from Waiting Queue
                                    </div>
                                )}
                            </div>

                            {/* Quick Selection Chips */}
                            <div>
                                <label className="block text-xs text-gray-600 mb-1.5 font-medium">
                                    Common Reasons
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {[
                                        'Customer preference',
                                        customerPrefLang ? `Language (${customerPrefLang})` : 'Language requirement',
                                        'Luggage / Passenger capacity',
                                        'Next driver delayed/unavailable',
                                        'VIP booking',
                                    ].map((chip) => (
                                        <button
                                            key={chip}
                                            type="button"
                                            onClick={() => setReasonModal(prev => ({ ...prev, reason: chip }))}
                                            className="text-xs px-2.5 py-1 rounded border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 transition"
                                        >
                                            {chip}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Reason Textarea */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Reason <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={reasonModal.reason || ''}
                                    onChange={(e) => setReasonModal(prev => ({ ...prev, reason: e.target.value }))}
                                    placeholder="Enter the reason here..."
                                    className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 outline-none text-gray-800"
                                />
                                <div className="flex justify-between items-center mt-1 text-[11px] text-gray-400">
                                    <span>Recorded for user: {auth?.user?.name || 'Staff'}</span>
                                    <span>{(reasonModal.reason || '').trim().length} chars</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex gap-2 px-5 py-3.5 bg-gray-50 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => setReasonModal(null)}
                                className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-white transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={!(reasonModal.reason || '').trim() || (reasonModal.reason || '').trim().length < 3}
                                onClick={() => {
                                    const trimmed = (reasonModal.reason || '').trim();
                                    if (trimmed.length < 3) return;
                                    setSelectionReason(trimmed);
                                    setSelectedVehicle(reasonModal.vehicle);
                                    setReasonModal(null);
                                }}
                                className="flex-1 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 transition"
                            >
                                Confirm Selection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function TripCard({ trip }) {
    const status = trip.status ?? 'Unknown';

    const cardColor = {
        Assigned: 'bg-red-50 border-red-500',
        Accepted: 'bg-yellow-50 border-yellow-500',
        'In_Progress': 'bg-blue-50 border-blue-500',
        'Completed': 'bg-green-50 border-green-500',
        // Released: 'bg-green-50 border-green-500',
    };

    const badgeColor = {
        Assigned: 'bg-red-600 text-white',
        Accepted: 'bg-yellow-500 text-white',
        'In_Progress': 'bg-blue-600 text-white',
        'Completed': 'bg-green-600 text-white',
        // Released: 'bg-green-600 text-white',
    };

    return (
        <div
            className={`border-l-4 rounded-lg shadow-sm p-2 flex flex-col justify-between ${cardColor[status] ?? 'bg-gray-50 border-gray-300'
                }`}
        >
            <div>
                <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0">
                        <h3 className="font-semibold text-xs truncate">
                            {(trip.driver?.first_name || trip.driver?.last_name) ? `${trip.driver?.first_name ?? ''} ${trip.driver?.last_name ?? ''}`.trim() : 'Driver'}
                        </h3>

                        <p className="text-[10px] text-black-800 truncate">
                            {trip.driver?.mobile_number ?? '-'} | {trip.driver?.vehicle?.registration_number ?? '-'}
                        </p>
                    </div>

                    <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold whitespace-nowrap ${badgeColor[status] ??
                            'bg-gray-500 text-white'
                            }`}
                    >
                        {status}
                    </span>
                </div>

                <div className="space-y-1 text-[11px] text-gray-700">
                    <div className="truncate">
                        <span className="font-semibold">Customer :</span>{' '}
                        {trip.customer?.name ?? '-'}
                    </div>

                    <div className="truncate">
                        <span className="font-semibold">Agent :</span>{' '}
                        {trip.agent?.user?.name ??
                            trip.agent?.name ??
                            '-'}
                    </div>

                    <div>
                        <span className="font-semibold">Assigned :</span>
                        <span className="text-[10px] ml-1">
                            {trip.trip_assigned_at
                                ? new Date(
                                    trip.trip_assigned_at
                                ).toLocaleDateString()
                                : '-'}
                        </span>
                    </div>

                    {trip.trip_started_at && (
                        <div>
                            <span className="font-semibold">
                                Started:
                            </span>{' '}
                            <span className="text-[10px]">
                                {new Date(
                                    trip.trip_started_at
                                ).toLocaleDateString()}
                            </span>
                        </div>
                    )}

                    {trip.trip_ended_at && (
                        <div>
                            <span className="font-semibold">
                                Ended:
                            </span>{' '}
                            <span className="text-[10px]">
                                {new Date(
                                    trip.trip_ended_at
                                ).toLocaleDateString()}
                            </span>
                        </div>
                    )}

                    {trip.remarks && (
                        <div className="text-[10px] text-gray-600 truncate">
                            <span className="font-semibold">
                                Notes:
                            </span>{' '}
                            {trip.remarks}
                        </div>
                    )}

                    {trip.is_short_trip && (
                        <div className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 rounded p-1.5 mt-1">
                            <div className="flex items-center justify-between font-bold">
                                <span>⚡ Short Tour</span>
                                {trip.original_session_id && (
                                    <span className="text-[9px] bg-amber-200 text-amber-900 px-1 rounded font-semibold">Queue {trip.original_session_id}</span>
                                )}
                            </div>
                            {trip.short_trip_by && (
                                <span className="text-amber-800 block text-[9px] mt-0.5">
                                    Given by: {trip.short_trip_by?.name ?? 'Staff'}
                                </span>
                            )}
                        </div>
                    )}

                    {trip.selection_reason && (
                        <div className="text-[10px] bg-amber-50 text-amber-900 border border-amber-200 rounded p-1.5 mt-1">
                            <span className="font-bold">⚠️ Out of Queue:</span> {trip.selection_reason}
                            {trip.selection_reason_by && (
                                <span className="text-gray-500 block text-[9px] mt-0.5">
                                    Logged by: {trip.selection_reason_by?.name ?? trip.assigned_by?.name ?? 'Staff'}
                                </span>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

function VehicleSlot({ vehicle, number, onClick, selectedLanguageFilter, selectedVehicleTypeFilter, selectedServiceCategoryFilter, allServiceCategories = [], baseSessionId = 1, allVehicleTypes = [], isMovedToNextQueue = false }) {
    // No vehicle registered in this slot — skip rendering
    if (!vehicle) return null;

    const isOnDuty = vehicle.driver?.duty_status === 'on_duty';
    const hasOngoingTrip = vehicle.driver?.trips && vehicle.driver.trips.length > 0;
    const languages = vehicle.driver?.languages || [];
    const languageNames = languages.map(l => l.language_name).filter(Boolean);

    const matchesLang = selectedLanguageFilter ? (languageNames.includes(selectedLanguageFilter) && isOnDuty) : true;
    const matchesType = selectedVehicleTypeFilter ? (vehicle?.vehicle_type === selectedVehicleTypeFilter && isOnDuty) : true;
    const serviceCategories = vehicle.driver?.service_categories ?? vehicle.driver?.serviceCategories ?? [];
    const matchesServiceCategory = selectedServiceCategoryFilter
        ? serviceCategories.some(category => category.id === selectedServiceCategoryFilter)
        : true;
    
    // if any filter is active and this vehicle doesn't match, we dim it
    const isFilterActive = selectedLanguageFilter || selectedVehicleTypeFilter || selectedServiceCategoryFilter;
    const matchesFilter = matchesLang && matchesType && matchesServiceCategory;
    
    const dimClass = isFilterActive && !matchesFilter ? 'opacity-30 grayscale-[50%]' : '';
    
    let highlightRing = '';
    if (isFilterActive && matchesFilter) {
        if (selectedVehicleTypeFilter) {
            const typeIndex = allVehicleTypes.indexOf(vehicle.vehicle_type);
            const ringColors = ['ring-purple-500 bg-purple-50', 'ring-emerald-500 bg-emerald-50', 'ring-orange-500 bg-orange-50', 'ring-pink-500 bg-pink-50', 'ring-cyan-500 bg-cyan-50', 'ring-rose-500 bg-rose-50', 'ring-indigo-500 bg-indigo-50'];
            const ringColor = typeIndex >= 0 ? ringColors[typeIndex % ringColors.length] : 'ring-blue-500 bg-blue-50';
            highlightRing = `ring-2 ${ringColor} ring-offset-1 scale-105 z-10`;
        } else {
            highlightRing = 'ring-2 ring-blue-500 ring-offset-1 scale-105 z-10 bg-blue-50';
        }
    }

    // Render language color dots (up to 4)
    const languageDots = (
        <div className="flex gap-0.5 items-center justify-center absolute bottom-0.5 inset-x-0">
            {languageNames.slice(0, 4).map((lang, idx) => {
                const style = getLanguageStyle(lang);
                return (
                    <span
                        key={idx}
                        className="w-1.5 h-1.5 rounded-full border border-white/80 shadow-xs shrink-0"
                        style={{ backgroundColor: style.dot }}
                        title={lang}
                    />
                );
            })}
            {languageNames.length > 4 && (
                <span className="text-[7px] font-bold text-gray-500 leading-none">+</span>
            )}
        </div>
    );

    // If driver completed a trip and moved to a new session row, show their old slot as disabled/moved
    if (isMovedToNextQueue) {
        return (
            <div
                className={`w-[38px] h-[38px] rounded-lg flex flex-col items-center justify-start pt-0.5 text-[9px] font-bold border border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed select-none leading-tight text-center px-0.5 shrink-0 opacity-60 relative ${dimClass} ${highlightRing}`}
                title={`Moved to next queue`}
            >
                <span className="text-[12px] leading-none text-gray-400">{number}</span>
                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter mt-0.5">Moved</span>
            </div>
        );
    }

    const sessionId = vehicle.driver?.session_id ?? null;

    // Vehicle on a trip
    if (hasOngoingTrip) {
        return (
            <div
                className={`w-[38px] h-[38px] rounded-lg flex flex-col items-center justify-start pt-0.5 text-[9px] font-bold border border-blue-300 bg-blue-50 text-blue-500 cursor-pointer select-none leading-tight text-center px-0.5 transition hover:bg-blue-100 shrink-0 relative ${dimClass} ${highlightRing}`}
                onClick={() => onClick?.(vehicle)}
                title={`${vehicle.driver?.first_name || ''} (${languageNames.join(', ')})`}
            >
                <span className="text-[12px] leading-none">{number}</span>
                <span className="text-[8px] font-bold text-blue-600 uppercase tracking-tighter mt-0.5">Trip</span>
                {languageDots}
            </div>
        );
    }

    // Off-duty vehicle
    if (!isOnDuty) {
        return (
            <div
                className={`w-[38px] h-[38px] rounded-lg flex flex-col items-center justify-start pt-0.5 text-[9px] font-bold border border-red-300 bg-red-50 text-red-400 cursor-pointer select-none leading-tight text-center px-0.5 transition hover:bg-red-100 shrink-0 relative ${dimClass} ${highlightRing}`}
                onClick={() => onClick?.(vehicle)}
                title={`${vehicle.driver?.first_name || ''} (${languageNames.join(', ')})`}
            >
                <span className="text-[12px] leading-none">{number}</span>
                <span className="text-[8px] font-semibold text-red-500 uppercase mt-0.5">Off</span>
                {languageDots}
            </div>
        );
    }

    // On-duty vehicle
    return (
        <div
            className={`w-[38px] h-[38px] rounded-lg flex flex-col items-center justify-start pt-1 text-[16px] font-bold border border-green-400 bg-green-50 text-green-700 cursor-pointer select-none leading-tight text-center px-0.5 transition hover:bg-green-100 hover:shadow-md hover:scale-110 shrink-0 relative ${dimClass} ${highlightRing}`}
            onClick={() => onClick?.(vehicle)}
            title={`${vehicle.driver?.first_name || ''} (${languageNames.join(', ')})`}
        >
            <span className="leading-none">{number}</span>
                {languageDots}
        </div>
    );
}

function VehicleSelectCard({ vehicle, index, onAssign, assigning }) {
    const languages = vehicle.driver?.languages || [];

    return (
        <div className="relative border rounded-lg bg-gray-50 p-2 shadow-sm">

            <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-blue-700 text-white text-[10px] flex items-center justify-center font-bold">
                {index + 1}
            </div>

            <div className="flex gap-2">
                <ImageBox path={vehicle.pictures?.front_view ?? vehicle.front_view} className="w-16 h-16 flex-shrink-0 rounded" />

                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-xs truncate">
                        {(vehicle.driver?.first_name ?? '') + ' ' + (vehicle.driver?.last_name ?? '') || 'Driver'}
                    </h3>

                    <p className="text-[12px] text-gray-500 truncate">
                        {vehicle.driver?.mobile_number ?? '-'} | {vehicle.registration_number ?? '-'}
                    </p>

                    <p className="text-[12px] text-gray-600 truncate">
                        {vehicle.brand ?? '-'} {vehicle.model ?? ''}
                    </p>

                    <p className="text-[12px] text-gray-600 truncate">
                        Pax : {vehicle.seating_capacity ?? '-'} | Luggage : {vehicle.luggage_capacity ?? ''}
                    </p>

                    <div className="flex flex-wrap gap-1 items-center mt-1">
                        <span className="text-[11px] text-gray-500">🌐</span>
                        {languages.length > 0 ? (
                            languages.map((l) => (
                                <LanguageBadge key={l.id || l.language_name} language={l.language_name} size="sm" />
                            ))
                        ) : (
                            <span className="text-[11px] text-gray-400">-</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-0 flex justify-end">
                <button type="button" disabled={assigning} onClick={onAssign} className="px-3 py-1 bg-blue-700 text-white rounded text-[11px] font-medium hover:bg-blue-800 disabled:opacity-50" >
                    {assigning ? 'Assigning...' : 'Assign'}
                </button>
            </div>
        </div>
    );
}

function Section({ title, icon, children, actions }) {
    return (
        <section className="bg-white rounded-xl shadow p-5 mb-6 overflow-visible">
            <div className="flex items-center gap-2 mb-4 justify-between">
                <div className="flex items-center gap-2">
                    {icon}
                    <h2 className="text-lg font-bold text-gray-800">{title}</h2>
                </div>

                {actions && <div>{actions}</div>}
            </div>
            {children}
        </section>
    );
}

function CardButton({ children, icon, onClick, disabled, color }) {
    const colors = {
        blue: 'bg-blue-700 hover:bg-blue-800',
        green: 'bg-green-700 hover:bg-green-800',
        purple: 'bg-purple-700 hover:bg-purple-800',
    };

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={`flex-1 inline-flex items-center justify-center gap-1 rounded py-1.5 text-[11px] font-medium ${disabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : `${colors[color]} text-white`
                }`}
        >
            {icon}
            {children}
        </button>
    );
}

function TabButton({ active, disabled, children, onClick }) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={`px-6 py-3 font-medium transition ${disabled
                    ? 'text-gray-300 cursor-not-allowed'
                    : active
                        ? 'border-b-2 border-blue-700 text-blue-700'
                        : 'text-gray-500 hover:text-gray-800'
                }`}
        >
            {children}
        </button>
    );
}

function Field({ label, value, onChange, error, type = 'text', ...rest }) {
    const handleKeyDown = (e) => {
        if (type === 'number') {
            if (['e', 'E', '+', '-'].includes(e.key)) {
                e.preventDefault();
            }
            // Prevent leading zeros
            if (e.key === '0' && e.target.selectionStart === 0) {
                e.preventDefault();
            }
        }
    };

    return (
        <div>
            <style>{`
                input[type=number]::-webkit-inner-spin-button, 
                input[type=number]::-webkit-outer-spin-button { 
                    -webkit-appearance: none; 
                    margin: 0; 
                }
                input[type=number] {
                    -moz-appearance: textfield;
                }
            `}</style>
            <label className="label">{label}</label>
            <input type={type} value={value ?? ''} onChange={onChange} onKeyDown={handleKeyDown} className="input" min="0" step={type === 'number' ? 'any' : undefined} {...rest} />
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
        </div>
    );
}

function Select({ label, value, onChange, options }) {
    return (
        <div>
            <label className="label">{label}</label>
            <select value={value} onChange={onChange} className="input">
                {options.map((x) => (
                    <option key={x} value={x}>{x}</option>
                ))}
            </select>
        </div>
    );
}

function ImageBox({ path, className }) {
    if (!path) {
        return (
            <div className={`${className} rounded bg-gray-100 border flex items-center justify-center text-xs text-gray-400`}>
                No Image
            </div>
        );
    }

    return (
        <a href={`/storage/${path}`} target="_blank" rel="noreferrer">
            <img src={`/storage/${path}`} className={`${className} rounded object-cover border`} alt="" />
        </a>
    );
}

function Empty({ text }) {
    return (
        <div className="h-[180px] rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">
            {text}
        </div>
    );
}

function RentACarVehicleTab({ agent, customerId, onClose, invoicePath = null }) {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [confirmModal, setConfirmModal] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchVehicles();
    }, [startDate, endDate]);

    const fetchVehicles = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`https://srilankaautorentals.com/api/available-vehicles?start_date=${startDate}&end_date=${endDate}`);
            if (!res.ok) throw new Error('Failed to fetch external vehicles');
            const data = await res.json();
            if (data && data.success) {
                setVehicles(data.data || []);
            } else {
                throw new Error(data.message || 'Unknown error');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, [startDate, endDate]);

    const confirmAssign = () => {
        setSubmitting(true);
        const v = confirmModal.vehicle;
        
        // Open invoice on vehicle assignment
        const invoiceUrl = `/customers/${customerId}/invoice/pdf`;
        window.open(invoiceUrl, '_blank');

        router.post(
            `/customers/${customerId}/assign-external-vehicle`,
            {
                external_vehicle_id: v.id,
                external_vehicle_reg: v.reg_no,
                external_vehicle_make: v.make,
                external_vehicle_model: v.model,
                external_company_id: v.company_id,
                external_company_name: v.company_name,
                start_date: startDate,
                end_date: endDate
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setConfirmModal(null);
                    onClose();
                },
                onFinish: () => setSubmitting(false),
            }
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center bg-gray-50 p-3 rounded-lg border">
                <div>
                    <label className="label">Start Date</label>
                    <input type="date" className="input text-sm" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div>
                    <label className="label">End Date</label>
                    <input type="date" className="input text-sm" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
                <div className="pt-5">
                    <button onClick={fetchVehicles} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">Search</button>
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="label">Search Vehicles</label>
                    <input 
                        type="text" 
                        className="input text-sm w-full" 
                        placeholder="Search by make, model, reg, or company..." 
                        value={searchQuery} 
                        onChange={e => setSearchQuery(e.target.value)} 
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10 text-gray-500">Loading external vehicles...</div>
            ) : error ? (
                <div className="text-center py-10 text-red-500 font-semibold">{error}</div>
            ) : vehicles.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No vehicles available for these dates.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto pr-2">
                    {vehicles.filter(v => {
                        if (!searchQuery) return true;
                        const query = searchQuery.toLowerCase();
                        return (
                            (v.make || '').toLowerCase().includes(query) ||
                            (v.model || '').toLowerCase().includes(query) ||
                            (v.reg_no || '').toLowerCase().includes(query) ||
                            (v.company_name || '').toLowerCase().includes(query)
                        );
                    }).map(v => (
                        <div key={v.id} className="border rounded-lg p-3 shadow-sm bg-white flex flex-col justify-between hover:border-blue-400 cursor-pointer transition-all" onClick={() => setConfirmModal({ vehicle: v })}>
                            <div>
                                <h4 className="font-bold text-gray-800">{v.make} {v.model}</h4>
                                <p className="text-xs text-gray-500 mt-1">{v.vehicle_type_name}</p>
                            </div>
                            <div className="mt-3 text-sm">
                                <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-mono font-bold">{v.reg_no}</span>
                                <p className="text-xs text-gray-500 mt-2 line-clamp-1">{v.company_name}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {confirmModal && (
                <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
                        <h3 className="text-lg font-bold">Assign External Vehicle</h3>
                        <div className="bg-gray-50 p-3 rounded border text-sm">
                            <p><strong>Vehicle:</strong> {confirmModal.vehicle.make} {confirmModal.vehicle.model}</p>
                            <p><strong>Reg No:</strong> {confirmModal.vehicle.reg_no}</p>
                            <p><strong>Company:</strong> {confirmModal.vehicle.company_name}</p>
                            <p><strong>Dates:</strong> {startDate} to {endDate}</p>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button type="button" onClick={() => setConfirmModal(null)} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50">Cancel</button>
                            <button type="button" disabled={submitting} onClick={confirmAssign} className="flex-1 py-2 rounded-lg bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 disabled:opacity-50">
                                {submitting ? 'Assigning...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}