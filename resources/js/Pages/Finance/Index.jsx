import { Head, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import AppSidebarLayout from '@/Layouts/AppSidebarLayout';

export default function Index({ trips = [] }) {
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [search, setSearch] = useState('');

    const filteredTrips = useMemo(() => {
        return trips.filter((trip) => {
            const text = [
                trip.id,
                trip.customer?.name,
                trip.customer?.customer_code,
                trip.agent?.user?.name,
                trip.driver?.full_name,
                trip.finance?.status ?? 'Pending',
            ].join(' ').toLowerCase();

            return text.includes(search.toLowerCase());
        });
    }, [trips, search]);

    const money = (value) => Number(value ?? 0).toLocaleString();

    const currencyOf = (trip) =>
        trip.customer?.agent?.new_currency ??
        trip.customer?.agent?.currency ??
        'LKR';

    const tripAmount = (trip) => Number(trip.customer?.paid_amount ?? 0);

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
            wrap: true,
            cell: row => (
                <div>
                    <div className="font-semibold">{row.customer?.name ?? '-'}</div>
                    <div className="text-xs text-gray-500">{row.customer?.customer_code ?? '-'}</div>
                </div>
            ),
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
            selector: row => tripAmount(row),
            sortable: true,
            right: true,
            cell: row => (
                <strong>
                    {currencyOf(row)} {money(tripAmount(row))}
                </strong>
            ),
        },
        {
            name: 'Driver',
            selector: row => Number(row.finance?.driver_amount ?? 0),
            sortable: true,
            right: true,
            cell: row => `${currencyOf(row)} ${money(row.finance?.driver_amount)}`,
        },
        {
            name: 'Agent',
            selector: row => Number(row.finance?.agent_amount ?? 0),
            sortable: true,
            right: true,
            cell: row => `${currencyOf(row)} ${money(row.finance?.agent_amount)}`,
        },
        {
            name: 'Company',
            selector: row => Number(row.finance?.company_amount ?? 0),
            sortable: true,
            right: true,
            cell: row => `${currencyOf(row)} ${money(row.finance?.company_amount)}`,
        },
        {
            name: 'Status',
            selector: row => row.finance?.status ?? 'Pending',
            sortable: true,
            cell: row => {
                const settled = row.finance?.status === 'Settled';

                return (
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                        settled
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                    }`}>
                        {settled ? 'Settled' : 'Pending'}
                    </span>
                );
            },
        },
        {
            name: 'Action',
            width: '120px',
            cell: row => {
                const settled = row.finance?.status === 'Settled';

                return (
                    <button
                        type="button"
                        onClick={() => setSelectedTrip(row)}
                        className={`px-3 py-1 rounded text-xs font-bold text-white ${
                            settled
                                ? 'bg-slate-700 hover:bg-slate-800'
                                : 'bg-blue-700 hover:bg-blue-800'
                        }`}
                    >
                        {settled ? 'Edit' : 'Settle'}
                    </button>
                );
            },
        },
    ];

    const customStyles = {
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
                minHeight: '58px',
            },
        },
    };

    return (
        <AppSidebarLayout title="Finance">
            <Head title="Finance" />

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold">Finance Settlements</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Split each trip amount between driver, agent, company and expenses.
                    </p>
                </div>

                <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <input
                        type="text"
                        placeholder="Search finance records..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full md:w-96 border border-gray-300 rounded px-4 py-2"
                    />

                    <div className="text-sm text-gray-600">
                        Records: <strong>{filteredTrips.length}</strong>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={filteredTrips}
                    pagination
                    paginationPerPage={10}
                    paginationRowsPerPageOptions={[10, 25, 50, 100]}
                    highlightOnHover
                    striped
                    responsive
                    persistTableHead
                    customStyles={customStyles}
                    noDataComponent={
                        <div className="p-6 text-gray-500">
                            No finance records found.
                        </div>
                    }
                />
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

function SettlementModal({ trip, onClose }) {
    const amount = Number(trip.customer?.paid_amount ?? 0);
    const currency =
        trip.customer?.agent?.new_currency ??
        trip.customer?.agent?.currency ??
        'LKR';

    const form = useForm({
        driver_amount: trip.finance?.driver_amount ?? '',
        agent_amount: trip.finance?.agent_amount ?? '',
        company_amount: trip.finance?.company_amount ?? '',
        expense_amount: trip.finance?.expense_amount ?? 0,
        remarks: trip.finance?.remarks ?? '',
    });

    const totalShared =
        Number(form.data.driver_amount || 0) +
        Number(form.data.agent_amount || 0) +
        Number(form.data.company_amount || 0) +
        Number(form.data.expense_amount || 0);

    const balance = amount - totalShared;

    const submit = (e) => {
        e.preventDefault();

        if (Number(totalShared.toFixed(2)) !== Number(amount.toFixed(2))) {
            alert('Driver + Agent + Company + Expenses must equal trip amount.');
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
                    <div>
                        <h2 className="text-lg font-bold">
                            {trip.finance?.status === 'Settled' ? 'Edit Settlement' : 'Settle Trip'} #{trip.id}
                        </h2>
                        <p className="text-xs text-gray-500">
                            {trip.customer?.name ?? '-'} · Driver : {trip.driver?.full_name ?? '-'}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-red-600 font-bold"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={submit} className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 rounded p-3">
                        <div>
                            <p className="text-gray-500 text-xs">Agent</p>
                            <p className="font-semibold truncate">{trip.agent?.user?.name ?? '-'}</p>
                        </div>

                        <div>
                            <p className="text-gray-500 text-xs">Trip Amount</p>
                            <p className="font-bold">
                                {currency} {amount.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Input label="Driver" value={form.data.driver_amount} onChange={(e) => form.setData('driver_amount', e.target.value)} />
                        <Input label="Agent" value={form.data.agent_amount} onChange={(e) => form.setData('agent_amount', e.target.value)} />
                        <Input label="Company" value={form.data.company_amount} onChange={(e) => form.setData('company_amount', e.target.value)} />
                        <Input label="Expenses" value={form.data.expense_amount} onChange={(e) => form.setData('expense_amount', e.target.value)} />
                    </div>

                    <div>
                        <label className="label">Remarks</label>
                        <textarea
                            className="input"
                            rows="2"
                            value={form.data.remarks}
                            onChange={(e) => form.setData('remarks', e.target.value)}
                        />
                    </div>

                    <div className={`p-2 rounded text-sm font-bold flex justify-between ${
                        balance === 0
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                    }`}>
                        <span>Total: {currency} {totalShared.toLocaleString()}</span>
                        <span>Balance: {currency} {balance.toLocaleString()}</span>
                    </div>

                    <button
                        disabled={form.processing}
                        className="w-full bg-green-700 text-white py-2 rounded font-bold disabled:opacity-50"
                    >
                        {form.processing ? 'Saving...' : 'Save Settlement'}
                    </button>
                </form>
            </div>
        </div>
    );
}

function Input({ label, value, onChange }) {
    return (
        <div>
            <label className="label text-xs">{label}</label>
            <input
                type="number"
                min="0"
                step="0.01"
                value={value}
                onChange={onChange}
                className="input text-sm"
            />
        </div>
    );
}