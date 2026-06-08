import { Head, Link } from '@inertiajs/react';
import AppSidebarLayout from '@/Layouts/AppSidebarLayout';

export default function Index({ customers = [] }) {
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

    return (
        <AppSidebarLayout title="Customers">
            <Head title="Customers" />

            <div className="min-h-screen bg-gray-100 p-0">
                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex justify-between items-center mb-5">
                        <h1 className="text-2xl font-bold text-gray-800">
                            Customers
                        </h1>

                        <Link
                            href="/counter"
                            className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
                        >
                            Back to Counter
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border px-3 py-2 text-left">Code</th>
                                    <th className="border px-3 py-2 text-left">Name</th>
                                    <th className="border px-3 py-2 text-left">Email</th>
                                    <th className="border px-3 py-2 text-left">WhatsApp</th>
                                    <th className="border px-3 py-2 text-left">Country</th>
                                    <th className="border px-3 py-2 text-left">Dropoff</th>
                                    <th className="border px-3 py-2 text-left">Agent</th>
                                    <th className="border px-3 py-2 text-left">Payment</th>
                                    <th className="border px-3 py-2 text-left">Status</th>
                                    <th className="border px-3 py-2 text-left">Created</th>
                                </tr>
                            </thead>

                            <tbody>
                                {customers.length > 0 ? (
                                    customers.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-gray-50">
                                            <td className="border px-3 py-2 font-semibold">
                                                {customer.customer_code ?? '-'}
                                            </td>

                                            <td className="border px-3 py-2">
                                                {customer.name ?? '-'}
                                            </td>

                                            <td className="border px-3 py-2">
                                                {customer.email ?? '-'}
                                            </td>

                                            <td className="border px-3 py-2">
                                                {customer.whatsapp_number ?? '-'}
                                            </td>

                                            <td className="border px-3 py-2">
                                                {customer.country ?? '-'}
                                            </td>

                                            <td className="border px-3 py-2">
                                                {customer.dropoff_location ?? '-'}
                                            </td>

                                            <td className="border px-3 py-2">
                                                {customer.agent?.user?.name ?? '-'}
                                            </td>

                                            <td className="border px-3 py-2">
                                                {customer.payment_status ?? 'Unpaid'}
                                            </td>

                                            <td className="border px-3 py-2">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${badge(customer.status)}`}>
                                                    {customer.status ?? 'New'}
                                                </span>
                                            </td>

                                            <td className="border px-3 py-2">
                                                {customer.created_at
                                                    ? new Date(customer.created_at).toLocaleDateString()
                                                    : '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="10" className="text-center py-8 text-gray-500">
                                            No customers found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppSidebarLayout>
    );
}