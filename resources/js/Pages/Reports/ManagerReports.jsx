import AppSidebarLayout from '@/Layouts/AppSidebarLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Clock, Eye, Printer, FileText, Calendar, CheckCircle, Banknote, CreditCard, Wallet, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

function buildPages(page, totalPages) {
    if (!totalPages || totalPages <= 1) return [1];
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const set = new Set([1, 2, page - 1, page, page + 1, totalPages - 1, totalPages].filter(p => p >= 1 && p <= totalPages));
    const arr = [...set].sort((a, b) => a - b);
    const result = [];
    arr.forEach((p, i) => {
        if (i > 0 && p - arr[i - 1] > 1) result.push('…');
        result.push(p);
    });
    return result;
}

function TablePagination({
    currentPage,
    totalItems,
    perPage,
    onPageChange,
    onPerPageChange,
    perPageOptions = [10, 25, 50, 100],
}) {
    if (totalItems === 0) return null;

    const totalPages = Math.ceil(totalItems / perPage) || 1;
    const start = (currentPage - 1) * perPage + 1;
    const end = Math.min(currentPage * perPage, totalItems);

    const pages = buildPages(currentPage, totalPages);

    return (
        <div className="bg-gray-50/70 border-t border-gray-200 px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-black">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 font-medium text-black">
                    <span>Rows per page:</span>
                    <select
                        value={perPage}
                        onChange={(e) => {
                            onPerPageChange(Number(e.target.value));
                            onPageChange(1);
                        }}
                        className="border border-gray-300 rounded-lg px-2 py-1 bg-white text-xs font-semibold text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {perPageOptions.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                </div>
                <span className="text-black font-medium">
                    Showing <span className="font-bold">{start}</span> to <span className="font-bold">{end}</span> of <span className="font-bold">{totalItems}</span> entries
                </span>
            </div>

            <div className="flex items-center gap-1.5">
                <button
                    type="button"
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white font-semibold text-black hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs"
                >
                    <ChevronLeft size={14} />
                    <span className="hidden sm:inline">Prev</span>
                </button>

                <div className="flex items-center gap-1">
                    {pages.map((p, i) =>
                        p === '…' ? (
                            <span key={`ellipsis-${i}`} className="w-7 h-7 flex items-center justify-center text-xs text-gray-400">
                                …
                            </span>
                        ) : (
                            <button
                                key={p}
                                type="button"
                                onClick={() => onPageChange(p)}
                                className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                                    p === currentPage
                                        ? 'bg-blue-700 text-white shadow-xs'
                                        : 'bg-white border border-gray-200 text-black hover:bg-gray-100'
                                }`}
                            >
                                {p}
                            </button>
                        )
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white font-semibold text-black hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs"
                >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
}

export default function ManagerReports({ trips = [], reports = [], filters = {}, paymentSummary = null, pettyCashReturns = [], pettyCashRequests = [] }) {
    const currentRange = filters.range || 'today';
    const [fromDate, setFromDate] = useState(filters.from || '');
    const [toDate, setToDate] = useState(filters.to || '');

    // Pagination states
    const [pettyCashPage, setPettyCashPage] = useState(1);
    const [pettyCashPerPage, setPettyCashPerPage] = useState(10);

    const [tripsPage, setTripsPage] = useState(1);
    const [tripsPerPage, setTripsPerPage] = useState(10);

    const [returnsPage, setReturnsPage] = useState(1);
    const [returnsPerPage, setReturnsPerPage] = useState(10);

    const handleRangeChange = (range) => {
        if (range === 'custom') {
            router.get('/manager-reports', { range, from: fromDate, to: toDate }, { preserveState: true });
        } else {
            router.get('/manager-reports', { range }, { preserveState: true });
        }
    };

    const handleApplyCustom = (e) => {
        e.preventDefault();
        if (!fromDate || !toDate) {
            alert('Please select both From and To dates.');
            return;
        }
        router.get('/manager-reports', { range: 'custom', from: fromDate, to: toDate }, { preserveState: true });
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const rangeOptions = [
        { label: 'Today', value: 'today' },
        { label: 'This Week', value: 'week' },
        { label: 'This Month', value: 'month' },
        { label: 'Custom Range', value: 'custom' },
    ];

    const totalTrips = trips.length;
    const totalRevenue = trips.reduce((sum, t) => sum + Number(t.trip_finance?.total_amount ?? 0), 0);

    const cashNotes = paymentSummary?.cashNotes ?? [];
    const byMethod = paymentSummary?.byMethod ?? {};
    const posTransactions = paymentSummary?.posTransactions ?? [];

    const exportQuery = currentRange === 'custom'
        ? `?range=custom&from=${filters.from || ''}&to=${filters.to || ''}`
        : `?range=${currentRange}`;

    // Pagination slices
    const totalPettyCashPages = Math.ceil(pettyCashRequests.length / pettyCashPerPage) || 1;
    const currentPettyCashPage = pettyCashPage > totalPettyCashPages ? 1 : pettyCashPage;
    const paginatedPettyCashRequests = pettyCashRequests.slice(
        (currentPettyCashPage - 1) * pettyCashPerPage,
        currentPettyCashPage * pettyCashPerPage
    );

    const totalTripsPages = Math.ceil(trips.length / tripsPerPage) || 1;
    const currentTripsPage = tripsPage > totalTripsPages ? 1 : tripsPage;
    const paginatedTrips = trips.slice(
        (currentTripsPage - 1) * tripsPerPage,
        currentTripsPage * tripsPerPage
    );

    const totalReturnsPages = Math.ceil(pettyCashReturns.length / returnsPerPage) || 1;
    const currentReturnsPage = returnsPage > totalReturnsPages ? 1 : returnsPage;
    const paginatedReturns = pettyCashReturns.slice(
        (currentReturnsPage - 1) * returnsPerPage,
        currentReturnsPage * returnsPerPage
    );

    return (
        <AppSidebarLayout title="Manager Reports">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-black">
                        Manager Reports Dashboard
                    </h1>
                    <p className="text-black mt-1 text-sm">
                        Generate global reports and review individual shift checkouts.
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Filter Card (Full Width) */}
                <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4 print:hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-bold text-black uppercase tracking-wider block mb-1">
                                Report Scope
                            </span>
                            <div className="flex rounded-lg border bg-white overflow-hidden text-sm font-medium">
                                {rangeOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => handleRangeChange(opt.value)}
                                        className={`px-4 py-2 transition ${
                                            currentRange === opt.value
                                                ? 'bg-blue-700 text-white'
                                                : 'text-black hover:bg-gray-50 bg-white'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <a
                                href={`/manager-reports/trips/print${exportQuery}`}
                                target="_blank"
                                className="inline-flex items-center gap-1.5 bg-slate-100 text-black border border-slate-200 font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-200 transition text-sm shadow-sm"
                            >
                                <Printer size={16} />
                                Print Report
                            </a>
                            <a
                                href={`/manager-reports/trips/pdf${exportQuery}`}
                                className="inline-flex items-center gap-1.5 bg-slate-100 text-black border border-slate-200 font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-200 transition text-sm shadow-sm"
                            >
                                <FileText size={16} />
                                Download PDF
                            </a>
                        </div>
                    </div>

                    {/* Custom Date Range Form */}
                    {currentRange === 'custom' && (
                        <form onSubmit={handleApplyCustom} className="flex flex-wrap items-end gap-3 p-4 bg-gray-50 border rounded-xl">
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-black uppercase">From Date</label>
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="text-sm border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-black uppercase">To Date</label>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="text-sm border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-4 py-2 rounded-lg text-sm transition"
                            >
                                Apply Filter
                            </button>
                        </form>
                    )}
                </div>

                {/* Side-by-Side Row: Equal Height */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    {/* Payment Collections & Cash Notes Summary */}
                    <div className="lg:col-span-7 flex flex-col">
                        <div className="bg-white border rounded-2xl p-5 shadow-sm flex flex-col h-[480px]">
                            <div className="border-b pb-3 mb-4 flex items-center justify-between shrink-0">
                                <div>
                                    <h2 className="text-base font-bold text-black flex items-center gap-2">
                                        <Wallet size={18} className="text-black" />
                                        Payment Collections & Cash Notes Summary ({currentRange.toUpperCase()})
                                    </h2>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 min-h-0">
                                {/* Card 1: Collection by Payment Method & Currency */}
                                <div className="bg-slate-50 border rounded-xl p-3.5 flex flex-col min-h-0 h-full">
                                    <h3 className="text-xs font-bold text-black flex items-center gap-1.5 uppercase tracking-wide shrink-0 mb-3">
                                        <CreditCard size={15} className="text-black" />
                                        Collection by Payment Method
                                    </h3>

                                    <div className="space-y-2 text-xs flex-1 min-h-0 overflow-y-auto pr-1">
                                        {Object.keys(byMethod).length > 0 ? (
                                            Object.entries(byMethod).map(([method, data]) => (
                                                <div key={method} className="bg-white border rounded-lg p-2.5 space-y-1">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-bold text-black flex items-center gap-1.5">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-extrabold ${method === 'Cash' ? 'bg-emerald-100 text-black' : 'bg-blue-100 text-black'}`}>
                                                                {method}
                                                            </span>
                                                            <span>({data.count} txns)</span>
                                                        </span>
                                                        <span className="font-black text-black">
                                                            LKR {data.total.toLocaleString()}
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-wrap gap-1 pt-1 border-t">
                                                        {Object.entries(data.currencies || {}).map(([cur, amt]) => (
                                                            <span key={cur} className="bg-slate-100 text-black border px-2 py-0.5 rounded font-semibold text-[10px]">
                                                                {cur} {Number(amt).toLocaleString()}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-black italic">No collections recorded.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Card 2: Cash Denominations Handover */}
                                <div className="bg-slate-50 border rounded-xl p-3.5 flex flex-col min-h-0 h-full">
                                    <h3 className="text-xs font-bold text-black flex items-center gap-1.5 uppercase tracking-wide shrink-0 mb-3">
                                        <Banknote size={15} className="text-black" />
                                        Cash Notes Denomination Summary
                                    </h3>

                                    <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                                        {cashNotes.length > 0 ? (
                                            <div className="overflow-hidden rounded-lg border bg-white">
                                                <table className="w-full text-left text-xs">
                                                    <thead className="bg-slate-100 border-b text-black font-bold uppercase text-[10px] sticky top-0">
                                                        <tr>
                                                            <th className="px-2.5 py-1.5">Currency</th>
                                                            <th className="px-2.5 py-1.5">Note</th>
                                                            <th className="px-2.5 py-1.5 text-center">Qty</th>
                                                            <th className="px-2.5 py-1.5 text-right">Subtotal</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y text-black">
                                                        {cashNotes.map((cn, idx) => (
                                                            <tr key={idx} className="hover:bg-slate-50">
                                                                <td className="px-2.5 py-1.5 font-bold text-black">{cn.currency}</td>
                                                                <td className="px-2.5 py-1.5 font-semibold">{Number(cn.note_value).toLocaleString()}</td>
                                                                <td className="px-2.5 py-1.5 text-center font-bold text-black">× {cn.count}</td>
                                                                <td className="px-2.5 py-1.5 text-right font-black text-black">
                                                                    {cn.currency} {Number(cn.total).toLocaleString()}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="p-3 bg-white border rounded-lg text-center text-xs text-black italic">
                                                No cash notes recorded for this range.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submitted Shifts */}
                    <div className="lg:col-span-5 flex flex-col">
                        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col h-[480px]">
                            <div className="p-4 px-5 border-b bg-gray-50/70 shrink-0 flex items-center justify-between">
                                <div>
                                    <h2 className="text-base font-bold text-black flex items-center gap-2">
                                        <Clock size={18} className="text-black" />
                                        Submitted Shifts
                                    </h2>
                                    <p className="text-xs text-gray-600 mt-0.5">Recent checkouts handed over by staff</p>
                                </div>
                                <span className="text-xs font-bold bg-white text-black px-2.5 py-1 rounded-full border border-gray-200 shadow-2xs">
                                    {reports.length} {reports.length === 1 ? 'Shift' : 'Shifts'}
                                </span>
                            </div>

                            <div className="divide-y overflow-y-auto flex-1 min-h-0 overscroll-contain">
                                {reports.length > 0 ? (
                                    reports.map((report, idx) => (
                                        <div
                                            key={report.id}
                                            className={`p-4 hover:bg-gray-50 transition flex flex-col gap-2.5 ${
                                                idx === 0 ? 'bg-blue-50/30' : ''
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-black text-sm">{report.user?.name}</p>
                                                        {idx === 0 && (
                                                            <span className="bg-blue-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                                Latest
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500">{report.user?.email}</p>
                                                </div>
                                                <span className="inline-flex items-center gap-0.5 bg-green-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-green-200">
                                                    <CheckCircle size={10} />
                                                    Submitted
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 text-xs border-t border-gray-100 pt-2">
                                                <div>
                                                    <span className="text-gray-500 block text-[11px] font-medium">Submitted At</span>
                                                    <span className="font-semibold text-black">
                                                        {new Date(report.handed_over_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} @ {new Date(report.handed_over_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 block text-[11px] font-medium">Total Trips</span>
                                                    <span className="font-semibold text-black">{report.total_trips} trips</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between border-t border-gray-100 pt-2 mt-0.5">
                                                <span className="text-xs font-bold text-black">
                                                    LKR {Number(report.total_revenue).toLocaleString()}
                                                </span>
                                                <Link
                                                    href={`/checkout-summary/${report.id}`}
                                                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 transition"
                                                >
                                                    View Summary <Eye size={12} />
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-gray-500 text-sm my-auto">
                                        No shifts handed over yet.
                                    </div>
                                )}
                            </div>

                            {reports.length > 3 && (
                                <div className="px-4 py-2 bg-gray-50 border-t text-[11px] text-gray-500 text-center font-medium shrink-0">
                                    Scroll to view older shifts ({reports.length} total)
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Petty Cash Requests Panel (Full Width) */}
                <div className="bg-white border rounded-2xl overflow-hidden shadow-sm w-full">
                    <div className="p-5 border-b flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h2 className="text-lg font-bold text-black flex items-center gap-2">
                                <Banknote size={18} className="text-black" />
                                Petty Cash Replenishment Requests ({pettyCashRequests.length})
                            </h2>
                            <p className="text-xs text-black mt-0.5">Requests sent to Finance after each shift</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {pettyCashRequests.length > 0 ? (
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead>
                                    <tr className="bg-gray-50 border-b text-black font-semibold uppercase text-[10px]">
                                        <th className="px-5 py-3">Date & Time</th>
                                        <th className="px-5 py-3">Shift ID</th>
                                        <th className="px-5 py-3 text-right">Till Balance</th>
                                        <th className="px-5 py-3 text-right">Needed (To 100k)</th>
                                        <th className="px-5 py-3 text-center">Status / Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-black">
                                    {paginatedPettyCashRequests.map((req) => (
                                        <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-5 py-3 text-xs">
                                                <div className="font-medium text-gray-900">
                                                    {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                                <div className="text-[11px] text-gray-500 font-medium">
                                                    {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-mono font-bold block w-fit">
                                                    {req.shift_id}
                                                </span>
                                                {req.officer_name && (
                                                    <span className="block text-[11px] font-semibold text-gray-600 mt-0.5">
                                                        {req.officer_name}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-right font-semibold text-gray-600">
                                                LKR {Number(req.balance_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-5 py-3 text-right font-bold text-black">
                                                LKR {Number(req.needed_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-5 py-3 text-center">
                                                {req.status === 'Pending' ? (
                                                    <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                                        Pending
                                                    </span>
                                                ) : req.status === 'Approved' ? (
                                                    <div>
                                                        <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                                            Approved
                                                        </span>
                                                        {req.approved_at && (
                                                            <div className="text-[10px] text-gray-500 mt-1">
                                                                {formatDateTime(req.approved_at)}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm(`Are you sure you want to request petty cash replenishment of LKR ${Number(req.needed_amount).toLocaleString()} for ${req.shift_id}?`)) {
                                                                router.post('/finance/petty-cash-requests', {
                                                                    shift_id: req.shift_id,
                                                                    balance_amount: req.balance_amount,
                                                                    needed_amount: req.needed_amount,
                                                                }, {
                                                                    preserveScroll: true,
                                                                });
                                                            }
                                                        }}
                                                        className="inline-flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition shadow-sm"
                                                    >
                                                        Req Needed Amount
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-8 text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                                    <Banknote size={24} className="text-slate-400" />
                                </div>
                                <p className="text-slate-500 font-medium">No petty cash requests found.</p>
                            </div>
                        )}
                    </div>

                    {pettyCashRequests.length > 0 && (
                        <TablePagination
                            currentPage={currentPettyCashPage}
                            totalItems={pettyCashRequests.length}
                            perPage={pettyCashPerPage}
                            onPageChange={setPettyCashPage}
                            onPerPageChange={setPettyCashPerPage}
                            perPageOptions={[5, 10, 25, 50]}
                        />
                    )}
                </div>

                {/* Trips List Panel (Full Width) */}
                <div className="bg-white border rounded-2xl overflow-hidden shadow-sm w-full">
                    <div className="p-5 border-b flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h2 className="text-lg font-bold text-black flex items-center gap-2">
                                <Calendar size={18} className="text-black" />
                                Trips list for this range ({totalTrips})
                            </h2>
                            <p className="text-xs text-black mt-0.5">Assigned trips during this period with payment details</p>
                        </div>

                        <div className="text-right">
                            <span className="text-xs font-semibold text-black uppercase tracking-wider block">Total Revenue</span>
                            <span className="text-xl font-black text-black">LKR {totalRevenue.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {trips.length > 0 ? (
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead>
                                    <tr className="bg-gray-50 border-b text-black font-semibold uppercase text-[10px]">
                                        <th className="px-5 py-3">Date & Time</th>
                                        <th className="px-5 py-3">Shift & Officer</th>
                                        <th className="px-5 py-3">Customer</th>
                                        <th className="px-5 py-3">Driver & Vehicle</th>
                                        <th className="px-5 py-3">Payment & Cash Notes</th>
                                        <th className="px-5 py-3">Dropoff</th>
                                        <th className="px-5 py-3 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-black">
                                    {paginatedTrips.map((trip) => {
                                        const tripTime = new Date(trip.trip_assigned_at ?? trip.created_at);
                                        const customer = trip.customer;
                                        const paymentNotes = Array.isArray(customer?.payment_notes)
                                            ? customer.payment_notes
                                            : (typeof customer?.payment_notes === 'string' ? JSON.parse(customer.payment_notes || '[]') : []);

                                        return (
                                            <tr key={trip.id} className="hover:bg-gray-50/50 transition">
                                                <td className="px-5 py-4 text-xs">
                                                    <div className="font-semibold text-black">
                                                        {tripTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </div>
                                                    <div className="text-black">
                                                        {tripTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="font-semibold text-black">{trip.shift_id || 'N/A'}</div>
                                                    <div className="text-xs text-black">{trip.assigned_by?.name || '-'}</div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="font-semibold text-black">{customer?.name ?? 'Guest'}</div>
                                                    <div className="text-xs text-black">{customer?.customer_code}</div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="font-semibold text-black">{trip.driver?.first_name + ' ' + trip.driver?.last_name}</div>
                                                    <div className="text-xs text-black">{trip.driver?.vehicle?.registration_number ?? '-'} ({trip.driver?.vehicle?.vehicle_type ?? ''})</div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    {paymentNotes.length > 0 ? (
                                                        <div className="space-y-1">
                                                            {paymentNotes.map((p, pi) => (
                                                                <div key={pi} className="flex flex-wrap items-center gap-1 text-xs">
                                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${p.method === 'Cash' ? 'bg-emerald-100 text-black' : 'bg-blue-100 text-black'}`}>
                                                                        {p.method}
                                                                    </span>
                                                                    <span className="font-semibold text-black">
                                                                        {p.currency} {Number(p.amount).toLocaleString()}
                                                                    </span>
                                                                    {p.method === 'Cash' && Array.isArray(p.notes) && p.notes.map((n, ni) => (
                                                                        <span key={ni} className="bg-slate-100 text-black px-1.5 py-0.5 rounded text-[10px] border">
                                                                            💵 {n.amount} x {n.count} ({n.currency || p.currency})
                                                                        </span>
                                                                    ))}
                                                                    {p.transaction_id && (
                                                                        <span className="text-[10px] text-black font-mono">
                                                                            TXN: {p.transaction_id}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-black">{customer?.payment_method ?? 'Cash'}</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 max-w-[150px] truncate" title={customer?.dropoff_location}>
                                                    {customer?.dropoff_location ?? '-'}
                                                </td>
                                                <td className="px-5 py-4 text-right font-bold text-black">
                                                    LKR {Number(trip.trip_finance?.total_amount ?? 0).toLocaleString()}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-12 text-center text-black">
                                No trips assigned for this range.
                            </div>
                        )}
                    </div>

                    {trips.length > 0 && (
                        <TablePagination
                            currentPage={currentTripsPage}
                            totalItems={trips.length}
                            perPage={tripsPerPage}
                            onPageChange={setTripsPage}
                            onPerPageChange={setTripsPerPage}
                            perPageOptions={[10, 25, 50, 100]}
                        />
                    )}
                </div>

                {/* Petty Cash Returns Panel (Full Width) */}
                <div className="bg-white border rounded-2xl overflow-hidden shadow-sm w-full">
                    <div className="p-5 border-b flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h2 className="text-lg font-bold text-black flex items-center gap-2">
                                <Banknote size={18} className="text-black" />
                                Petty Cash Returns (Change Given) ({pettyCashReturns.length})
                            </h2>
                            <p className="text-xs text-black mt-0.5">Change returned from the petty cash drawer during this period</p>
                        </div>

                        <div className="text-right">
                            <span className="text-xs font-semibold text-black uppercase tracking-wider block">Total Returned</span>
                            <span className="text-xl font-black text-black">LKR {pettyCashReturns.reduce((sum, r) => sum + Number(r.amount_lkr), 0).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {pettyCashReturns.length > 0 ? (
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead>
                                    <tr className="bg-gray-50 border-b text-black font-semibold uppercase text-[10px]">
                                        <th className="px-5 py-3">Date & Time</th>
                                        <th className="px-5 py-3">Customer</th>
                                        <th className="px-5 py-3 text-right">Amount (LKR)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-black">
                                    {paginatedReturns.map((r) => {
                                        const rTime = new Date(r.created_at);
                                        return (
                                            <tr key={r.id} className="hover:bg-gray-50/50 transition">
                                                <td className="px-5 py-4 text-xs">
                                                    <div className="font-semibold text-black">
                                                        {rTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </div>
                                                    <div className="text-black">
                                                        {rTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="font-semibold text-black">{r.customer?.name ?? 'Guest'}</div>
                                                    <div className="text-xs text-black">{r.customer?.customer_code}</div>
                                                </td>
                                                <td className="px-5 py-4 text-right font-bold text-black">
                                                    LKR {Number(r.amount_lkr).toLocaleString()}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-12 text-center text-black">
                                No petty cash returns for this range.
                            </div>
                        )}
                    </div>

                    {pettyCashReturns.length > 0 && (
                        <TablePagination
                            currentPage={currentReturnsPage}
                            totalItems={pettyCashReturns.length}
                            perPage={returnsPerPage}
                            onPageChange={setReturnsPage}
                            onPerPageChange={setReturnsPerPage}
                            perPageOptions={[5, 10, 25, 50]}
                        />
                    )}
                </div>
            </div>
        </AppSidebarLayout>
    );
}
