import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import DataTable from 'react-data-table-component';
import AppSidebarLayout from '@/Layouts/AppSidebarLayout';

export default function Index({
    trips = [],
    drivers = [],
    agents = [],
    driverTotals = [],
    agentTotals = [],
    incentives = [],
}) {
    const [mainTab, setMainTab] = useState('daily_operations');
    const [subTab, setSubTab] = useState('settlements');
    const [selectedTrip, setSelectedTrip] = useState(null);

    return (
        <AppSidebarLayout title="Finance">
            <Head title="Finance" />

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold">Finance</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Daily operations, settlements, reports and expenses.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3 p-4 border-b">
                    <MainTabCard active={mainTab === 'daily_operations'} onClick={() => setMainTab('daily_operations')}>
                        Daily Operations
                    </MainTabCard>
                    <MainTabCard active={mainTab === 'settlements'} onClick={() => setMainTab('settlements')}>
                        Settlements
                    </MainTabCard>
                    <MainTabCard active={mainTab === 'reports'} onClick={() => setMainTab('reports')}>
                        Reports
                    </MainTabCard>
                    <MainTabCard active={mainTab === 'expenses'} onClick={() => setMainTab('expenses')}>
                        Expenses
                    </MainTabCard>
                </div>

                <div className="p-4">
                    {mainTab === 'daily_operations' && (
                        <DailyOperationsPanel trips={trips} onSettle={setSelectedTrip} />
                    )}

                    {mainTab === 'settlements' && (
                        <>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <SubTab active={subTab === 'settlements'} onClick={() => setSubTab('settlements')}>Settlements</SubTab>
                                <SubTab active={subTab === 'drivers'} onClick={() => setSubTab('drivers')}>Drivers</SubTab>
                                <SubTab active={subTab === 'driver_totals'} onClick={() => setSubTab('driver_totals')}>Driver Totals</SubTab>
                                <SubTab active={subTab === 'agents'} onClick={() => setSubTab('agents')}>Agent Totals</SubTab>
                                <SubTab active={subTab === 'incentives'} onClick={() => setSubTab('incentives')}>Incentives</SubTab>
                            </div>

                            {subTab === 'settlements' && (
                                <SettlementsTable trips={trips} onSettle={setSelectedTrip} />
                            )}

                            {subTab === 'drivers' && (
                                <DriversTable drivers={drivers} />
                            )}

                            {subTab === 'driver_totals' && (
                                <TotalsTable data={driverTotals} title="Driver" />
                            )}

                            {subTab === 'agents' && (
                                <TotalsTable data={agentTotals} title="Agent" />
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
                        <EmptyState
                            title="Reports"
                            description="Revenue and performance reports will appear here soon."
                        />
                    )}

                    {mainTab === 'expenses' && (
                        <EmptyState
                            title="Expenses"
                            description="Expense tracking and approvals will appear here soon."
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
        </AppSidebarLayout>
    );
}

function DailyOperationsPanel({ trips, onSettle }) {
    const [range, setRange] = useState('today');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

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

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                <div className="flex flex-wrap gap-2">
                    {[
                        { key: 'today', label: 'Today' },
                        { key: 'week', label: 'This Week' },
                        { key: 'month', label: 'This Month' },
                        { key: 'custom', label: 'Custom' },
                    ].map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => setRange(item.key)}
                            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                                range === item.key
                                    ? 'bg-blue-700 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {range === 'custom' && (
                    <div className="flex flex-wrap gap-2">
                        <input
                            type="date"
                            value={customStart}
                            onChange={(e) => setCustomStart(e.target.value)}
                            className="rounded border border-gray-300 px-3 py-2 text-sm"
                        />
                        <input
                            type="date"
                            value={customEnd}
                            onChange={(e) => setCustomEnd(e.target.value)}
                            className="rounded border border-gray-300 px-3 py-2 text-sm"
                        />
                    </div>
                )}
            </div>

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
                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                    {filteredTrips.map((trip) => (
                        <div key={trip.id} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
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
                                    <p className="mt-1 truncate text-xs text-gray-600">
                                        {trip.customer?.name ?? '-'}
                                    </p>
                                    <p className="truncate text-[11px] text-gray-500">
                                        {trip.driver?.full_name ?? '-'}
                                    </p>
                                    <p className="truncate text-[11px] text-gray-400">
                                        {trip.agent?.user?.name ?? '-'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase tracking-wide text-gray-400">Amt</p>
                                    <p className="text-sm font-semibold text-gray-800">LKR {Number(trip.customer?.paid_amount ?? 0).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    ))}
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

function TotalsTable({ data, title }) {
    const money = (v) => Number(v ?? 0).toLocaleString();

    const columns = [
        {
            name: title,
            selector: row => row.name ?? '-',
            sortable: true,
            cell: row => <strong>{row.name ?? '-'}</strong>,
        },
        {
            name: 'Share Total',
            selector: row => Number(row.share_total ?? 0),
            sortable: true,
            right: true,
            cell: row => `LKR ${money(row.share_total)}`,
        },
        {
            name: 'Incentives',
            selector: row => Number(row.incentive_total ?? 0),
            sortable: true,
            right: true,
            cell: row => `LKR ${money(row.incentive_total)}`,
        },
        {
            name: 'Grand Total',
            selector: row => Number(row.grand_total ?? 0),
            sortable: true,
            right: true,
            cell: row => <strong>LKR {money(row.grand_total)}</strong>,
        },
    ];

    return <Table columns={columns} data={data} empty={`No ${title.toLowerCase()} totals found.`} />;
}

function IncentivesTab({ drivers, agents, incentives }) {
    const form = useForm({
        person_type: 'Driver',
        driver_id: '',
        agent_id: '',
        amount: '',
        currency: 'LKR',
        remarks: '',
    });

    const submit = (e) => {
        e.preventDefault();

        form.post('/finance/incentives/store', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                router.reload({ only: ['incentives', 'driverTotals', 'agentTotals'] });
            },
        });
    };

    const columns = [
        {
            name: 'Type',
            selector: row => row.person_type,
            sortable: true,
        },
        {
            name: 'Name',
            selector: row =>
                row.person_type === 'Driver'
                    ? row.driver?.full_name ?? '-'
                    : row.agent?.user?.name ?? '-',
            sortable: true,
        },
        {
            name: 'Amount',
            selector: row => Number(row.amount ?? 0),
            sortable: true,
            right: true,
            cell: row => `${row.currency ?? 'LKR'} ${Number(row.amount ?? 0).toLocaleString()}`,
        },
        {
            name: 'Remarks',
            selector: row => row.remarks ?? '-',
            wrap: true,
        },
    ];

    return (
        <div className="space-y-5">
            <form
                onSubmit={submit}
                className="bg-gray-50 border rounded-lg p-4"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Type */}
                    <div>
                        <label className="block text-xs font-medium mb-1">
                            Type
                        </label>

                        <select
                            className="w-full border rounded px-3 py-2"
                            value={form.data.person_type}
                            onChange={(e) =>
                                form.setData('person_type', e.target.value)
                            }
                        >
                            <option value="Driver">Driver</option>
                            <option value="Agent">Agent</option>
                        </select>
                    </div>

                    {/* Driver / Agent */}
                    <div>
                        <label className="block text-xs font-medium mb-1">
                            {form.data.person_type}
                        </label>

                        {form.data.person_type === 'Driver' ? (
                            <select
                                className="w-full border rounded px-3 py-2"
                                value={form.data.driver_id}
                                onChange={(e) =>
                                    form.setData('driver_id', e.target.value)
                                }
                            >
                                <option value="">Select Driver</option>

                                {drivers.map((driver) => (
                                    <option key={driver.id} value={driver.id}>
                                        {driver.full_name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <select
                                className="w-full border rounded px-3 py-2"
                                value={form.data.agent_id}
                                onChange={(e) =>
                                    form.setData('agent_id', e.target.value)
                                }
                            >
                                <option value="">Select Agent</option>

                                {agents.map((agent) => (
                                    <option key={agent.id} value={agent.id}>
                                        {agent.user?.name ?? agent.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-xs font-medium mb-1">
                            Amount
                        </label>

                        <input
                            type="number"
                            step="0.01"
                            className="w-full border rounded px-3 py-2"
                            value={form.data.amount}
                            onChange={(e) =>
                                form.setData('amount', e.target.value)
                            }
                        />
                    </div>

                    {/* Currency */}
                    <div>
                        <label className="block text-xs font-medium mb-1">
                            Currency
                        </label>

                        <select
                            className="w-full border rounded px-3 py-2"
                            value={form.data.currency}
                            onChange={(e) =>
                                form.setData('currency', e.target.value)
                            }
                        >
                            <option value="LKR">LKR</option>
                        </select>
                    </div>

                    {/* Remarks */}
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium mb-1">
                            Remarks
                        </label>

                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2"
                            value={form.data.remarks}
                            onChange={(e) =>
                                form.setData('remarks', e.target.value)
                            }
                        />
                    </div>

                    {/* Button */}
                    <div className="md:col-span-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="bg-green-700 text-white px-5 py-2 rounded hover:bg-green-800 disabled:opacity-50"
                        >
                            Add Incentive
                        </button>
                    </div>

                </div>
            </form>

            <Table columns={columns} data={incentives} empty="No incentives found." />
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