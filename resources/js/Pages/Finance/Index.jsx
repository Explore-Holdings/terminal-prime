import { Head, useForm, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import AppSidebarLayout from '@/Layouts/AppSidebarLayout';
import toast, { Toaster } from 'react-hot-toast';

export default function Index({
    trips = [],
    drivers = [],
    agents = [],
    driverTotals = [],
    agentTotals = [],
    incentives = [],
    rateSetting = null,
    expenses = [],
}) {
    const [mainTab, setMainTab] = useState('daily_operations');
    const [subTab, setSubTab] = useState('payouts');
    const [selectedTrip, setSelectedTrip] = useState(null);

    // Date-range filter — lifted here so it lives in the header
    const [range, setRange] = useState('today');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    return (
        <AppSidebarLayout title="Finance">
            <Head title="Finance" />
            <Toaster position="top-right" toastOptions={{ duration: 3500 }} />

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="p-6 border-b">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-bold">Finance</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Daily operations, settlements, reports and expenses.
                            </p>
                        </div>

                        {(mainTab === 'daily_operations' || mainTab === 'reports') && (
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
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                        Settlements
                    </MainTabCard>
                    <MainTabCard active={mainTab === 'expenses'} onClick={() => setMainTab('expenses')}>
                        Expenses
                    </MainTabCard>
                    <MainTabCard active={mainTab === 'reports'} onClick={() => setMainTab('reports')}>
                        Reports
                    </MainTabCard>
                </div>

                <div className="p-4">
                    {mainTab === 'daily_operations' && (
                        <DailyOperationsPanel trips={trips} rateSetting={rateSetting} range={range} customStart={customStart} customEnd={customEnd} />
                    )}

                    {mainTab === 'settlements' && (
                        <>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <SubTab active={subTab === 'drivers'} onClick={() => setSubTab('drivers')}>Drivers</SubTab>
                                <SubTab active={subTab === 'payouts'} onClick={() => setSubTab('payouts')}>Payouts</SubTab>
                                <SubTab active={subTab === 'incentives'} onClick={() => setSubTab('incentives')}>Incentives</SubTab>
                            </div>

                            {subTab === 'drivers' && (
                                <DriversTable drivers={drivers} />
                            )}

                            {subTab === 'payouts' && (
                                <PayoutsTab 
                                    drivers={driverTotals} 
                                    agents={agentTotals}
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
                        />
                    )}

                    {mainTab === 'expenses' && (
                        <ExpensesPanel expenses={expenses} />
                    )}
                </div>
            </div>

            {selectedTrip && (
                <SettlementModal
                    trip={selectedTrip}
                    onClose={() => setSelectedTrip(null)}
                />
            )}
        </AppSidebarLayout>
    );
}

function DailyOperationsPanel({ trips, rateSetting, range, customStart, customEnd }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 8;

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    const filteredTrips = trips.filter((trip) => {
        const assignedAt = trip.trip_assigned_at ? new Date(trip.trip_assigned_at) : null;

        if (!assignedAt || Number.isNaN(assignedAt.getTime())) {
            return false;
        }

        if (range === 'today') {
            return assignedAt >= startOfToday && assignedAt <= endOfToday;
        }

        if (range === 'week') {
            const startOfWeek = new Date(startOfToday);
            startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);
            return assignedAt >= startOfWeek && assignedAt <= endOfWeek;
        }

        if (range === 'month') {
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
            return assignedAt >= startOfMonth && assignedAt <= endOfMonth;
        }

        if (range === 'custom') {
            if (!customStart) {
                return false;
            }

            const from = new Date(customStart);
            from.setHours(0, 0, 0, 0);

            const to = customEnd ? new Date(customEnd) : new Date(customStart);
            to.setHours(23, 59, 59, 999);

            return assignedAt >= from && assignedAt <= to;
        }

        return false;
    });

    const totalAmount = filteredTrips.reduce((sum, trip) => sum + Number(trip.customer?.paid_amount ?? 0), 0);
    const agentRate = Number(rateSetting?.agent_rate ?? 0);
    const driverRate = Number(rateSetting?.driver_rate ?? 0);

    const filteredRows = filteredTrips.filter((trip) => {
        const query = searchTerm.toLowerCase();
        return (
            String(trip.id).includes(query) ||
            (trip.customer?.name ?? '').toLowerCase().includes(query) ||
            (trip.driver?.full_name ?? '').toLowerCase().includes(query) ||
            (trip.agent?.user?.name ?? '').toLowerCase().includes(query)
        );
    });

    const pagedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);
    const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));

    return (
        <>
        <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-gray-800">
                    {range === 'today' ? 'Today assigned trips' : 'Assigned trips'}
                </h2>
                <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-500">{filteredTrips.length} trip(s)</span>
                    <span className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700">
                        Total : LKR {totalAmount.toLocaleString()}
                    </span>
                </div>
            </div>

            {filteredTrips.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
                    No assigned trips found for this period.
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-2">
                        <div className="flex gap-2">
                            {filteredTrips.map((trip) => (
                                <div key={trip.id} className="min-w-[220px] rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-gray-700">Trip #{trip.id}</span>
                                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                                    trip.finance?.status === 'Settled'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {trip.finance?.status ?? 'Pending'}
                                                </span>
                                            </div>
                                            <p className="mt-1 truncate text-xs text-gray-600">{trip.customer?.name ?? '-'}</p>
                                            <p className="truncate text-[11px] text-gray-500">{trip.driver?.full_name ?? '-'}</p>
                                            <p className="truncate text-[11px] text-gray-400">{trip.agent?.user?.name ?? '-'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] uppercase tracking-wide text-gray-400">Amt</p>
                                            <p className="text-sm font-semibold text-gray-800">LKR {Number(trip.customer?.paid_amount ?? 0).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-3">
                            <input
                                type="text"
                                placeholder="Search trips..."
                                className="w-full max-w-xs rounded border border-gray-300 px-3 py-2 text-sm"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setPage(1);
                                }}
                            />
                            <div className="text-sm text-gray-500">
                                Page {page} of {totalPages}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Trip</th>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Amount</th>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Agent Share</th>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Driver Share</th>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Balance</th>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Rate</th>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {pagedRows.map((trip) => {
                                        const amount = Number(trip.customer?.paid_amount ?? 0);

                                        // Prefer stored trip_finance data when it exists and uses a custom rate
                                        const tf             = trip.trip_finance;
                                        const isCustomRate   = Boolean(tf?.is_custom_rate);
                                        const hasStoredRates = tf && (Number(tf.driver_share) > 0 || Number(tf.agent_share) > 0 || Number(tf.total_amount) > 0);

                                        let agentPortion, driverPortion, balance, displayDriverRate, displayAgentRate;

                                        if (isCustomRate && hasStoredRates) {
                                            // Use values saved at assignment time
                                            agentPortion      = Number(tf.agent_share);
                                            driverPortion     = Number(tf.driver_share);
                                            balance           = Number(tf.balance);
                                            displayDriverRate = Number(tf.driver_rate);
                                            displayAgentRate  = Number(tf.agent_rate);
                                        } else if (hasStoredRates) {
                                            // Standard rate — still prefer stored calculated values for consistency
                                            agentPortion      = Number(tf.agent_share);
                                            driverPortion     = Number(tf.driver_share);
                                            balance           = Number(tf.balance);
                                            displayDriverRate = Number(tf.driver_rate ?? driverRate);
                                            displayAgentRate  = Number(tf.agent_rate ?? agentRate);
                                        } else {
                                            // Fallback: calculate from global rate setting
                                            agentPortion      = (amount * agentRate) / 100;
                                            driverPortion     = (amount * driverRate) / 100;
                                            balance           = amount - agentPortion - driverPortion;
                                            displayDriverRate = driverRate;
                                            displayAgentRate  = agentRate;
                                        }

                                        const isReceived = Boolean(trip.cash_received) || Boolean(tf?.received);

                                        const handleMarkReceived = () => {
                                            if (!window.confirm(`Are you sure you want to mark Trip #${trip.id} as received?`)) {
                                                return;
                                            }

                                            const toastId = toast.loading(`Marking Trip #${trip.id} as received…`);

                                            router.post(
                                                `/finance/trip-finances/${trip.id}/mark-received`,
                                                {
                                                    total_amount:    amount,
                                                    driver_share:    driverPortion,
                                                    agent_share:     agentPortion,
                                                    balance:         balance,
                                                    received_amount: amount,
                                                },
                                                {
                                                    preserveScroll: true,
                                                    onSuccess: () => {
                                                        toast.success(
                                                            `Trip #${trip.id} marked as received — LKR ${amount.toLocaleString()}`,
                                                            { id: toastId }
                                                        );
                                                    },
                                                    onError: () => {
                                                        toast.error(
                                                            `Failed to mark Trip #${trip.id} as received`,
                                                            { id: toastId }
                                                        );
                                                    },
                                                }
                                            );
                                        };

                                        return (
                                            <tr key={trip.id} className="hover:bg-gray-50">
                                                <td className="px-3 py-2">
                                                    <div className="font-semibold text-gray-800">#{trip.id}</div>
                                                    <div className="text-xs text-gray-500">{trip.customer?.name ?? '-'}</div>
                                                </td>
                                                <td className="px-3 py-2 font-medium text-gray-700">LKR {amount.toLocaleString()}</td>
                                                <td className="px-3 py-2">
                                                    <div className="font-medium text-gray-700">LKR {agentPortion.toLocaleString()}</div>
                                                    <div className="text-[11px] text-gray-400">{displayAgentRate}%</div>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <div className="font-medium text-gray-700">LKR {driverPortion.toLocaleString()}</div>
                                                    <div className="text-[11px] text-gray-400">{displayDriverRate}%</div>
                                                </td>
                                                <td className="px-3 py-2 font-medium text-gray-700">LKR {balance.toLocaleString()}</td>
                                                <td className="px-3 py-2">
                                                    {isCustomRate ? (
                                                        <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700">
                                                            ✦ Custom
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                                                            Standard
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2">
                                                    {isReceived ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                                            ✓ Received
                                                        </span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={handleMarkReceived}
                                                            className="rounded bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 active:scale-95 transition-transform"
                                                        >
                                                            Mark Received
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-200 p-3 text-sm text-gray-600">
                            <button
                                type="button"
                                onClick={() => setPage((current) => Math.max(1, current - 1))}
                                disabled={page === 1}
                                className="rounded border border-gray-300 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span>
                                Showing {filteredRows.length === 0 ? 0 : (page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredRows.length)} of {filteredRows.length}
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
            selector: row => Number(row.customer?.paid_amount ?? 0),
            sortable: true,
            right: true,
            cell: row => `LKR ${money(row.customer?.paid_amount)}`,
        },
        {
            name: 'Status',
            cell: row => (
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                    row.finance?.status === 'Settled'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
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

    return <Table columns={columns} data={trips} empty="No trips found." />;
}

function PayoutsTab({ drivers, agents }) {
    const allPeople = [
        ...drivers.map(d => ({ ...d, type: 'Driver', person_id: d.id, id: `Driver_${d.id}` })),
        ...agents.map(a => ({ ...a, type: 'Agent', person_id: a.id, id: `Agent_${a.id}` }))
    ];

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
            cell: row => <strong>{row.name ?? '-'}</strong>,
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
                <span className={`font-bold ${row.balance > 0 ? 'text-blue-600' : 'text-gray-600'}`}>
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

    return (
        <div className="space-y-5">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <Table columns={columns} data={allPeople} empty="No users found." />
            </div>
        </div>
    );
}

function IncentivesTab({ drivers, incentives }) {
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
            selector: row => row.full_name,
            sortable: true,
            cell: row => <strong>{row.full_name}</strong>
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
                <span className="font-semibold text-gray-700">
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
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <Table columns={columns} data={drivers} empty="No drivers found." />
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
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-red-600 font-bold text-xl">
                        ✕
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {incentives.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No incentives found for this driver.</p>
                    ) : (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold text-gray-700">Date</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700">Amount (LKR)</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700">Remarks</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {incentives.map(inc => (
                                        <tr key={inc.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-gray-500">
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
                                            <td className="px-4 py-3 text-gray-600">
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
                                                        <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-700 font-semibold text-xs">Cancel</button>
                                                        <button onClick={() => handleSave(inc.id)} className="text-blue-600 hover:text-blue-800 font-semibold text-xs">Save</button>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-end gap-3">
                                                        <button onClick={() => handleEdit(inc)} className="text-blue-600 hover:text-blue-800 font-semibold text-xs">Edit</button>
                                                        <button onClick={() => handleDelete(inc.id)} className="text-red-600 hover:text-red-800 font-semibold text-xs">Delete</button>
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
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            <p className="mt-2 text-sm text-gray-500">{description}</p>
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
                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:text-blue-700'
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
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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

                    <button type="button" onClick={onClose} className="text-red-600 font-bold">
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
                        total === amount ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
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
            noDataComponent={<div className="p-6 text-gray-500">{empty}</div>}
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
                    : 'bg-gray-100 text-gray-700'
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
        return (
            (driver.full_name?.toLowerCase().includes(query) ?? false) ||
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
            selector: row => row.full_name ?? '-',
            sortable: true,
            cell: row => <strong>{row.full_name ?? '-'}</strong>,
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
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
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
                    className="text-blue-600 hover:text-blue-800 underline font-semibold text-xs"
                >
                    View
                </a>
            ) : (
                <span className="text-gray-400 text-xs">No file</span>
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
                            row.driver_status === 'Active' ? 'border-green-300 bg-green-50 text-green-700 font-bold' :
                            row.driver_status === 'Suspended' ? 'border-red-300 bg-red-50 text-red-700 font-bold' :
                            'border-gray-300 bg-gray-50 text-gray-700 font-bold'
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

                    <button type="button" onClick={onClose} className="text-red-600 font-bold">
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
                            className="rounded text-blue-700 focus:ring-blue-700 h-4 w-4"
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
                                    className="text-blue-600 underline font-semibold"
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
                            className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded font-bold transition-colors"
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
                    <div className="font-semibold text-gray-800">{row.title}</div>
                    {row.remarks && <div className="text-xs text-gray-500 truncate max-w-[250px]">{row.remarks}</div>}
                </div>
            )
        },
        {
            name: 'Amount',
            selector: row => Number(row.amount ?? 0),
            sortable: true,
            right: true,
            width: '140px',
            cell: row => <span className="font-bold text-gray-900">LKR {Number(row.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>,
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
                        className="px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium text-xs border border-blue-200"
                    >
                        Edit
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDelete(row.id)}
                        className="px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 font-medium text-xs border border-red-200"
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
                    <h3 className="font-bold text-lg text-gray-800">
                        {editingExpense ? '✏️ Edit Expense' : '➕ Add Expense'}
                    </h3>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Title</label>
                            <input
                                type="text"
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={form.data.title}
                                onChange={(e) => form.setData('title', e.target.value)}
                                placeholder="e.g. Office rent, Fuel reimbursement"
                                required
                            />
                            {form.errors.title && <p className="text-red-500 text-xs mt-1">{form.errors.title}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Amount (LKR)</label>
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
                            {form.errors.amount && <p className="text-red-500 text-xs mt-1">{form.errors.amount}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Expense Date</label>
                            <input
                                type="date"
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={form.data.expense_date}
                                onChange={(e) => form.setData('expense_date', e.target.value)}
                                required
                            />
                            {form.errors.expense_date && <p className="text-red-500 text-xs mt-1">{form.errors.expense_date}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Remarks</label>
                            <textarea
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="3"
                                value={form.data.remarks}
                                onChange={(e) => form.setData('remarks', e.target.value)}
                                placeholder="Additional details..."
                            />
                            {form.errors.remarks && <p className="text-red-500 text-xs mt-1">{form.errors.remarks}</p>}
                        </div>

                        <div className="flex gap-2 justify-end pt-2">
                            {editingExpense && (
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="px-4 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50 font-medium"
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
                        <h3 className="font-bold text-lg text-gray-800">Expense List</h3>
                        <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-100">
                            Total: LKR {expenses.reduce((sum, exp) => sum + Number(exp.amount), 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </span>
                    </div>

                    <Table columns={columns} data={expenses} empty="No expenses found. Use the form to add one." />
                </div>
            </div>
        </div>
    );
}

function ReportsPanel({ trips, expenses, rateSetting, range, customStart, customEnd }) {
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
        const amount = Number(trip.customer?.paid_amount ?? 0);
        grossRevenue += amount;

        const tf = trip.trip_finance;
        if (tf && tf.is_custom_rate) {
            driverPayouts += Number(tf.driver_share ?? 0);
            agentPayouts += Number(tf.agent_share ?? 0);
        } else {
            driverPayouts += amount * defaultDriverRate / 100;
            agentPayouts += amount * defaultAgentRate / 100;
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
                <div className="bg-gray-50 border-b border-gray-200 p-6 flex flex-col items-center relative">
                    <h1 className="text-xl font-black text-gray-900 uppercase tracking-widest mb-1">Terminal Prime</h1>
                    <h2 className="text-lg font-bold text-gray-700 uppercase tracking-wider">Profit & Loss Statement</h2>
                    
                    <div className="text-sm text-gray-500 mt-3 flex flex-col items-center space-y-1">
                        <p>For the period : <span className="font-semibold text-gray-700">{dateLabel}</span></p>
                        <p>Generated as at : <span className="font-semibold text-gray-700">{new Date().toLocaleString()}</span></p>
                    </div>

                    <div className="absolute top-6 right-6">
                        <button 
                            type="button"
                            onClick={exportToExcel}
                            className="flex items-center gap-2 bg-white border border-green-600 text-green-700 hover:bg-green-50 px-3 py-1.5 rounded text-sm font-semibold shadow-sm transition"
                        >
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            Export to Excel
                        </button>
                    </div>
                </div>
                
                <div className="p-6 md:p-10 space-y-8">
                    {/* Income Section */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200 pb-2 mb-4">
                            Revenue
                        </h3>
                        <div className="space-y-3 text-gray-700">
                            <div className="flex justify-between items-center text-lg">
                                <span>Gross Revenue (Trips: {filteredTrips.length})</span>
                                <span className="font-semibold text-gray-900">LKR {formatCurrency(grossRevenue)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Cost of Sales Section */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200 pb-2 mb-4">
                            Cost of Sales (Commissions)
                        </h3>
                        <div className="space-y-3 text-gray-700 pl-4 border-l-2 border-gray-100">
                            <div className="flex justify-between items-center">
                                <span>Driver Payouts</span>
                                <span className="font-medium text-red-600">- LKR {formatCurrency(driverPayouts)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Agent Payouts</span>
                                <span className="font-medium text-red-600">- LKR {formatCurrency(agentPayouts)}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-lg font-bold text-gray-900 mt-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <span>Net Revenue</span>
                            <span>LKR {formatCurrency(netRevenue)}</span>
                        </div>
                    </div>

                    {/* Operating Expenses Section */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200 pb-2 mb-4">
                            Operating Expenses
                        </h3>
                        <div className="space-y-3 text-gray-700 pl-4 border-l-2 border-gray-100">
                            {filteredExpenses.length === 0 ? (
                                <div className="text-sm text-gray-400 italic">No expenses recorded for this period.</div>
                            ) : (
                                filteredExpenses.map(exp => (
                                    <div key={exp.id} className="flex justify-between items-center text-sm">
                                        <span>{exp.title}</span>
                                        <span className="font-medium text-red-600">- LKR {formatCurrency(exp.amount)}</span>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="flex justify-between items-center text-md font-semibold text-gray-800 mt-4 border-t border-gray-100 pt-3">
                            <span>Total Operating Expenses</span>
                            <span className="text-red-600">- LKR {formatCurrency(totalExpenses)}</span>
                        </div>
                    </div>

                    {/* Net Profit Section */}
                    <div className={`p-5 rounded-xl border-2 flex justify-between items-center text-xl font-black uppercase tracking-wide
                        ${netProfit >= 0 ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}
                    `}>
                        <span>{netProfit >= 0 ? 'Net Profit' : 'Net Loss'}</span>
                        <span>LKR {formatCurrency(Math.abs(netProfit))}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}