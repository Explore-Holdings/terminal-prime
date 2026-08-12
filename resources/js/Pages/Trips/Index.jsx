import { Head, Link, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import AppSidebarLayout from '@/Layouts/AppSidebarLayout';

export default function Index({ trips = [] }) {
    const { auth } = usePage().props;
    const isReadOnly = auth?.user?.isExecutiveStaff;
    const [search, setSearch] = useState('');

    const filteredTrips = useMemo(() => {
        return trips.filter((trip) => {
            const text = [
                trip.id,
                trip.customer?.name,
                trip.customer?.customer_code,
                trip.driver?.full_name,
                trip.agent?.user?.name,
                trip.status,
            ].join(' ').toLowerCase();

            return text.includes(search.toLowerCase());
        });
    }, [trips, search]);

    const statusColor = (status) => {
        const colors = {
            Assigned: 'bg-blue-100 text-blue-700',
            Accepted: 'bg-yellow-100 text-yellow-700',
            'On Route': 'bg-purple-100 text-purple-700',
            'Picked Up': 'bg-orange-100 text-orange-700',
            Completed: 'bg-green-100 text-green-700',
            Cancelled: 'bg-red-100 text-red-700',
        };

        return colors[status] ?? 'bg-gray-100 text-gray-700';
    };

    const columns = [
        {
            name: 'Trip #',
            selector: row => row.id,
            sortable: true,
            width: '110px',
            cell: row => <strong>#{row.id}</strong>,
        },
        {
            name: 'Customer',
            selector: row => row.customer?.name ?? '-',
            sortable: true,
            wrap: true,
            cell: row => (
                <div>
                    <div className="font-medium">{row.customer?.name ?? '-'}</div>
                    <div className="text-xs text-gray-500">
                        {row.customer?.customer_code ?? '-'}
                    </div>
                </div>
            ),
        },
        {
            name: 'Driver',
            selector: row => row.driver?.full_name ?? '-',
            sortable: true,
        },
        {
            name: 'Agent',
            selector: row => row.agent?.user?.name ?? '-',
            sortable: true,
        },
        {
            name: 'Assigned At',
            selector: row => row.trip_assigned_at ?? '',
            sortable: true,
            wrap: true,
            cell: row =>
                row.trip_assigned_at
                    ? new Date(row.trip_assigned_at).toLocaleString()
                    : '-',
        },
        {
            name: 'Status',
            selector: row => row.status ?? '',
            sortable: true,
            cell: row => (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(row.status)}`}>
                    {row.status ?? '-'}
                </span>
            ),
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
        <AppSidebarLayout title="Trips">
            <Head title="Trips" />

            <div className="p-6">
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <div className="flex justify-between items-center p-6 border-b">
                        <div>
                            <h1 className="text-2xl font-bold">
                                Trip Management
                            </h1>

                            <p className="text-gray-500 text-sm mt-1">
                                View all assigned and completed trips
                            </p>
                        </div>

                        {!isReadOnly && (
                            <Link
                                href="/counter"
                                className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800"
                            >
                                Back to Counter
                            </Link>
                        )}
                    </div>

                    <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <input
                            type="text"
                            placeholder="Search trips..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full md:w-96 border border-gray-300 rounded px-4 py-2"
                        />

                        <div className="text-sm text-gray-600">
                            Total Trips: <strong>{filteredTrips.length}</strong>
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
                    />
                </div>
            </div>
        </AppSidebarLayout>
    );
}