import React from 'react';
import AppSidebarLayout from '@/Layouts/AppSidebarLayout';
import { Head, usePage, router } from '@inertiajs/react';
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

export default function DCSSIndex() {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [shiftSearch, setShiftSearch] = React.useState('');
    const [tripSearch, setTripSearch] = React.useState('');
    const [financeSearch, setFinanceSearch] = React.useState('');
    const [lastUpdated, setLastUpdated] = React.useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    const [dateFilter, setDateFilter] = React.useState('today');

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
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>
                <div className="flex items-baseline space-x-2">
                    <span className="text-xl font-bold text-slate-900">{value}</span>
                </div>
                {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
        </div>
    );

    // Mock Data for Tables
    const shiftData = [
        { id: 1, staff: 'Sarah Connor', role: 'Counter Staff', loginTime: '08:00 AM', cashCollected: '$1,250', cashHandedOver: '$1,000', cashInHand: '$250' },
        { id: 2, staff: 'John Smith', role: 'Manager', loginTime: '07:30 AM', cashCollected: '$3,400', cashHandedOver: '$3,400', cashInHand: '$0' },
    ];

    const activeTripsData = [
        { id: 101, driver: 'Mike Johnson', vehicle: 'CAB-4521', customer: 'Alice Brown', destination: 'City Center', status: 'In Progress' },
        { id: 102, driver: 'Tom Hanks', vehicle: 'VAN-9932', customer: 'David Lee', destination: 'North Terminal', status: 'Assigned' },
        { id: 103, driver: 'Robert Ford', vehicle: 'CAB-1122', customer: 'Emma Watson', destination: 'South Hotel', status: 'In Progress' },
    ];

    const financeData = [
        { id: 1, type: 'Income', category: 'Trip Payments', amount: '+$5,400', date: 'Today' },
        { id: 2, type: 'Expense', category: 'Fuel', amount: '-$450', date: 'Today' },
        { id: 3, type: 'Payout', category: 'Driver Commission', amount: '-$1,200', date: 'Today' },
    ];

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
        { name: 'Category', selector: row => row.category, sortable: true },
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
            <Head title="System Overview - DCSS" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 space-y-8 bg-slate-50 min-h-screen">
                <div className="flex justify-between items-end border-b border-slate-200 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Comprehensive System Overview</h1>
                        <p className="text-sm text-slate-500 mt-1">Real-time metrics across all system modules.</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 text-sm text-slate-500">
                        <span>Viewing as <strong className="text-slate-800">{user?.name || 'User'}</strong></span>
                        <div className="flex items-center gap-3">
                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
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

                {/* --- 1. MANAGER & COUNTER (SHIFT & CASH) --- */}
                <section className="border-2 border-slate-700 rounded-3xl p-6 bg-slate-50/50">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                        <BanknotesIcon className="w-5 h-5 mr-2 text-slate-500" />
                        Manager & Counter Operations (Cash & Shifts)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <MiniCard title="Total Cash Collected" value="$4,650" icon={BanknotesIcon} colorClass="text-emerald-600" bgColorClass="bg-emerald-100" subtitle="Current Shift Total" />
                        <MiniCard title="Handed Over Cash" value="$4,400" icon={BanknotesIcon} colorClass="text-blue-600" bgColorClass="bg-blue-100" subtitle="To Manager/Finance" />
                        <MiniCard title="Cash In Hand" value="$250" icon={BanknotesIcon} colorClass="text-amber-600" bgColorClass="bg-amber-100" subtitle="At the counter currently" />
                        <MiniCard title="Staff On Shift" value="2" icon={UsersIcon} colorClass="text-indigo-600" bgColorClass="bg-indigo-100" subtitle="1 Manager, 1 Counter Staff" />
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
                    <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                        <TruckIcon className="w-5 h-5 mr-2 text-slate-500" />
                        Trips & Fleet Operations
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <MiniCard title="Active Trips" value="12" icon={TruckIcon} colorClass="text-blue-600" bgColorClass="bg-blue-100" />
                        <MiniCard title="Completed (Today)" value="45" icon={ClipboardDocumentCheckIcon} colorClass="text-emerald-600" bgColorClass="bg-emerald-100" />
                        <MiniCard title="Pending Allocations" value="3" icon={ClockIcon} colorClass="text-amber-600" bgColorClass="bg-amber-100" />
                        <MiniCard title="Available Drivers" value="18" icon={UserGroupIcon} colorClass="text-indigo-600" bgColorClass="bg-indigo-100" />
                        <MiniCard title="Off Duty Drivers" value="2" icon={UserGroupIcon} colorClass="text-slate-600" bgColorClass="bg-slate-100" />
                        <MiniCard title="Suspended Drivers" value="3" icon={UserGroupIcon} colorClass="text-red-600" bgColorClass="bg-red-100" subtitle="Action required" />
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
                        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                            <ChartPieIcon className="w-5 h-5 mr-2 text-slate-500" />
                            Finance & Accounting
                        </h2>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <MiniCard title="Total Revenue" value="$5,400" icon={BanknotesIcon} colorClass="text-emerald-600" bgColorClass="bg-emerald-100" subtitle="Today's Earnings" />
                            <MiniCard title="Pending Payouts" value="$1,200" icon={BanknotesIcon} colorClass="text-rose-600" bgColorClass="bg-rose-100" subtitle="Driver Payments" />
                            <MiniCard title="Total Expenses" value="$450" icon={DocumentTextIcon} colorClass="text-amber-600" bgColorClass="bg-amber-100" subtitle="Fuel & Misc" />
                            <MiniCard title="Net Profit (Est)" value="$3,750" icon={ChartPieIcon} colorClass="text-blue-600" bgColorClass="bg-blue-100" subtitle="Today" />
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
                    <section className="space-y-8">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                                <UsersIcon className="w-5 h-5 mr-2 text-slate-500" />
                                Customers & Feedback
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <MiniCard title="Total Customers" value="8,432" icon={UsersIcon} colorClass="text-indigo-600" bgColorClass="bg-indigo-100" subtitle="All time" />
                                <MiniCard title="New Today" value="48" icon={UsersIcon} colorClass="text-blue-600" bgColorClass="bg-blue-100" subtitle="Added today" />
                                <MiniCard title="Surveys Collected" value="124" icon={DocumentTextIcon} colorClass="text-purple-600" bgColorClass="bg-purple-100" subtitle="This week" />
                                <MiniCard title="Avg. Satisfaction" value="4.8/5" icon={StarIcon} colorClass="text-amber-500" bgColorClass="bg-amber-100" subtitle="Based on recent data" />
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                                <ShieldCheckIcon className="w-5 h-5 mr-2 text-slate-500" />
                                System Users
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <MiniCard title="Active System Users" value="12" icon={ShieldCheckIcon} colorClass="text-slate-700" bgColorClass="bg-slate-200" subtitle="Admins, Execs, Managers" />
                                <MiniCard title="Online Now" value="4" icon={ClockIcon} colorClass="text-emerald-600" bgColorClass="bg-emerald-100" subtitle="Currently logged in" />
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
