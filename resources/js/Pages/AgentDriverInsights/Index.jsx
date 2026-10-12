import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import AppSidebarLayout from '@/Layouts/AppSidebarLayout';

export default function Index({ customers = [] }) {
    const [activeTab, setActiveTab] = useState('agents');
    const [agentSearch, setAgentSearch] = useState('');
    const [driverSearch, setDriverSearch] = useState('');
    const [selectedAgentFilter, setSelectedAgentFilter] = useState('');

    // Pagination state
    const [agentPage, setAgentPage] = useState(1);
    const [agentPerPage, setAgentPerPage] = useState(10);

    const [driverPage, setDriverPage] = useState(1);
    const [driverPerPage, setDriverPerPage] = useState(10);

    // Extract unique agent list
    const uniqueAgents = useMemo(() => {
        const set = new Set();
        customers.forEach((c) => {
            const name = c.agent?.user?.name || c.agent?.name;
            if (name) set.add(name);
        });
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [customers]);

    const handleAgentFilterChange = (val) => {
        setSelectedAgentFilter(val);
        setAgentPage(1);
        setDriverPage(1);
    };

    const handleAgentSearch = (val) => {
        setAgentSearch(val);
        setAgentPage(1);
    };

    const handleDriverSearch = (val) => {
        setDriverSearch(val);
        setDriverPage(1);
    };

    // Process Agent Data & Trips
    const agentRecords = useMemo(() => {
        let list = customers.map((c) => {
            const agent = c.agent;
            const trip = c.latest_trip;
            const finance = trip?.trip_finance || trip?.tripFinance;
            const driver = trip?.driver;

            const origPrice = agent?.price ? `${agent.price} ${agent.currency || 'LKR'}` : '-';
            const agreedPrice = agent?.new_price ? `${agent.new_price} ${agent.new_currency || 'LKR'}` : (c.paid_amount ? `${c.paid_amount} LKR` : '-');

            const driverShareNum = finance?.driver_share ? Number(finance.driver_share) : 0;
            const balanceNum = finance?.balance ? Number(finance.balance) : 0;
            const totalAmountNum = finance?.total_amount ? Number(finance.total_amount) : (agent?.new_price || 0);

            const driverName = driver
                ? ([driver.first_name, driver.last_name].filter(Boolean).join(' ') || driver.full_name || '-')
                : (agent?.external_vehicle_reg ? 'External Rental' : '-');

            const vehicleReg = agent?.external_vehicle_reg || driver?.vehicle?.registration_number || '-';

            return {
                id: c.id,
                customerCode: c.customer_code || '-',
                customerName: c.name || '-',
                agentName: agent?.user?.name || agent?.name || 'Unknown Agent',
                bookingType: agent?.booking_type || 'N/A',
                origPrice,
                agreedPrice,
                totalAmountNum,
                driverShareNum,
                balanceNum,
                driverName,
                driverReg: driver?.registration_number || '',
                vehicleReg,
                status: c.payment_status || c.status || 'New',
                createdAt: c.created_at ? new Date(c.created_at).toLocaleDateString() : '-',
            };
        });

        if (selectedAgentFilter) {
            list = list.filter(r => r.agentName === selectedAgentFilter);
        }

        if (agentSearch.trim()) {
            const q = agentSearch.toLowerCase();
            list = list.filter((r) =>
                r.agentName.toLowerCase().includes(q) ||
                r.customerName.toLowerCase().includes(q) ||
                r.customerCode.toLowerCase().includes(q) ||
                r.bookingType.toLowerCase().includes(q) ||
                r.driverName.toLowerCase().includes(q) ||
                r.vehicleReg.toLowerCase().includes(q)
            );
        }

        return list;
    }, [customers, selectedAgentFilter, agentSearch]);

    const paginatedAgentRecords = useMemo(() => {
        const start = (agentPage - 1) * agentPerPage;
        return agentRecords.slice(start, start + agentPerPage);
    }, [agentRecords, agentPage, agentPerPage]);

    const agentTotalPages = Math.ceil(agentRecords.length / agentPerPage) || 1;

    // Process Driver Data & Trips
    const driverRecords = useMemo(() => {
        let list = customers.filter(c => c.latest_trip?.driver || c.agent?.external_vehicle_reg).map((c) => {
            const trip = c.latest_trip;
            const driver = trip?.driver;
            const finance = trip?.trip_finance || trip?.tripFinance;
            const agent = c.agent;

            const agentName = agent?.user?.name || agent?.name || 'Unknown Agent';

            const driverName = driver
                ? ([driver.first_name, driver.last_name].filter(Boolean).join(' ') || driver.full_name || '-')
                : 'External Vehicle';

            const driverReg = driver?.registration_number || '-';
            const vehicleReg = agent?.external_vehicle_reg || driver?.vehicle?.registration_number || '-';

            return {
                id: c.id,
                tripId: trip?.id || c.id,
                driverName,
                driverReg,
                vehicleReg,
                agentName,
                customerCode: c.customer_code || '-',
                customerName: c.name || '-',
                dropoff: c.dropoff_location || '-',
                bookingType: agent?.booking_type || 'Transfer',
                totalAmountNum: finance?.total_amount ? Number(finance.total_amount) : (c.paid_amount || 0),
                driverShareNum: finance?.driver_share ? Number(finance.driver_share) : 0,
                tripStatus: trip?.status || c.status || 'Assigned',
                date: c.created_at ? new Date(c.created_at).toLocaleDateString() : '-',
            };
        });

        if (selectedAgentFilter) {
            list = list.filter(r => r.agentName === selectedAgentFilter);
        }

        if (driverSearch.trim()) {
            const q = driverSearch.toLowerCase();
            list = list.filter((r) =>
                r.driverName.toLowerCase().includes(q) ||
                r.driverReg.toLowerCase().includes(q) ||
                r.vehicleReg.toLowerCase().includes(q) ||
                r.customerName.toLowerCase().includes(q) ||
                r.customerCode.toLowerCase().includes(q) ||
                r.agentName.toLowerCase().includes(q)
            );
        }

        return list;
    }, [customers, selectedAgentFilter, driverSearch]);

    const paginatedDriverRecords = useMemo(() => {
        const start = (driverPage - 1) * driverPerPage;
        return driverRecords.slice(start, start + driverPerPage);
    }, [driverRecords, driverPage, driverPerPage]);

    const driverTotalPages = Math.ceil(driverRecords.length / driverPerPage) || 1;

    const formatLKR = (amount) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(amount || 0);
    };

    const typeBadgeClass = (type) => {
        switch (type) {
            case 'Transfer':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Tour':
            case 'Tours':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'Rent a Car':
                return 'bg-amber-100 text-amber-800 border-amber-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const exportAgentCSV = () => {
        const headers = [
            'Agent Name',
            'Customer Code',
            'Customer Name',
            'Booking Type',
            'Original Price',
            'Agreed Price',
            'Driver Share (LKR)',
            'Balance (LKR)',
            'Assigned Driver',
            'Vehicle Reg No',
            'Created Date',
        ];

        const rows = agentRecords.map(r => [
            r.agentName,
            r.customerCode,
            r.customerName,
            r.bookingType,
            r.origPrice,
            r.agreedPrice,
            r.driverShareNum,
            r.balanceNum,
            r.driverName,
            r.vehicleReg,
            r.createdAt,
        ]);

        const csvContent = [
            headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','),
            ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `agent_insights_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const exportDriverCSV = () => {
        const headers = [
            'Driver Name',
            'Driver Reg No',
            'Vehicle Reg No',
            'Agent Name',
            'Customer Code',
            'Customer Name',
            'Dropoff Location',
            'Booking Type',
            'Total Amount (LKR)',
            'Driver Share (LKR)',
            'Status',
            'Date',
        ];

        const rows = driverRecords.map(r => [
            r.driverName,
            r.driverReg,
            r.vehicleReg,
            r.agentName,
            r.customerCode,
            r.customerName,
            r.dropoff,
            r.bookingType,
            r.totalAmountNum,
            r.driverShareNum,
            r.tripStatus,
            r.date,
        ]);

        const csvContent = [
            headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','),
            ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `driver_insights_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <AppSidebarLayout title="Agent & Driver Insights">
            <Head title="Agent & Driver Insights" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-[#0f1d45] tracking-tight flex items-center gap-2">
                            <span>Agent & Driver Insights</span>
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Comprehensive view of Agent bookings, original/agreed prices, and Driver trip share allocations.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {activeTab === 'agents' ? (
                            <button
                                type="button"
                                onClick={exportAgentCSV}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Export Agent CSV
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={exportDriverCSV}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Export Driver CSV
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Tabs & Controls Header */}
                    <div className="bg-slate-50 px-6 pt-4 pb-3 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab('agents')}
                                className={`px-6 py-3 rounded-t-xl font-bold text-sm transition-all flex items-center gap-2 border-b-2 ${
                                    activeTab === 'agents'
                                        ? 'bg-white text-[#0f1d45] border-[#0f1d45] shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900 border-transparent hover:bg-slate-200/60'
                                }`}
                            >
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Agent Trips & Pricing ({agentRecords.length})
                            </button>

                            <button
                                onClick={() => setActiveTab('drivers')}
                                className={`px-6 py-3 rounded-t-xl font-bold text-sm transition-all flex items-center gap-2 border-b-2 ${
                                    activeTab === 'drivers'
                                        ? 'bg-white text-emerald-800 border-emerald-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900 border-transparent hover:bg-slate-200/60'
                                }`}
                            >
                                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                                Driver Trips & Shares ({driverRecords.length})
                            </button>
                        </div>

                        {/* Controls (Agent Dropdown & Search) */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Agent Filter Dropdown */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Agent:</span>
                                <select
                                    value={selectedAgentFilter}
                                    onChange={(e) => handleAgentFilterChange(e.target.value)}
                                    className="text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-[#0f1d45] focus:outline-none font-semibold text-gray-800 shadow-sm"
                                >
                                    <option value="">All Agents ({uniqueAgents.length})</option>
                                    {uniqueAgents.map((name) => (
                                        <option key={name} value={name}>
                                            {name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Search Input */}
                            <div>
                                {activeTab === 'agents' ? (
                                    <input
                                        type="text"
                                        placeholder="Search customer, driver..."
                                        value={agentSearch}
                                        onChange={(e) => handleAgentSearch(e.target.value)}
                                        className="text-xs border border-gray-200 rounded-xl px-4 py-2 w-full md:w-60 focus:ring-2 focus:ring-[#0f1d45] focus:outline-none shadow-sm"
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        placeholder="Search driver, vehicle, customer..."
                                        value={driverSearch}
                                        onChange={(e) => handleDriverSearch(e.target.value)}
                                        className="text-xs border border-gray-200 rounded-xl px-4 py-2 w-full md:w-60 focus:ring-2 focus:ring-emerald-600 focus:outline-none shadow-sm"
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tab Body */}
                    <div className="p-6">
                        {/* TAB 1: AGENTS */}
                        {activeTab === 'agents' && (
                            <div className="space-y-4">
                                {/* Table */}
                                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-100 text-slate-700 text-xs uppercase font-extrabold border-b border-gray-200">
                                                <th className="py-3.5 px-4">Agent Name</th>
                                                <th className="py-3.5 px-4">Customer</th>
                                                <th className="py-3.5 px-4">Type</th>
                                                <th className="py-3.5 px-4">Original Price</th>
                                                <th className="py-3.5 px-4">Agreed Price</th>
                                                <th className="py-3.5 px-4 text-emerald-800 bg-emerald-100/50">Driver Share</th>
                                                <th className="py-3.5 px-4">Assigned Driver & Vehicle</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 text-xs text-gray-800">
                                            {paginatedAgentRecords.length === 0 ? (
                                                <tr>
                                                    <td colSpan="8" className="py-8 text-center text-gray-400 italic">
                                                        No agent records found.
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginatedAgentRecords.map((r) => (
                                                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="py-3.5 px-4 font-bold text-slate-900">
                                                            {r.agentName}
                                                        </td>
                                                        <td className="py-3.5 px-4">
                                                            <div className="font-semibold text-gray-900">{r.customerName}</div>
                                                            <div className="text-[11px] text-gray-400 font-mono">{r.customerCode}</div>
                                                        </td>
                                                        <td className="py-3.5 px-4">
                                                            <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${typeBadgeClass(r.bookingType)}`}>
                                                                {r.bookingType}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-4 font-mono font-medium text-gray-600">
                                                            {r.origPrice}
                                                        </td>
                                                        <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                                                            {r.agreedPrice}
                                                        </td>
                                                        <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-700 bg-emerald-50/40">
                                                            {formatLKR(r.driverShareNum)}
                                                        </td>
                                                        <td className="py-3.5 px-4">
                                                            <div className="font-bold text-slate-800">{r.driverName}</div>
                                                            {r.vehicleReg && r.vehicleReg !== '-' && (
                                                                <div className="mt-0.5">
                                                                    <span className="font-mono text-[11px] font-semibold px-2 py-0.5 bg-gray-100 rounded border border-gray-300 inline-block">
                                                                        {r.vehicleReg}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Agent Pagination Controls */}
                                <div className="bg-slate-50 px-4 py-3 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <span>Rows per page:</span>
                                        <select
                                            value={agentPerPage}
                                            onChange={(e) => {
                                                setAgentPerPage(Number(e.target.value));
                                                setAgentPage(1);
                                            }}
                                            className="border border-gray-300 rounded px-2 py-1 bg-white font-medium focus:ring-1 focus:ring-blue-500"
                                        >
                                            <option value={10}>10</option>
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                        </select>
                                        <span>
                                            Showing {agentRecords.length === 0 ? 0 : (agentPage - 1) * agentPerPage + 1} to {Math.min(agentPage * agentPerPage, agentRecords.length)} of {agentRecords.length} entries
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setAgentPage((p) => Math.max(1, p - 1))}
                                            disabled={agentPage === 1}
                                            className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white font-semibold transition"
                                        >
                                            Previous
                                        </button>
                                        <span className="px-2 font-bold text-gray-700">
                                            Page {agentPage} of {agentTotalPages}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setAgentPage((p) => Math.min(agentTotalPages, p + 1))}
                                            disabled={agentPage >= agentTotalPages}
                                            className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white font-semibold transition"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: DRIVERS */}
                        {activeTab === 'drivers' && (
                            <div className="space-y-4">
                                {/* Table */}
                                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-100 text-slate-700 text-xs uppercase font-extrabold border-b border-gray-200">
                                                <th className="py-3.5 px-4">Driver Name</th>
                                                <th className="py-3.5 px-4">Vehicle Reg</th>
                                                <th className="py-3.5 px-4">Agent Name</th>
                                                <th className="py-3.5 px-4">Customer & Dropoff</th>
                                                <th className="py-3.5 px-4">Booking Type</th>
                                                <th className="py-3.5 px-4">Total Amount</th>
                                                <th className="py-3.5 px-4 text-emerald-800 bg-emerald-100/50">Driver Share</th>
                                                <th className="py-3.5 px-4">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 text-xs text-gray-800">
                                            {paginatedDriverRecords.length === 0 ? (
                                                <tr>
                                                    <td colSpan="8" className="py-8 text-center text-gray-400 italic">
                                                        No driver records found.
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginatedDriverRecords.map((r) => (
                                                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="py-3.5 px-4">
                                                            <div className="font-extrabold text-slate-900">{r.driverName}</div>
                                                            {r.driverReg && r.driverReg !== '-' && (
                                                                <div className="text-[11px] text-gray-400 font-mono">{r.driverReg}</div>
                                                            )}
                                                        </td>
                                                        <td className="py-3.5 px-4">
                                                            <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-gray-100 rounded border border-gray-300">
                                                                {r.vehicleReg}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-4 font-bold text-gray-800">
                                                            {r.agentName}
                                                        </td>
                                                        <td className="py-3.5 px-4">
                                                            <div className="font-semibold text-gray-900">{r.customerName}</div>
                                                            <div className="text-[11px] text-gray-500">{r.dropoff}</div>
                                                        </td>
                                                        <td className="py-3.5 px-4">
                                                            <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${typeBadgeClass(r.bookingType)}`}>
                                                                {r.bookingType}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-4 font-mono font-medium text-gray-700">
                                                            {formatLKR(r.totalAmountNum)}
                                                        </td>
                                                        <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-700 bg-emerald-50/40">
                                                            {formatLKR(r.driverShareNum)}
                                                        </td>
                                                        <td className="py-3.5 px-4 text-gray-500 font-medium">
                                                            {r.date}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Driver Pagination Controls */}
                                <div className="bg-slate-50 px-4 py-3 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <span>Rows per page:</span>
                                        <select
                                            value={driverPerPage}
                                            onChange={(e) => {
                                                setDriverPerPage(Number(e.target.value));
                                                setDriverPage(1);
                                            }}
                                            className="border border-gray-300 rounded px-2 py-1 bg-white font-medium focus:ring-1 focus:ring-emerald-500"
                                        >
                                            <option value={10}>10</option>
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                        </select>
                                        <span>
                                            Showing {driverRecords.length === 0 ? 0 : (driverPage - 1) * driverPerPage + 1} to {Math.min(driverPage * driverPerPage, driverRecords.length)} of {driverRecords.length} entries
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setDriverPage((p) => Math.max(1, p - 1))}
                                            disabled={driverPage === 1}
                                            className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white font-semibold transition"
                                        >
                                            Previous
                                        </button>
                                        <span className="px-2 font-bold text-gray-700">
                                            Page {driverPage} of {driverTotalPages}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setDriverPage((p) => Math.min(driverTotalPages, p + 1))}
                                            disabled={driverPage >= driverTotalPages}
                                            className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white font-semibold transition"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
