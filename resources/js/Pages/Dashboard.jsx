import AppSidebarLayout from '@/Layouts/AppSidebarLayout';

export default function Dashboard() {
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

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm text-gray-500">
                        Total Drivers
                    </h3>
                    <p className="text-3xl font-bold text-blue-600 mt-2">
                        120
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm text-gray-500">
                        Active Drivers
                    </h3>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                        95
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm text-gray-500">
                        Pending Approval
                    </h3>
                    <p className="text-3xl font-bold text-yellow-500 mt-2">
                        15
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm text-gray-500">
                        Suspended Drivers
                    </h3>
                    <p className="text-3xl font-bold text-red-600 mt-2">
                        10
                    </p>
                </div>

            </div>

            {/* Welcome Card */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-3">
                    Welcome
                </h2>

                <p className="text-gray-600">
                    Use the sidebar menu to manage drivers, registrations,
                    vehicle information, documents, and approvals.
                </p>
            </div>

        </AppSidebarLayout>
    );
}