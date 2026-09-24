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
            const text = [
                customer.customer_code,
                customer.name,
                customer.email,
                customer.country,
                customer.dropoff_location,
                customer.agent?.user?.name,
                customer.payment_status,
                customer.status,
                customer.invoice_number,
            ].join(' ').toLowerCase();

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

    const columns = [
        {
            name: 'Code',
            selector: row => row.customer_code ?? '-',
            sortable: true,
            width: '130px',
            cell: row => (
                <span className="font-semibold">
                    {row.customer_code ?? '-'}
                </span>
            ),
        },
        {
            name: 'Customer',
            selector: row => row.name ?? '-',
            sortable: true,
            wrap: true,
            cell: row => (
                <div>
                    <div className="font-medium">{row.name ?? '-'}</div>
                    <div className="text-xs text-gray-500">{row.email ?? '-'}</div>
                </div>
            ),
        },
        {
            name: 'Country',
            selector: row => row.country ?? '-',
            sortable: true,
        },
        {
            name: 'Dropoff',
            selector: row => row.dropoff_location ?? '-',
            sortable: true,
            wrap: true,
        },
        {
            name: 'Agent',
            selector: row => row.agent?.user?.name ?? '-',
            sortable: true,
        },
        {
            name: 'Payment',
            selector: row => row.payment_status ?? 'Unpaid',
            sortable: true,
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
            cell: row => (
                row.invoice_path ? (
                    <a
                        href={row.invoice_path}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-blue-700 text-white px-3 py-1 rounded text-xs hover:bg-blue-800"
                    >
                        View Invoice
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

                        {!isReadOnly && (
                            <Link
                                href="/counter"
                                className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
                            >
                                Back to Counter
                            </Link>
                        )}
                    </div>

                    <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <input
                            type="text"
                            placeholder="Search customers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full md:w-96 border border-gray-300 rounded px-4 py-2"
                        />

                        <div className="text-sm text-gray-600">
                            Total Customers: <strong>{filteredCustomers.length}</strong>
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