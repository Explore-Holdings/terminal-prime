import React, { useState, useMemo } from 'react';
import Modal from '@/Components/Modal';

export default function AgentDriverModal({
    show = false,
    onClose = () => {},
    customers = [],
    agents = [],
    drivers = [],
}) {
    const [activeTab, setActiveTab] = useState('agents');
    const [agentSearch, setAgentSearch] = useState('');
    const [driverSearch, setDriverSearch] = useState('');

    // Process Agent Data & Trips
    const agentRecords = useMemo(() => {
        // Collect all trip records grouped by agent or customer
        const list = customers.map((c) => {
            const agent = c.agent;
            const trip = c.latest_trip;
            const finance = trip?.tripFinance;
            const driver = trip?.driver;

            const origPrice = agent?.price ? `${agent.price} ${agent.currency || 'LKR'}` : '-';
            const agreedPrice = agent?.new_price ? `${agent.new_price} ${agent.new_currency || 'LKR'}` : (c.paid_amount ? `${c.paid_amount} LKR` : '-');

            const driverShareNum = finance?.driver_share ? Number(finance.driver_share) : 0;
            const agentShareNum = finance?.agent_share ? Number(finance.agent_share) : 0;
            const balanceNum = finance?.balance ? Number(finance.balance) : 0;
            const totalAmountNum = finance?.total_amount ? Number(finance.total_amount) : (agent?.new_price || 0);

            const driverName = driver
                ? ([driver.first_name, driver.last_name].filter(Boolean).join(' ') || driver.full_name || '-')
                : (agent?.external_vehicle_reg ? 'External Rental' : '-');

            const vehicleReg = agent?.external_vehicle_reg || driver?.vehicle?.registration_number || '-';

            return {
                id: c.id,
                customerCode: c.customer_code,
                customerName: c.name,
                agentName: agent?.user?.name || agent?.name || 'Unknown Agent',
                bookingType: agent?.booking_type || 'N/A',
                origPrice,
                agreedPrice,
                totalAmountNum,
                driverShareNum,
                agentShareNum,
                balanceNum,
                driverName,
                driverReg: driver?.registration_number || '',
                vehicleReg,
                status: c.payment_status || c.status || 'New',
                createdAt: c.created_at ? new Date(c.created_at).toLocaleDateString() : '-',
            };
        });

        if (!agentSearch.trim()) return list;

        const q = agentSearch.toLowerCase();
        return list.filter((r) =>
            r.agentName.toLowerCase().includes(q) ||
            r.customerName.toLowerCase().includes(q) ||
            r.customerCode.toLowerCase().includes(q) ||
            r.bookingType.toLowerCase().includes(q) ||
            r.driverName.toLowerCase().includes(q) ||
            r.vehicleReg.toLowerCase().includes(q)
        );
    }, [customers, agentSearch]);

    // Process Driver Data & Trips
    const driverRecords = useMemo(() => {
        const list = customers.filter(c => c.latest_trip?.driver || c.agent?.external_vehicle_reg).map((c) => {
            const trip = c.latest_trip;
            const driver = trip?.driver;
            const finance = trip?.tripFinance;
            const agent = c.agent;

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
                customerCode: c.customer_code,
                customerName: c.name,
                dropoff: c.dropoff_location || '-',
                bookingType: agent?.booking_type || 'Transfer',
                totalAmountNum: finance?.total_amount ? Number(finance.total_amount) : (c.paid_amount || 0),
                driverShareNum: finance?.driver_share ? Number(finance.driver_share) : 0,
                tripStatus: trip?.status || c.status || 'Assigned',
                date: c.created_at ? new Date(c.created_at).toLocaleDateString() : '-',
            };
        });

        if (!driverSearch.trim()) return list;

        const q = driverSearch.toLowerCase();
        return list.filter((r) =>
            r.driverName.toLowerCase().includes(q) ||
            r.driverReg.toLowerCase().includes(q) ||
            r.vehicleReg.toLowerCase().includes(q) ||
            r.customerName.toLowerCase().includes(q) ||
            r.customerCode.toLowerCase().includes(q)
        );
    }, [customers, driverSearch]);

    // Summary Totals
    const agentTotals = useMemo(() => {
        return agentRecords.reduce(
            (acc, r) => {
                acc.totalAgreed += r.totalAmountNum;
                acc.totalDriverShare += r.driverShareNum;
                acc.totalAgentShare += r.agentShareNum;
                acc.totalBalance += r.balanceNum;
                return acc;
            },
            { totalAgreed: 0, totalDriverShare: 0, totalAgentShare: 0, totalBalance: 0 }
        );
    }, [agentRecords]);

    const driverTotals = useMemo(() => {
        return driverRecords.reduce(
            (acc, r) => {
                acc.totalTrips += 1;
                acc.totalDriverShare += r.driverShareNum;
                acc.totalAmount += r.totalAmountNum;
                return acc;
            },
            { totalTrips: 0, totalDriverShare: 0, totalAmount: 0 }
        );
    }, [driverRecords]);

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
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'Rent a Car':
                return 'bg-amber-100 text-amber-800 border-amber-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="6xl">
            <div className="bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                {/* Modal Header */}
                <div className="bg-slate-900 text-white p-5 flex justify-between items-center border-b border-slate-800">
                    <div>
                        <h2 className="text-xl font-bold tracking-wide flex items-center gap-2">
                            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Agent & Driver Insights
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                            Trips, prices, agreed amounts, and driver shares breakdown
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs Header */}
                <div className="bg-slate-100 px-6 pt-3 border-b flex items-center justify-between">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('agents')}
                            className={`px-5 py-2.5 rounded-t-lg font-semibold text-sm transition-all flex items-center gap-2 border-b-2 ${
                                activeTab === 'agents'
                                    ? 'bg-white text-blue-700 border-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 border-transparent hover:bg-slate-200'
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Agent Trips & Pricing ({agentRecords.length})
                        </button>

                        <button
                            onClick={() => setActiveTab('drivers')}
                            className={`px-5 py-2.5 rounded-t-lg font-semibold text-sm transition-all flex items-center gap-2 border-b-2 ${
                                activeTab === 'drivers'
                                    ? 'bg-white text-emerald-700 border-emerald-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 border-transparent hover:bg-slate-200'
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            Driver Trips & Shares ({driverRecords.length})
                        </button>
                    </div>

                    {/* Search Field */}
                    <div className="pb-2">
                        {activeTab === 'agents' ? (
                            <input
                                type="text"
                                placeholder="Search agent, customer, vehicle..."
                                value={agentSearch}
                                onChange={(e) => setAgentSearch(e.target.value)}
                                className="text-xs border border-gray-300 rounded-lg px-3 py-1.5 w-64 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        ) : (
                            <input
                                type="text"
                                placeholder="Search driver, vehicle, customer..."
                                value={driverSearch}
                                onChange={(e) => setDriverSearch(e.target.value)}
                                className="text-xs border border-gray-300 rounded-lg px-3 py-1.5 w-64 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            />
                        )}
                    </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                    {/* TAB 1: AGENT TRIPS & PRICING */}
                    {activeTab === 'agents' && (
                        <div>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="text-xs font-medium text-gray-500">Total Agent Bookings</div>
                                    <div className="text-2xl font-bold text-gray-800 mt-1">{agentRecords.length}</div>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 shadow-sm">
                                    <div className="text-xs font-semibold text-blue-700">Total Agreed Price</div>
                                    <div className="text-xl font-extrabold text-blue-900 mt-1">
                                        {formatLKR(agentTotals.totalAgreed)}
                                    </div>
                                </div>

                                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-sm">
                                    <div className="text-xs font-semibold text-emerald-700">Total Driver Shares</div>
                                    <div className="text-xl font-extrabold text-emerald-900 mt-1">
                                        {formatLKR(agentTotals.totalDriverShare)}
                                    </div>
                                </div>

                                <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 shadow-sm">
                                    <div className="text-xs font-semibold text-purple-700">Agent Shares / Balance</div>
                                    <div className="text-xl font-extrabold text-purple-900 mt-1">
                                        {formatLKR(agentTotals.totalAgentShare + agentTotals.totalBalance)}
                                    </div>
                                </div>
                            </div>

                            {/* Agent Table */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-100 text-slate-700 text-xs uppercase font-bold border-b border-gray-200">
                                            <th className="py-3 px-4">Agent</th>
                                            <th className="py-3 px-4">Customer</th>
                                            <th className="py-3 px-4">Type</th>
                                            <th className="py-3 px-4">Original Price</th>
                                            <th className="py-3 px-4">Agreed Price</th>
                                            <th className="py-3 px-4 text-emerald-700 bg-emerald-50/50">Driver Share</th>
                                            <th className="py-3 px-4 text-purple-700 bg-purple-50/50">Agent Share</th>
                                            <th className="py-3 px-4">Assigned Driver & Vehicle</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 text-xs text-gray-800">
                                        {agentRecords.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="py-8 text-center text-gray-500">
                                                    No agent records found.
                                                </td>
                                            </tr>
                                        ) : (
                                            agentRecords.map((r) => (
                                                <tr key={r.id} className="hover:bg-gray-50 transition">
                                                    <td className="py-3 px-4 font-semibold text-gray-900">
                                                        {r.agentName}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="font-medium text-gray-900">{r.customerName}</div>
                                                        <div className="text-[11px] text-gray-500 font-mono">{r.customerCode}</div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${typeBadgeClass(r.bookingType)}`}>
                                                            {r.bookingType}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 font-mono font-medium text-gray-700">
                                                        {r.origPrice}
                                                    </td>
                                                    <td className="py-3 px-4 font-mono font-bold text-blue-700">
                                                        {r.agreedPrice}
                                                    </td>
                                                    <td className="py-3 px-4 font-mono font-bold text-emerald-700 bg-emerald-50/30">
                                                        {formatLKR(r.driverShareNum)}
                                                    </td>
                                                    <td className="py-3 px-4 font-mono font-bold text-purple-700 bg-purple-50/30">
                                                        {formatLKR(r.agentShareNum)}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="font-semibold text-gray-800">{r.driverName}</div>
                                                        {r.vehicleReg && r.vehicleReg !== '-' && (
                                                            <div className="mt-0.5">
                                                                <span className="font-mono text-[11px] px-1.5 py-0.5 bg-gray-100 rounded border border-gray-300">
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
                        </div>
                    )}

                    {/* TAB 2: DRIVER TRIPS & SHARES */}
                    {activeTab === 'drivers' && (
                        <div>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="text-xs font-medium text-gray-500">Total Driver Trips</div>
                                    <div className="text-2xl font-bold text-gray-800 mt-1">{driverTotals.totalTrips}</div>
                                </div>

                                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-sm">
                                    <div className="text-xs font-semibold text-emerald-700">Total Driver Shares Earned</div>
                                    <div className="text-xl font-extrabold text-emerald-900 mt-1">
                                        {formatLKR(driverTotals.totalDriverShare)}
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 shadow-sm">
                                    <div className="text-xs font-semibold text-blue-700">Total Trip Revenue</div>
                                    <div className="text-xl font-extrabold text-blue-900 mt-1">
                                        {formatLKR(driverTotals.totalAmount)}
                                    </div>
                                </div>
                            </div>

                            {/* Driver Table */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-100 text-slate-700 text-xs uppercase font-bold border-b border-gray-200">
                                            <th className="py-3 px-4">Driver</th>
                                            <th className="py-3 px-4">Vehicle Reg</th>
                                            <th className="py-3 px-4">Customer & Dropoff</th>
                                            <th className="py-3 px-4">Booking Type</th>
                                            <th className="py-3 px-4">Trip Amount</th>
                                            <th className="py-3 px-4 text-emerald-700 bg-emerald-50/50">Driver Share</th>
                                            <th className="py-3 px-4">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 text-xs text-gray-800">
                                        {driverRecords.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="py-8 text-center text-gray-500">
                                                    No driver records found.
                                                </td>
                                            </tr>
                                        ) : (
                                            driverRecords.map((r) => (
                                                <tr key={r.id} className="hover:bg-gray-50 transition">
                                                    <td className="py-3 px-4">
                                                        <div className="font-bold text-gray-900">{r.driverName}</div>
                                                        {r.driverReg && r.driverReg !== '-' && (
                                                            <div className="text-[11px] text-gray-500">{r.driverReg}</div>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-gray-100 rounded border border-gray-300">
                                                            {r.vehicleReg}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="font-semibold text-gray-900">{r.customerName}</div>
                                                        <div className="text-[11px] text-gray-500">{r.dropoff}</div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${typeBadgeClass(r.bookingType)}`}>
                                                            {r.bookingType}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 font-mono font-medium text-gray-700">
                                                        {formatLKR(r.totalAmountNum)}
                                                    </td>
                                                    <td className="py-3 px-4 font-mono font-bold text-emerald-700 bg-emerald-50/30">
                                                        {formatLKR(r.driverShareNum)}
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-500">
                                                        {r.date}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 bg-gray-100 border-t border-gray-200 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-semibold transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
}
