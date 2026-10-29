import { Head, useForm, router, usePage } from '@inertiajs/react';
import UploadSlipModal from '@/Components/UploadSlipModal';
import { useState, useMemo, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import AppSidebarLayout from '@/Layouts/AppSidebarLayout';
import toast, { Toaster } from 'react-hot-toast';
import { CarFront, Users, FileText, Eye, X } from 'lucide-react';
import RentACarRatesPanel from './RentACarRatesPanel';

const getAmountInLkr = (amount, currency, rates) => {
    const fromCurrency = (currency ?? 'LKR').toLowerCase();
    if (fromCurrency === 'lkr') return Number(amount ?? 0);
    if (!rates) return Number(amount ?? 0);
    const rateFrom = rates[fromCurrency];
    const rateLkr = rates['lkr'];
    if (!rateFrom || !rateLkr) return Number(amount ?? 0);
    return (Number(amount ?? 0) / rateFrom) * rateLkr;
};

export default function Index({
    trips = [],
    drivers = [],
    agents = [],
    driverTotals = [],
    agentTotals = [],
    incentives = [],
    rateSetting = null,
    expenses = [],
    payouts = [],
    outsourceVehicles = [],
    pettyCashShiftLogs = [],
    pettyCashReturns = [],
    pettyCashBalance = 0,
    pettyCashRequests = [],
    rentACarRates = [],
    rentACarBookings = [],
}) {
    const [mainTab, setMainTab] = useState('daily_operations');
    const [subTab, setSubTab] = useState('payouts');
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [uploadSlipModal, setUploadSlipModal] = useState(null);
    const [viewSlipsModal, setViewSlipsModal] = useState(null);
    const [eurRates, setEurRates] = useState(null);

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

    // Date-range filter — lifted here so it lives in the header
    const [range, setRange] = useState('today');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    const { auth, pendingFinanceCount, pendingAccountantSlipsCount } = usePage().props;
    const isReadOnly = auth?.user?.isExecutiveStaff ?? false;

    return (
        <AppSidebarLayout title="Finance">
            <Head title="Finance" />
            <Toaster position="top-right" toastOptions={{ duration: 3500 }} />

            {isReadOnly && (
                <div className="mb-4 rounded-lg bg-indigo-50 border border-indigo-200 px-4 py-3 flex items-center gap-3">
                    <svg className="h-5 w-5 text-indigo-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm font-semibold text-indigo-800">View-Only Mode</span>
                    <span className="text-sm text-indigo-600">You are logged in as Executive Staff. All data is read-only.</span>
                </div>
            )}

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="p-6 border-b">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-bold">Finance</h1>
                            <p className="text-sm text-black mt-1">
                                Daily operations, settlements, reports and expenses.
                            </p>
                        </div>

                        {(mainTab === 'daily_operations' || mainTab === 'reports' || (mainTab === 'settlements' && subTab === 'till_amount')) && (
                            <div className="flex flex-wrap items-center gap-2">
                                {[
                                    { key: 'today', label: 'Today' },
                                    { key: 'week',  label: 'This Week' },
                                    { key: 'month', label: 'This Month' },
                                    { key: 'custom', label: 'Custom' },
                                ].map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => setRange(item.key)}
                                        className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                                            range === item.key
                                                ? 'bg-blue-700 text-white'
                                                : 'bg-gray-100 text-black hover:bg-gray-200'
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}

                                {range === 'custom' && (
                                    <>
                                        <input
                                            type="date"
                                            value={customStart}
                                            onChange={(e) => setCustomStart(e.target.value)}
                                            className="rounded border border-gray-300 px-3 py-1.5 text-sm"
                                        />
                                        <input
                                            type="date"
                                            value={customEnd}
                                            onChange={(e) => setCustomEnd(e.target.value)}
                                            className="rounded border border-gray-300 px-3 py-1.5 text-sm"
                                        />
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 p-4 border-b">
                    <MainTabCard active={mainTab === 'daily_operations'} onClick={() => setMainTab('daily_operations')}>
                        Daily Operations
                    </MainTabCard>
                    <MainTabCard active={mainTab === 'settlements'} onClick={() => setMainTab('settlements')}>
                        <span className="flex items-center gap-2">
                            Settlements
                            {pendingFinanceCount > 0 && (
                                <span className="inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 min-w-[18px]">
                                    {pendingFinanceCount}
                                </span>
                            )}
                        </span>
                    </MainTabCard>
                    <MainTabCard active={mainTab === 'expenses'} onClick={() => setMainTab('expenses')}>
                        Expenses
                    </MainTabCard>
                    <MainTabCard active={mainTab === 'rent_a_car'} onClick={() => setMainTab('rent_a_car')}>
                        <span className="flex items-center gap-2">
                            <CarFront size={16} />
                            <span>Rent a Car</span>
                        </span>
                    </MainTabCard>
                    <MainTabCard active={mainTab === 'reports'} onClick={() => setMainTab('reports')}>
                        Reports
                    </MainTabCard>
                    <MainTabCard active={mainTab === 'accountant_auth'} onClick={() => setMainTab('accountant_auth')}>
                        <span className="flex items-center gap-2">
                            Accountant Authorization
                            {pendingAccountantSlipsCount > 0 && (
                                <span className="inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 min-w-[18px]">
                                    {pendingAccountantSlipsCount}
                                </span>
                            )}
                        </span>
                    </MainTabCard>
                </div>

                <div className="p-4">
                    {mainTab === 'daily_operations' && (
                        <DailyOperationsPanel
                            trips={trips}
                            rateSetting={rateSetting}
                            range={range}
                            customStart={customStart}
                            customEnd={customEnd}
                            eurRates={eurRates}
                            setUploadSlipModal={setUploadSlipModal}
                            outsourceVehicles={outsourceVehicles}
                            rentACarBookings={rentACarBookings}
                        />
                    )}

                    {mainTab === 'settlements' && (
                        <>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <SubTab active={subTab === 'payouts'} onClick={() => setSubTab('payouts')}>Payouts</SubTab>
                                <SubTab active={subTab === 'till_amount'} onClick={() => setSubTab('till_amount')}>Till Amount</SubTab>
                                <SubTab active={subTab === 'drivers'} onClick={() => setSubTab('drivers')}>Driver Inactive</SubTab>
                                <SubTab active={subTab === 'incentives'} onClick={() => setSubTab('incentives')}>Incentives</SubTab>
                            </div>

                            {subTab === 'till_amount' && (
                                <TillAmountTab 
                                    shiftLogs={pettyCashShiftLogs}
                                    returns={pettyCashReturns}
                                    currentBalance={pettyCashBalance}
                                    requests={pettyCashRequests}
                                    range={range}
                                    customStart={customStart}
                                    customEnd={customEnd}
                                />
                            )}

                            {subTab === 'drivers' && (
                                <DriversTable drivers={drivers} />
                            )}

                            {subTab === 'payouts' && (
                                <PayoutsTab 
                                    drivers={driverTotals} 
                                    agents={agentTotals}
                                    outsourceVehicles={outsourceVehicles}
                                />
                            )}

                            {subTab === 'incentives' && (
                                <IncentivesTab
                                    drivers={drivers}
                                    agents={agents}
                                    incentives={incentives}
                                />
                            )}
                        </>
                    )}

                    {mainTab === 'reports' && (
                        <ReportsPanel 
                            trips={trips} 
                            expenses={expenses} 
                            rateSetting={rateSetting} 
                            range={range} 
                            customStart={customStart} 
                            customEnd={customEnd} 
                            eurRates={eurRates}
                        />
                    )}

                    {mainTab === 'expenses' && (
                        <ExpensesPanel expenses={expenses} />
                    )}

                    {mainTab === 'rent_a_car' && (
                        <RentACarRatesPanel rentACarRates={rentACarRates} isReadOnly={isReadOnly} />
                    )}

                    {mainTab === 'accountant_auth' && (
                        <AccountantAuthTab
                            trips={trips}
                            outsourceVehicles={outsourceVehicles}
                            rentACarBookings={rentACarBookings}
                            rateSetting={rateSetting}
                            eurRates={eurRates}
                            setUploadSlipModal={setUploadSlipModal}
                            setViewSlipsModal={setViewSlipsModal}
                        />
                    )}
                </div>
            </div>

            {selectedTrip && (
                <SettlementModal
                    trip={selectedTrip}
                    onClose={() => setSelectedTrip(null)}
                />
            )}
            {/* Upload Slip Modal */}
            {uploadSlipModal && (
                <UploadSlipModal uploadSlipModal={uploadSlipModal} setUploadSlipModal={setUploadSlipModal} />
            )}
            {/* View Slips Modal */}
            {viewSlipsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setViewSlipsModal(null)}>
                    <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#f5f6fa]/50 shrink-0">
                            <div>
                                <h3 className="text-lg font-black text-[#0f1d45]">Uploaded Slips — {viewSlipsModal.display_id || viewSlipsModal.displayId || `Trip #${viewSlipsModal.trip_id}`}</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Payment slip documents uploaded for accountant verification</p>
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
                                    const isImage = slip.slip_path && slip.slip_path.match(/\.(jpeg|jpg|png|webp|gif)$/i);
                                    return (
                                        <div key={slip.id} className="rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border bg-gray-50 border-gray-200">
                                            <div className="space-y-1.5 flex-1">
                                                <div className="text-xs text-gray-500">
                                                    Uploaded by: <span className="font-semibold text-gray-700">{slip.uploader?.name || 'Finance User'}</span>
                                                    {slip.created_at && (
                                                        <span className="ml-2 text-gray-400">• {new Date(slip.created_at).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-[#0f1d45]">Description:</p>
                                                    <p className="text-sm text-gray-700">{slip.slip_des || <span className="italic text-gray-400">No description provided</span>}</p>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-semibold pt-0.5">
                                                    <span className="text-gray-500">Status:</span>
                                                    <span className={`uppercase font-bold ${slip.status === 'completed' ? 'text-emerald-600' : slip.status === 'incomplete' ? 'text-rose-600' : 'text-amber-600'}`}>
                                                        {slip.status === 'completed' ? '✓ Completed' : slip.status === 'incomplete' ? '⚠️ Incomplete' : '⏳ Pending Review'}
                                                    </span>
                                                </div>
                                            </div>

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

function DailyOperationsPanel({
    trips = [],
    rateSetting = null,
    range = 'today',
    customStart = '',
    customEnd = '',
    eurRates = null,
    setUploadSlipModal,
    outsourceVehicles = [],
    rentACarBookings = [],
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 8;
    const [expandedDates, setExpandedDates] = useState([]);

    const toggleDate = (dateStr) => {
        setExpandedDates(prev => prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]);
    };

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    const filterByRange = (dateVal) => {
        if (!dateVal || Number.isNaN(dateVal.getTime())) return false;
        if (range === 'today') return dateVal >= startOfToday && dateVal <= endOfToday;
        if (range === 'week') {
            const startOfWeek = new Date(startOfToday);
            startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);
            return dateVal >= startOfWeek && dateVal <= endOfWeek;
        }
        if (range === 'month') {
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
            return dateVal >= startOfMonth && dateVal <= endOfMonth;
        }
        if (range === 'custom') {
            if (!customStart) return false;
            const from = new Date(customStart);
            from.setHours(0, 0, 0, 0);
            const to = customEnd ? new Date(customEnd) : new Date(customStart);
            to.setHours(23, 59, 59, 999);
            return dateVal >= from && dateVal <= to;
        }
        return false;
    };

    const agentRate = Number(rateSetting?.agent_rate ?? 0);
    const driverRate = Number(rateSetting?.driver_rate ?? 0);

    // Normalize all streams into unified transactions
    const allUnifiedTransactions = useMemo(() => {
        const items = [];
        const tripCustomerIds = new Set();
        const outsourceCustomerIds = new Set();

        // 1. Standard Trips (Transfer, Tours, etc.)
        trips.forEach((trip) => {
            if (trip.customer_id) tripCustomerIds.add(trip.customer_id);

            const assignedAt = trip.trip_assigned_at ? new Date(trip.trip_assigned_at) : (trip.created_at ? new Date(trip.created_at) : null);
            if (!filterByRange(assignedAt)) return;

            const customer = trip.customer;
            const originalCurrency = customer?.agent?.new_currency ?? customer?.agent?.currency ?? 'LKR';
            const originalAmount = Number(customer?.paid_amount ?? 0);
            const tf = trip.trip_finance;
            const amountInLkr = tf?.total_amount
                ? Number(tf.total_amount)
                : Math.round(getAmountInLkr(originalAmount, originalCurrency, eurRates));

            const isCustomRate = Boolean(tf?.is_custom_rate);
            const hasStoredRates = tf && (Number(tf.driver_share) > 0 || Number(tf.agent_share) > 0 || Number(tf.total_amount) > 0);

            let agentPortion, driverPortion, balance;
            if (isCustomRate && hasStoredRates) {
                agentPortion  = Number(tf.agent_share);
                driverPortion = Number(tf.driver_share);
                balance       = Number(tf.balance);
            } else if (hasStoredRates) {
                agentPortion  = Number(tf.agent_share);
                driverPortion = Number(tf.driver_share);
                balance       = Number(tf.balance);
            } else {
                agentPortion  = Math.round((amountInLkr * agentRate) / 100);
                driverPortion = Math.round((amountInLkr * driverRate) / 100);
                balance       = amountInLkr - agentPortion - driverPortion;
            }

            const isReceived = Boolean(trip.cash_received) || Boolean(tf?.received);
            const rawType = (customer?.agent?.booking_type || trip.agent?.booking_type || 'Transfer').trim();
            const bookingType = rawType || 'Transfer';

            items.push({
                uniqueKey: `trip-${trip.id}`,
                id: trip.id,
                transactionType: 'trip',
                bookingType,
                displayId: `#${trip.id}`,
                assignedAt,
                customer,
                agentName: customer?.agent?.user?.name || trip.agent?.user?.name || '-',
                vehicleInfo: trip.driver?.vehicle?.registration_number || (trip.driver ? trip.driver.full_name : '-'),
                driverName: trip.driver?.full_name || '-',
                amountInLkr,
                originalCurrency,
                originalAmount,
                paymentNotes: Array.isArray(customer?.payment_notes)
                    ? customer.payment_notes
                    : (typeof customer?.payment_notes === 'string' ? JSON.parse(customer?.payment_notes || '[]') : []),
                agentPortion,
                driverPortion,
                balance,
                isCustomRate,
                isReceived,
                onMarkReceived: () => {
                    if (!window.confirm(`Are you sure you want to mark Trip #${trip.id} as received from counter manager?`)) return;
                    const toastId = toast.loading(`Marking Trip #${trip.id} as received from counter manager…`);
                    router.post(
                        `/finance/trip-finances/${trip.id}/mark-received`,
                        {
                            total_amount:    amountInLkr,
                            driver_share:    driverPortion,
                            agent_share:     agentPortion,
                            balance:         balance,
                            received_amount: amountInLkr,
                        },
                        {
                            preserveScroll: true,
                            preserveState: true,
                            onSuccess: () => {
                                toast.success(`Trip #${trip.id} marked as received from counter manager — LKR ${amountInLkr.toLocaleString()}`, { id: toastId });
                            },
                            onError: () => {
                                toast.error(`Failed to mark Trip #${trip.id} as received from counter manager`, { id: toastId });
                            },
                        }
                    );
                },
            });
        });

        // 2. Outside Vehicles (Outsource Vehicles)
        outsourceVehicles.forEach((ov) => {
            if (ov.customer_id) outsourceCustomerIds.add(ov.customer_id);

            const createdAt = ov.created_at ? new Date(ov.created_at) : null;
            if (!filterByRange(createdAt)) return;

            const customer = ov.customer;
            const originalCurrency = customer?.agent?.new_currency ?? customer?.agent?.currency ?? 'LKR';
            const originalAmount = Number(customer?.paid_amount ?? ov.price ?? 0);
            const amountInLkr = Math.round(getAmountInLkr(originalAmount, originalCurrency, eurRates));

            const ovPrice = Number(ov.price || 0);
            const agentPortion = 0;
            const driverPortion = ovPrice;
            const balance = amountInLkr - ovPrice;
            const isReceived = Boolean(ov.received);

            items.push({
                uniqueKey: `ov-${ov.id}`,
                id: ov.id,
                transactionType: 'outside_vehicle',
                bookingType: 'Outside Vehicle',
                displayId: `OV-${ov.id}`,
                assignedAt: createdAt,
                customer,
                agentName: ov.agent?.user?.name || ov.creator?.name || '-',
                vehicleInfo: ov.vehicle_number || (ov.mobile_number ? `Mob: ${ov.mobile_number}` : 'Outside Vehicle'),
                driverName: ov.mobile_number ? `Driver (${ov.mobile_number})` : 'External Driver',
                amountInLkr,
                originalCurrency,
                originalAmount,
                paymentNotes: Array.isArray(customer?.payment_notes)
                    ? customer.payment_notes
                    : (typeof customer?.payment_notes === 'string' ? JSON.parse(customer?.payment_notes || '[]') : []),
                agentPortion,
                driverPortion,
                balance,
                isCustomRate: false,
                isReceived,
                onMarkReceived: () => {
                    if (!window.confirm(`Are you sure you want to mark Outside Vehicle OV-${ov.id} as received from counter manager?`)) return;
                    const toastId = toast.loading(`Marking OV-${ov.id} as received from counter manager…`);
                    router.post(
                        `/finance/outsource-vehicles/${ov.id}/mark-received`,
                        {
                            received_amount: amountInLkr,
                        },
                        {
                            preserveScroll: true,
                            preserveState: true,
                            onSuccess: () => {
                                toast.success(`Outside Vehicle OV-${ov.id} marked as received from counter manager — LKR ${amountInLkr.toLocaleString()}`, { id: toastId });
                            },
                            onError: () => {
                                toast.error(`Failed to mark OV-${ov.id} as received from counter manager`, { id: toastId });
                            },
                        }
                    );
                },
            });
        });

        // 3. Rent a Car Bookings
        rentACarBookings.forEach((customer) => {
            if (tripCustomerIds.has(customer.id) || outsourceCustomerIds.has(customer.id)) return;

            const createdAt = customer.created_at ? new Date(customer.created_at) : null;
            if (!filterByRange(createdAt)) return;

            const originalCurrency = customer.agent?.new_currency ?? customer.agent?.currency ?? 'LKR';
            const originalAmount = Number(customer.paid_amount ?? customer.agent?.new_price ?? customer.agent?.price ?? 0);
            const amountInLkr = Math.round(getAmountInLkr(originalAmount, originalCurrency, eurRates));

            const agentPortion = Math.round((amountInLkr * agentRate) / 100);
            const driverPortion = 0;
            const balance = amountInLkr - agentPortion;
            const isReceived = Boolean(customer.finance_received);

            items.push({
                uniqueKey: `rc-${customer.id}`,
                id: customer.id,
                transactionType: 'rent_a_car',
                bookingType: 'Rent a Car',
                displayId: `RC-${customer.id}`,
                assignedAt: createdAt,
                customer,
                agentName: customer.agent?.user?.name || '-',
                vehicleInfo: customer.agent?.external_vehicle_reg || 'Rent a Car',
                driverName: 'Self Drive / Rental',
                amountInLkr,
                originalCurrency,
                originalAmount,
                paymentNotes: Array.isArray(customer?.payment_notes)
                    ? customer.payment_notes
                    : (typeof customer?.payment_notes === 'string' ? JSON.parse(customer?.payment_notes || '[]') : []),
                agentPortion,
                driverPortion,
                balance,
                isCustomRate: false,
                isReceived,
                onMarkReceived: () => {
                    if (!window.confirm(`Are you sure you want to mark Rent a Car #${customer.id} as received from counter manager?`)) return;
                    const toastId = toast.loading(`Marking Rent a Car #${customer.id} as received from counter manager…`);
                    router.post(
                        `/finance/customers/${customer.id}/mark-received`,
                        {
                            received_amount: amountInLkr,
                        },
                        {
                            preserveScroll: true,
                            preserveState: true,
                            onSuccess: () => {
                                toast.success(`Rent a Car #${customer.id} marked as received from counter manager — LKR ${amountInLkr.toLocaleString()}`, { id: toastId });
                            },
                            onError: () => {
                                toast.error(`Failed to mark Rent a Car #${customer.id} as received from counter manager`, { id: toastId });
                            },
                        }
                    );
                },
            });
        });

        return items;
    }, [trips, outsourceVehicles, rentACarBookings, range, customStart, customEnd, eurRates, agentRate, driverRate]);

    const totalAmount = allUnifiedTransactions.reduce((sum, item) => sum + item.amountInLkr, 0);

    const filteredRows = allUnifiedTransactions.filter((item) => {
        const query = searchTerm.toLowerCase();
        return (
            String(item.id).includes(query) ||
            item.displayId.toLowerCase().includes(query) ||
            (item.customer?.name ?? '').toLowerCase().includes(query) ||
            (item.vehicleInfo ?? '').toLowerCase().includes(query) ||
            (item.agentName ?? '').toLowerCase().includes(query) ||
            (item.bookingType ?? '').toLowerCase().includes(query)
        );
    });

    const groupedTransactions = useMemo(() => {
        const groups = {};
        filteredRows.forEach(item => {
            if (!item.assignedAt || Number.isNaN(item.assignedAt.getTime())) return;
            const dateStr = item.assignedAt.toLocaleDateString('en-CA'); // 'YYYY-MM-DD'
            if (!groups[dateStr]) {
                groups[dateStr] = { date: dateStr, items: [], totalAmount: 0 };
            }
            groups[dateStr].items.push(item);
            groups[dateStr].totalAmount += item.amountInLkr;
        });
        return Object.values(groups).sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [filteredRows]);

    const pagedGroups = groupedTransactions.slice((page - 1) * pageSize, page * pageSize);
    const totalPages = Math.max(1, Math.ceil(groupedTransactions.length / pageSize));

    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-black">
                    {range === 'today' ? "Today's daily operations" : 'Daily operations'}
                </h2>
                <div className="flex items-center gap-3 text-sm">
                    <span className="text-black">{allUnifiedTransactions.length} transaction(s)</span>
                    <span className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-black">
                        Total : LKR {totalAmount.toLocaleString()}
                    </span>
                </div>
            </div>

            {allUnifiedTransactions.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-black">
                    No transactions found for this period.
                </div>
            ) : (
                <>
                    <div className="mt-4 rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-3">
                            <input
                                type="text"
                                placeholder="Search all transactions (ID, customer, vehicle, agent)..."
                                className="w-full max-w-sm rounded border border-gray-300 px-3 py-2 text-sm"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setPage(1);
                                }}
                            />
                            <div className="text-sm text-black">
                                Page {page} of {totalPages}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-semibold text-black">Trip / Ref</th>
                                        <th className="px-3 py-2 text-left font-semibold text-black">Agent</th>
                                        <th className="px-3 py-2 text-left font-semibold text-black">Vehicle</th>
                                        <th className="px-3 py-2 text-left font-semibold text-black">Amount</th>
                                        <th className="px-3 py-2 text-left font-semibold text-black">Agent Share</th>
                                        <th className="px-3 py-2 text-left font-semibold text-black">Driver Share / Cost</th>
                                        <th className="px-3 py-2 text-left font-semibold text-black">Balance</th>
                                        <th className="px-3 py-2 text-left font-semibold text-black">Type / Rate</th>
                                        <th className="px-3 py-2 text-left font-semibold text-black">Action</th>
                                    </tr>
                                </thead>
                                {pagedGroups.map((group) => (
                                    <tbody key={group.date} className="divide-y divide-gray-100 bg-white">
                                        <tr className="bg-gray-100 hover:bg-gray-200 cursor-pointer border-t border-gray-300 transition-colors" onClick={() => toggleDate(group.date)}>
                                            <td className="px-3 py-3 font-bold text-black">
                                                {new Date(group.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="px-3 py-3 font-bold text-black">
                                                LKR {group.totalAmount.toLocaleString()}
                                            </td>
                                            <td className="px-3 py-3 text-black font-medium" colSpan={6}>
                                                {group.items.length} Transaction{group.items.length !== 1 && 's'}
                                            </td>
                                            <td className="px-3 py-3 text-right text-black font-semibold text-xs uppercase tracking-wider">
                                                {expandedDates.includes(group.date) ? '▲ Hide' : '▼ Show'}
                                            </td>
                                        </tr>
                                        {expandedDates.includes(group.date) && group.items.map((item) => {
                                            const customer = item.customer;
                                            const borderAccent =
                                                item.transactionType === 'outside_vehicle' ? 'border-amber-500' :
                                                item.transactionType === 'rent_a_car' ? 'border-purple-500' :
                                                'border-blue-500';

                                            return (
                                                <tr key={item.uniqueKey} className="hover:bg-blue-50/50 bg-white">
                                                    <td className={`px-3 py-2 border-l-2 ${borderAccent}`}>
                                                        <div className="font-semibold text-black">{item.displayId}</div>
                                                        <div className="text-xs text-black">{customer?.name ?? '-'}</div>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <div className="text-xs font-medium text-black">{item.agentName}</div>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <div className="text-xs font-medium text-black">{item.vehicleInfo}</div>
                                                    </td>
                                                    <td className="px-3 py-2 font-medium text-black">
                                                        <div>LKR {item.amountInLkr.toLocaleString()}</div>
                                                        {item.originalCurrency !== 'LKR' && (
                                                            <span className="inline-flex items-center rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-black border border-blue-100 mt-1 mb-1">
                                                                {item.originalCurrency} {item.originalAmount.toLocaleString()}
                                                            </span>
                                                        )}
                                                        {item.paymentNotes.length > 0 && (
                                                            <div className="mt-1 space-y-1">
                                                                {item.paymentNotes.map((p, pi) => (
                                                                    <div key={pi} className="flex flex-wrap items-center gap-1 text-[10px]">
                                                                        <span className={`px-1 py-0.5 rounded font-bold uppercase ${p.method === 'Cash' ? 'bg-emerald-100 text-black' : 'bg-blue-100 text-black'}`}>
                                                                            {p.method}
                                                                        </span>
                                                                        {p.method === 'Cash' && Array.isArray(p.notes) && p.notes.map((n, ni) => (
                                                                            <span key={ni} className="bg-slate-100 text-black px-1 py-0.5 rounded border font-semibold">
                                                                                💵 {n.amount} x {n.count} ({n.currency || p.currency})
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <div className="font-medium text-black">LKR {item.agentPortion.toLocaleString()}</div>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <div className="font-medium text-black">LKR {item.driverPortion.toLocaleString()}</div>
                                                    </td>
                                                    <td className="px-3 py-2 font-medium text-black">LKR {item.balance.toLocaleString()}</td>
                                                    <td className="px-3 py-2">
                                                        <div className="flex flex-col gap-1 items-start">
                                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                                item.transactionType === 'outside_vehicle' ? 'bg-amber-100 text-amber-800' :
                                                                item.transactionType === 'rent_a_car' ? 'bg-purple-100 text-purple-800' :
                                                                item.bookingType.toLowerCase().includes('tour') ? 'bg-teal-100 text-teal-800' :
                                                                'bg-blue-100 text-blue-800'
                                                            }`}>
                                                                {item.bookingType}
                                                            </span>
                                                            {item.transactionType === 'trip' && (
                                                                item.isCustomRate ? (
                                                                    <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-[9px] font-bold text-black">
                                                                        Custom
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-semibold text-black">
                                                                        Standard
                                                                    </span>
                                                                )
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <div className="flex flex-col gap-2 items-start">
                                                            {item.isReceived ? (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-black">
                                                                    ✓ Received from Counter Manager
                                                                </span>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    onClick={item.onMarkReceived}
                                                                    className="rounded bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 active:scale-95 transition-transform whitespace-nowrap shadow-sm"
                                                                >
                                                                    Received from Counter Manager
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                ))}
                            </table>
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-200 p-3 text-sm text-black">
                            <button
                                type="button"
                                onClick={() => setPage((current) => Math.max(1, current - 1))}
                                disabled={page === 1}
                                className="rounded border border-gray-300 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span>
                                Showing {groupedTransactions.length === 0 ? 0 : (page - 1) * pageSize + 1}-{Math.min(page * pageSize, groupedTransactions.length)} of {groupedTransactions.length} Dates
                            </span>
                            <button
                                type="button"
                                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                                disabled={page === totalPages}
                                className="rounded border border-gray-300 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

function AccountantAuthTab({ trips, outsourceVehicles = [], rentACarBookings = [], rateSetting, eurRates, setUploadSlipModal, setViewSlipsModal }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [authRange, setAuthRange] = useState('today');
    const [authFrom, setAuthFrom] = useState('');
    const [authTo, setAuthTo] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 15;

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    const filterByDate = (dateString) => {
        const d = dateString ? new Date(dateString) : null;
        if (!d || isNaN(d.getTime())) return false;
        if (authRange === 'today') return d >= startOfToday && d <= endOfToday;
        if (authRange === 'week') {
            const ws = new Date(startOfToday);
            ws.setDate(startOfToday.getDate() - startOfToday.getDay());
            const we = new Date(ws); we.setDate(ws.getDate() + 6); we.setHours(23, 59, 59, 999);
            return d >= ws && d <= we;
        }
        if (authRange === 'month') {
            const ms = new Date(today.getFullYear(), today.getMonth(), 1);
            const me = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
            return d >= ms && d <= me;
        }
        if (authRange === 'custom') {
            const from = authFrom ? new Date(authFrom) : new Date(0);
            const to = authTo ? new Date(authTo) : new Date('2100-01-01');
            to.setHours(23, 59, 59, 999);
            return d >= from && d <= to;
        }
        return true;
    };

    const tripCustomerIdSet = new Set(trips.map(t => t.customer_id).filter(Boolean));
    const outsourceCustomerIdSet = new Set(outsourceVehicles.map(ov => ov.customer_id).filter(Boolean));

    const approvedTripRecords = trips
        .filter(t => t.trip_finance?.accountant_approved && filterByDate(t.trip_assigned_at))
        .map(trip => {
            const tf = trip.trip_finance;
            const customer = trip.customer;
            const originalCurrency = customer?.agent?.new_currency ?? customer?.agent?.currency ?? 'LKR';
            const originalAmount = Number(customer?.paid_amount ?? 0);
            const amountInLkr = tf?.total_amount
                ? Number(tf.total_amount)
                : Math.round(getAmountInLkr(originalAmount, originalCurrency, eurRates));

            return {
                id: `trip-${trip.id}`,
                rawId: trip.id,
                displayId: `#${trip.id}`,
                type: 'trip',
                typeBadge: 'Trip',
                customerName: customer?.name ?? '-',
                customer: customer,
                agentName: customer?.agent?.user?.name ?? '-',
                vehicleDisplay: trip.driver?.vehicle?.registration_number ?? '-',
                amountInLkr,
                date: trip.trip_assigned_at,
                trip,
                tf,
                slips: tf?.payment_slips || [],
            };
        });

    const approvedOutsourceRecords = outsourceVehicles
        .filter(ov => ov.accountant_approved && filterByDate(ov.assigned_at || ov.created_at))
        .map(ov => {
            const customer = ov.customer;
            const originalCurrency = customer?.agent?.new_currency ?? customer?.agent?.currency ?? 'LKR';
            const originalAmount = Number(customer?.paid_amount ?? 0);
            const amountInLkr = ov.total_amount
                ? Number(ov.total_amount)
                : Math.round(getAmountInLkr(originalAmount, originalCurrency, eurRates));

            return {
                id: `ov-${ov.id}`,
                rawId: ov.id,
                displayId: `OV-${ov.id}`,
                type: 'outside_vehicle',
                typeBadge: 'Outside Vehicle',
                customerName: customer?.name ?? '-',
                customer: customer,
                agentName: customer?.agent?.user?.name ?? '-',
                vehicleDisplay: `${ov.vehicle_number || ov.supplier_name || 'Outside Vehicle'}${ov.vehicle_model ? ` (${ov.vehicle_model})` : ''}`,
                amountInLkr,
                date: ov.assigned_at || ov.created_at,
                ov,
                slips: ov.payment_slips || [],
            };
        });

    const approvedRentACarRecords = rentACarBookings
        .filter(c => !tripCustomerIdSet.has(c.id) && !outsourceCustomerIdSet.has(c.id))
        .filter(c => c.accountant_approved && filterByDate(c.created_at))
        .map(c => {
            const originalCurrency = c.agent?.new_currency ?? c.agent?.currency ?? 'LKR';
            const originalAmount = Number(c.paid_amount ?? 0);
            const amountInLkr = Math.round(getAmountInLkr(originalAmount, originalCurrency, eurRates));

            return {
                id: `rc-${c.id}`,
                rawId: c.id,
                displayId: `RC-${c.id}`,
                type: 'rent_a_car',
                typeBadge: 'Rent a Car',
                customerName: c.name ?? '-',
                customer: c,
                agentName: c.agent?.user?.name ?? '-',
                vehicleDisplay: c.rent_a_car_rate?.vehicle_type || 'Rent a Car',
                amountInLkr,
                date: c.created_at,
                customer: c,
                slips: c.payment_slips || [],
            };
        });

    const allApproved = [...approvedTripRecords, ...approvedOutsourceRecords, ...approvedRentACarRecords].sort(
        (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
    );

    const filtered = allApproved.filter(item => {
        const q = searchTerm.toLowerCase();
        return (
            item.displayId.toLowerCase().includes(q) ||
            item.customerName.toLowerCase().includes(q) ||
            item.agentName.toLowerCase().includes(q) ||
            item.vehicleDisplay.toLowerCase().includes(q) ||
            item.typeBadge.toLowerCase().includes(q)
        );
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

    const rangeOptions = [
        { key: 'today', label: 'Today' },
        { key: 'week', label: 'This Week' },
        { key: 'month', label: 'This Month' },
        { key: 'custom', label: 'Custom' },
    ];

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-black">Accountant Authorization</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Transactions approved by the accountant and their slip upload status</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {rangeOptions.map(opt => (
                        <button
                            key={opt.key}
                            type="button"
                            onClick={() => { setAuthRange(opt.key); setPage(1); }}
                            className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${authRange === opt.key ? 'bg-blue-700 text-white' : 'bg-gray-100 text-black hover:bg-gray-200'}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                    {authRange === 'custom' && (
                        <>
                            <input type="date" value={authFrom} onChange={e => { setAuthFrom(e.target.value); setPage(1); }} className="rounded border border-gray-300 px-3 py-1.5 text-sm" />
                            <input type="date" value={authTo} onChange={e => { setAuthTo(e.target.value); setPage(1); }} className="rounded border border-gray-300 px-3 py-1.5 text-sm" />
                        </>
                    )}
                    <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-800 text-sm border border-emerald-200">
                        {allApproved.length} Approved
                    </span>
                </div>
            </div>

            {allApproved.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-400">
                    No accountant-approved transactions found for this period.
                </div>
            ) : (
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-200 p-3 gap-3">
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            className="w-full max-w-xs rounded border border-gray-300 px-3 py-2 text-sm"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        />
                        <span className="text-sm text-gray-500 whitespace-nowrap">{filtered.length} record(s)</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-3 py-2 text-left font-semibold text-black">Ref / Type</th>
                                    <th className="px-3 py-2 text-left font-semibold text-black">Customer</th>
                                    <th className="px-3 py-2 text-left font-semibold text-black">Agent</th>
                                    <th className="px-3 py-2 text-left font-semibold text-black">Vehicle</th>
                                    <th className="px-3 py-2 text-left font-semibold text-black">Amount</th>
                                    <th className="px-3 py-2 text-left font-semibold text-black">Accountant Status</th>
                                    <th className="px-3 py-2 text-left font-semibold text-black">Uploaded Slips</th>
                                    <th className="px-3 py-2 text-left font-semibold text-black">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {paged.map(item => {
                                    const slips = item.slips || [];
                                    const pendingSlips = slips.filter(s => s.status === 'pending');
                                    const completedSlips = slips.filter(s => s.status === 'completed');
                                    const incompleteSlips = slips.filter(s => s.status === 'incomplete');

                                    return (
                                        <tr key={item.id} className="hover:bg-emerald-50/40">
                                            <td className="px-3 py-2 border-l-2 border-emerald-500">
                                                <div className="font-semibold text-black flex items-center gap-1.5">
                                                    {item.displayId}
                                                    <span className={`inline-block px-1.5 py-0.5 text-[10px] font-bold rounded ${
                                                        item.type === 'trip'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : item.type === 'outside_vehicle'
                                                            ? 'bg-purple-100 text-purple-800'
                                                            : 'bg-emerald-100 text-emerald-800'
                                                    }`}>
                                                        {item.typeBadge}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-gray-400">
                                                    {item.date ? new Date(item.date).toLocaleDateString() : '-'}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-xs font-semibold text-gray-800">
                                                {item.customerName}
                                            </td>
                                            <td className="px-3 py-2 text-xs text-black">
                                                {item.agentName}
                                            </td>
                                            <td className="px-3 py-2 text-xs font-medium text-black">
                                                {item.vehicleDisplay}
                                            </td>
                                            <td className="px-3 py-2 font-medium text-black">
                                                LKR {item.amountInLkr.toLocaleString()}
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200 whitespace-nowrap">
                                                    ✓ Approved by Accountant
                                                </span>
                                            </td>
                                            <td className="px-3 py-2">
                                                {slips.length === 0 ? (
                                                    <span className="text-gray-400 text-xs italic">No Slips Uploaded</span>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <button
                                                            type="button"
                                                            onClick={() => setViewSlipsModal({ payment_slips: slips, display_id: item.displayId, ...item })}
                                                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 px-2.5 py-1 text-xs font-bold transition active:scale-95 whitespace-nowrap shadow-sm"
                                                        >
                                                            👁 View Slips ({slips.length})
                                                        </button>
                                                        {completedSlips.length === slips.length && (
                                                            <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold whitespace-nowrap">
                                                                ✓ Verified
                                                            </span>
                                                        )}
                                                        {incompleteSlips.length > 0 && (
                                                            <span className="inline-flex items-center rounded-full bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 text-[10px] font-bold whitespace-nowrap">
                                                                ⚠️ Incomplete
                                                            </span>
                                                        )}
                                                        {pendingSlips.length > 0 && incompleteSlips.length === 0 && (
                                                            <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 text-[10px] font-bold whitespace-nowrap">
                                                                ⏳ Pending Review
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap">
                                                {slips.length === 0 ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setUploadSlipModal({
                                                            id: item.type === 'trip' ? (item.tf?.id || item.rawId) : item.rawId,
                                                            type: item.type,
                                                            displayId: item.displayId,
                                                            customer: item.customer,
                                                            trip: item.trip,
                                                            amountInLkr: item.amountInLkr,
                                                            received_amount: item.amountInLkr,
                                                        })}
                                                        className="rounded-lg bg-[#0f1d45] hover:bg-black text-white px-3 py-1.5 text-xs font-bold shadow-sm active:scale-95 transition whitespace-nowrap"
                                                    >
                                                        Upload Slips
                                                    </button>
                                                ) : incompleteSlips.length > 0 ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setUploadSlipModal({
                                                            id: item.type === 'trip' ? (item.tf?.id || item.rawId) : item.rawId,
                                                            type: item.type,
                                                            displayId: item.displayId,
                                                            customer: item.customer,
                                                            trip: item.trip,
                                                            amountInLkr: item.amountInLkr,
                                                            received_amount: item.amountInLkr,
                                                        })}
                                                        className="rounded-lg bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 text-xs font-bold shadow-sm active:scale-95 transition whitespace-nowrap"
                                                    >
                                                        ⚠️ Re-upload
                                                    </button>
                                                ) : completedSlips.length === slips.length ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 whitespace-nowrap">
                                                        ✓ Slips Approved
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200 whitespace-nowrap">
                                                        ⏳ Awaiting Approval
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="flex items-center justify-between border-t border-gray-200 p-3 text-sm text-black">
                        <button
                            type="button"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="rounded border border-gray-300 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span>
                            Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
                        </span>
                        <button
                            type="button"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="rounded border border-gray-300 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function SettlementsTable({ trips, onSettle }) {
    const money = (v) => Number(v ?? 0).toLocaleString();

    const columns = [
        {
            name: 'Trip',
            selector: row => row.id,
            sortable: true,
            width: '90px',
            cell: row => <strong>#{row.id}</strong>,
        },
        {
            name: 'Customer',
            selector: row => row.customer?.name ?? '-',
            sortable: true,
        },
        {
            name: 'Agent',
            selector: row => row.agent?.user?.name ?? '-',
            sortable: true,
        },
        {
            name: 'Driver',
            selector: row => row.driver?.full_name ?? '-',
            sortable: true,
        },
        {
            name: 'Trip Amount',
            selector: row => {
                const tf = row.trip_finance;
                const originalCurrency = row.customer?.agent?.new_currency ?? row.customer?.agent?.currency ?? 'LKR';
                const originalAmount = Number(row.customer?.paid_amount ?? 0);
                return tf?.total_amount
                    ? Number(tf.total_amount)
                    : originalAmount;
            },
            sortable: true,
            right: true,
            cell: row => {
                const tf = row.trip_finance;
                const originalCurrency = row.customer?.agent?.new_currency ?? row.customer?.agent?.currency ?? 'LKR';
                const originalAmount = Number(row.customer?.paid_amount ?? 0);
                const amountInLkr = tf?.total_amount
                    ? Number(tf.total_amount)
                    : originalAmount;
                return (
                    <div className="text-right">
                        <div className="font-semibold text-black">LKR {amountInLkr.toLocaleString()}</div>
                        {originalCurrency !== 'LKR' && (
                            <span className="inline-flex items-center rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-black border border-blue-100 mt-1">
                                {originalCurrency} {originalAmount.toLocaleString()}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            name: 'Status',
            cell: row => (
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                    row.finance?.status === 'Settled'
                        ? 'bg-green-100 text-black'
                        : 'bg-yellow-100 text-black'
                }`}>
                    {row.finance?.status ?? 'Pending'}
                </span>
            ),
        },
        {
            name: 'Action',
            width: '120px',
            cell: row => (
                <button
                    onClick={() => onSettle(row)}
                    className={`px-3 py-1 rounded text-xs font-bold text-white ${
                        row.finance?.status === 'Settled'
                            ? 'bg-slate-700'
                            : 'bg-blue-700'
                    }`}
                >
                    {row.finance?.status === 'Settled' ? 'Edit' : 'Settle'}
                </button>
            ),
        },
    ];

    return <Table columns={columns} data={trips} empty="No tours found." />;
}

function PayoutsTab({ drivers, agents, outsourceVehicles = [] }) {
    const [payoutView, setPayoutView] = useState('standard'); // 'standard' | 'outsource'
    const [search, setSearch] = useState('');
    const [selectedOutsourceModal, setSelectedOutsourceModal] = useState(null);

    const allPeople = [
        ...drivers.map(d => ({ ...d, type: 'Driver', person_id: d.id, id: `Driver_${d.id}` })),
        ...agents.map(a => ({ ...a, type: 'Agent', person_id: a.id, id: `Agent_${a.id}` }))
    ];

    const filteredPeople = allPeople.filter(p =>
        (p.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
        p.type.toLowerCase().includes(search.toLowerCase())
    );

    const filteredOutsource = outsourceVehicles.filter(ov => {
        const q = search.toLowerCase();
        const vNum = (ov.vehicle_number || '').toLowerCase();
        const mNum = (ov.mobile_number || '').toLowerCase();
        const cName = (ov.customer?.name || '').toLowerCase();
        const bNum = (ov.agent?.booking_number || '').toLowerCase();
        const bType = (ov.agent?.booking_type || '').toLowerCase();
        const dropoff = (ov.customer?.dropoff_location || ov.agent?.dropoff_location || '').toLowerCase();
        const idStr = `ov-${ov.id} ${ov.id}`.toLowerCase();
        const creator = (ov.creator?.name || '').toLowerCase();
        return vNum.includes(q) || mNum.includes(q) || cName.includes(q) || bNum.includes(q) || bType.includes(q) || dropoff.includes(q) || idStr.includes(q) || creator.includes(q);
    });

    const totalOutsourcePrice = outsourceVehicles.reduce((sum, ov) => sum + Number(ov.price || 0), 0);
    const totalOutsourceAdvance = outsourceVehicles.reduce((sum, ov) => sum + Number(ov.advance_payment || 0), 0);
    const totalOutsourceBalance = totalOutsourcePrice - totalOutsourceAdvance;

    const [inputs, setInputs] = useState({});

    const handleInputChange = (type, id, field, value) => {
        const key = `${type}_${id}`;
        setInputs(prev => ({
            ...prev,
            [key]: {
                ...prev[key] || {},
                [field]: value
            }
        }));
    };

    const submitPayout = (type, id) => {
        const key = `${type}_${id}`;
        const data = inputs[key];
        if (!data || !data.amount) return;

        router.post('/finance/payouts/store', {
            person_type: type,
            [`${type.toLowerCase()}_id`]: id,
            amount: data.amount,
            currency: 'LKR',
            remarks: data.remarks || '',
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setInputs(prev => {
                    const newInputs = { ...prev };
                    delete newInputs[key];
                    return newInputs;
                });
                toast.success('Payout recorded successfully');
            }
        });
    };

    const money = (v) => Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const columns = [
        {
            name: 'Type',
            selector: row => row.type,
            sortable: true,
            width: '100px',
        },
        {
            name: 'Name',
            selector: row => row.name ?? '-',
            sortable: true,
            cell: row => <strong>{`${row.first_name ?? ''} ${row.last_name ?? ''}`.trim() || row.name || '-'}</strong>,
        },
        {
            name: 'Trip Shares',
            selector: row => Number(row.share_total ?? 0),
            sortable: true,
            right: true,
            cell: row => money(row.share_total),
        },
        {
            name: 'Incentives',
            selector: row => Number(row.incentive_total ?? 0),
            sortable: true,
            right: true,
            cell: row => money(row.incentive_total),
        },
        {
            name: 'Earned (Total)',
            selector: row => Number(row.grand_total ?? 0),
            sortable: true,
            right: true,
            cell: row => <strong>{money(row.grand_total)}</strong>,
        },
        {
            name: 'Paid',
            selector: row => Number(row.total_paid ?? 0),
            sortable: true,
            right: true,
            cell: row => money(row.total_paid),
        },
        {
            name: 'Balance',
            selector: row => Number(row.balance ?? 0),
            sortable: true,
            right: true,
            cell: row => (
                <span className={`font-bold ${row.balance > 0 ? 'text-black' : 'text-black'}`}>
                    {money(row.balance)}
                </span>
            ),
        },
        {
            name: 'Amount (LKR)',
            width: '150px',
            cell: row => (
                <input
                    type="number"
                    step="0.01"
                    className="border border-gray-300 rounded px-2 py-1 w-full text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="0.00"
                    value={inputs[`${row.type}_${row.person_id}`]?.amount || ''}
                    onChange={(e) => handleInputChange(row.type, row.person_id, 'amount', e.target.value)}
                />
            )
        },
        {
            name: 'Remarks',
            width: '200px',
            cell: row => (
                <input
                    type="text"
                    className="border border-gray-300 rounded px-2 py-1 w-full text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Optional remarks"
                    value={inputs[`${row.type}_${row.person_id}`]?.remarks || ''}
                    onChange={(e) => handleInputChange(row.type, row.person_id, 'remarks', e.target.value)}
                />
            )
        },
        {
            name: 'Action',
            width: '100px',
            cell: row => (
                <button
                    onClick={() => submitPayout(row.type, row.person_id)}
                    className="bg-purple-600 text-white px-3 py-1.5 rounded hover:bg-purple-700 font-bold text-xs w-full disabled:opacity-50 transition-colors"
                    disabled={!inputs[`${row.type}_${row.person_id}`]?.amount}
                >
                    Pay
                </button>
            )
        }
    ];

    const outsourceColumns = [
        {
            name: 'Ref #',
            selector: row => row.id,
            sortable: true,
            width: '85px',
            cell: row => (
                <span className="font-mono font-bold text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                    OV-{row.id}
                </span>
            ),
        },
        {
            name: 'Vehicle Number',
            selector: row => row.vehicle_number,
            sortable: true,
            width: '140px',
            cell: row => (
                <span className="font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded text-xs tracking-wider uppercase inline-block">
                    {row.vehicle_number}
                </span>
            ),
        },
        {
            name: 'Driver Mobile',
            selector: row => row.mobile_number ?? '-',
            sortable: true,
            width: '130px',
            cell: row => (
                <span className="text-xs font-semibold text-gray-800">
                    {row.mobile_number || '-'}
                </span>
            ),
        },
        {
            name: 'Customer & Route',
            selector: row => row.customer?.name ?? '-',
            sortable: true,
            cell: row => (
                <div className="py-1">
                    <div className="font-semibold text-gray-900 text-xs">
                        {row.customer?.name || 'Walk-in Customer'}
                    </div>
                    {(row.customer?.dropoff_location || row.agent?.dropoff_location) && (
                        <div className="text-[11px] text-gray-500 truncate max-w-xs mt-0.5" title={row.customer?.dropoff_location || row.agent?.dropoff_location}>
                            📍 {row.customer?.dropoff_location || row.agent?.dropoff_location}
                        </div>
                    )}
                </div>
            ),
        },
        {
            name: 'Booking',
            selector: row => row.agent?.booking_type ?? 'Outsource',
            sortable: true,
            width: '120px',
            cell: row => (
                <div>
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-800">
                        {row.agent?.booking_type || 'Outsource Trip'}
                    </span>
                    {/* {row.agent?.booking_number && (
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                            {row.agent.booking_number}
                        </div>
                    )} */}
                </div>
            ),
        },
        {
            name: 'Agreed Price',
            selector: row => Number(row.price ?? 0),
            sortable: true,
            right: true,
            width: '125px',
            cell: row => <strong className="text-gray-900 text-xs">LKR {money(row.price)}</strong>,
        },
        {
            name: 'Advance Paid',
            selector: row => Number(row.advance_payment ?? 0),
            sortable: true,
            right: true,
            width: '125px',
            cell: row => <span className="font-semibold text-emerald-700 text-xs">LKR {money(row.advance_payment)}</span>,
        },
        {
            name: 'Balance Due',
            selector: row => Number(row.price ?? 0) - Number(row.advance_payment ?? 0),
            sortable: true,
            right: true,
            width: '125px',
            cell: row => {
                const bal = Number(row.price ?? 0) - Number(row.advance_payment ?? 0);
                return (
                    <span className={`font-bold text-xs ${bal > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                        LKR {money(bal)}
                    </span>
                );
            },
        },
        {
            name: 'Assigned By / Date',
            selector: row => row.created_at,
            sortable: true,
            width: '140px',
            cell: row => (
                <div className="text-xs py-1">
                    <div className="font-semibold text-gray-800">{row.creator?.name || 'Staff'}</div>
                    <div className="text-gray-400 text-[11px]">{row.created_at ? new Date(row.created_at).toLocaleDateString() : '-'}</div>
                </div>
            ),
        },
        {
            name: 'Actions',
            width: '150px',
            cell: row => (
                <div className="flex items-center gap-1.5">
                    <a
                        href={`/trips/outsource/${row.id}/invoice`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-slate-700 hover:bg-slate-800 rounded transition-colors shadow-sm"
                        title="View / Download Invoice"
                    >
                        <FileText size={12} />
                        <span>Invoice</span>
                    </a>
                    <button
                        type="button"
                        onClick={() => setSelectedOutsourceModal(row)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded border border-gray-200 transition-colors"
                        title="View All Details"
                    >
                        <Eye size={12} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-5">
            {/* View Switcher Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => { setPayoutView('standard'); setSearch(''); }}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
                            payoutView === 'standard'
                                ? 'bg-blue-700 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <Users size={16} />
                        <span>Driver & Agent Payouts</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => { setPayoutView('outsource'); setSearch(''); }}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
                            payoutView === 'outsource'
                                ? 'bg-blue-700 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <CarFront size={16} />
                        <span>Outsource Vehicles</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            payoutView === 'outsource'
                                ? 'bg-white text-blue-700'
                                : 'bg-gray-200 text-gray-700'
                        }`}>
                            {outsourceVehicles.length}
                        </span>
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input
                            type="text"
                            className="w-64 pl-3 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            placeholder={payoutView === 'standard' ? "Search by name or type…" : "Search vehicle, customer, route…"}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    {search && (
                        <button onClick={() => setSearch('')} className="text-xs text-gray-500 hover:text-black">
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {payoutView === 'standard' ? (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <Table columns={columns} data={filteredPeople} empty="No matching records found." />
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Summary cards for Outsource Vehicles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 shadow-sm">
                            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Outsource Trips</div>
                            <div className="text-2xl font-bold text-slate-800 mt-1">{outsourceVehicles.length}</div>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 shadow-sm">
                            <div className="text-xs font-medium text-blue-600 uppercase tracking-wider">Total Contract Price</div>
                            <div className="text-2xl font-bold text-blue-900 mt-1">LKR {money(totalOutsourcePrice)}</div>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 shadow-sm">
                            <div className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Total Advance Paid</div>
                            <div className="text-2xl font-bold text-emerald-900 mt-1">LKR {money(totalOutsourceAdvance)}</div>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 shadow-sm">
                            <div className="text-xs font-medium text-amber-600 uppercase tracking-wider">Remaining Balance Due</div>
                            <div className="text-2xl font-bold text-amber-900 mt-1">LKR {money(totalOutsourceBalance)}</div>
                        </div>
                    </div>

                    {/* Outsource Vehicles Table */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                        <Table columns={outsourceColumns} data={filteredOutsource} empty="No outsource vehicles found." />
                    </div>
                </div>
            )}

            {/* Outsource Vehicle Detail Modal */}
            {selectedOutsourceModal && (
                <OutsourceVehicleModal
                    vehicle={selectedOutsourceModal}
                    onClose={() => setSelectedOutsourceModal(null)}
                />
            )}
        </div>
    );
}

function OutsourceVehicleModal({ vehicle, onClose }) {
    if (!vehicle) return null;
    const money = (v) => Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const balance = Number(vehicle.price ?? 0) - Number(vehicle.advance_payment ?? 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in duration-150">
                <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2.5 py-1 bg-blue-100 text-blue-800 rounded">
                            OV-{vehicle.id}
                        </span>
                        <h3 className="text-base font-bold text-gray-900">
                            Outsource Vehicle Details
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                    {/* Vehicle & Contact */}
                    <div>
                        <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">Vehicle & Contact</h4>
                        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3.5 rounded-lg border border-gray-200">
                            <div>
                                <span className="text-xs text-gray-500 block">Vehicle Number</span>
                                <div className="text-base font-extrabold text-blue-900 mt-0.5">{vehicle.vehicle_number}</div>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 block">Driver Mobile</span>
                                <div className="text-sm font-semibold text-gray-800 mt-0.5">{vehicle.mobile_number || 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Financial Breakdown */}
                    <div>
                        <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">Financial Breakdown</h4>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <span className="text-xs font-medium text-blue-600 block">Total Agreed Price</span>
                                <div className="text-base font-bold text-blue-900 mt-1">LKR {money(vehicle.price)}</div>
                            </div>
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                                <span className="text-xs font-medium text-emerald-600 block">Advance Paid</span>
                                <div className="text-base font-bold text-emerald-900 mt-1">LKR {money(vehicle.advance_payment)}</div>
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <span className="text-xs font-medium text-amber-600 block">Balance Due</span>
                                <div className="text-base font-bold text-amber-900 mt-1">LKR {money(balance)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Customer & Route Details */}
                    <div>
                        <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">Customer & Trip Details</h4>
                        <div className="space-y-2 text-sm bg-gray-50 p-3.5 rounded-lg border border-gray-200">
                            <div className="flex justify-between border-b border-gray-200 pb-2">
                                <span className="text-gray-500 text-xs">Customer Name:</span>
                                <span className="font-semibold text-gray-900 text-xs">{vehicle.customer?.name || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-200 pb-2">
                                <span className="text-gray-500 text-xs">Customer Mobile:</span>
                                <span className="font-semibold text-gray-800 text-xs">{vehicle.customer?.mobile_number || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-200 pb-2">
                                <span className="text-gray-500 text-xs">Booking Type / Number:</span>
                                <span className="font-semibold text-gray-800 text-xs">{vehicle.agent?.booking_type || 'N/A'} ({vehicle.agent?.booking_number || 'N/A'})</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-200 pb-2">
                                <span className="text-gray-500 text-xs">Dropoff / Route:</span>
                                <span className="font-semibold text-gray-800 text-xs text-right max-w-xs">{vehicle.customer?.dropoff_location || vehicle.agent?.dropoff_location || 'N/A'}</span>
                            </div>
                            {vehicle.customer?.paid_amount && (
                                <div className="flex justify-between pt-0.5">
                                    <span className="text-gray-500 text-xs">Customer Billed Amount:</span>
                                    <span className="font-bold text-gray-900 text-xs">LKR {money(vehicle.customer.paid_amount)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Metadata & Audit */}
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 border-t border-gray-100 pt-3">
                        <div>
                            <span className="block font-medium">Assigned By:</span>
                            <span className="text-gray-700">{vehicle.creator?.name || 'Counter Staff'}</span>
                        </div>
                        <div>
                            <span className="block font-medium">Assigned At:</span>
                            <span className="text-gray-700">{vehicle.created_at ? new Date(vehicle.created_at).toLocaleString() : 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                    <a
                        href={`/trips/outsource/${vehicle.id}/invoice`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-700 hover:bg-slate-800 rounded transition-colors"
                    >
                        <FileText size={14} />
                        <span>View Driver Invoice</span>
                    </a>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

function IncentivesTab({ drivers, incentives }) {
    const [search, setSearch] = useState('');
    const filteredDrivers = (drivers || []).filter(d => {
        const fullName = `${d.first_name ?? ''} ${d.last_name ?? ''}`.trim().toLowerCase();
        return fullName.includes(search.toLowerCase());
    });

    const [inputs, setInputs] = useState({});

    const totals = useMemo(() => {
        const t = {};
        (incentives || []).forEach(inc => {
            if (inc.person_type === 'Driver' && inc.driver_id) {
                t[inc.driver_id] = (t[inc.driver_id] || 0) + Number(inc.amount || 0);
            }
        });
        return t;
    }, [incentives]);

    const handleInputChange = (id, field, value) => {
        setInputs(prev => ({
            ...prev,
            [id]: {
                ...prev[id] || {},
                [field]: value
            }
        }));
    };

    const submitIncentive = (driverId) => {
        const data = inputs[driverId];
        if (!data || !data.amount) {
            return;
        }

        router.post('/finance/incentives/store', {
            person_type: 'Driver',
            driver_id: driverId,
            amount: data.amount,
            currency: 'LKR',
            remarks: data.remarks || '',
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setInputs(prev => {
                    const newInputs = { ...prev };
                    delete newInputs[driverId];
                    return newInputs;
                });
            },
        });
    };

    const columns = [
        {
            name: 'Driver Name',
            selector: row => `${row.first_name ?? ''} ${row.last_name ?? ''}`.trim(),
            sortable: true,
            cell: row => <strong>{`${row.first_name ?? ''} ${row.last_name ?? ''}`.trim()}</strong>
        },
        {
            name: 'Reg. Number',
            selector: row => row.registration_number ?? '-',
            sortable: true,
        },
        {
            name: 'Total Added (LKR)',
            width: '150px',
            selector: row => totals[row.id] || 0,
            sortable: true,
            right: true,
            cell: row => (
                <span className="font-semibold text-black">
                    {Number(totals[row.id] || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
            )
        },
        {
            name: 'Amount (LKR)',
            width: '180px',
            cell: row => (
                <input
                    type="number"
                    step="0.01"
                    className="border border-gray-300 rounded px-2 py-1 w-full text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="0.00"
                    value={inputs[row.id]?.amount || ''}
                    onChange={(e) => handleInputChange(row.id, 'amount', e.target.value)}
                />
            )
        },
        {
            name: 'Remarks',
            width: '200px',
            cell: row => (
                <input
                    type="text"
                    className="border border-gray-300 rounded px-2 py-1 w-full text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Optional remarks"
                    value={inputs[row.id]?.remarks || ''}
                    onChange={(e) => handleInputChange(row.id, 'remarks', e.target.value)}
                />
            )
        },
        {
            name: 'Action',
            width: '180px',
            cell: row => (
                <div className="flex gap-2 w-full">
                    <button
                        onClick={() => submitIncentive(row.id)}
                        className="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 font-bold text-xs flex-1 disabled:opacity-50 transition-colors"
                        disabled={!inputs[row.id]?.amount}
                    >
                        Add
                    </button>
                    {totals[row.id] > 0 && (
                        <button
                            onClick={() => setSelectedDriverForHistory(row)}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 font-bold text-xs flex-1 transition-colors"
                        >
                            History
                        </button>
                    )}
                </div>
            )
        }
    ];

    const [selectedDriverForHistory, setSelectedDriverForHistory] = useState(null);

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-end gap-2 mb-3">
                <div className="relative flex-1 max-w-xs">
                    <input
                        type="text"
                        className="w-full pl-3 pr-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none justify-end"
                        placeholder="Search by driver name…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                {search && (
                    <button onClick={() => setSearch('')} className="text-xs text-black hover:text-black">
                        Clear
                    </button>
                )}
            </div>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <Table columns={columns} data={filteredDrivers} empty="No matching drivers found." />
            </div>

            {selectedDriverForHistory && (
                <IncentiveHistoryModal 
                    driver={selectedDriverForHistory} 
                    incentives={(incentives || []).filter(i => i.person_type === 'Driver' && i.driver_id === selectedDriverForHistory.id)}
                    onClose={() => setSelectedDriverForHistory(null)} 
                />
            )}
        </div>
    );
}

function IncentiveHistoryModal({ driver, incentives, onClose }) {
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ amount: '', remarks: '' });

    const handleEdit = (inc) => {
        setEditingId(inc.id);
        setEditForm({ amount: inc.amount, remarks: inc.remarks || '' });
    };

    const handleSave = (id) => {
        if (!editForm.amount) return;
        
        router.put(`/finance/incentives/${id}`, editForm, {
            preserveScroll: true,
            onSuccess: () => setEditingId(null)
        });
    };

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this incentive?")) {
            router.delete(`/finance/incentives/${id}`, {
                preserveScroll: true
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center border-b px-6 py-4 bg-gray-50">
                    <h2 className="text-lg font-bold">
                        Incentive History - {driver.full_name}
                    </h2>
                    <button type="button" onClick={onClose} className="text-black hover:text-black font-bold text-xl">
                        ✕
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {incentives.length === 0 ? (
                        <p className="text-black text-center py-4">No incentives found for this driver.</p>
                    ) : (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold text-black">Date</th>
                                        <th className="px-4 py-3 font-semibold text-black">Amount (LKR)</th>
                                        <th className="px-4 py-3 font-semibold text-black">Remarks</th>
                                        <th className="px-4 py-3 font-semibold text-black text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {incentives.map(inc => (
                                        <tr key={inc.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-black">
                                                {new Date(inc.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 font-medium">
                                                {editingId === inc.id ? (
                                                    <input 
                                                        type="number" 
                                                        step="0.01"
                                                        className="border border-gray-300 rounded px-2 py-1 w-24 text-sm"
                                                        value={editForm.amount}
                                                        onChange={e => setEditForm(prev => ({...prev, amount: e.target.value}))}
                                                    />
                                                ) : (
                                                    Number(inc.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-black">
                                                {editingId === inc.id ? (
                                                    <input 
                                                        type="text" 
                                                        className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                                                        value={editForm.remarks}
                                                        onChange={e => setEditForm(prev => ({...prev, remarks: e.target.value}))}
                                                    />
                                                ) : (
                                                    inc.remarks || '-'
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {editingId === inc.id ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => setEditingId(null)} className="text-black hover:text-black font-semibold text-xs">Cancel</button>
                                                        <button onClick={() => handleSave(inc.id)} className="text-black hover:text-black font-semibold text-xs">Save</button>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-end gap-3">
                                                        <button onClick={() => handleEdit(inc)} className="text-black hover:text-black font-semibold text-xs">Edit</button>
                                                        <button onClick={() => handleDelete(inc.id)} className="text-black hover:text-black font-semibold text-xs">Delete</button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function EmptyState({ title, description }) {
    return (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <h2 className="text-lg font-semibold text-black">{title}</h2>
            <p className="mt-2 text-sm text-black">{description}</p>
        </div>
    );
}

function MainTabCard({ active, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                active
                    ? 'border-blue-700 bg-blue-700 text-white shadow'
                    : 'border-gray-200 bg-white text-black hover:border-blue-300 hover:text-black'
            }`}
        >
            {children}
        </button>
    );
}

function SubTab({ active, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                active
                    ? 'bg-blue-700 text-white'
                    : 'bg-gray-100 text-black hover:bg-gray-200'
            }`}
        >
            {children}
        </button>
    );
}

function SettlementModal({ trip, onClose }) {
    const amount = Number(trip.customer?.paid_amount ?? 0);
    const currency = trip.customer?.agent?.new_currency ?? trip.customer?.agent?.currency ?? 'LKR';

    const form = useForm({
        driver_amount: trip.finance?.driver_amount ?? '',
        agent_amount: trip.finance?.agent_amount ?? '',
        company_amount: trip.finance?.company_amount ?? '',
        expense_amount: trip.finance?.expense_amount ?? 0,
        remarks: trip.finance?.remarks ?? '',
    });

    const total =
        Number(form.data.driver_amount || 0) +
        Number(form.data.agent_amount || 0) +
        Number(form.data.company_amount || 0) +
        Number(form.data.expense_amount || 0);

    const submit = (e) => {
        e.preventDefault();

        if (Number(total.toFixed(2)) !== Number(amount.toFixed(2))) {
            alert('Total must equal trip amount.');
            return;
        }

        form.post(`/finance/${trip.id}`, {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center border-b px-4 py-3">
                    <h2 className="text-lg font-bold">
                        {trip.finance ? 'Edit' : 'Settle'} Trip #{trip.id}
                    </h2>

                    <button type="button" onClick={onClose} className="text-black font-bold">
                        ✕
                    </button>
                </div>

                <form onSubmit={submit} className="p-4 space-y-3">
                    <div className="bg-gray-50 p-3 rounded text-sm">
                        <strong>Trip Amount:</strong> {currency} {amount.toLocaleString()}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Input label="Driver" value={form.data.driver_amount} onChange={(e) => form.setData('driver_amount', e.target.value)} />
                        <Input label="Agent" value={form.data.agent_amount} onChange={(e) => form.setData('agent_amount', e.target.value)} />
                        <Input label="Company" value={form.data.company_amount} onChange={(e) => form.setData('company_amount', e.target.value)} />
                        <Input label="Expenses" value={form.data.expense_amount} onChange={(e) => form.setData('expense_amount', e.target.value)} />
                    </div>

                    <Input label="Remarks" value={form.data.remarks} onChange={(e) => form.setData('remarks', e.target.value)} />

                    <div className={`p-2 rounded text-sm font-bold ${
                        total === amount ? 'bg-green-100 text-black' : 'bg-red-100 text-black'
                    }`}>
                        Total : {currency} {total.toLocaleString()} / {currency} {amount.toLocaleString()}
                    </div>

                    <button disabled={form.processing} className="w-full bg-green-700 text-white py-2 rounded font-bold">
                        Save Settlement
                    </button>
                </form>
            </div>
        </div>
    );
}

function Table({ columns, data, empty }) {
    return (
        <DataTable
            columns={columns}
            data={data}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 25, 50, 100]}
            highlightOnHover
            striped
            responsive
            persistTableHead
            customStyles={{
                headCells: {
                    style: {
                        fontWeight: 700,
                        backgroundColor: '#f3f4f6',
                        color: '#111827',
                        fontSize: '13px',
                    },
                },
                rows: {
                    style: {
                        minHeight: '56px',
                    },
                },
            }}
            noDataComponent={<div className="p-6 text-black">{empty}</div>}
        />
    );
}

function Tab({ active, children, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-4 py-2 rounded text-sm font-bold ${
                active
                    ? 'bg-blue-700 text-white'
                    : 'bg-gray-100 text-black'
            }`}
        >
            {children}
        </button>
    );
}

function Input({ label, value, onChange }) {
    return (
        <div>
            <label className="label text-xs">{label}</label>
            <input
                type="text"
                value={value ?? ''}
                onChange={onChange}
                className="input text-sm"
            />
        </div>
    );
}

function Select({ label, value, onChange, options }) {
    return (
        <div>
            <label className="label text-xs">{label}</label>
            <select value={value} onChange={onChange} className="input text-sm">
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
}

function DriversTable({ drivers }) {
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [search, setSearch] = useState('');

    const handleStatusChange = (id, newStatus) => {
        if (confirm(`Are you sure you want to change the driver status to ${newStatus}?`)) {
            router.post(`/finance/drivers/${id}/status`, {
                driver_status: newStatus
            }, {
                preserveScroll: true,
            });
        }
    };

    const filteredDrivers = drivers.filter(driver => {
        const query = search.toLowerCase();
        const fullName = `${driver.first_name ?? ''} ${driver.last_name ?? ''}`.trim().toLowerCase();
        return (
            fullName.includes(query) ||
            (driver.registration_number?.toLowerCase().includes(query) ?? false)
        );
    });

    const columns = [
        {
            name: 'Reg. Number',
            selector: row => row.registration_number ?? '-',
            sortable: true,
        },
        {
            name: 'Driver Name',
            selector: row => `${row.first_name ?? ''} ${row.last_name ?? ''}`.trim(),
            sortable: true,
            cell: row => <strong>{`${row.first_name ?? ''} ${row.last_name ?? ''}`.trim()}</strong>,
        },
        {
            name: 'Amount',
            selector: row => Number(row.amount ?? 0),
            sortable: true,
            right: true,
            cell: row => row.amount !== null ? `LKR ${Number(row.amount).toLocaleString()}` : '-',
        },
        {
            name: 'Due Date',
            selector: row => row.due_date ?? '-',
            sortable: true,
            cell: row => row.due_date ?? '-',
        },
        {
            name: 'Payment Received',
            selector: row => row.payment_received,
            sortable: true,
            cell: row => (
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                    row.payment_received
                        ? 'bg-green-100 text-black'
                        : 'bg-red-100 text-black'
                }`}>
                    {row.payment_received ? 'Received' : 'Pending'}
                </span>
            ),
        },
        {
            name: 'Payment Method',
            selector: row => row.payment_method ?? '-',
            sortable: true,
        },
        {
            name: 'Attachment',
            cell: row => row.payment_attachment ? (
                <a
                    href={`/storage/${row.payment_attachment}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-black hover:text-black underline font-semibold text-xs"
                >
                    View
                </a>
            ) : (
                <span className="text-black text-xs">No file</span>
            ),
        },
        {
            name: 'Driver Status',
            width: '180px',
            cell: row => {
                return (
                    <select
                        value={row.driver_status ?? 'Inactive'}
                        onChange={(e) => handleStatusChange(row.id, e.target.value)}
                        className={`border rounded px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer ${
                            row.driver_status === 'Active' ? 'border-green-300 bg-green-50 text-black font-bold' :
                            row.driver_status === 'Suspended' ? 'border-red-300 bg-red-50 text-black font-bold' :
                            'border-gray-300 bg-gray-50 text-black font-bold'
                        }`}
                    >
                        <option value="Active">Active</option>
                        <option value="Suspended">Suspended</option>
                    </select>
                );
            },
        },
        {
            name: 'Action',
            width: '120px',
            cell: row => (
                <button
                    onClick={() => setSelectedDriver(row)}
                    className="px-3 py-1 rounded text-xs font-bold text-white bg-blue-700 hover:bg-blue-855"
                >
                    Edit Payment
                </button>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-end p-2">
                <input
                    type="text"
                    placeholder="Search by name or registration number..."
                    className="border rounded px-3 py-2 text-sm w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <Table columns={columns} data={filteredDrivers} empty="No drivers found." />
            {selectedDriver && (
                <DriverPaymentModal
                    driver={selectedDriver}
                    onClose={() => setSelectedDriver(null)}
                />
            )}
        </div>
    );
}

function DriverPaymentModal({ driver, onClose }) {
    const todayStr = new Date().toLocaleDateString('en-CA');

    const form = useForm({
        amount: driver.amount ?? '',
        due_date: driver.due_date ?? '',
        payment_received: driver.payment_received ? true : false,
        payment_method: driver.payment_method ?? '',
        payment_attachment: null,
    });

    const submit = (e) => {
        e.preventDefault();

        form.post(`/finance/drivers/${driver.id}/payment`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center border-b px-4 py-3">
                    <h2 className="text-lg font-bold">
                        Edit Payment Info - {driver.full_name}
                    </h2>

                    <button type="button" onClick={onClose} className="text-black font-bold">
                        ✕
                    </button>
                </div>

                <form onSubmit={submit} className="p-4 space-y-4">
                    {/* Amount */}
                    <div>
                        <label className="block text-xs font-medium mb-1">
                            Amount (LKR)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="w-full border rounded px-3 py-2 text-sm"
                            value={form.data.amount}
                            onChange={(e) => form.setData('amount', e.target.value)}
                        />
                    </div>

                    {/* Due Date */}
                    <div>
                        <label className="block text-xs font-medium mb-1">
                            Due Date
                        </label>
                        <input
                            type="date"
                            min={todayStr}
                            className="w-full border rounded px-3 py-2 text-sm"
                            value={form.data.due_date}
                            onChange={(e) => form.setData('due_date', e.target.value)}
                        />
                    </div>

                    {/* Payment Received Status */}
                    <div className="flex items-center gap-2 py-1">
                        <input
                            type="checkbox"
                            id="payment_received"
                            className="rounded text-black focus:ring-blue-700 h-4 w-4"
                            checked={form.data.payment_received}
                            onChange={(e) => form.setData('payment_received', e.target.checked)}
                        />
                        <label htmlFor="payment_received" className="text-sm font-medium select-none cursor-pointer">
                            Payment Received
                        </label>
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="block text-xs font-medium mb-1">
                            Payment Method
                        </label>
                        <select
                            className="w-full border rounded px-3 py-2 text-sm"
                            value={form.data.payment_method}
                            onChange={(e) => form.setData('payment_method', e.target.value)}
                        >
                            <option value="">Select Method</option>
                            <option value="Cash">Cash</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Payment Attachment */}
                    <div>
                        <label className="block text-xs font-medium mb-1">
                            Payment Attachment
                        </label>
                        {driver.payment_attachment && (
                            <div className="mb-2 text-xs">
                                Current attachment:{' '}
                                <a
                                    href={`/storage/${driver.payment_attachment}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-black underline font-semibold"
                                >
                                    View File
                                </a>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*,.pdf"
                            className="w-full border rounded px-2 py-1 text-sm bg-gray-50"
                            onChange={(e) => form.setData('payment_attachment', e.target.files[0])}
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-1/2 bg-gray-100 hover:bg-gray-200 text-black py-2 rounded font-bold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="w-1/2 bg-green-700 hover:bg-green-800 text-white py-2 rounded font-bold transition-colors"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ExpensesPanel({ expenses = [] }) {
    const [editingExpense, setEditingExpense] = useState(null);

    const form = useForm({
        title: '',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0],
        remarks: '',
    });

    const submit = (e) => {
        e.preventDefault();

        if (editingExpense) {
            form.put(`/finance/expenses/${editingExpense.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    form.reset();
                    setEditingExpense(null);
                    toast.success('Expense updated successfully');
                },
                onError: () => {
                    toast.error('Failed to update expense');
                }
            });
        } else {
            form.post('/finance/expenses', {
                preserveScroll: true,
                onSuccess: () => {
                    form.reset();
                    toast.success('Expense added successfully');
                },
                onError: () => {
                    toast.error('Failed to add expense');
                }
            });
        }
    };

    const handleEdit = (expense) => {
        setEditingExpense(expense);
        form.setData({
            title: expense.title,
            amount: expense.amount,
            expense_date: expense.expense_date ? expense.expense_date.split('T')[0] : new Date().toISOString().split('T')[0],
            remarks: expense.remarks ?? '',
        });
    };

    const handleCancelEdit = () => {
        setEditingExpense(null);
        form.reset();
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this expense?')) {
            router.delete(`/finance/expenses/${id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Expense deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete expense');
                }
            });
        }
    };

    const columns = [
        {
            name: 'Date',
            selector: row => row.expense_date ? row.expense_date.split('T')[0] : '-',
            sortable: true,
            width: '120px',
        },
        {
            name: 'Title',
            selector: row => row.title,
            sortable: true,
            cell: row => (
                <div>
                    <div className="font-semibold text-black">{row.title}</div>
                    {row.remarks && <div className="text-xs text-black truncate max-w-[250px]">{row.remarks}</div>}
                </div>
            )
        },
        {
            name: 'Amount',
            selector: row => Number(row.amount ?? 0),
            sortable: true,
            right: true,
            width: '140px',
            cell: row => <span className="font-bold text-black">LKR {Number(row.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>,
        },
        {
            name: 'Created By',
            selector: row => row.creator?.name ?? '-',
            sortable: true,
            width: '140px',
        },
        {
            name: 'Actions',
            width: '150px',
            cell: row => (
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => handleEdit(row)}
                        className="px-2 py-1 rounded bg-blue-50 text-black hover:bg-blue-100 font-medium text-xs border border-blue-200"
                    >
                        Edit
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDelete(row.id)}
                        className="px-2 py-1 rounded bg-red-50 text-black hover:bg-red-100 font-medium text-xs border border-red-200"
                    >
                        Delete
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form column */}
                <div className="bg-white border rounded-xl shadow-sm p-5 space-y-4 h-fit">
                    <h3 className="font-bold text-lg text-black">
                        {editingExpense ? '✏️ Edit Expense' : '➕ Add Expense'}
                    </h3>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-black uppercase mb-1">Title</label>
                            <input
                                type="text"
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={form.data.title}
                                onChange={(e) => form.setData('title', e.target.value)}
                                placeholder="e.g. Office rent, Fuel reimbursement"
                                required
                            />
                            {form.errors.title && <p className="text-black text-xs mt-1">{form.errors.title}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-black uppercase mb-1">Amount (LKR)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={form.data.amount}
                                onChange={(e) => form.setData('amount', e.target.value)}
                                placeholder="0.00"
                                required
                            />
                            {form.errors.amount && <p className="text-black text-xs mt-1">{form.errors.amount}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-black uppercase mb-1">Expense Date</label>
                            <input
                                type="date"
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={form.data.expense_date}
                                onChange={(e) => form.setData('expense_date', e.target.value)}
                                required
                            />
                            {form.errors.expense_date && <p className="text-black text-xs mt-1">{form.errors.expense_date}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-black uppercase mb-1">Remarks</label>
                            <textarea
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="3"
                                value={form.data.remarks}
                                onChange={(e) => form.setData('remarks', e.target.value)}
                                placeholder="Additional details..."
                            />
                            {form.errors.remarks && <p className="text-black text-xs mt-1">{form.errors.remarks}</p>}
                        </div>

                        <div className="flex gap-2 justify-end pt-2">
                            {editingExpense && (
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="px-4 py-2 border rounded-lg text-sm text-black hover:bg-gray-50 font-medium"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={form.processing}
                                className={`px-4 py-2 rounded-lg text-sm text-white font-medium ${editingExpense ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-700 hover:bg-blue-800'} disabled:opacity-50`}
                            >
                                {form.processing ? 'Saving...' : editingExpense ? 'Update Expense' : 'Add Expense'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Table column */}
                <div className="lg:col-span-2 bg-white border rounded-xl shadow-sm p-5 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg text-black">Expense List</h3>
                        <span className="bg-blue-50 text-black text-xs font-bold px-2.5 py-1 rounded-full border border-blue-100">
                            Total: LKR {expenses.reduce((sum, exp) => sum + Number(exp.amount), 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </span>
                    </div>

                    <Table columns={columns} data={expenses} empty="No expenses found. Use the form to add one." />
                </div>
            </div>
        </div>
    );
}

function ReportsPanel({ trips, expenses, rateSetting, range, customStart, customEnd, eurRates }) {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    const filterByDate = (dateString) => {
        const itemDate = dateString ? new Date(dateString) : null;
        if (!itemDate || Number.isNaN(itemDate.getTime())) return false;

        if (range === 'today') return itemDate >= startOfToday && itemDate <= endOfToday;
        if (range === 'week') return itemDate >= startOfWeek && itemDate <= endOfWeek;
        if (range === 'month') return itemDate >= startOfMonth && itemDate <= endOfMonth;
        if (range === 'custom') {
            if (!customStart) return false;
            const from = new Date(customStart);
            from.setHours(0, 0, 0, 0);
            const to = customEnd ? new Date(customEnd) : new Date(customStart);
            to.setHours(23, 59, 59, 999);
            return itemDate >= from && itemDate <= to;
        }
        return false;
    };

    const filteredTrips = trips.filter(t => filterByDate(t.trip_assigned_at));
    const filteredExpenses = expenses.filter(e => filterByDate(e.expense_date));

    let grossRevenue = 0;
    let driverPayouts = 0;
    let agentPayouts = 0;

    const defaultAgentRate = Number(rateSetting?.agent_rate ?? 0);
    const defaultDriverRate = Number(rateSetting?.driver_rate ?? 0);

    filteredTrips.forEach(trip => {
        const tf = trip.trip_finance;
        const originalCurrency = trip.customer?.agent?.new_currency ?? trip.customer?.agent?.currency ?? 'LKR';
        const originalAmount = Number(trip.customer?.paid_amount ?? 0);
        const amountLkr = tf?.total_amount
            ? Number(tf.total_amount)
            : Math.round(getAmountInLkr(originalAmount, originalCurrency, eurRates));

        grossRevenue += amountLkr;

        if (tf && (Number(tf.driver_share) > 0 || Number(tf.agent_share) > 0)) {
            driverPayouts += Number(tf.driver_share ?? 0);
            agentPayouts += Number(tf.agent_share ?? 0);
        } else {
            driverPayouts += Math.round(amountLkr * defaultDriverRate / 100);
            agentPayouts += Math.round(amountLkr * defaultAgentRate / 100);
        }
    });

    const netRevenue = grossRevenue - driverPayouts - agentPayouts;

    let totalExpenses = 0;
    filteredExpenses.forEach(exp => {
        totalExpenses += Number(exp.amount ?? 0);
    });

    const netProfit = netRevenue - totalExpenses;

    const formatCurrency = (val) => {
        return Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const formatDateStr = (dateObj) => {
        return dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    let dateLabel = 'All Time';
    if (range === 'today') dateLabel = `${formatDateStr(startOfToday)}`;
    else if (range === 'week') dateLabel = `${formatDateStr(startOfWeek)} to ${formatDateStr(endOfWeek)}`;
    else if (range === 'month') dateLabel = `${formatDateStr(startOfMonth)} to ${formatDateStr(endOfMonth)}`;
    else if (range === 'custom') dateLabel = `${customStart ? formatDateStr(new Date(customStart)) : '-'} to ${customEnd ? formatDateStr(new Date(customEnd)) : customStart ? formatDateStr(new Date(customStart)) : '-'}`;

    const exportToExcel = () => {
        const url = `/finance/export?range=${range}&custom_start=${customStart || ''}&custom_end=${customEnd || ''}`;
        window.location.href = url;
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 p-4 flex flex-col items-center relative">
                    <img
                        src="/assets/images/logo-europcar.png"
                        alt="Europcar Logo"
                        className="h-16 w-auto object-contain mb-3"
                    />
                    <h1 className="text-xl font-black text-black uppercase tracking-widest mb-1">EUROPCAR SRI LANKA</h1>
                    <h2 className="text-lg font-bold text-black uppercase tracking-wider">BALANCE SHEET & FINANCIAL STATEMENT</h2>
                    
                    <div className="text-sm text-black mt-3 flex flex-col items-center space-y-1">
                        <p>For the period : <span className="font-semibold text-black">{dateLabel}</span></p>
                        <p>Generated as at : <span className="font-semibold text-black">{new Date().toLocaleString()}</span></p>
                    </div>

                    <div className="absolute top-6 right-6">
                        <button 
                            type="button"
                            onClick={exportToExcel}
                            className="flex items-center gap-2 bg-white border border-green-600 text-black hover:bg-green-50 px-3 py-1.5 rounded text-sm font-semibold shadow-sm transition"
                        >
                            <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            Export to Excel
                        </button>
                    </div>
                </div>
                
                <div className="p-4 space-y-8">
                    {/* Income Section */}
                    <div>
                        <h3 className="text-sm font-bold text-black uppercase tracking-wider border-b border-gray-200 pb-2 mb-4">
                            Revenue
                        </h3>
                        <div className="space-y-3 text-black">
                            <div className="flex justify-between items-center text-lg">
                                <span>Gross Revenue (Tours: {filteredTrips.length})</span>
                                <span className="font-semibold text-black">LKR {formatCurrency(grossRevenue)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Cost of Sales Section */}
                    <div>
                        <h3 className="text-sm font-bold text-black uppercase tracking-wider border-b border-gray-200 pb-2 mb-4">
                            Cost of Sales (Commissions)
                        </h3>
                        <div className="space-y-3 text-black pl-4 border-l-2 border-gray-100">
                            <div className="flex justify-between items-center">
                                <span>Driver Payouts</span>
                                <span className="font-medium text-black">- LKR {formatCurrency(driverPayouts)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Agent Payouts</span>
                                <span className="font-medium text-black">- LKR {formatCurrency(agentPayouts)}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-lg font-bold text-black mt-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <span>Net Revenue</span>
                            <span>LKR {formatCurrency(netRevenue)}</span>
                        </div>
                    </div>

                    {/* Operating Expenses Section */}
                    <div>
                        <h3 className="text-sm font-bold text-black uppercase tracking-wider border-b border-gray-200 pb-2 mb-4">
                            Operating Expenses
                        </h3>
                        <div className="space-y-3 text-black pl-4 border-l-2 border-gray-100">
                            {filteredExpenses.length === 0 ? (
                                <div className="text-sm text-black italic">No expenses recorded for this period.</div>
                            ) : (
                                filteredExpenses.map(exp => (
                                    <div key={exp.id} className="flex justify-between items-center text-sm">
                                        <span>{exp.title}</span>
                                        <span className="font-medium text-black">- LKR {formatCurrency(exp.amount)}</span>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="flex justify-between items-center text-md font-semibold text-black mt-4 border-t border-gray-100 pt-3">
                            <span>Total Operating Expenses</span>
                            <span className="text-black">- LKR {formatCurrency(totalExpenses)}</span>
                        </div>
                    </div>

                    {/* Net Profit Section */}
                    <div className={`p-3 rounded-xl border-2 flex justify-between items-center text-xl font-black uppercase tracking-wide
                        ${netProfit >= 0 ? 'bg-green-50 border-green-200 text-black' : 'bg-red-50 border-red-200 text-black'}
                    `}>
                        <span>{netProfit >= 0 ? 'Net Profit' : 'Net Loss'}</span>
                        <span>LKR {formatCurrency(Math.abs(netProfit))}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}function TillAmountTab({ shiftLogs, returns, currentBalance, requests, range, customStart, customEnd }) {
    const filterByDate = (dateString) => {
        if (!dateString) return false;
        const d = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (range === 'today') {
            return d >= today;
        } else if (range === 'week') {
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            return d >= weekStart;
        } else if (range === 'month') {
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            return d >= monthStart;
        } else if (range === 'custom') {
            const start = customStart ? new Date(customStart) : new Date(0);
            const end = customEnd ? new Date(customEnd) : new Date('2100-01-01');
            end.setHours(23, 59, 59, 999);
            return d >= start && d <= end;
        }
        return true;
    };

    const filteredLogs = shiftLogs.filter(log => filterByDate(log.created_at));
    const filteredReturns = returns.filter(ret => filterByDate(ret.created_at));

    const combined = [];

    // Map Returns (Cash Out)
    filteredReturns.forEach(ret => {
        combined.push({
            id: `ret-${ret.id}`,
            date: new Date(ret.created_at),
            desc: `Cash Return to ${ret.customer?.name ?? 'Guest'} (${ret.shift_id || 'No Shift'})`,
            in: 0,
            out: Number(ret.amount_lkr),
        });
    });

    // Map Shift Logs / Replenishments (Cash In)
    filteredLogs.forEach(log => {
        combined.push({
            id: `log-${log.id}`,
            date: new Date(log.created_at),
            desc: `Till Replenishment - Checkout ${log.shift_id}`,
            in: Number(log.amount_spent), // Cash added back to till to reach 100k
            out: 0,
        });
    });

    // Sort chronologically ascending to calculate running balance
    combined.sort((a, b) => a.date - b.date);

    // Assume standard opening balance is 100,000
    let runningBalance = 100000;
    
    // Add an opening balance row
    const ledger = [
        {
            id: 'opening-balance',
            date: combined.length > 0 ? new Date(combined[0].date.getTime() - 1000) : new Date(),
            desc: 'Opening Balance (Default)',
            in: 0,
            out: 0,
            balance: 100000
        }
    ];

    combined.forEach(item => {
        runningBalance = runningBalance + item.in - item.out;
        item.balance = runningBalance;
        ledger.push(item);
    });

    // Reverse to show newest on top
    ledger.reverse();

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-6 shadow-lg">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-blue-100 uppercase tracking-wider mb-1">Current Till Balance</h2>
                        <div className="text-4xl font-extrabold tracking-tight">
                            LKR {Number(currentBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Requests Section */}
            <div className="bg-white rounded-xl shadow-sm border border-rose-100 overflow-hidden mb-6">
                <div className="px-5 py-4 border-b border-rose-100 bg-rose-50 flex justify-between items-center">
                    <h3 className="font-bold text-rose-900 flex items-center gap-2">
                        <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        Pending Replenishment Requests
                    </h3>
                </div>
                <div className="p-0 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-rose-700 uppercase bg-rose-50/50">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Requested By</th>
                                <th className="px-6 py-4 font-semibold">Shift ID</th>
                                <th className="px-6 py-4 font-semibold text-right">Current Balance</th>
                                <th className="px-6 py-4 font-semibold text-right">Needed Amount</th>
                                <th className="px-6 py-4 font-semibold text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-rose-100">
                            {requests && requests.filter(r => r.status === 'Pending').length > 0 ? (
                                requests.filter(r => r.status === 'Pending').map(req => (
                                    <tr key={req.id} className="hover:bg-rose-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{req.requested_by?.name || 'Counter Staff'}</div>
                                            <div className="text-[10px] text-gray-500">{new Date(req.created_at).toLocaleString()}</div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs font-mono block w-fit">
                                                {req.shift_id}
                                            </span>
                                            {req.requested_by?.name && (
                                                <span className="block text-[11px] font-semibold text-gray-600 mt-0.5">
                                                    {req.requested_by.name.split(' ')[0]}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-600 font-medium">
                                            LKR {Number(req.balance_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-right text-rose-600 font-bold">
                                            LKR {Number(req.needed_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => {
                                                    if (window.confirm(`Are you sure you want to approve this petty cash replenishment request (LKR ${Number(req.needed_amount).toLocaleString()}) for ${req.shift_id} and replenish the till?`)) {
                                                        router.post(`/finance/petty-cash-requests/${req.id}/approve`, {}, {
                                                            preserveScroll: true,
                                                            onSuccess: () => toast.success('Petty cash request approved!')
                                                        });
                                                    }
                                                }}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-4 rounded shadow text-xs transition"
                                            >
                                                Approve & Replenish
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-rose-300 font-medium">
                                        No pending requests
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Petty Cash Ledger Book
                    </h3>
                </div>
                <div className="p-0 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Date & Time</th>
                                <th className="px-6 py-4 font-semibold">Description</th>
                                <th className="px-6 py-4 font-semibold text-right">Cash In (Dr)</th>
                                <th className="px-6 py-4 font-semibold text-right">Cash Out (Cr)</th>
                                <th className="px-6 py-4 font-semibold text-right">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {ledger.map((row) => (
                                <tr key={row.id} className={`hover:bg-blue-50/50 transition-colors ${row.id === 'opening-balance' ? 'bg-gray-50' : ''}`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                        {row.id === 'opening-balance' ? '-' : row.date.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {row.desc}
                                    </td>
                                    <td className="px-6 py-4 text-right text-emerald-600 font-medium">
                                        {row.in > 0 ? Number(row.in).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right text-rose-600 font-medium">
                                        {row.out > 0 ? Number(row.out).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-900 font-bold bg-gray-50/50">
                                        {Number(row.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

