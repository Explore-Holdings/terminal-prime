import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import AppSidebarLayout from '@/Layouts/AppSidebarLayout';

export default function Index({ surveys = [] }) {
    const [search, setSearch] = useState('');
    const [driverFilter, setDriverFilter] = useState('');

    const drivers = useMemo(() => {
        const map = new Map();

        surveys.forEach((survey) => {
            if (survey.driver?.id) {
                map.set(survey.driver.id, survey.driver.full_name);
            }
        });

        return Array.from(map, ([id, name]) => ({ id, name }));
    }, [surveys]);

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

            const matchesSearch = text.includes(search.toLowerCase());

            const matchesDriver = driverFilter
                ? String(survey.driver?.id) === String(driverFilter)
                : true;

            return matchesSearch && matchesDriver;
        });
    }, [surveys, search, driverFilter]);

    const yesNo = (value) => value ? 'Yes' : 'No';

    const exportCsv = () => {
        const rows = filtered.map((row) => ({
            Trip: row.trip_id ?? '',
            Customer: row.customer?.name ?? '',
            Email: row.customer?.email ?? '',
            Driver: row.driver?.full_name ?? '',
            JourneyRating: row.journey_rating ?? '',
            DriverRating: row.driver_rating ?? '',
            ExtraCharge: yesNo(row.driver_charged_extra),
            ExtraAmount: row.extra_amount ?? '',
            Polite: yesNo(row.driver_was_polite),
            CleanVehicle: yesNo(row.vehicle_was_clean),
            Safe: yesNo(row.felt_safe),
            Comments: row.comments ?? '',
            Date: row.created_at
                ? new Date(row.created_at).toLocaleString()
                : '',
        }));

        const headers = Object.keys(rows[0] ?? {
            Trip: '',
            Customer: '',
            Email: '',
            Driver: '',
            JourneyRating: '',
            DriverRating: '',
            ExtraCharge: '',
            ExtraAmount: '',
            Polite: '',
            CleanVehicle: '',
            Safe: '',
            Comments: '',
            Date: '',
        });

        const csv = [
            headers.join(','),
            ...rows.map((row) =>
                headers.map((header) => {
                    const value = String(row[header] ?? '').replace(/"/g, '""');
                    return `"${value}"`;
                }).join(',')
            ),
        ].join('\n');

        const blob = new Blob([csv], {
            type: 'text/csv;charset=utf-8;',
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = `customer-surveys-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();

        URL.revokeObjectURL(url);
    };

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
            selector: row => row.driver?.first_name + ' ' + row.driver?.last_name ?? '-',
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
                </div>

                <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                    
                    <input type="text" placeholder="Search surveys..." value={search} onChange={(e) => setSearch(e.target.value)} className="md:col-span-2 w-full border border-gray-300 rounded px-4 py-2" />

                    <select value={driverFilter} onChange={(e) => setDriverFilter(e.target.value)} className="w-full border border-gray-300 rounded px-4 py-2" >
                        <option value="">All Drivers</option>
                        {drivers.map((driver) => (
                            <option key={driver.id} value={driver.id}>
                                {driver.name}
                            </option>
                        ))}
                    </select>

                    <div className="flex items-center justify-end gap-3">
                        <div className="text-sm text-gray-600 whitespace-nowrap">
                            Total: <strong>{filtered.length}</strong>
                        </div>

                        <button type="button" onClick={exportCsv} className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 text-sm font-semibold whitespace-nowrap" >
                            Export CSV
                        </button>
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