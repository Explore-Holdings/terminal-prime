import { Head, router } from '@inertiajs/react';
import AppSidebarLayout from '@/Layouts/AppSidebarLayout';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

const fmt = (n) => Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (d) => d ? new Date(d).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';

export default function AccountantIndex({
    receivedFinances,
    totalRecords = 0,
    totalReceived = 0,
    pendingApprovalsCount = 0,
    pendingSlipsCount = 0,
    pendingSlipsTripsCount = 0,
    filters = {}
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [range, setRange] = useState(filters.range || 'all');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [viewSlipsModal, setViewSlipsModal] = useState(null);

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        router.get(
            route('accountant.index'),
            { search, range, start_date: startDate, end_date: endDate, status },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handleRangeChange = (newRange) => {
        setRange(newRange);
        if (newRange !== 'custom') {
            router.get(
                route('accountant.index'),
                { search, range: newRange, status },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }
    };

    const handleStatusChange = (newStatus) => {
        setStatus(newStatus);
        router.get(
            route('accountant.index'),
            { search, range, start_date: startDate, end_date: endDate, status: newStatus },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const clearFilters = () => {
        setSearch('');
        setRange('all');
        setStartDate('');
        setEndDate('');
        setStatus('all');
        router.get(
            route('accountant.index'),
            { range: 'all', status: 'all' },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handleApprove = (record) => {
        const title = record.display_id ? `${record.type_badge || 'Record'} ${record.display_id}` : `Trip #${record.trip_id}`;
        if (window.confirm(`Are you sure you want to approve ${title}?`)) {
            const toastId = toast.loading(`Approving ${title}...`);
            let url;
            if (record.type === 'outside_vehicle') {
                url = route('accountant.approve-outsource', record.id);
            } else if (record.type === 'rent_a_car') {
                url = route('accountant.approve-customer', record.id);
            } else {
                url = route('accountant.approve', record.id);
            }
            router.post(
                url,
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => toast.success(`${title} approved successfully.`, { id: toastId }),
                    onError: () => toast.error('Failed to approve record.', { id: toastId }),
                }
            );
        }
    };

    const handleApproveSlips = (record) => {
        const toastId = toast.loading('Approving slip(s)...');
        let url;
        if (record.type === 'outside_vehicle') {
            url = route('accountant.outsource-vehicles.slips.status', record.id);
        } else if (record.type === 'rent_a_car') {
            url = route('accountant.customers.slips.status', record.id);
        } else {
            url = route('accountant.trip-finances.slips.status', record.id);
        }

        router.post(
            url,
            { status: 'completed' },
            {
                preserveScroll: true,
                onSuccess: () => toast.success(`Slip(s) for ${record.display_id || 'Trip #' + record.trip_id} approved.`, { id: toastId }),
                onError: () => toast.error('Failed to approve slip(s).', { id: toastId }),
            }
        );
    };

    return (
        <AppSidebarLayout title="Accountant">
            <Head title="Accountant" />
            
            <div className="mb-6">
                <h1 className="text-2xl font-black text-[#0f1d45]">Accountant Dashboard</h1>
                <p className="text-sm font-medium text-gray-400 mt-1">Trips and amounts received from the Counter Manager, with payment slip verifications</p>
            </div>

            {/* Slip Upload Alert Notification */}
            {pendingSlipsCount > 0 && (
                <div className="mb-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 p-4 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-2xl shrink-0 backdrop-blur-sm shadow-inner">
                            🔔
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-black text-base leading-snug">
                                    New Slips Uploaded from Finance
                                </h3>
                                <span className="bg-white/25 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    Action Required
                                </span>
                            </div>
                            <p className="text-xs text-amber-100 mt-0.5">
                                {pendingSlipsCount} payment {pendingSlipsCount === 1 ? 'slip has' : 'slips have'} been uploaded by the Finance team across {pendingSlipsTripsCount} {pendingSlipsTripsCount === 1 ? 'trip' : 'trips'} and {pendingSlipsCount === 1 ? 'is' : 'are'} awaiting your verification.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => handleStatusChange(status === 'pending_slips' ? 'all' : 'pending_slips')}
                        className={`px-4 py-2 text-xs font-bold rounded-xl shadow transition shrink-0 whitespace-nowrap active:scale-95 ${
                            status === 'pending_slips'
                                ? 'bg-black text-white hover:bg-gray-900'
                                : 'bg-white text-amber-900 hover:bg-amber-50'
                        }`}
                    >
                        {status === 'pending_slips' ? '✓ Showing Pending Slips' : `Review Slips (${pendingSlipsCount})`}
                    </button>
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-7">
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total Received Records</p>
                    <p className="text-2xl font-black leading-tight text-[#0f1d45] mt-1.5">{totalRecords}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total Amount Received</p>
                    <p className="text-2xl font-black leading-tight text-emerald-600 mt-1.5">LKR {fmt(totalReceived)}</p>
                </div>
                <div
                    onClick={() => handleStatusChange(status === 'pending_approval' ? 'all' : 'pending_approval')}
                    className={`bg-white rounded-xl border p-4 shadow-sm cursor-pointer transition ${status === 'pending_approval' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-100 hover:border-blue-200'}`}
                >
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Pending Approvals</p>
                        {pendingApprovalsCount > 0 && (
                            <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                        )}
                    </div>
                    <div className="flex items-baseline gap-2 mt-1.5">
                        <p className="text-2xl font-black leading-tight text-blue-600">{pendingApprovalsCount}</p>
                        {pendingApprovalsCount > 0 && (
                            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                Needs Approval
                            </span>
                        )}
                    </div>
                </div>
                <div
                    onClick={() => handleStatusChange(status === 'pending_slips' ? 'all' : 'pending_slips')}
                    className={`bg-white rounded-xl border p-4 shadow-sm cursor-pointer transition ${status === 'pending_slips' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-gray-100 hover:border-amber-200'}`}
                >
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Slips from Finance</p>
                        {pendingSlipsCount > 0 && (
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                            </span>
                        )}
                    </div>
                    <div className="flex items-baseline gap-2 mt-1.5">
                        <p className="text-2xl font-black leading-tight text-amber-600">{pendingSlipsCount}</p>
                        {pendingSlipsCount > 0 ? (
                            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                🔔 Needs Review
                            </span>
                        ) : (
                            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                Up to Date
                            </span>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex flex-col gap-4 mb-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-black text-[#0f1d45]">Received Finances</h2>
                            {status !== 'all' && (
                                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#0f1d45] text-white">
                                    Filtered: {status === 'pending_slips' ? 'Slips to Review' : status === 'pending_approval' ? 'Pending Approval' : 'Approved'}
                                </span>
                            )}
                        </div>

                        {/* Quick Status Filter Pills */}
                        <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
                            <button
                                type="button"
                                onClick={() => handleStatusChange('all')}
                                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${status === 'all' ? 'bg-white text-black shadow-sm' : 'text-gray-600 hover:text-black'}`}
                            >
                                All Records
                            </button>
                            <button
                                type="button"
                                onClick={() => handleStatusChange('pending_slips')}
                                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${status === 'pending_slips' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-600 hover:text-black'}`}
                            >
                                <span>Slips to Review</span>
                                {pendingSlipsCount > 0 && (
                                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${status === 'pending_slips' ? 'bg-white text-amber-700' : 'bg-amber-200 text-amber-900'}`}>
                                        {pendingSlipsCount}
                                    </span>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleStatusChange('pending_approval')}
                                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${status === 'pending_approval' ? 'bg-blue-700 text-white shadow-sm' : 'text-gray-600 hover:text-black'}`}
                            >
                                <span>Pending Approval</span>
                                {pendingApprovalsCount > 0 && (
                                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${status === 'pending_approval' ? 'bg-white text-blue-700' : 'bg-blue-200 text-blue-900'}`}>
                                        {pendingApprovalsCount}
                                    </span>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleStatusChange('approved')}
                                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${status === 'approved' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:text-black'}`}
                            >
                                Approved
                            </button>
                        </div>
                    </div>

                    {/* Date Filters & Search */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pt-2 border-t border-gray-100">
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
                                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                                        range === item.key
                                            ? 'bg-blue-700 text-white'
                                            : 'bg-gray-100 text-black hover:bg-gray-200'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                        
                        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                            <input
                                type="text"
                                placeholder="Search Trip ID, Customer, Agent..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full sm:w-60 rounded-xl border-gray-200 text-xs focus:border-[#0f1d45] focus:ring-[#0f1d45]"
                            />
                            
                            {range === 'custom' && (
                                <>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full sm:w-auto rounded-xl border-gray-200 text-xs focus:border-[#0f1d45] focus:ring-[#0f1d45]"
                                    />
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full sm:w-auto rounded-xl border-gray-200 text-xs focus:border-[#0f1d45] focus:ring-[#0f1d45]"
                                    />
                                </>
                            )}
                            
                            <div className="flex gap-2">
                                <button type="submit" className="px-4 py-2 bg-[#0f1d45] text-white rounded-xl text-xs font-bold hover:bg-black transition">
                                    Search
                                </button>
                                {(search || range !== 'all' || status !== 'all') && (
                                    <button type="button" onClick={clearFilters} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition">
                                        Reset
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
                                <th className="px-4 py-3 text-left text-xs font-bold text-[#0f1d45] uppercase tracking-wider">Trip / Ref</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-[#0f1d45] uppercase tracking-wider">Agent</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-[#0f1d45] uppercase tracking-wider">Vehicle</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-[#0f1d45] uppercase tracking-wider">Payment Breakdown</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-[#0f1d45] uppercase tracking-wider">Received By</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-[#0f1d45] uppercase tracking-wider">Amount (LKR)</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-[#0f1d45] uppercase tracking-wider">Slips from Finance</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-[#0f1d45] uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 bg-white">
                            {receivedFinances.data && receivedFinances.data.length > 0 ? (
                                receivedFinances.data.map((tf) => {
                                    let paymentNotes = [];
                                    try {
                                        const raw = tf.payment_notes || tf.trip?.customer?.payment_notes;
                                        paymentNotes = typeof raw === 'string' ? JSON.parse(raw) : (raw || []);
                                    } catch (e) {}

                                    const slips = tf.payment_slips || [];
                                    const pendingSlips = slips.filter(s => s.status === 'pending');
                                    const incompleteSlips = slips.filter(s => s.status === 'incomplete');
                                    const agentName = tf.agent_name || (tf.trip?.customer?.agent?.user?.name ?? tf.trip?.agent?.user?.name ?? tf.agentUser?.name ?? '-');
                                    const vehicleInfo = tf.vehicle_info || tf.trip?.driver?.vehicle?.registration_number || '-';
                                    const customerName = tf.customer_name || tf.trip?.customer?.name || '-';
                                    const displayId = tf.display_id || `#${tf.trip_id}`;
                                    const typeBadge = tf.type_badge || 'Transfer';

                                    const typeBorder = tf.type === 'outside_vehicle' ? 'border-amber-500' :
                                                       tf.type === 'rent_a_car' ? 'border-purple-500' : 'border-blue-500';

                                    return (
                                        <tr key={`${tf.type || 'trip'}-${tf.id}`} className="hover:bg-[#f5f6fa]/50 transition">
                                            <td className={`px-4 py-3 border-l-2 ${typeBorder}`}>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-[#0f1d45]">{displayId}</span>
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                                        tf.type === 'outside_vehicle' ? 'bg-amber-100 text-amber-800' :
                                                        tf.type === 'rent_a_car' ? 'bg-purple-100 text-purple-800' :
                                                        typeBadge.toLowerCase().includes('tour') ? 'bg-teal-100 text-teal-800' :
                                                        'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {typeBadge}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5">{customerName}</div>
                                            </td>
                                            <td className="px-4 py-3 text-xs font-medium text-black">
                                                {agentName}
                                            </td>
                                            <td className="px-4 py-3 text-xs font-medium text-black">
                                                {vehicleInfo}
                                            </td>
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
                                                    {tf.receiver_name || tf.receiver?.name || 'System'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-black text-emerald-600">
                                                LKR {fmt(tf.received_amount)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {tf.type && tf.type !== 'trip' ? (
                                                    <span className="text-gray-400 text-xs italic">N/A</span>
                                                ) : (() => {
                                                    if (slips.length === 0) {
                                                        return <span className="text-gray-400 text-xs italic">No Slips</span>;
                                                    }
                                                    if (pendingSlips.length > 0) {
                                                        return (
                                                            <button
                                                                type="button"
                                                                onClick={() => setViewSlipsModal(tf)}
                                                                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white px-3 py-1.5 text-xs font-bold shadow-sm shadow-amber-500/20 transition"
                                                            >
                                                                <span className="relative flex h-2 w-2">
                                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                                                </span>
                                                                View Slips ({slips.length})
                                                            </button>
                                                        );
                                                    }
                                                    if (incompleteSlips.length > 0) {
                                                        return (
                                                            <button
                                                                type="button"
                                                                onClick={() => setViewSlipsModal(tf)}
                                                                className="inline-flex items-center gap-1 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 active:scale-95 text-rose-700 px-3 py-1.5 text-xs font-bold transition"
                                                            >
                                                                ⚠️ Incomplete ({slips.length})
                                                            </button>
                                                        );
                                                    }
                                                    return (
                                                        <button
                                                            type="button"
                                                            onClick={() => setViewSlipsModal(tf)}
                                                            className="inline-flex items-center gap-1 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 px-3 py-1.5 text-xs font-bold transition"
                                                        >
                                                            👁 View Slips ({slips.length})
                                                        </button>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                                                    {/* Approval action */}
                                                    {!tf.accountant_approved ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleApprove(tf)}
                                                            className="rounded-lg bg-[#0f1d45] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#1a2d5c] active:scale-95 transition-transform shadow-sm whitespace-nowrap"
                                                        >
                                                            Approve {typeBadge}
                                                        </button>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800 border border-emerald-200 whitespace-nowrap">
                                                            ✓ {typeBadge} Approved
                                                        </span>
                                                    )}

                                                    {/* Slip approval action */}
                                                    {pendingSlips.length > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleApproveSlips(tf)}
                                                            className="rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-3 py-1.5 text-xs font-bold shadow-sm transition whitespace-nowrap"
                                                            title="Approve uploaded payment slip(s)"
                                                        >
                                                            ✓ Approve Slip{pendingSlips.length > 1 ? 's' : ''}
                                                        </button>
                                                    )}

                                                    {/* Slips already verified badge */}
                                                    {pendingSlips.length === 0 && slips.length > 0 && slips.every(s => s.status === 'completed') && (
                                                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 border border-blue-200 whitespace-nowrap">
                                                            ✓ Slips Verified
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500 font-medium bg-[#f5f6fa]/30">
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
                                onClick={() => link.url && router.get(link.url, { search, range, start_date: startDate, end_date: endDate, status }, { preserveState: true, preserveScroll: true })}
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

            {/* View Slips Modal (VIEW ONLY - No approval buttons) */}
            {viewSlipsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setViewSlipsModal(null)}>
                    <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#f5f6fa]/50 shrink-0">
                            <div>
                                <h3 className="text-lg font-black text-[#0f1d45]">View Slips — {viewSlipsModal.display_id || `Trip #${viewSlipsModal.trip_id}`}</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Uploaded payment slip documents from Finance</p>
                            </div>
                            <button onClick={() => setViewSlipsModal(null)} className="text-gray-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1 space-y-4">
                            {viewSlipsModal.payment_slips && viewSlipsModal.payment_slips.length > 0 ? (
                                viewSlipsModal.payment_slips.map(slip => {
                                    const isPending = slip.status === 'pending';
                                    const isImage = slip.slip_path && slip.slip_path.match(/\.(jpeg|jpg|png|webp|gif)$/i);

                                    return (
                                        <div key={slip.id} className={`rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border ${
                                            isPending ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300' : 'bg-gray-50 border-gray-200'
                                        }`}>
                                            <div className="space-y-1.5 flex-1">
                                                {isPending && (
                                                    <span className="inline-flex items-center gap-1.5 bg-amber-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
                                                        Uploaded from Finance • Pending Review
                                                    </span>
                                                )}
                                                <div className="text-xs text-gray-500">
                                                    Uploaded by: <span className="font-semibold text-gray-700">{slip.uploader?.name || 'Finance User'}</span>
                                                    {slip.created_at && (
                                                        <span className="ml-2 text-gray-400">• {fmtDate(slip.created_at)}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-[#0f1d45]">Description:</p>
                                                    <p className="text-sm text-gray-700">{slip.slip_des || <span className="italic text-gray-400">No description provided</span>}</p>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-semibold pt-0.5">
                                                    <span className="text-gray-500">Status:</span>
                                                    <span className={`uppercase font-bold ${slip.status === 'completed' ? 'text-emerald-600' : slip.status === 'incomplete' ? 'text-rose-600' : 'text-amber-600'}`}>
                                                        {slip.status}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Preview & Open Link (View Only) */}
                                            <div className="flex flex-col items-center gap-2 shrink-0 w-full md:w-auto">
                                                {isImage && (
                                                    <a href={`/storage/${slip.slip_path}`} target="_blank" rel="noreferrer" className="block w-28 h-20 rounded-lg overflow-hidden border border-gray-300 bg-white shadow-sm hover:opacity-90 transition">
                                                        <img src={`/storage/${slip.slip_path}`} alt="Slip Preview" className="w-full h-full object-cover" />
                                                    </a>
                                                )}
                                                <a
                                                    href={`/storage/${slip.slip_path}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="w-full md:w-auto text-center rounded-xl bg-[#0f1d45] hover:bg-black text-white px-4 py-2 text-xs font-bold shadow-sm transition"
                                                >
                                                    📄 Open Full Document
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-sm text-gray-400 italic">No slips found for this trip.</p>
                            )}
                        </div>
                        
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
                            <button
                                type="button"
                                onClick={() => setViewSlipsModal(null)}
                                className="px-5 py-2 text-xs font-bold text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-xl transition"
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
