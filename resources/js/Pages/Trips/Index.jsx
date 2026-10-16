import { Head, Link, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import AppSidebarLayout from '@/Layouts/AppSidebarLayout';

export default function Index({ trips = [] }) {
    const { auth } = usePage().props;
    const isReadOnly = auth?.user?.isExecutiveStaff ?? false;
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
            cell: row => (
                <div className="py-1">
                    <strong>#{row.id}</strong>
                    {row.is_short_trip && (
                        <span className="block mt-0.5 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded px-1 text-center leading-tight">
                            ⚡ Short
                        </span>
                    )}
                </div>
            ),
        },
        {
            name: 'Invoice',
            selector: row => row.id,
            sortable: false,
            width: '120px',
            cell: row => {
                const bookingType = (row.agent?.booking_type || '').toLowerCase();
                const isRentACar = bookingType === 'rent a car' || bookingType.includes('rent');

                if (isRentACar) {
                    return <span className="text-gray-400 text-xs italic">-</span>;
                }

                const invoiceUrl = row.is_outsource && row.outsource_id
                    ? `/trips/outsource/${row.outsource_id}/invoice`
                    : `/trips/${row.id}/invoice`;

                return (
                    <a
                        href={invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs transition"
                        title="View / Print Trip Invoice"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Invoice</span>
                    </a>
                );
            },
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
            name: 'Driver / Vehicle',
            selector: row => `${row.driver?.first_name ?? ''} ${row.driver?.last_name ?? ''}`.trim() || row.driver?.full_name || '-',
            sortable: true,
            wrap: true,
            cell: row => {
                const driverName = `${row.driver?.first_name ?? ''} ${row.driver?.last_name ?? ''}`.trim() || row.driver?.full_name || '-';
                const vehReg = row.driver?.vehicle?.registration_number || row.driver?.vehicle_registration_number || row.vehicle_number;
                return (
                    <div className="py-1">
                        <div className="font-semibold text-gray-900">{driverName}</div>
                        {vehReg && (
                            <div className="text-[11px] font-bold text-gray-500">
                                {vehReg}
                            </div>
                        )}
                        {row.is_outsource && (
                            <span className="inline-block mt-0.5 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded px-1">
                                Outside Vehicle
                            </span>
                        )}
                    </div>
                );
            },
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
            name: 'Selection Reason',
            selector: row => row.selection_reason ?? '',
            sortable: true,
            wrap: true,
            cell: row => (
                row.selection_reason ? (
                    <span className="text-red-600 text-xs font-semibold">
                        {row.selection_reason}
                    </span>
                ) : (
                    <span className="text-gray-400 text-xs">-</span>
                )
            ),
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
        <AppSidebarLayout title="Tour Invoices">
            <Head title="Tour Invoices" />

            <div className="p-6">
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <div className="flex justify-between items-center p-6 border-b">
                        <div>
                            <h1 className="text-2xl font-bold">
                                Tour Invoices
                            </h1>

                            <p className="text-gray-500 text-sm mt-1">
                                View all assigned tours & transfers and generate driver/vehicle invoices
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
                            Total Tours: <strong>{filteredTrips.length}</strong>
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