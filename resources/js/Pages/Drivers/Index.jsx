import { Link } from '@inertiajs/react';

export default function Index({ drivers }) {
    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow">
                <div className="flex justify-between mb-6">
                    <h1 className="text-2xl font-bold">Drivers</h1>

                    <div className="flex gap-2">
                        <Link
                            href={route('dashboard')}
                            className="bg-gray-600 text-white px-4 py-2 rounded"
                        >
                            Dashboard
                        </Link>

                        <Link
                            href="/drivers/create"
                            className="bg-blue-600 text-white px-4 py-2 rounded"
                        >
                            Add Driver
                        </Link>
                    </div>
                </div>

                <table className="w-full border">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border p-2">Name</th>
                            <th className="border p-2">Phone</th>
                            <th className="border p-2">License No</th>
                            <th className="border p-2">NIC</th>
                            <th className="border p-2">Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        {drivers.map((driver) => (
                            <tr key={driver.id}>
                                <td className="border p-2">{driver.name}</td>
                                <td className="border p-2">{driver.phone}</td>
                                <td className="border p-2">{driver.license_number}</td>
                                <td className="border p-2">{driver.nic}</td>
                                <td className="border p-2">{driver.address}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}