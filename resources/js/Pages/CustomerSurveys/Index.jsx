import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import AppSidebarLayout from '@/Layouts/AppSidebarLayout';

export default function Index({ surveys = [] }) {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        return surveys.filter((survey) => {
            const text = [
                survey.id,
                survey.trip_id,
                survey.customer?.name,
                survey.customer?.email,
                survey.driver?.full_name,
                survey.journey_rating,
                survey.driver_rating,
                survey.comments,
            ].join(' ').toLowerCase();

            return text.includes(search.toLowerCase());
        });
    }, [surveys, search]);

    const yesNo = (value) => value ? 'Yes' : 'No';

    const columns = [
        {
            name: 'Trip',
            selector: row => row.trip_id,
            sortable: true,
            width: '90px',
            cell: row => <strong>#{row.trip_id}</strong>,
        },
        {
            name: 'Customer',
            selector: row => row.customer?.name ?? '-',
            sortable: true,
            wrap: true,
            cell: row => (
                <div>
                    <div className="font-semibold">{row.customer?.name ?? '-'}</div>
                    <div className="text-xs text-gray-500">{row.customer?.email ?? '-'}</div>
                </div>
            ),
        },
        {
            name: 'Driver',
            selector: row => row.driver?.full_name ?? '-',
            sortable: true,
        },
        {
            name: 'Journey',
            selector: row => row.journey_rating,
            sortable: true,
            cell: row => <Rating value={row.journey_rating} />,
        },
        {
            name: 'Driver Rating',
            selector: row => row.driver_rating,
            sortable: true,
            cell: row => <Rating value={row.driver_rating} />,
        },
        {
            name: 'Extra Charge',
            selector: row => row.driver_charged_extra,
            sortable: true,
            cell: row => (
                <span className={row.driver_charged_extra ? 'text-red-700 font-bold' : 'text-green-700 font-bold'}>
                    {yesNo(row.driver_charged_extra)}
                    {row.driver_charged_extra && row.extra_amount
                        ? ` - ${Number(row.extra_amount).toLocaleString()}`
                        : ''}
                </span>
            ),
        },
        {
            name: 'Polite',
            selector: row => row.driver_was_polite,
            cell: row => yesNo(row.driver_was_polite),
        },
        {
            name: 'Clean Vehicle',
            selector: row => row.vehicle_was_clean,
            cell: row => yesNo(row.vehicle_was_clean),
        },
        {
            name: 'Safe',
            selector: row => row.felt_safe,
            cell: row => yesNo(row.felt_safe),
        },
        {
            name: 'Comments',
            selector: row => row.comments ?? '-',
            wrap: true,
        },
        {
            name: 'Date',
            selector: row => row.created_at,
            sortable: true,
            cell: row => row.created_at
                ? new Date(row.created_at).toLocaleString()
                : '-',
        },
    ];

    return (
        <AppSidebarLayout title="Customer Surveys">
            <Head title="Customer Surveys" />

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Customer Surveys
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            View customer journey feedback and ratings
                        </p>
                    </div>

                    {/* <Link
                        href="/dashboard"
                        className="bg-slate-700 text-white px-4 py-2 rounded hover:bg-slate-800"
                    >
                        Back
                    </Link> */}
                </div>

                <div className="p-4 flex justify-between gap-4">
                    <input
                        type="text"
                        placeholder="Search surveys..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full md:w-96 border border-gray-300 rounded px-4 py-2"
                    />

                    <div className="text-sm text-gray-600">
                        Total: <strong>{filtered.length}</strong>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={filtered}
                    pagination
                    paginationPerPage={10}
                    paginationRowsPerPageOptions={[10, 25, 50, 100]}
                    highlightOnHover
                    striped
                    responsive
                    persistTableHead
                    noDataComponent={
                        <div className="p-6 text-gray-500">
                            No survey records found.
                        </div>
                    }
                />
            </div>
        </AppSidebarLayout>
    );
}

function Rating({ value }) {
    const rating = Number(value || 0);

    return (
        <span className="font-bold text-yellow-600">
            {rating ? `${rating}/5` : '-'}
        </span>
    );
}