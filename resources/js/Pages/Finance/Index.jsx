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
    const [tab, setTab] = useState('settlements');
    const [selectedTrip, setSelectedTrip] = useState(null);

    return (
        <AppSidebarLayout title="Finance">
            <Head title="Finance" />

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold">Finance</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Settlements, driver totals, agent totals and incentives.
                    </p>
                </div>

                <div className="flex gap-2 p-4 border-b">
                    <Tab active={tab === 'settlements'} onClick={() => setTab('settlements')}>Settlements</Tab>
                    <Tab active={tab === 'drivers'} onClick={() => setTab('drivers')}>Driver Totals</Tab>
                    <Tab active={tab === 'agents'} onClick={() => setTab('agents')}>Agent Totals</Tab>
                    <Tab active={tab === 'incentives'} onClick={() => setTab('incentives')}>Incentives</Tab>
                </div>

                <div className="p-4">
                    {tab === 'settlements' && (
                        <SettlementsTable trips={trips} onSettle={setSelectedTrip} />
                    )}

                    {tab === 'drivers' && (
                        <TotalsTable data={driverTotals} title="Driver" />
                    )}

                    {tab === 'agents' && (
                        <TotalsTable data={agentTotals} title="Agent" />
                    )}

                    {tab === 'incentives' && (
                        <IncentivesTab
                            drivers={drivers}
                            agents={agents}
                            incentives={incentives}
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
                        Total: {currency} {total.toLocaleString()} / {currency} {amount.toLocaleString()}
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