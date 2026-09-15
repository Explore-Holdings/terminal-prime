import { Head, router } from '@inertiajs/react';
import AppSidebarLayout from '@/Layouts/AppSidebarLayout';
import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';

const fmt = (n) => Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (d) => d ? new Date(d).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';

export default function AccountantIndex({ receivedFinances, totalRecords = 0, totalReceived = 0, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [range, setRange] = useState(filters.range || 'all');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        router.get(
            route('accountant.index'),
            { search, range, start_date: startDate, end_date: endDate },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handleRangeChange = (newRange) => {
        setRange(newRange);
        if (newRange !== 'custom') {
            router.get(
                route('accountant.index'),
                { search, range: newRange },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }
    };

    const clearFilters = () => {
        setSearch('');
        setRange('all');
        setStartDate('');
        setEndDate('');
        router.get(
            route('accountant.index'),
            { range: 'all' },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const [viewSlipsModal, setViewSlipsModal] = useState(null);

    const handleApprove = (tripFinance) => {
        if (window.confirm(`Are you sure you want to approve the finance record for Trip #${tripFinance.trip_id}?`)) {
            const toastId = toast.loading('Approving...');
            router.post(
                route('accountant.approve', tripFinance.id),
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => toast.success(`Trip #${tripFinance.trip_id} approved successfully.`, { id: toastId }),
                    onError: () => toast.error('Failed to approve record.', { id: toastId }),
                }
            );
        }
    };

    const updateSlipStatus = (slipId, status) => {
        const toastId = toast.loading(`Marking slip as ${status}...`);
        router.post(
            route('accountant.slips.status', slipId),
            { status },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Slip marked as ${status}.`, { id: toastId });
                    setViewSlipsModal(null);
                },
                onError: () => toast.error('Failed to update status.', { id: toastId }),
            }
        );
    };

    return (
        <AppSidebarLayout title="Accountant">
            <Head title="Accountant" />
            
            <div className="mb-6">
                <h1 className="text-2xl font-black text-[#0f1d45]">Accountant Dashboard</h1>
                <p className="text-sm font-medium text-gray-400 mt-1">Trips and amounts received from the Counter Manager</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-7">
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total Received Records</p>
                    <p className="text-2xl font-black leading-tight text-[#0f1d45] mt-1.5">{totalRecords}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total Amount Received</p>
                    <p className="text-2xl font-black leading-tight text-emerald-600 mt-1.5">LKR {fmt(totalReceived)}</p>
                </div>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <h2 className="text-lg font-black text-[#0f1d45]">Received Finances</h2>
                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
                        <div className="flex flex-wrap items-center gap-2">
                            {[
                                { key: 'all', label: 'All Time' },
                                { key: 'today', label: 'Today' },
                                { key: 'week',  label: 'This Week' },
                                { key: 'month', label: 'This Month' },
                                { key: 'custom', label: 'Custom' },
                            ].map((item) => (
                                <button
                                    key={item.key}
                                    type="button"
                                    onClick={() => handleRangeChange(item.key)}
                                    className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                                        range === item.key
                                            ? 'bg-blue-700 text-white'
                                            : 'bg-gray-100 text-black hover:bg-gray-200'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                        
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                            <input
                                type="text"
                                placeholder="Search by Trip ID or Customer Name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full md:w-64 rounded-xl border-gray-200 text-sm focus:border-[#0f1d45] focus:ring-[#0f1d45]"
                            />
                            
                            {range === 'custom' && (
                                <>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full md:w-auto rounded-xl border-gray-200 text-sm focus:border-[#0f1d45] focus:ring-[#0f1d45]"
                                    />
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full md:w-auto rounded-xl border-gray-200 text-sm focus:border-[#0f1d45] focus:ring-[#0f1d45]"
                                    />
                                </>
                            )}
                            
                            <div className="flex gap-2">
                                <button type="submit" className="px-4 py-2 bg-[#0f1d45] text-white rounded-xl text-sm font-bold hover:bg-black transition">
                                    Search
                                </button>
                                {(search || range === 'custom') && (
                                    <button type="button" onClick={clearFilters} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition">
                                        Clear
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-sm whitespace-nowrap">
                        <thead>
                            <tr className="bg-[#f5f6fa]">
                                <th className="px-4 py-3 text-left text-xs font-bold text-[#0f1d45] uppercase tracking-wider">Trip ID</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-[#0f1d45] uppercase tracking-wider">Received At</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-[#0f1d45] uppercase tracking-wider">Payment Breakdown</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-[#0f1d45] uppercase tracking-wider">Received By</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-[#0f1d45] uppercase tracking-wider">Amount (LKR)</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-[#0f1d45] uppercase tracking-wider">Slips</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-[#0f1d45] uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 bg-white">
                            {receivedFinances.data && receivedFinances.data.length > 0 ? (
                                receivedFinances.data.map((tf) => {
                                    let paymentNotes = [];
                                    try {
                                        const raw = tf.trip?.customer?.payment_notes;
                                        paymentNotes = typeof raw === 'string' ? JSON.parse(raw) : (raw || []);
                                    } catch (e) {}

                                    return (
                                        <tr key={tf.id} className="hover:bg-[#f5f6fa]/50 transition">
                                            <td className="px-4 py-3 font-bold text-[#0f1d45]">#{tf.trip_id}</td>
                                            <td className="px-4 py-3 text-gray-600 font-medium">{fmtDate(tf.received_at)}</td>
                                            <td className="px-4 py-3">
                                                {paymentNotes.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {paymentNotes.map((p, pi) => (
                                                            <div key={pi} className="flex flex-wrap items-center gap-1 text-[10px]">
                                                                <span className={`px-1 py-0.5 rounded font-bold uppercase ${p.method === 'Cash' ? 'bg-emerald-100 text-black' : 'bg-blue-100 text-black'}`}>
                                                                    {p.method}
                                                                </span>
                                                                {p.method === 'Cash' && Array.isArray(p.notes) && p.notes.map((n, ni) => (
                                                                    <span key={ni} className="bg-slate-100 text-black px-1 py-0.5 rounded border font-semibold">
                                                                        💵 {n.amount} x {n.count} ({n.currency || p.currency})
                                                                    </span>
                                                                ))}
                                                                {p.method !== 'Cash' && p.amount && (
                                                                    <span className="font-semibold text-gray-600 ml-1">
                                                                        {p.currency} {fmt(p.amount)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic text-xs">No breakdown</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                                    {tf.receiver?.name || 'System'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-black text-emerald-600">
                                                LKR {fmt(tf.received_amount)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {tf.payment_slips && tf.payment_slips.length > 0 ? (
                                                    <button
                                                        onClick={() => setViewSlipsModal(tf)}
                                                        className="rounded bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 hover:bg-blue-200 transition"
                                                    >
                                                        View Slips ({tf.payment_slips.length})
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400 text-xs italic">No Slips</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {tf.accountant_approved ? (
                                                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                                                        Approved {tf.approver?.name ? `by ${tf.approver.name}` : ''}
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleApprove(tf)}
                                                        className="rounded bg-[#0f1d45] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#1a2d5c] active:scale-95 transition-transform shadow-sm"
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500 font-medium bg-[#f5f6fa]/30">
                                        No received records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {receivedFinances.links && receivedFinances.links.length > 3 && (
                    <div className="mt-6 flex flex-wrap justify-center gap-1">
                        {receivedFinances.links.map((link, k) => (
                            <button
                                key={k}
                                onClick={() => link.url && router.get(link.url, { search, range, start_date: startDate, end_date: endDate }, { preserveState: true, preserveScroll: true })}
                                disabled={!link.url}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                                    link.active
                                        ? 'bg-[#0f1d45] text-white shadow-md'
                                        : link.url
                                        ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                        : 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-100'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* View Slips Modal */}
            {viewSlipsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setViewSlipsModal(null)}>
                    <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#f5f6fa]/50 shrink-0">
                            <h3 className="text-lg font-black text-[#0f1d45]">Slips for Trip #{viewSlipsModal.trip_id}</h3>
                            <button onClick={() => setViewSlipsModal(null)} className="text-gray-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1 space-y-4">
                            {viewSlipsModal.payment_slips.map(slip => (
                                <div key={slip.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
                                    <div>
                                        <p className="text-sm font-bold text-[#0f1d45] mb-1">Description:</p>
                                        <p className="text-sm text-gray-600 mb-2">{slip.slip_des || <span className="italic text-gray-400">No description provided</span>}</p>
                                        <div className="flex gap-2 text-xs font-semibold">
                                            <span className="text-gray-500">Status:</span>
                                            <span className={`uppercase ${slip.status === 'completed' ? 'text-emerald-600' : slip.status === 'incomplete' ? 'text-rose-600' : 'text-amber-600'}`}>
                                                {slip.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                                        <a href={`/storage/${slip.slip_path}`} target="_blank" rel="noreferrer" className="text-center rounded bg-gray-200 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-300 transition">
                                            View Slip
                                        </a>
                                        {slip.status !== 'completed' && (
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => updateSlipStatus(slip.id, 'completed')}
                                                    className="flex-1 rounded bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
                                                >
                                                    Complete
                                                </button>
                                                <button 
                                                    onClick={() => updateSlipStatus(slip.id, 'incomplete')}
                                                    className="flex-1 rounded bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition"
                                                >
                                                    Incomplete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
                            <button
                                type="button"
                                onClick={() => setViewSlipsModal(null)}
                                className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-xl transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppSidebarLayout>
    );
}
