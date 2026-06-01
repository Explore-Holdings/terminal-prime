import AppSidebarLayout from '@/Layouts/AppSidebarLayout';
import { Link } from '@inertiajs/react';

export default function Dashboard({ stats = {}, recentDrivers = [] }) {
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Drivers"
                    value={stats.totalDrivers}
                    color="text-blue-600"
                />

                <StatCard
                    title="Active Drivers"
                    value={stats.activeDrivers}
                    color="text-green-600"
                />

                <StatCard
                    title="Pending Approval"
                    value={stats.pendingApproval}
                    color="text-yellow-500"
                />

                <StatCard
                    title="Suspended Drivers"
                    value={stats.suspendedDrivers}
                    color="text-red-600"
                />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-xl font-semibold">
                            Recent Drivers
                        </h2>
                        <p className="text-sm text-gray-500">
                            Latest registered drivers
                        </p>
                    </div>

                    <Link
                        href="/drivers"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        View All
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-2 text-left">Reg No</th>
                                <th className="border p-2 text-left">Name</th>
                                <th className="border p-2 text-left">Phone</th>
                                <th className="border p-2 text-left">Driver Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {recentDrivers.length > 0 ? (
                                recentDrivers.map((driver) => (
                                    <tr key={driver.id} className="hover:bg-gray-50">
                                        <td className="border p-2">
                                            {driver.registration_number ?? '-'}
                                        </td>

                                        <td className="border p-2">
                                            {driver.full_name ?? '-'}
                                        </td>

                                        <td className="border p-2">
                                            {driver.mobile_number ?? '-'}
                                        </td>

                                        <td className="border p-2">
                                            <Badge value={driver.driver_status} />
                                        </td>

                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="border p-4 text-center text-gray-500"
                                    >
                                        No drivers found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </AppSidebarLayout>
    );
}

function StatCard({ title, value, color }) {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm text-gray-500">
                {title}
            </h3>

            <p className={`text-3xl font-bold mt-2 ${color}`}>
                {value ?? 0}
            </p>
        </div>
    );
}

function Badge({ value }) {
    const colors = {
        Active: 'bg-green-100 text-green-700',
        Inactive: 'bg-gray-100 text-gray-600',
        Pending: 'bg-yellow-100 text-yellow-700',
        Approved: 'bg-blue-100 text-blue-700',
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