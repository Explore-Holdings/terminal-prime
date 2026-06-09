import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppSidebarLayout from '@/Layouts/AppSidebarLayout';

export default function Index({ trips = [] }) {
    const [selectedTrip, setSelectedTrip] = useState(null);

    return (
        <AppSidebarLayout title="Finance">
            <Head title="Finance" />

            <div className="bg-white rounded-xl shadow p-6">
                <h1 className="text-2xl font-bold mb-5">Finance Settlements</h1>

                <div className="overflow-x-auto">
                    <table className="w-full border text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2">Trip</th>
                                <th className="border p-2">Customer</th>
                                <th className="border p-2">Agent</th>
                                <th className="border p-2">Driver</th>
                                <th className="border p-2">Trip Amount</th>
                                <th className="border p-2">Driver Share</th>
                                <th className="border p-2">Agent Share</th>
                                <th className="border p-2">Company Share</th>
                                <th className="border p-2">Status</th>
                                <th className="border p-2">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {trips.map((trip) => {
                                const amount = trip.customer?.paid_amount ?? 0;
                                const currency =
                                    trip.customer?.agent?.new_currency ??
                                    trip.customer?.agent?.currency ??
                                    'LKR';

                                return (
                                    <tr key={trip.id}>
                                        <td className="border p-2">#{trip.id}</td>
                                        <td className="border p-2">{trip.customer?.name ?? '-'}</td>
                                        <td className="border p-2">{trip.agent?.user?.name ?? '-'}</td>
                                        <td className="border p-2">{trip.driver?.full_name ?? '-'}</td>

                                        <td className="border p-2 font-bold">
                                            {currency} {Number(amount).toLocaleString()}
                                        </td>

                                        <td className="border p-2">
                                            {currency} {Number(trip.finance?.driver_amount ?? 0).toLocaleString()}
                                        </td>

                                        <td className="border p-2">
                                            {currency} {Number(trip.finance?.agent_amount ?? 0).toLocaleString()}
                                        </td>

                                        <td className="border p-2">
                                            {currency} {Number(trip.finance?.company_amount ?? 0).toLocaleString()}
                                        </td>

                                        <td className="border p-2">
                                            {trip.finance?.status ?? 'Pending'}
                                        </td>

                                        <td className="border p-2">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedTrip(trip)}
                                                className="bg-blue-700 text-white px-3 py-1 rounded"
                                            >
                                                Settle
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedTrip && (
                <SettlementModal
                    trip={selectedTrip}
                    onClose={() => setSelectedTrip(null)}
                />
            )}
        </AppSidebarLayout>
    );
}

function SettlementModal({ trip, onClose }) {
    const amount = Number(trip.customer?.paid_amount ?? 0);
    const currency =
        trip.customer?.agent?.new_currency ??
        trip.customer?.agent?.currency ??
        'LKR';

    const form = useForm({
        driver_amount: trip.finance?.driver_amount ?? '',
        agent_amount: trip.finance?.agent_amount ?? '',
        company_amount: trip.finance?.company_amount ?? '',
        expense_amount: trip.finance?.expense_amount ?? 0,
        remarks: trip.finance?.remarks ?? '',
    });

    const totalShared =
        Number(form.data.driver_amount || 0) +
        Number(form.data.agent_amount || 0) +
        Number(form.data.company_amount || 0) +
        Number(form.data.expense_amount || 0);

    const submit = (e) => {
        e.preventDefault();

        if (totalShared !== amount) {
            alert('Driver + Agent + Company + Expenses must equal trip amount.');
            return;
        }

        form.post(`/finance/${trip.id}`, {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
                <div className="flex justify-between border-b p-5">
                    <h2 className="text-xl font-bold">Settle Trip #{trip.id}</h2>

                    <button onClick={onClose} className="text-red-600 font-bold">
                        Close
                    </button>
                </div>

                <form onSubmit={submit} className="p-5 space-y-4">
                    <div className="bg-gray-100 rounded p-3">
                        <p><strong>Customer:</strong> {trip.customer?.name}</p>
                        <p><strong>Agent:</strong> {trip.agent?.user?.name}</p>
                        <p><strong>Driver:</strong> {trip.driver?.full_name}</p>
                        <p>
                            <strong>Trip Amount:</strong> {currency} {amount.toLocaleString()}
                        </p>
                    </div>

                    <Input label="Driver Share" value={form.data.driver_amount} onChange={(e) => form.setData('driver_amount', e.target.value)} />
                    <Input label="Agent Share" value={form.data.agent_amount} onChange={(e) => form.setData('agent_amount', e.target.value)} />
                    <Input label="Company Share" value={form.data.company_amount} onChange={(e) => form.setData('company_amount', e.target.value)} />
                    <Input label="Extra Expenses" value={form.data.expense_amount} onChange={(e) => form.setData('expense_amount', e.target.value)} />

                    <div>
                        <label className="label">Remarks</label>
                        <textarea
                            className="input"
                            rows="3"
                            value={form.data.remarks}
                            onChange={(e) => form.setData('remarks', e.target.value)}
                        />
                    </div>

                    <div className={`p-3 rounded font-bold ${
                        totalShared === amount
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                    }`}>
                        Total Shared: {currency} {totalShared.toLocaleString()}
                    </div>

                    <button
                        disabled={form.processing}
                        className="w-full bg-green-700 text-white py-2 rounded font-bold disabled:opacity-50"
                    >
                        {form.processing ? 'Saving...' : 'Save Settlement'}
                    </button>
                </form>
            </div>
        </div>
    );
}

function Input({ label, value, onChange }) {
    return (
        <div>
            <label className="label">{label}</label>
            <input
                type="number"
                value={value}
                onChange={onChange}
                className="input"
            />
        </div>
    );
}