import AppSidebarLayout from '@/Layouts/AppSidebarLayout';
import { Link } from '@inertiajs/react';

export default function Dashboard({ stats = {}, recentCustomers = [], recentDrivers = [] }) {
    return (
        <AppSidebarLayout title="Dashboard">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    Airport Counter Dashboard
                </h1>
                <p className="text-gray-500 mt-1">
                    Welcome to the Airport Counter Management System
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <DashboardCard
                    title="Customers"
                    value={stats.totalCustomers}
                    subtitle="Total registered customers"
                    href="/customers"
                    buttonText="Manage Customers"
                    color="text-blue-600"
                />

                <DashboardCard
                    title="Drivers"
                    value={stats.totalDrivers}
                    subtitle="Total registered drivers"
                    href="/drivers"
                    buttonText="Manage Drivers"
                    color="text-green-600"
                />

                <DashboardCard
                    title="Finance"
                    value={`Rs. ${Number(stats.totalFinance ?? 0).toLocaleString()}`}
                    subtitle="Total recorded finance"
                    href="/finance"
                    buttonText="View Finance"
                    color="text-purple-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentCard
                    title="Recent Customers"
                    href="/customers"
                    headers={['Name', 'WhatsApp', 'Status']}
                    rows={recentCustomers.map((customer) => [
                        customer.name ?? '-',
                        customer.whatsapp_number ?? '-',
                        <Badge value={customer.status} />,
                    ])}
                    emptyText="No customers found"
                />

                <RecentCard
                    title="Recent Drivers"
                    href="/drivers"
                    headers={['Reg No', 'Name', 'Status']}
                    rows={recentDrivers.map((driver) => [
                        driver.registration_number ?? '-',
                        driver.full_name ?? '-',
                        <Badge value={driver.driver_status} />,
                    ])}
                    emptyText="No drivers found"
                />
            </div>
        </AppSidebarLayout>
    );
}

function DashboardCard({ title, value, subtitle, href, buttonText, color }) {
    return (
        <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
            <p className="text-sm font-semibold text-gray-500">{title}</p>

            <p className={`text-4xl font-bold mt-3 ${color}`}>
                {value ?? 0}
            </p>

            <p className="text-sm text-gray-500 mt-2">
                {subtitle}
            </p>

            <Link
                href={href}
                className="inline-block mt-5 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800"
            >
                {buttonText}
            </Link>
        </div>
    );
}

function RecentCard({ title, href, headers, rows, emptyText }) {
    return (
        <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <p className="text-sm text-gray-500">Latest records</p>
                </div>

                <Link
                    href={href}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                >
                    View All
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border">
                    <thead>
                        <tr className="bg-gray-100">
                            {headers.map((header) => (
                                <th key={header} className="border p-2 text-left">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {rows.length > 0 ? (
                            rows.map((row, rowIndex) => (
                                <tr key={rowIndex} className="hover:bg-gray-50">
                                    {row.map((cell, cellIndex) => (
                                        <td key={cellIndex} className="border p-2">
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={headers.length}
                                    className="border p-4 text-center text-gray-500"
                                >
                                    {emptyText}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function Badge({ value }) {
    const colors = {
        Active: 'bg-green-100 text-green-700',
        Inactive: 'bg-gray-100 text-gray-600',
        Pending: 'bg-yellow-100 text-yellow-700',
        New: 'bg-blue-100 text-blue-700',
        Confirmed: 'bg-green-100 text-green-700',
        Completed: 'bg-purple-100 text-purple-700',
        Cancelled: 'bg-red-100 text-red-700',
        Suspended: 'bg-red-100 text-red-700',
        Rejected: 'bg-gray-200 text-gray-700',
    };

    return (
        <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                colors[value] ?? 'bg-gray-100 text-gray-600'
            }`}
        >
            {value ?? 'N/A'}
        </span>
    );
}