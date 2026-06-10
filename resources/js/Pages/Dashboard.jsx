import AppSidebarLayout from '@/Layouts/AppSidebarLayout';
import { Link, usePage } from '@inertiajs/react';

export default function Dashboard({
    stats = {},
    recentCustomers = [],
    recentDrivers = [],
}) {
    const { props } = usePage();
    const role = String(props.auth?.user?.role ?? '').toLowerCase();

    const canViewCustomers = ['admin', 'counter staff'].includes(role);
    const canViewDrivers = role === 'admin';
    const canViewFinance = ['admin', 'finance'].includes(role);

    return (
        <AppSidebarLayout title="Dashboard">
            <div className="mb-5">
                <h1 className="text-2xl font-bold text-gray-800">
                    Airport Counter Dashboard
                </h1>
                <p className="text-gray-500 mt-1 text-sm">
                    Welcome to the Airport Counter Management System
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {canViewCustomers && (
                    <DashboardCard
                        title="Customers"
                        value={stats.totalCustomers}
                        subtitle="Registered customers"
                        href="/customers"
                        buttonText="Manage"
                        icon="👥"
                        color="text-blue-600"
                        bg="bg-blue-50"
                    />
                )}

                {canViewDrivers && (
                    <DashboardCard
                        title="Drivers"
                        value={stats.totalDrivers}
                        subtitle="Registered drivers"
                        href="/drivers"
                        buttonText="Manage"
                        icon="🚕"
                        color="text-green-600"
                        bg="bg-green-50"
                    />
                )}

                {canViewFinance && (
                    <DashboardCard
                        title="Finance"
                        value={`Rs. ${Number(stats.totalFinance ?? 0).toLocaleString()}`}
                        subtitle="Total finance"
                        href="/finance"
                        buttonText="View"
                        icon="💰"
                        color="text-purple-600"
                        bg="bg-purple-50"
                    />
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {canViewCustomers && (
                    <RecentCard
                        title="Recent Customers"
                        href="/customers"
                        headers={['Name', 'WhatsApp', 'Status']}
                        rows={recentCustomers.map((customer) => [
                            customer.name ?? '-',
                            customer.whatsapp_number ?? '-',
                            <Badge key={customer.id} value={customer.status} />,
                        ])}
                        emptyText="No customers found"
                    />
                )}

                {canViewDrivers && (
                    <RecentCard
                        title="Recent Drivers"
                        href="/drivers"
                        headers={['Reg No', 'Name', 'Status']}
                        rows={recentDrivers.map((driver) => [
                            driver.registration_number ?? '-',
                            driver.full_name ?? '-',
                            <Badge key={driver.id} value={driver.driver_status} />,
                        ])}
                        emptyText="No drivers found"
                    />
                )}
            </div>
        </AppSidebarLayout>
    );
}

function DashboardCard({ title, value, subtitle, href, buttonText, color, bg, icon }) {
    return (
        <Link href={href} className="group block">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between gap-3">
                    <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center text-lg shrink-0`}>
                        {icon}
                    </div>

                    <span className="text-[11px] font-semibold text-gray-400 group-hover:text-gray-700 whitespace-nowrap">
                        View →
                    </span>
                </div>

                <div className="flex items-center justify-between gap-3 mt-3">
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-500 truncate">
                            {title}
                        </p>

                        <p className={`text-xl font-bold leading-tight ${color}`}>
                            {value ?? 0}
                        </p>
                    </div>

                    <span className="bg-slate-900 text-white px-3 py-1 text-xs font-medium group-hover:bg-blue-600 transition whitespace-nowrap">
                        {buttonText}
                    </span>
                </div>

                <p className="text-[11px] text-gray-400 mt-1 truncate">
                    {subtitle}
                </p>
            </div>
        </Link>
    );
}

function RecentCard({ title, href, headers, rows, emptyText }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition">
            <div className="flex justify-between items-center mb-3">
                <div>
                    <h2 className="text-lg font-bold text-gray-800">{title}</h2>
                    <p className="text-xs text-gray-500">Latest records</p>
                </div>

                <Link
                    href={href}
                    className="bg-blue-50 text-blue-700 px-3 py-1.5 hover:bg-blue-600 hover:text-white text-xs font-semibold transition"
                >
                    View All
                </Link>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50">
                            {headers.map((header) => (
                                <th
                                    key={header}
                                    className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {rows.length > 0 ? (
                            rows.map((row, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className="border-t hover:bg-blue-50/50 transition"
                                >
                                    {row.map((cell, cellIndex) => (
                                        <td key={cellIndex} className="px-4 py-2 text-gray-700">
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={headers.length}
                                    className="p-4 text-center text-gray-500"
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
            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                colors[value] ?? 'bg-gray-100 text-gray-600'
            }`}
        >
            {value ?? 'N/A'}
        </span>
    );
}