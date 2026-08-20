import React from 'react';
import AppSidebarLayout from '@/Layouts/AppSidebarLayout';
import { Head, usePage, router } from '@inertiajs/react';
import VehicleQueueGrid from './VehicleQueueGrid';
import {
    BanknotesIcon,
    UserGroupIcon,
    TruckIcon,
    ClipboardDocumentCheckIcon,
    UsersIcon,
    ChartPieIcon,
    ClockIcon,
    ShieldCheckIcon,
    DocumentTextIcon,
    StarIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import DataTable from 'react-data-table-component';

const getVehicleSlotNumber = (v) => {
    if (!v) return null;
    const reg = v.driver?.registration_number ?? v.registration_number ?? '';
    const match = reg.match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
};

const getNextInLineVehicle = (vehiclesList, ongoingTripsList) => {
    const activeSessions = (vehiclesList ?? []).map(v => v.driver?.session_id).filter(s => s !== null && s !== undefined && s > 0);
    const baseSessionId = activeSessions.length > 0 ? Math.min(...activeSessions) : 1;

    const available = (vehiclesList ?? []).filter((v) => {
        const isOnDuty = v.driver?.duty_status === 'on_duty';
        const hasOngoingTrip = v.driver?.trips && v.driver.trips.length > 0;
        const isCurrentSession = (v.driver?.session_id ?? 0) <= baseSessionId;
        return isOnDuty && !hasOngoingTrip && isCurrentSession;
    });

    if (available.length === 0) return null;

    const sorted = [...available].sort((a, b) => {
        const sessionA = a.driver?.session_id ?? 0;
        const sessionB = b.driver?.session_id ?? 0;
        if (sessionA !== sessionB) return sessionA - sessionB;

        const slotA = getVehicleSlotNumber(a) ?? 999;
        const slotB = getVehicleSlotNumber(b) ?? 999;
        return slotA - slotB;
    });

    const lastAssignedTrip = ongoingTripsList && ongoingTripsList.length > 0 ? ongoingTripsList[0] : null;
    const lastAssignedDriver = lastAssignedTrip?.driver;
    const lastSlotNumber = getVehicleSlotNumber(lastAssignedDriver) ?? 0;
    const lastSessionId = lastAssignedDriver?.session_id ?? 0;

    if (lastSlotNumber > 0) {
        const nextVehicles = sorted.filter(
            (v) => {
                const sid = v.driver?.session_id ?? 0;
                if (sid < lastSessionId) return true;
                if (sid === lastSessionId && (getVehicleSlotNumber(v) ?? 0) > lastSlotNumber) return true;
                return false;
            }
        );
        if (nextVehicles.length > 0) {
            return nextVehicles[0];
        }
    }

    return sorted[0];
};

export default function DSSIndex({ vehicles = [], ongoingTrips = [], metrics = {}, filter = 'today' }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [shiftSearch, setShiftSearch] = React.useState('');
    const [tripSearch, setTripSearch] = React.useState('');
    const [financeSearch, setFinanceSearch] = React.useState('');
    const [lastUpdated, setLastUpdated] = React.useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    const [dateFilter, setDateFilter] = React.useState(filter);

    const nextInLineVehicle = getNextInLineVehicle(vehicles, ongoingTrips);
    const nextInLineSlotNumber = getVehicleSlotNumber(nextInLineVehicle);

    // const queueVehicles = vehicles.filter((v) => {
    //     const isOnDuty = v.driver?.duty_status === 'on_duty';
    //     const hasOngoingTrip = v.driver?.trips && v.driver.trips.length > 0;
    //     return isOnDuty && !hasOngoingTrip;
    // }).sort((a, b) => {
    //     const sessionA = a.driver?.session_id ?? 0;
    //     const sessionB = b.driver?.session_id ?? 0;
    //     if (sessionA !== sessionB) return sessionA - sessionB;
    //     return (getVehicleSlotNumber(a) ?? 999) - (getVehicleSlotNumber(b) ?? 999);
    // });

    React.useEffect(() => {
        const intervalId = setInterval(() => {
            router.reload({
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
            });
        }, 10000);

        return () => clearInterval(intervalId);
    }, []);

    // Reusable Mini Card Component
    const MiniCard = ({ title, value, icon: Icon, colorClass, bgColorClass, subtitle }) => (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${bgColorClass}`}>
                <Icon className={`w-6 h-6 ${colorClass}`} />
            </div>
            <div>
                <h3 className="text-xs font-semibold text-black uppercase tracking-wider">{title}</h3>
                <div className="flex items-baseline space-x-2">
                    <span className="text-xl font-bold text-black">{value}</span>
                </div>
                {subtitle && <p className="text-xs text-black mt-0.5">{subtitle}</p>}
            </div>
        </div>
    );

    // Map Backend Data for Tables
    const shiftData = [
        { 
            id: 1, 
            staff: user?.name || 'Unknown', 
            role: user?.designation || 'Staff', 
            loginTime: 'Current Shift', 
            cashCollected: 'LKR ' + (metrics.totalCashCollected || 0).toLocaleString(), 
            cashHandedOver: 'LKR ' + (metrics.handedOverCash || 0).toLocaleString(), 
            cashInHand: 'LKR ' + (metrics.cashInHand || 0).toLocaleString() 
        }
    ];

    const activeTripsData = ongoingTrips.map(trip => ({
        id: trip.id,
        driver: `${trip.driver?.first_name || ''} ${trip.driver?.last_name || ''}`.trim() || 'N/A',
        vehicle: trip.driver?.vehicle?.registration_number || 'N/A',
        customer: `${trip.customer?.first_name || ''} ${trip.customer?.last_name || ''}`.trim() || 'N/A',
        destination: trip.remarks || 'Unknown',
        status: trip.status,
    }));

    const financeData = (metrics.recentFinancialTransactions || []).map(tx => ({
        id: tx.id,
        type: tx.received ? 'Income' : 'Pending',
        category: 'Trip #' + tx.trip_id,
        amount: (tx.received ? '+' : '') + 'LKR ' + (tx.total_amount || 0).toLocaleString(),
        date: new Date(tx.created_at).toLocaleDateString(),
    }));

    const filteredShiftData = shiftData.filter(item => 
        item.staff.toLowerCase().includes(shiftSearch.toLowerCase()) || 
        item.role.toLowerCase().includes(shiftSearch.toLowerCase())
    );

    const filteredTripsData = activeTripsData.filter(item => 
        item.driver.toLowerCase().includes(tripSearch.toLowerCase()) || 
        item.vehicle.toLowerCase().includes(tripSearch.toLowerCase()) || 
        item.customer.toLowerCase().includes(tripSearch.toLowerCase()) || 
        item.destination.toLowerCase().includes(tripSearch.toLowerCase())
    );

    const filteredFinanceData = financeData.filter(item => 
        item.category.toLowerCase().includes(financeSearch.toLowerCase()) || 
        item.type.toLowerCase().includes(financeSearch.toLowerCase())
    );

    // Table Columns
    const shiftColumns = [
        { name: 'Staff Name', selector: row => row.staff, sortable: true },
        { name: 'Role', selector: row => row.role, sortable: true },
        { name: 'Login Time', selector: row => row.loginTime },
        { name: 'Cash Collected', selector: row => row.cashCollected, sortable: true },
        { name: 'Handed Over', selector: row => row.cashHandedOver, sortable: true },
        { name: 'Cash In Hand', selector: row => row.cashInHand, sortable: true, cell: row => <span className="font-bold text-blue-600">{row.cashInHand}</span> },
    ];

    const tripColumns = [
        { name: 'Driver', selector: row => row.driver, sortable: true },
        { name: 'Vehicle', selector: row => row.vehicle },
        { name: 'Customer', selector: row => row.customer },
        { name: 'Destination', selector: row => row.destination },
        { name: 'Status', selector: row => row.status, cell: row => (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {row.status}
            </span>
        ) },
    ];

    const financeColumns = [
        { name: 'Type', selector: row => row.type, sortable: true },
        { name: 'Amount', selector: row => row.amount, sortable: true, cell: row => (
            <span className={`font-semibold ${row.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {row.amount}
            </span>
        )},
        { name: 'Date', selector: row => row.date },
    ];

    const tableStyles = {
        headRow: { style: { backgroundColor: '#f1f5f9', borderBottomColor: '#e2e8f0', fontWeight: 'bold' } },
        cells: { style: { paddingLeft: '12px', paddingRight: '12px' } },
    };

    return (
        <AppSidebarLayout title="Decision Support System" defaultSidebarOpen={false}>
            <Head title="Comprehensive System Overview" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 space-y-8 bg-slate-50 min-h-screen">
                <div className="flex justify-between items-end border-b border-slate-200 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-black">Comprehensive System Overview</h1>
                        <p className="text-sm mt-1 text-black">Real-time metrics across all system modules.</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 text-sm text-black">
                        <span>Viewing as <strong className="text-black">{user?.name || 'User'}</strong></span>
                        <div className="flex items-center gap-3">
                            <select
                                value={dateFilter}
                                onChange={(e) => {
                                    setDateFilter(e.target.value);
                                    router.get('/dss', { filter: e.target.value }, { preserveState: true, preserveScroll: true, onSuccess: () => setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) });
                                }}
                                className="text-sm border-slate-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1.5 pl-3 pr-8 text-slate-700 bg-white cursor-pointer hover:bg-slate-50 transition-colors"
                            >
                                <option value="today">Today</option>
                                <option value="this_week">This Week</option>
                                <option value="this_month">This Month</option>
                                <option value="this_year">This Year</option>
                                <option value="all_time">All Time</option>
                            </select>
                            <span className="flex items-center"><ClockIcon className="w-4 h-4 mr-1" /> Last updated: {lastUpdated}</span>
                            <button 
                                onClick={() => {
                                    router.reload({
                                        onSuccess: () => setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
                                    });
                                }}
                                className="flex items-center px-3 py-1.5 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 text-slate-700 transition-colors"
                            >
                                <ArrowPathIcon className="w-4 h-4 mr-1.5" />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mt-6">
                    <div className="xl:col-span-8 space-y-8">
                        {/* --- 1. MANAGER & COUNTER (SHIFT & CASH) --- */}
                        <section className="border-2 border-slate-700 rounded-3xl p-6 bg-slate-50/50">
                            <h2 className="text-lg font-semibold text-black mb-4 flex items-center">
                                <BanknotesIcon className="w-5 h-5 mr-2 text-black" />
                                Manager & Counter Operations (Cash & Shifts)
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                <MiniCard title="Total Cash Collected" value={'LKR ' + (metrics.totalCashCollected || 0).toLocaleString()} icon={BanknotesIcon} colorClass="text-emerald-600" bgColorClass="bg-emerald-100" subtitle="Current Shift Total" />
                                <MiniCard title="Handed Over Cash" value={'LKR ' + (metrics.handedOverCash || 0).toLocaleString()} icon={BanknotesIcon} colorClass="text-blue-600" bgColorClass="bg-blue-100" subtitle="To Manager/Finance" />
                                <MiniCard title="Cash In Hand" value={'LKR ' + (metrics.cashInHand || 0).toLocaleString()} icon={BanknotesIcon} colorClass="text-amber-600" bgColorClass="bg-amber-100" subtitle="At the counter currently" />
                                <MiniCard title="Staff On Shift" value={metrics.staffOnShift || 0} icon={UsersIcon} colorClass="text-indigo-600" bgColorClass="bg-indigo-100" subtitle="Active users logged in" />
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                    <span className="font-semibold text-sm text-slate-700">Current Shift Details</span>
                                    <input 
                                        type="text" 
                                        placeholder="Search shift..." 
                                        className="text-sm border-slate-300 rounded-md shadow-sm py-1 px-3 w-48"
                                        value={shiftSearch}
                                        onChange={e => setShiftSearch(e.target.value)}
                                    />
                                </div>
                                <DataTable columns={shiftColumns} data={filteredShiftData} customStyles={tableStyles} responsive dense pagination paginationPerPage={5} paginationRowsPerPageOptions={[5, 10, 20]} />
                            </div>
                        </section>

                        {/* --- 2. TRIPS & DRIVERS --- */}
                        <section className="border-2 border-slate-700 rounded-3xl p-6 bg-slate-50/50">
                            <h2 className="text-lg font-semibold text-black mb-4 flex items-center">
                                <TruckIcon className="w-5 h-5 mr-2 text-black" />
                                Trips & Fleet Operations
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                <MiniCard title="Active Trips" value={metrics.activeTripsCount || 0} icon={TruckIcon} colorClass="text-blue-600" bgColorClass="bg-blue-100" />
                                <MiniCard title="Completed (Today)" value={metrics.completedTodayCount || 0} icon={ClipboardDocumentCheckIcon} colorClass="text-emerald-600" bgColorClass="bg-emerald-100" />
                                <MiniCard title="Available Drivers" value={metrics.availableDriversCount || 0} icon={UserGroupIcon} colorClass="text-indigo-600" bgColorClass="bg-indigo-100" />
                                <MiniCard title="Off Duty Drivers" value={metrics.offDutyDriversCount || 0} icon={UserGroupIcon} colorClass="text-slate-600" bgColorClass="bg-slate-100" />
                                <MiniCard title="Suspended Drivers" value={metrics.suspendedDriversCount || 0} icon={UserGroupIcon} colorClass="text-red-600" bgColorClass="bg-red-100" subtitle="Action required" />
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                    <span className="font-semibold text-sm text-slate-700">Ongoing Trips Monitor</span>
                                    <input 
                                        type="text" 
                                        placeholder="Search trips..." 
                                        className="text-sm border-slate-300 rounded-md shadow-sm py-1 px-3 w-48"
                                        value={tripSearch}
                                        onChange={e => setTripSearch(e.target.value)}
                                    />
                                </div>
                                <DataTable columns={tripColumns} data={filteredTripsData} customStyles={tableStyles} responsive dense pagination paginationPerPage={5} paginationRowsPerPageOptions={[5, 10, 20]} />
                            </div>
                        </section>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-2 border-slate-700 rounded-3xl p-6 bg-slate-50/50">
                            {/* --- 3. FINANCE & REPORTS --- */}
                            <section>
                                <h2 className="text-lg font-semibold text-black mb-4 flex items-center">
                                    <ChartPieIcon className="w-5 h-5 mr-2 text-black" />
                                    Finance & Accounting
                                </h2>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <MiniCard title="Total Revenue" value={'LKR ' + (metrics.totalRevenueToday || 0).toLocaleString()} icon={BanknotesIcon} colorClass="text-emerald-600" bgColorClass="bg-emerald-100" subtitle="Today's Earnings" />
                                    <MiniCard title="Pending Payouts" value={'LKR ' + (metrics.pendingPayouts || 0).toLocaleString()} icon={BanknotesIcon} colorClass="text-rose-600" bgColorClass="bg-rose-100" subtitle="Driver Payments" />
                                    <MiniCard title="Total Expenses" value={'LKR ' + (metrics.totalExpensesToday || 0).toLocaleString()} icon={DocumentTextIcon} colorClass="text-amber-600" bgColorClass="bg-amber-100" subtitle="Fuel & Misc" />
                                    <MiniCard title="Net Profit (Est)" value={'LKR ' + (metrics.netProfit || 0).toLocaleString()} icon={ChartPieIcon} colorClass="text-blue-600" bgColorClass="bg-blue-100" subtitle="Today" />
                                </div>
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                        <span className="font-semibold text-sm text-slate-700">Recent Financial Transactions</span>
                                        <input 
                                            type="text" 
                                            placeholder="Search finance..." 
                                            className="text-sm border-slate-300 rounded-md shadow-sm py-1 px-3 w-48"
                                            value={financeSearch}
                                            onChange={e => setFinanceSearch(e.target.value)}
                                        />
                                    </div>
                                    <DataTable columns={financeColumns} data={filteredFinanceData} customStyles={tableStyles} responsive dense pagination paginationPerPage={5} paginationRowsPerPageOptions={[5, 10, 20]} />
                                </div>
                            </section>

                            {/* --- 4. CUSTOMERS, SURVEYS & USERS --- */}
                            <section>
                                <div className="mb-8">
                                    <h2 className="text-lg font-semibold text-black mb-4 flex items-center">
                                        <UsersIcon className="w-5 h-5 mr-2 text-black" />
                                        Customers & Feedback
                                    </h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <MiniCard title="Total Customers" value={(metrics.totalCustomers || 0).toLocaleString()} icon={UsersIcon} colorClass="text-indigo-600" bgColorClass="bg-indigo-100" subtitle="All time" />
                                        <MiniCard title="New Today" value={metrics.newTodayCustomers || 0} icon={UsersIcon} colorClass="text-blue-600" bgColorClass="bg-blue-100" subtitle="Added today" />
                                        <MiniCard title="Surveys Collected" value={metrics.surveysCollected || 0} icon={DocumentTextIcon} colorClass="text-purple-600" bgColorClass="bg-purple-100" subtitle="All time" />
                                        <MiniCard title="Avg. Satisfaction" value={`${metrics.avgSatisfaction || 0}/5`} icon={StarIcon} colorClass="text-amber-500" bgColorClass="bg-amber-100" subtitle="Based on recent data" />
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-lg font-semibold text-black mb-4 flex items-center">
                                        <ShieldCheckIcon className="w-5 h-5 mr-2 text-black" />
                                        System Users
                                    </h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <MiniCard title="Registered Users" value={metrics.activeSystemUsers || 0} icon={ShieldCheckIcon} colorClass="text-slate-700" bgColorClass="bg-slate-200" subtitle="Total registered users" />
                                        <MiniCard title="Online Now" value={metrics.onlineNow || 0} icon={ClockIcon} colorClass="text-emerald-600" bgColorClass="bg-emerald-100" subtitle="Currently logged in" />
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                        
                    <div className="xl:col-span-4">
                        <VehicleQueueGrid 
                            vehicles={vehicles}
                            nextInLineVehicle={nextInLineVehicle}
                            nextInLineSlotNumber={nextInLineSlotNumber}
                            getVehicleSlotNumber={getVehicleSlotNumber}
                        />

                        {metrics.suspendedDriversList && metrics.suspendedDriversList.length > 0 && (
                            <div className="mt-8 border-2 border-red-300 rounded-3xl p-6 bg-red-50/30">
                                <h2 className="text-lg font-semibold text-black mb-4 flex items-center">
                                    <UserGroupIcon className="w-5 h-5 mr-2 text-red-600" />
                                    Suspended Drivers
                                </h2>
                                <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-red-50 text-red-800 text-xs uppercase font-semibold">
                                                <tr>
                                                    <th className="px-4 py-3">Driver Name</th>
                                                    <th className="px-4 py-3">Contact</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-red-100">
                                                {metrics.suspendedDriversList.map(driver => (
                                                    <tr key={driver.id} className="hover:bg-red-50/50 transition-colors">
                                                        <td className="px-4 py-3 font-medium text-black">
                                                            {driver.first_name} {driver.last_name}
                                                        </td>
                                                        <td className="px-4 py-3 text-black">
                                                            {driver.mobile_number || 'N/A'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
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
