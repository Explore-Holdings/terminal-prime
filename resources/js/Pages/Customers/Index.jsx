import AppSidebarLayout from '@/Layouts/AppSidebarLayout';
import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ pendingAgents = [], customers = [] }) {
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const form = useForm({
        agent_id: '',
        name: '',
        email: '',
        mobile_number: '',
        whatsapp_number: '',
        country: '',
        passport_image: null,
        dropoff_location: '',
        passenger_count: 1,
        language_preference: '',
        status: 'New',
        remarks: '',
    });

    const openCustomerModal = (agent) => {
        setSelectedAgent(agent);

        form.setData({
            agent_id: agent.id,

            // Auto-fill from Agent
            name: agent.name ?? '',
            dropoff_location: agent.dropoff_location ?? '',
            passenger_count: agent.passenger_count ?? 1,

            email: '',
            whatsapp_number: '',
            country: '',
            passport_number: '',

            // Use same passport image
            passport_image: agent.customer_passport,

            language_preference: '',
            status: 'New',
            remarks: agent.remarks ?? '',
        });

        setShowModal(true);
    };

    const saveCustomer = (e) => {
        e.preventDefault();

        form.post('/customers', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setShowModal(false);
                setSelectedAgent(null);
                form.reset();
            },
        });
    };

    return (
        <AppSidebarLayout title="Customers">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Customers
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Pending agent requests are shown below. Add customer details from each agent request.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => router.reload()}
                    className="inline-flex items-center justify-center rounded-lg bg-slate-800 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-900"
                >
                    Refresh
                </button>
            </div>

            <div className="bg-white rounded-xl shadow p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">
                    Pending Agent Requests
                </h2>

                {pendingAgents.length > 0 ? (
                    <div className="space-y-5">
                        {pendingAgents.map((agent) => (
                            <div
                                key={agent.id}
                                className="border rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition"
                            >
                                <div className="flex flex-col lg:flex-row gap-6">

                                    {/* Passport Image */}
                                    <div className="flex-shrink-0">
                                        <ImagePreview path={agent.customer_passport} />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1">

                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-800">
                                                    Agent : {agent.user?.name ?? 'Agent'}
                                                </h3>

                                                <p className="text-sm text-gray-500">
                                                    Customer Request Information
                                                </p>
                                            </div>

                                            <span className="rounded-full bg-yellow-100 text-yellow-700 px-4 py-1 text-xs font-semibold">
                                                {agent.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">
                                                    Customer Name
                                                </p>
                                                <p className="font-semibold">
                                                    {agent.name ?? '-'}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">
                                                    Passenger Count
                                                </p>
                                                <p className="font-semibold">
                                                    {agent.passenger_count ?? '-'}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">
                                                    Price
                                                </p>
                                                <p className="font-semibold text-red-600">
                                                    {agent.currency ?? 'USD'} {Number(agent.price ?? 0).toLocaleString()}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">
                                                    Drop-off Location
                                                </p>
                                                <p className="font-semibold">
                                                    {agent.dropoff_location ?? '-'}
                                                </p>
                                            </div>

                                        </div>

                                        <div className="mt-5 flex justify-end">
                                            <button
                                                onClick={() => openCustomerModal(agent)}
                                                className="bg-blue-700 text-white px-5 py-2 rounded-lg hover:bg-blue-800"
                                            >
                                                Add Customer
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-500">
                        No pending agent requests found.
                    </div>
                )}
            </div>

            <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-semibold mb-4">
                    Added Customers
                </h2>

                <div className="overflow-x-auto">
                    <table className="w-full border">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-2 text-left">Customer Code</th>
                                <th className="border p-2 text-left">Customer</th>
                                <th className="border p-2 text-left">Agent</th>
                                <th className="border p-2 text-left">Country</th>
                                <th className="border p-2 text-left">Passengers</th>
                                <th className="border p-2 text-left">Language</th>
                                <th className="border p-2 text-left">Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {customers.length > 0 ? (
                                customers.map((customer) => (
                                    <tr key={customer.id}>
                                        <td className="border p-2">{customer.customer_code}</td>
                                        <td className="border p-2">
                                            <div className="font-semibold">
                                                {customer.name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {customer.whatsapp_number}
                                            </div>
                                        </td>
                                        <td className="border p-2">
                                            {customer.agent?.user?.name ?? '-'}
                                        </td>
                                        <td className="border p-2">{customer.country ?? '-'}</td>
                                        <td className="border p-2">{customer.passenger_count}</td>
                                        <td className="border p-2">{customer.language_preference ?? '-'}</td>
                                        <td className="border p-2">
                                            <Badge value={customer.status} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="border p-4 text-center text-gray-500">
                                        No customers added yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && selectedAgent && (
                <Modal
                    title="Add Customer"
                    onClose={() => setShowModal(false)}
                >
                    <div className="mb-5 rounded-lg bg-gray-50 border p-4 flex gap-4">
                        <ImagePreview path={selectedAgent.customer_passport} small />

                        <div>
                            <h3 className="font-bold text-gray-800">
                                Agent : {selectedAgent.user?.name ?? 'Agent'}
                            </h3>
                            <p className="text-sm text-gray-500">
                                Currency: {selectedAgent.currency ?? 'USD'} {Number(selectedAgent.price ?? 0).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500">
                                Dropoff Location: {selectedAgent.dropoff_location ?? '-'}
                            </p>
                            <p className="text-sm text-gray-500">
                                Remarks: {selectedAgent.remarks ?? '-'}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={saveCustomer} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            <Field label="Customer Name *" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} error={form.errors.name} />
                            <Field label="Email" type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} error={form.errors.email} />
                            <Field label="Mobile Number" value={form.data.whatsapp_number} onChange={(e) => form.setData('whatsapp_number', e.target.value)} error={form.errors.whatsapp_number} />
                            <Field label="Country" value={form.data.country} onChange={(e) => form.setData('country', e.target.value)} error={form.errors.country} />
                            <Field label="Passenger Count" type="number" value={form.data.passenger_count} onChange={(e) => form.setData('passenger_count', e.target.value)} error={form.errors.passenger_count} />
                            <Field label="Dropoff Location" value={form.data.dropoff_location} onChange={(e) => form.setData('dropoff_location', e.target.value)} error={form.errors.dropoff_location} />

                            <div>
                                <label className="label">Language Preference</label>
                                <select
                                    value={form.data.language_preference}
                                    onChange={(e) => form.setData('language_preference', e.target.value)}
                                    className="input"
                                >
                                    <option value="">Select Language</option>
                                    <option>English</option>
                                    <option>Sinhala</option>
                                    <option>Tamil</option>
                                    <option>Arabic</option>
                                    <option>Chinese</option>
                                    <option>Russian</option>
                                    <option>German</option>
                                    <option>French</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="label">Remarks</label>
                            <textarea
                                value={form.data.remarks}
                                onChange={(e) => form.setData('remarks', e.target.value)}
                                rows="3"
                                className="input"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={form.processing}
                                className="bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
                            >
                                {form.processing ? 'Saving...' : 'Save Customer'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </AppSidebarLayout>
    );
}

function ImagePreview({ path, small = false }) {
    const size = small ? 'w-20 h-14' : 'w-46 h-36';

    if (!path) {
        return (
            <div className={`${size} rounded bg-gray-100 border flex items-center justify-center text-xs text-gray-400`}>
                No Image
            </div>
        );
    }

    return (
        <a href={`/storage/${path}`} target="_blank" rel="noreferrer">
            <img
                src={`/storage/${path}`}
                className={`${size} object-cover rounded border`}
            />
        </a>
    );
}

function Info({ label, value, wide = false }) {
    return (
        <div className={wide ? 'md:col-span-2' : ''}>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="font-semibold text-gray-800">{value}</p>
        </div>
    );
}

function Field({ label, value, onChange, error, type = 'text' }) {
    return (
        <div>
            <label className="label">{label}</label>
            <input type={type} value={value ?? ''} onChange={onChange} className="input" />
            <Error message={error} />
        </div>
    );
}

function Badge({ value }) {
    const colors = {
        New: 'bg-blue-100 text-blue-700',
        Contacted: 'bg-yellow-100 text-yellow-700',
        Quoted: 'bg-purple-100 text-purple-700',
        Confirmed: 'bg-green-100 text-green-700',
        Completed: 'bg-slate-100 text-slate-700',
        Cancelled: 'bg-red-100 text-red-700',
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[value] ?? 'bg-gray-100 text-gray-600'}`}>
            {value ?? 'N/A'}
        </span>
    );
}

function Error({ message }) {
    return message ? <p className="text-red-600 text-sm mt-1">{message}</p> : null;
}

function Modal({ title, children, onClose }) {
    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-7xl max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button onClick={onClose} className="text-red-600 font-bold">✕</button>
                </div>
                {children}
            </div>
        </div>
    );
}