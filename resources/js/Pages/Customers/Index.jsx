import { Head, Link, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import AppSidebarLayout from '@/Layouts/AppSidebarLayout';

export default function Index({ customers = [] }) {
    const { auth } = usePage().props;
    const isReadOnly = auth?.user?.isExecutiveStaff ?? false;
    const [search, setSearch] = useState('');

    const filteredCustomers = useMemo(() => {
        return customers.filter((customer) => {
            const vehicleNo = customer.agent?.external_vehicle_reg || customer.latest_trip?.driver?.vehicle?.registration_number;
            const driver = customer.latest_trip?.driver;
            const driverName = driver ? ([driver.first_name, driver.last_name].filter(Boolean).join(' ') || driver.full_name) : null;
            const driverNo = driver?.registration_number;
            const bookingType = customer.agent?.booking_type;

            const text = [
                customer.customer_code,
                customer.name,
                customer.email,
                customer.country,
                customer.dropoff_location,
                customer.agent?.user?.name,
                bookingType,
                driverNo,
                driverName,
                driver?.first_name,
                driver?.last_name,
                vehicleNo,
                customer.payment_status,
                customer.status,
                customer.invoice_number,
            ].filter(Boolean).join(' ').toLowerCase();

            return text.includes(search.toLowerCase());
        });
    }, [customers, search]);

    const badge = (status) => {
        const colors = {
            New: 'bg-blue-100 text-blue-700',
            Paid: 'bg-green-100 text-green-700',
            Pending: 'bg-yellow-100 text-yellow-700',
            Assigned: 'bg-purple-100 text-purple-700',
            Completed: 'bg-gray-100 text-gray-700',
        };

        return colors[status] ?? 'bg-slate-100 text-slate-700';
    };

    const typeBadgeClass = (type) => {
        switch (type) {
            case 'Transfer':
                return 'bg-blue-50 text-blue-700 border border-blue-200';
            case 'Tour':
            case 'Tours':
                return 'bg-purple-50 text-purple-700 border border-purple-200';
            case 'Rent a Car':
                return 'bg-amber-50 text-amber-800 border border-amber-200';
            default:
                return 'bg-gray-50 text-gray-700 border border-gray-200';
        }
    };

    const columns = [
        {
            name: 'Code',
            selector: row => row.customer_code ?? '-',
            sortable: true,
            width: '120px',
            cell: row => (
                <span className="font-semibold text-gray-900">
                    {row.customer_code ?? '-'}
                </span>
            ),
        },
        {
            name: 'Customer',
            selector: row => row.name ?? '-',
            sortable: true,
            wrap: true,
            minWidth: '160px',
            cell: row => (
                <div>
                    <div className="font-medium text-gray-900">{row.name ?? '-'}</div>
                    <div className="text-xs text-gray-500">{row.email ?? '-'}</div>
                </div>
            ),
        },
        {
            name: 'Type',
            selector: row => row.agent?.booking_type ?? '-',
            sortable: true,
            width: '120px',
            cell: row => {
                const type = row.agent?.booking_type;
                if (!type) return <span className="text-gray-400 text-xs">-</span>;
                return (
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${typeBadgeClass(type)}`}>
                        {type}
                    </span>
                );
            },
        },
        {
            name: 'Driver & Vehicle',
            selector: row => {
                const driver = row.latest_trip?.driver;
                const dName = [driver?.first_name, driver?.last_name].filter(Boolean).join(' ') || driver?.full_name || '';
                const vReg = row.agent?.external_vehicle_reg || driver?.vehicle?.registration_number || '';
                return `${dName} ${vReg}`;
            },
            sortable: true,
            minWidth: '170px',
            cell: row => {
                const driver = row.latest_trip?.driver;
                const driverName = driver
                    ? ([driver.first_name, driver.last_name].filter(Boolean).join(' ') || driver.full_name || null)
                    : null;
                const vehReg = row.agent?.external_vehicle_reg || driver?.vehicle?.registration_number;

                if (!driverName && !vehReg) {
                    return <span className="text-gray-400 text-xs">-</span>;
                }

                return (
                    <div className="py-1">
                        {driverName ? (
                            <div className="font-semibold text-gray-800 text-xs leading-tight">
                                {driverName}
                                {driver?.registration_number && (
                                    <span className="text-[11px] text-gray-500 ml-1 font-normal">
                                        ({driver.registration_number})
                                    </span>
                                )}
                            </div>
                        ) : (
                            <div className="text-xs text-gray-400 italic">No Driver</div>
                        )}
                        {vehReg ? (
                            <div className="mt-0.5">
                                <span className="inline-block px-1.5 py-0.5 font-mono text-[11px] font-semibold bg-gray-100 text-gray-800 rounded border border-gray-300">
                                    {vehReg}
                                </span>
                            </div>
                        ) : null}
                    </div>
                );
            },
        },
        {
            name: 'Country',
            selector: row => row.country ?? '-',
            sortable: true,
            width: '110px',
        },
        {
            name: 'Dropoff',
            selector: row => row.dropoff_location ?? '-',
            sortable: true,
            wrap: true,
            minWidth: '150px',
        },
        {
            name: 'Agent',
            selector: row => row.agent?.user?.name ?? '-',
            sortable: true,
            minWidth: '120px',
        },
        {
            name: 'Payment',
            selector: row => row.payment_status ?? 'Unpaid',
            sortable: true,
            width: '110px',
            cell: row => (
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                    row.payment_status === 'Paid'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                }`}>
                    {row.payment_status ?? 'Unpaid'}
                </span>
            ),
        },
        // {
        //     name: 'Status',
        //     selector: row => row.status ?? 'New',
        //     sortable: true,
        //     cell: row => (
        //         <span className={`px-2 py-1 rounded text-xs font-bold ${badge(row.status)}`}>
        //             {row.status ?? 'New'}
        //         </span>
        //     ),
        // },
        {
            name: 'Invoice',
            selector: row => row.invoice_number ?? '-',
            sortable: true,
            width: '120px',
            cell: row => (
                row.invoice_path ? (
                    <a
                        href={row.invoice_path}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-blue-700 text-white px-3 py-1 rounded text-xs hover:bg-blue-800"
                    >
                        View
                    </a>
                ) : (
                    <span className="text-gray-400 text-xs">No Invoice</span>
                )
            ),
        },
        {
            name: 'Created',
            selector: row => row.created_at ?? '',
            sortable: true,
            width: '110px',
            cell: row =>
                row.created_at
                    ? new Date(row.created_at).toLocaleDateString()
                    : '-',
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

    const exportToCSV = () => {
        const headers = [
            'Code',
            'Customer Name',
            'Email',
            'Type',
            'Driver Name',
            'Driver Reg No',
            'Vehicle Reg No',
            'Country',
            'Dropoff Location',
            'Agent',
            'Payment Status',
            'Invoice Number',
            'Created Date',
        ];

        const rows = filteredCustomers.map((c) => {
            const driver = c.latest_trip?.driver;
            const driverName = driver
                ? ([driver.first_name, driver.last_name].filter(Boolean).join(' ') || driver.full_name || '')
                : '';
            const driverReg = driver?.registration_number || '';
            const vehReg = c.agent?.external_vehicle_reg || driver?.vehicle?.registration_number || '';
            const createdDate = c.created_at ? new Date(c.created_at).toLocaleDateString() : '';

            return [
                c.customer_code || '',
                c.name || '',
                c.email || '',
                c.agent?.booking_type || '',
                driverName,
                driverReg,
                vehReg,
                c.country || '',
                c.dropoff_location || '',
                c.agent?.user?.name || '',
                c.payment_status || 'Unpaid',
                c.invoice_number || '',
                createdDate,
            ];
        });

        const csvContent = [
            headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','),
            ...rows.map(row =>
                row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
            ),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `customers_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <AppSidebarLayout title="Customers">
            <Head title="Customers" />

            <div className="min-h-screen bg-gray-100 p-0">
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <div className="flex justify-between items-center p-4 border-b">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                Customers
                            </h1>

                            <p className="text-sm text-gray-500 mt-1">
                                View all customers and invoice details
                            </p>
                        </div>
                    </div>

                    <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <input
                            type="text"
                            placeholder="Search customers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full md:w-96 border border-gray-300 rounded px-4 py-2"
                        />

                        <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-600">
                                Total Customers: <strong>{filteredCustomers.length}</strong>
                            </div>

                            <button
                                type="button"
                                onClick={exportToCSV}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded text-sm font-semibold shadow-sm transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Export CSV
                            </button>
                        </div>
                    </div>

                    <DataTable
                        columns={columns}
                        data={filteredCustomers}
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
                                No customers found.
                            </div>
                        }
                    />
                </div>
            </div>
        </AppSidebarLayout>
    );
}