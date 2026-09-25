import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, Calculator, Trash2, Plus, ArrowRightLeft, ChevronDown, Search, Check } from 'lucide-react';

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
            {label && <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</label>}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-left flex justify-between items-center bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-sm font-bold text-slate-800 shadow-sm hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                <span className="flex items-center gap-2 truncate">
                    {flagUrl && (
                        <img 
                            src={flagUrl} 
                            alt={value} 
                            className="w-5 h-3.5 object-cover rounded-xs border border-slate-200 shrink-0 shadow-xs" 
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    )}
                    <span>{value || 'Select'}</span>
                </span>
                <ChevronDown size={14} className={`transition-transform text-slate-500 shrink-0 ml-1 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-[100] left-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-2xl p-2 space-y-2 max-h-60 overflow-hidden flex flex-col">
                    <div className="relative shrink-0">
                        <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                        <input
                            type="text"
                            autoFocus
                            placeholder="Search currency..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full text-xs border border-slate-200 rounded-md pl-8 pr-2 py-1.5 focus:outline-none focus:border-indigo-500 font-bold text-slate-800"
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
                                            c === value ? 'bg-indigo-50 text-indigo-700 font-black' : 'hover:bg-slate-100 text-slate-700'
                                        }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            {optionFlagUrl && (
                                                <img 
                                                    src={optionFlagUrl} 
                                                    alt={c} 
                                                    className="w-5 h-3.5 object-cover rounded-xs border border-slate-200 shrink-0 shadow-xs" 
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            )}
                                            <span>{c}</span>
                                        </span>
                                        {c === value && <Check size={13} className="text-indigo-700 shrink-0" />}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="p-2 text-center text-xs text-slate-400 font-medium">
                                No currency found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Converter({ initialCurrency = 'USD', initialAmount = 0 }) {
    const [eurRates, setEurRates] = useState(null);

    const CURRENCIES = useMemo(() => {
        const defaultCurrencies = ['LKR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'INR', 'AED', 'CNY', 'JPY'];
        if (!eurRates) return defaultCurrencies;
        const apiKeys = Object.keys(eurRates).map(c => c.toUpperCase()).sort();
        return Array.from(new Set([...defaultCurrencies, ...apiKeys]));
    }, [eurRates]);
    const [baseCurrency, setBaseCurrency] = useState(initialCurrency || 'USD');
    const [targetAmount, setTargetAmount] = useState(Number(initialAmount || 0));
    const [payments, setPayments] = useState([{ id: Date.now(), currency: 'EUR', amount: 0 }]);
    const [loadingRates, setLoadingRates] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        const fetchRates = () => {
            setLoadingRates(true);
            fetch('https://latest.currency-api.pages.dev/v1/currencies/eur.json')
                .then(res => res.json())
                .then(data => {
                    if (data && data.eur) {
                        setEurRates(data.eur);
                        setLastUpdated(new Date().toLocaleTimeString());
                    }
                })
                .catch(err => console.error('Failed to fetch currency rates:', err))
                .finally(() => setLoadingRates(false));
        };
        fetchRates();
        const interval = setInterval(fetchRates, 60000); // refresh every minute
        return () => clearInterval(interval);
    }, []);

    const convertAmount = (amount, fromCur, toCur) => {
        if (!eurRates) return 0;
        if (fromCur === toCur) return Number(amount);
        
        const rateFrom = eurRates[fromCur.toLowerCase()];
        const rateTo = eurRates[toCur.toLowerCase()];
        
        if (!rateFrom || !rateTo) return 0;
        
        const amountInEur = Number(amount) / rateFrom;
        return amountInEur * rateTo;
    };

    const addPayment = () => {
        setPayments([...payments, { id: Date.now(), currency: 'USD', amount: 0 }]);
    };

    const removePayment = (id) => {
        setPayments(payments.filter(p => p.id !== id));
    };

    const updatePayment = (id, field, value) => {
        setPayments(payments.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const totalPaidInBase = payments.reduce((sum, p) => {
        return sum + convertAmount(p.amount || 0, p.currency, baseCurrency);
    }, 0);

    const balance = targetAmount - totalPaidInBase;
    const isBalanced = Math.abs(balance) < 0.05; // Handle tiny float precision issues
    const isOverpaid = balance <= -0.05;

    return (
        <>
            <Head title="Exchange Converter" />

            <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                                <Calculator className="text-indigo-600" size={32} />
                                Multi-Currency Converter
                            </h1>
                            <p className="text-slate-500 mt-1 font-medium">Breakdown payments across different currencies with live rates.</p>
                        </div>
                        <div className="flex gap-4 items-center">
                            {lastUpdated && (
                                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 shadow-sm">
                                    Rates Live • {lastUpdated}
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={() => window.close()}
                                className="inline-flex items-center gap-2 bg-white text-slate-700 px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 hover:text-slate-900 font-bold shadow-sm transition"
                            >
                                <ArrowLeft size={18} />
                                Close
                            </button>
                        </div>
                    </div>

                    {loadingRates && !eurRates && (
                        <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 p-4 rounded-xl flex items-center justify-center font-bold animate-pulse">
                            Fetching Live Exchange Rates...
                        </div>
                    )}

                    {eurRates && (
                        <div className="grid grid-cols-1 gap-8">
                            
                            <div className="flex flex-col lg:flex-row gap-6 items-start">
                                {/* Left Side: Interactive Area */}
                                <div className="w-full lg:w-7/12 bg-white rounded-2xl shadow-sm border border-slate-200">
                                    {/* Target Section (Header-like) */}
                                    <div className="bg-slate-50 p-5 border-b border-slate-200 flex items-center justify-between gap-4">
                                        <div className="w-36">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                Target Currency
                                            </label>

                                            <div className="w-full border border-slate-300 rounded-lg bg-slate-100 px-3 py-2 text-lg font-bold text-slate-700">
                                                {baseCurrency}
                                            </div>
                                        </div>
                                        <div className="flex-2 text-right">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Target Amount Needed</label>
                                            <input 
                                                type="number" 
                                                disabled
                                                className="w-full sm:w-48 border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xl font-black text-slate-800 placeholder-slate-300 text-right"
                                                value={targetAmount === 0 ? '' : targetAmount}
                                                onChange={(e) => setTargetAmount(e.target.value ? Number(e.target.value) : 0)}
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    {/* Payments List */}
                                    <div className="p-5">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Breakdown</h2>
                                            <button 
                                                onClick={addPayment}
                                                className="text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                                            >
                                                <Plus size={14} /> Add Part
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {payments.map((p, i) => (
                                                <div key={p.id} className="flex items-center gap-2 bg-slate-50/50 p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 transition">
                                                    <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400 shrink-0">
                                                        {i + 1}
                                                    </div>
                                                    
                                                    <div className="w-28 shrink-0">
                                                        <SearchableCurrencySelect 
                                                            value={p.currency}
                                                            onChange={(newCur) => updatePayment(p.id, 'currency', newCur)}
                                                            options={CURRENCIES}
                                                        />
                                                    </div>
                                                    
                                                    <div className="flex-1">
                                                        <input 
                                                            type="number" 
                                                            className="w-full border-slate-200 rounded-lg text-base font-bold bg-white focus:ring-2 focus:ring-indigo-500 placeholder-slate-300 py-1.5"
                                                            value={p.amount === 0 ? '' : p.amount}
                                                            onChange={(e) => updatePayment(p.id, 'amount', e.target.value ? Number(e.target.value) : 0)}
                                                            placeholder="0.00"
                                                        />
                                                    </div>

                                                    <div className="w-24 text-right pr-2 shrink-0">
                                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Value in {baseCurrency}</div>
                                                        <div className="text-sm font-black text-indigo-700 leading-tight">
                                                            {convertAmount(p.amount || 0, p.currency, baseCurrency).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                                        </div>
                                                    </div>

                                                    <button 
                                                        onClick={() => removePayment(p.id)}
                                                        disabled={payments.length === 1}
                                                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-30 disabled:hover:bg-transparent shrink-0"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Summary Card */}
                                <div className="w-full lg:w-5/12 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-6">
                                    <div className="p-6 relative">
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-full blur-3xl pointer-events-none"></div>

                                        <div className="space-y-5">
                                            {/* Target Row */}
                                            <div className="flex justify-between items-end">
                                                <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-0.5">Target</div>
                                                <div className="text-xl font-black text-slate-800 flex items-baseline gap-1">
                                                    <span className="text-sm text-slate-400 font-bold">{baseCurrency}</span>
                                                    {targetAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </div>
                                            </div>

                                            {/* Total Converted Row */}
                                            <div className="flex justify-between items-end border-t border-slate-100 pt-5">
                                                <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                                                    <ArrowRightLeft size={12} className="text-slate-400" />
                                                    Converted
                                                </div>
                                                <div className="text-2xl font-black text-emerald-600 flex items-baseline gap-1">
                                                    <span className="text-sm text-emerald-600/70 font-bold">{baseCurrency}</span>
                                                    {totalPaidInBase.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </div>
                                            </div>

                                            {/* Balance Row */}
                                            <div className={`mt-2 p-4 rounded-xl border-2 transition-colors ${
                                                isBalanced ? 'bg-emerald-50 border-emerald-200' : 
                                                isOverpaid ? 'bg-amber-50 border-amber-200' : 
                                                'bg-rose-50 border-rose-200'
                                            }`}>
                                                <div className={`text-[10px] font-black uppercase tracking-wider mb-1 flex justify-between items-center ${
                                                    isBalanced ? 'text-emerald-600' : 
                                                    isOverpaid ? 'text-amber-600' : 
                                                    'text-rose-600'
                                                }`}>
                                                    <span>{isBalanced ? 'Fully Covered' : isOverpaid ? 'Change Due' : 'Balance Remaining'}</span>
                                                    {!isBalanced && !isOverpaid && <span className="text-[9px] px-1.5 py-0.5 bg-rose-100 rounded-md">Pending</span>}
                                                </div>
                                                <div className={`text-3xl font-black text-right mt-1 ${
                                                    isBalanced ? 'text-emerald-700' : 
                                                    isOverpaid ? 'text-amber-700' : 
                                                    'text-rose-700'
                                                }`}>
                                                    <span className="text-base opacity-70 mr-1.5">{baseCurrency}</span>
                                                    {Math.abs(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}

                </div>
            </div>
        </>
    );
}
