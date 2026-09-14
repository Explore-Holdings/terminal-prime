import { Head } from '@inertiajs/react';
import AppSidebarLayout from '@/Layouts/AppSidebarLayout';
import { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import {
    ChevronDownIcon,
    ChevronUpIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const fmt = (n) => Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (d) => d ? new Date(d).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';
const calcDuration = (a, b) => {
    if (!a || !b) return 'N/A';
    const ms = new Date(b) - new Date(a);
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return h + 'h ' + m + 'm';
};

function TripDetailsModal({ shift, onClose }) {
    const trips = shift.trips || [];
    const byMethod = shift.payment_summary?.byMethod || {};
    const cashNotes = shift.payment_summary?.cashNotes || [];
    const posTransactions = shift.payment_summary?.posTransactions || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div
                className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white border border-gray-100 rounded-2xl shadow-xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-white/95 backdrop-blur z-10 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-[#0f1d45]">{shift.user_name}</h2>
                        <p className="text-sm font-medium text-gray-400 mt-0.5">
                            {fmtDate(shift.login_at)} → {fmtDate(shift.logout_at)}
                            {shift.shift_id ? '  ·  Shift #' + shift.shift_id : ''}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* KPIs */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Trips', value: shift.total_trips },
                            { label: 'Revenue', value: 'LKR ' + fmt(shift.total_revenue) },
                            { label: 'Driver Shares', value: 'LKR ' + fmt(shift.total_driver_share) },
                            { label: 'Balance', value: 'LKR ' + fmt(shift.total_balance) },
                        ].map((k) => (
                            <div key={k.label} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">{k.label}</p>
                                <p className="text-xl font-black text-[#0f1d45] mt-1">{k.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Payment Methods */}
                    {Object.keys(byMethod).length > 0 && (
                        <div>
                            <h3 className="text-sm font-black text-[#0f1d45] mb-3">Payment Methods</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {Object.entries(byMethod).map(([method, data]) => (
                                    <div key={method} className="bg-[#f5f6fa]/50 border border-gray-100 rounded-xl p-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-[#0f1d45]">
                                                {method} <span className="text-gray-400 font-medium text-xs ml-1">({data.count} txn{data.count !== 1 ? 's' : ''})</span>
                                            </span>
                                            <span className="text-sm font-black text-[#0f1d45]">LKR {fmt(data.total)}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {Object.entries(data.currencies || {}).map(([cur, amt]) => (
                                                <span key={cur} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-500">{cur} {fmt(amt)}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Cash Notes */}
                    {cashNotes.length > 0 && (
                        <div>
                            <h3 className="text-sm font-black text-[#0f1d45] mb-3">Cash Notes</h3>
                            <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-[#f5f6fa]">
                                            <th className="px-4 py-3 text-left text-xs font-bold text-[#0f1d45] uppercase tracking-wider">Currency</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-[#0f1d45] uppercase tracking-wider">Note</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-[#0f1d45] uppercase tracking-wider">Qty</th>
                                            <th className="px-4 py-3 text-right text-xs font-bold text-[#0f1d45] uppercase tracking-wider">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 bg-white">
                                        {cashNotes.map((cn, i) => (
                                            <tr key={i} className="hover:bg-[#f5f6fa]/50 transition">
                                                <td className="px-4 py-3 font-bold text-[#0f1d45]">{cn.currency}</td>
                                                <td className="px-4 py-3 text-gray-600 font-medium">{Number(cn.note_value).toLocaleString()}</td>
                                                <td className="px-4 py-3 text-center text-gray-600 font-medium">×{cn.count}</td>
                                                <td className="px-4 py-3 text-right font-black text-[#0f1d45]">{cn.currency} {fmt(cn.total)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* POS Transactions */}
                    {posTransactions.length > 0 && (
                        <div>
                            <h3 className="text-sm font-black text-[#0f1d45] mb-3">POS / Card Transactions</h3>
                            <div className="space-y-2">
                                {posTransactions.map((tx, i) => (
                                    <div key={i} className="flex flex-wrap gap-4 justify-between items-center bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
                                        <div>
                                            <span className="text-sm font-bold text-[#0f1d45]">{tx.customer_name}</span>
                                            <span className="ml-2 text-xs font-medium text-gray-400">({tx.customer_code})</span>
                                            {tx.transaction_id && <p className="text-[10px] text-gray-500 font-mono mt-0.5">TXN: {tx.transaction_id}</p>}
                                        </div>
                                        <span className="text-sm font-black text-[#0f1d45]">{tx.currency} {fmt(tx.amount)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Trips */}
                    <div>
                        <h3 className="text-sm font-black text-[#0f1d45] mb-3">Trips ({trips.length})</h3>
                        {trips.length > 0 ? (
                            <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
                                <table className="w-full text-sm whitespace-nowrap">
                                    <thead>
                                        <tr className="bg-[#f5f6fa]">
                                            <th className="px-4 py-3 text-left text-xs font-bold text-[#0f1d45] uppercase tracking-wider">#</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-[#0f1d45] uppercase tracking-wider">Time</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-[#0f1d45] uppercase tracking-wider">Customer</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-[#0f1d45] uppercase tracking-wider">Driver</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-[#0f1d45] uppercase tracking-wider">Dropoff</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-[#0f1d45] uppercase tracking-wider">Payment</th>
                                            <th className="px-4 py-3 text-right text-xs font-bold text-[#0f1d45] uppercase tracking-wider">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 bg-white">
                                        {trips.map((trip, idx) => {
                                            const c = trip.customer;
                                            let pn = [];
                                            try { pn = Array.isArray(c?.payment_notes) ? c.payment_notes : JSON.parse(c?.payment_notes || '[]'); } catch (_) {}
                                            return (
                                                <tr key={trip.id} className="hover:bg-[#f5f6fa]/50 transition text-gray-600 font-medium">
                                                    <td className="px-4 py-3">{idx + 1}</td>
                                                    <td className="px-4 py-3">{trip.trip_assigned_at ? new Date(trip.trip_assigned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-bold text-[#0f1d45]">{c?.name || 'Guest'}</div>
                                                        <div className="text-gray-400 text-[10px]">{c?.customer_code}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-bold text-[#0f1d45]">{trip.driver ? trip.driver.first_name + ' ' + trip.driver.last_name : '—'}</div>
                                                        <div className="text-gray-400 text-[10px]">{trip.driver?.vehicle?.registration_number || '—'}</div>
                                                    </td>
                                                    <td className="px-4 py-3 max-w-[150px] truncate" title={c?.dropoff_location}>{c?.dropoff_location || '—'}</td>
                                                    <td className="px-4 py-3">
                                                        {pn.length > 0
                                                            ? pn.map((p, pi) => <span key={pi} className="mr-1.5 text-[#0f1d45] font-bold">{p.method} {p.currency} {fmt(p.amount)}</span>)
                                                            : <span className="text-gray-500">{c?.payment_method || 'Cash'}</span>
                                                        }
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-black text-[#0f1d45]">LKR {fmt(trip.trip_finance?.total_amount ?? 0)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-[#f5f6fa]">
                                            <td colSpan={6} className="px-4 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Shift Total</td>
                                            <td className="px-4 py-3 text-right font-black text-[#0f1d45]">LKR {fmt(shift.total_revenue)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">No trips for this shift.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ShiftRow({ shift, index }) {
    const [expanded, setExpanded] = useState(false);
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            {showModal && <TripDetailsModal shift={shift} onClose={() => setShowModal(false)} />}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div
                    className="flex flex-wrap items-center gap-4 px-5 py-4 cursor-pointer hover:bg-[#f5f6fa]/50 select-none"
                    onClick={() => setExpanded(e => !e)}
                >
                    <span className="text-gray-400 font-bold text-xs w-6 text-center shrink-0">{index + 1}</span>
                    <div className="min-w-[150px]">
                        <p className="text-sm font-black text-[#0f1d45]">{shift.user_name}</p>
                        {shift.shift_id && <p className="text-[10px] font-medium text-gray-400">Shift #{shift.shift_id}</p>}
                    </div>
                    <span className="text-xs font-medium text-gray-500 hidden md:block">
                        {fmtDate(shift.login_at)} → {fmtDate(shift.logout_at)}
                    </span>
                    <span className="text-xs font-medium text-gray-500">{calcDuration(shift.login_at, shift.logout_at)}</span>
                    <span className="text-xs font-bold text-[#0f1d45] bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                        {shift.total_trips} trip{shift.total_trips !== 1 ? 's' : ''}
                    </span>
                    <span className="text-sm font-black text-[#0f1d45] ml-auto">LKR {fmt(shift.total_revenue)}</span>
                    
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${shift.handed_over_at ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {shift.handed_over_at ? 'Handed Over' : 'Pending'}
                    </span>
                    <span className="text-gray-400 shrink-0 ml-2">
                        {expanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                    </span>
                </div>

                {expanded && (
                    <div className="border-t border-gray-100 bg-[#f5f6fa]/30 px-5 py-5 space-y-5">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Trips', value: shift.total_trips },
                                { label: 'Revenue', value: 'LKR ' + fmt(shift.total_revenue) },
                                { label: 'Driver Shares', value: 'LKR ' + fmt(shift.total_driver_share) },
                                { label: 'Balance', value: 'LKR ' + fmt(shift.total_balance) },
                            ].map((k) => (
                                <div key={k.label} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                                    <p className="text-[11px] font-bold text-gray-400 uppercase">{k.label}</p>
                                    <p className="text-base font-black text-[#0f1d45] mt-1">{k.value}</p>
                                </div>
                            ))}
                        </div>

                        {Object.keys(shift.payment_summary?.byMethod || {}).length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(shift.payment_summary.byMethod).map(([method, data]) => (
                                    <div key={method} className="flex items-center gap-2 text-xs bg-white border border-gray-100 rounded-lg px-3 py-2 shadow-sm">
                                        <span className="font-black text-[#0f1d45]">{method}</span>
                                        <span className="font-bold text-gray-600">LKR {fmt(data.total)}</span>
                                        <span className="font-medium text-gray-400">({data.count} txn{data.count !== 1 ? 's' : ''})</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {shift.handed_over_at && (
                            <p className="text-xs font-medium text-gray-500">Handed over: <span className="font-bold text-[#0f1d45]">{fmtDate(shift.handed_over_at)}</span></p>
                        )}

                        <div>
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
                                className="text-xs bg-[#0f1d45] text-white hover:bg-[#1a2d5c] px-4 py-2 font-bold rounded-lg transition shadow-md shadow-[#0f1d45]/10"
                            >
                                View Full Shift &amp; Trips
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default function AccountantIndex({ shifts = [] }) {
    const [search, setSearch] = useState('');
    const [filterHandedOver, setFilterHandedOver] = useState('all');

    const filtered = useMemo(() => shifts.filter((s) => {
        const q = search.toLowerCase();
        const matchSearch = !q || s.user_name.toLowerCase().includes(q) || String(s.shift_id || '').includes(q);
        const matchHandover = filterHandedOver === 'all'
            || (filterHandedOver === 'handed' && s.handed_over_at)
            || (filterHandedOver === 'pending' && !s.handed_over_at);
        return matchSearch && matchHandover;
    }), [shifts, search, filterHandedOver]);

    const totalRevenue = shifts.reduce((s, sh) => s + Number(sh.total_revenue || 0), 0);
    const totalTrips = shifts.reduce((s, sh) => s + Number(sh.total_trips || 0), 0);
    const handedOverCount = shifts.filter((s) => s.handed_over_at).length;

    return (
        <AppSidebarLayout title="Accountant">
            <Head title="Accountant" />
            
            <div className="mb-6">
                <h1 className="text-2xl font-black text-[#0f1d45]">Accountant Dashboard</h1>
                <p className="text-sm font-medium text-gray-400 mt-1">Shift handovers, trip records and payment details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-7">
                {[
                    { label: 'Total Shifts', value: shifts.length },
                    { label: 'Total Trips', value: totalTrips },
                    { label: 'Total Revenue', value: 'LKR ' + fmt(totalRevenue) },
                    { label: 'Handed Over', value: handedOverCount + ' / ' + shifts.length },
                ].map((k) => (
                    <div key={k.label} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:shadow-[#0f1d45]/5 transition-all duration-300">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{k.label}</p>
                        <p className="text-2xl font-black leading-tight text-[#0f1d45] mt-1.5">{k.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
                    <div className="relative w-full sm:max-w-xs">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by officer or shift ID..."
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-[#0f1d45] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f1d45]/20 focus:border-[#0f1d45]"
                        />
                    </div>
                    
                    <div className="flex bg-[#f5f6fa] p-1 rounded-lg w-full sm:w-auto">
                        {['all', 'handed', 'pending'].map((val) => (
                            <button
                                key={val}
                                onClick={() => setFilterHandedOver(val)}
                                className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-md transition ${
                                    filterHandedOver === val
                                        ? 'bg-white text-[#0f1d45] shadow-sm'
                                        : 'text-gray-500 hover:text-[#0f1d45]'
                                }`}
                            >
                                {val === 'all' ? 'All' : val === 'handed' ? 'Handed Over' : 'Pending'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-3">
                    <p className="text-xs font-bold text-gray-400">{filtered.length} shift{filtered.length !== 1 ? 's' : ''} found</p>
                </div>

                <div className="space-y-3">
                    {filtered.length > 0 ? filtered.map((shift, idx) => (
                        <ShiftRow key={shift.id} shift={shift} index={idx} />
                    )) : (
                        <div className="text-center py-12 bg-[#f5f6fa]/50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-sm font-bold text-gray-500">No shifts found</p>
                            <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search term</p>
                        </div>
                    )}
                </div>
            </div>
        </AppSidebarLayout>
    );
}

