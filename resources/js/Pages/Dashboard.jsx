
import { Link } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Airport Counter Dashboard</h1>

                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-semibold mb-4">Welcome</h2>

                    <Link
                        href="/drivers"
                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Manage Drivers
                    </Link>
                </div>
            </div>
        </div>
    );
}