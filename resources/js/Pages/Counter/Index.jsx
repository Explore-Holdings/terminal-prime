import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    UserPlus,
    CreditCard,
    Car,
    Users,
    CarFront
} from 'lucide-react';

export default function Index({ pendingAgents = [] , vehicles = []  }) {
    return (
        <>
            <Head title="Counter" />

            <div className="min-h-screen bg-gray-100 p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Counter
                        </h1>

                        <p className="text-gray-500 mt-1">
                            Airport counter customer handling
                        </p>
                    </div>

                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg shadow hover:bg-slate-800 transition"
                    >
                        <ArrowLeft size={18} />
                        Back to Dashboard
                    </Link>
                </div>

                <div className="space-y-6">
                    <section className="bg-white rounded-xl shadow p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Users className="text-blue-700" size={22} />

                            <h2 className="text-lg font-bold text-gray-800">
                                Pending Customers
                            </h2>
                        </div>

                        {pendingAgents.length > 0 ? (
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {pendingAgents.map((agent) => (
                                    <CustomerCard key={agent.id} agent={agent} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500">
                                No pending customers found.
                            </div>
                        )}
                    </section>

                    <section className="bg-white rounded-xl shadow p-5 min-h-[300px]">
                        <div className="flex items-center gap-2 mb-4">
                            <CarFront className="text-green-700" size={22} />

                            <h2 className="text-lg font-bold text-gray-800">
                                Vehicles Checked In
                            </h2>
                        </div>

                        {vehicles.length > 0 ? (
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {vehicles.map((vehicle) => (
                                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                                ))}
                            </div>
                        ) : (
                            <div className="h-[220px] rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">
                                No vehicles found
                            </div>
                        )}
                    </section>

                    <section className="bg-white rounded-xl shadow p-5 min-h-[300px]">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">
                            Ongoing Trips
                        </h2>

                        <div className="h-[220px] rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">
                            Blank for now
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

function CustomerCard({ agent }) {
    return (
        <div className="min-w-[300px] border rounded-lg bg-gray-50 p-3 shadow-sm hover:shadow-md transition">
            <h3 className="font-semibold text-sm text-gray-800 truncate">
                {agent.name ?? 'Customer'}
            </h3>

            <p className="text-xs text-gray-600 mt-1 truncate">
                {agent.passenger_count ?? 0} Pax : {agent.dropoff_location ?? '-'}
            </p>

            <div className="flex gap-1 mt-3">
                <button
                    type="button"
                    className="flex-1 inline-flex items-center justify-center gap-1 bg-blue-700 text-white rounded py-1.5 text-[11px] font-medium hover:bg-blue-800"
                >
                    <UserPlus size={13} />
                    Customer
                </button>

               <button
                    type="button"
                    disabled
                    className="flex-1 inline-flex items-center justify-center gap-1 bg-gray-300 text-gray-500 rounded py-1.5 text-[11px] font-medium cursor-not-allowed"
                >
                    <CreditCard size={13} />
                    Payment
                </button>

                <button
                    type="button"
                    disabled
                    className="flex-1 inline-flex items-center justify-center gap-1 bg-gray-300 text-gray-500 rounded py-1.5 text-[11px] font-medium cursor-not-allowed"
                >
                    <Car size={13} />
                    Vehicle
                </button>
            </div>
        </div>
    );
}

function VehicleCard({ vehicle }) {
    const image =
        vehicle.pictures?.front_view ??
        vehicle.front_view ??
        null;

    const languages =
        vehicle.driver?.languages
            ?.map((lang) => lang.language_name)
            .join(', ') || '-';

    return (
        <div className="min-w-[300px] border rounded-lg bg-gray-50 p-3 shadow-sm hover:shadow-md transition">

            <div className="flex gap-3">

                <VehicleImage path={image} />

                <div className="flex-1">

                    <h3 className="font-semibold text-sm text-gray-800 truncate">
                        {vehicle.driver?.full_name ?? 'Driver'} : {vehicle.driver?.mobile_number ?? '-'}
                    </h3>

                    <p className="text-s font-medium text-red-800 truncate mt-1">
                        {vehicle.registration_number ?? '-'}
                    </p>

                    <p className="text-xs text-gray-600 truncate mt-1">
                        {vehicle.vehicle_type ?? '-'} : {vehicle.brand ?? '-'} {vehicle.model ?? ''}
                    </p>

                    <p className="text-xs font-bold text-dark-500 mt-1 truncate" title={languages}>
                        🌐 {languages}
                    </p>

                </div>

            </div>
        </div>
    );
}

function VehicleImage({ path }) {
    if (!path) {
        return (
            <div className="w-32 h-24 rounded-lg bg-gray-100 border flex items-center justify-center text-xs text-gray-400">
                No Image
            </div>
        );
    }

    return (
        <a href={`/storage/${path}`} target="_blank" rel="noreferrer">
            <img
                src={`/storage/${path}`}
                className="w-32 h-24 rounded-lg object-cover border"
            />
        </a>
    );
}