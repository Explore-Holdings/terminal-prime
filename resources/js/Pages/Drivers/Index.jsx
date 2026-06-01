import { Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import AppSidebarLayout from '@/Layouts/AppSidebarLayout';

export default function Index({ drivers = [] }) {
    const [search, setSearch] = useState('');

    const filteredDrivers = useMemo(() => {
        return drivers.filter((driver) => {
            const text = `
                ${driver.full_name ?? ''}
                ${driver.first_name ?? ''}
                ${driver.last_name ?? ''}
                ${driver.email ?? ''}
                ${driver.mobile_number ?? ''}
                ${driver.nic_number ?? ''}
                ${driver.driver_status ?? ''}
                ${driver.registration_status ?? ''}
            `.toLowerCase();

            return text.includes(search.toLowerCase());
        });
    }, [drivers, search]);

    const columns = [
        {
            name: 'Reg No',
            selector: row => row.registration_number ?? '-',
            sortable: true,
        },
        {
            name: 'Name',
            selector: row => row.full_name ?? `${row.first_name ?? ''} ${row.last_name ?? ''}`,
            sortable: true,
            wrap: true,
        },
        {
            name: 'Email',
            selector: row => row.email ?? '-',
            sortable: true,
            wrap: true,
        },
        {
            name: 'Phone',
            selector: row => row.mobile_number ?? '-',
            sortable: true,
        },
        {
            name: 'NIC',
            selector: row => row.nic_number ?? '-',
            sortable: true,
        },
        {
            name: 'City',
            selector: row => row.city ?? '-',
            sortable: true,
        },
        {
            name: 'Status',
            cell: row => (
                <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        row.driver_status === 'Active'
                            ? 'bg-green-100 text-green-700'
                            : row.driver_status === 'Suspended'
                            ? 'bg-red-100 text-red-700'
                            : row.driver_status === 'Rejected'
                            ? 'bg-gray-200 text-gray-700'
                            : 'bg-yellow-100 text-yellow-700'
                    }`}
                >
                    {row.driver_status ?? 'Inactive'}
                </span>
            ),
            sortable: true,
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="flex gap-2">
                    <Link
                        href={`/drivers/${row.id}`}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                    >
                        View
                    </Link>

                    <Link
                        href={`/drivers/${row.id}/edit`}
                        className="bg-yellow-500 text-white px-3 py-1 rounded text-xs hover:bg-yellow-600"
                    >
                        Edit
                    </Link>
                </div>
            ),
        },
    ];

    const customStyles = {
        headCells: {
            style: {
                fontWeight: '700',
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
        <AppSidebarLayout>
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-7xl mx-auto bg-white p-6 rounded shadow">

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Drivers
                        </h1>
                        <p className="text-sm text-gray-500">
                            Manage registered drivers
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Link
                            href={route('dashboard')}
                            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                        >
                            Dashboard
                        </Link>

                        <Link
                            href="/drivers/create"
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Add Driver
                        </Link>
                    </div>
                </div>

                <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <input
                        type="text"
                        placeholder="Search drivers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full md:w-96 border border-gray-300 rounded px-4 py-2"
                    />

                    <div className="text-sm text-gray-600">
                        Total Drivers: <strong>{filteredDrivers.length}</strong>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={filteredDrivers}
                    pagination
                    highlightOnHover
                    striped
                    responsive
                    persistTableHead
                    customStyles={customStyles}
                    noDataComponent={
                        <div className="p-6 text-gray-500">
                            No drivers found
                        </div>
                    }
                />
            </div>
        </div>
        </AppSidebarLayout>
    );
}