import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeft,
    UserPlus,
    CreditCard,
    Car,
    Users,
    CarFront,
    Trash2,
} from 'lucide-react';


export default function Index({ pendingAgents = [], vehicles = [], createdCustomerId: serverCustomerId = null }) {
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState('customer');
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [createdCustomerId, setCreatedCustomerId] = useState(null);
    
    const form = useForm({
        agent_id: '',
        name: '',
        email: '',
        mobile_number: '',
        whatsapp_number: '',
        country: '',
        dropoff_location: '',
        passenger_count: 1,
        language_preference: '',
        status: 'New',
        remarks: '',
    });

    const openCustomerModal = (agent) => {
        setSelectedAgent(agent);
        setActiveTab('customer');

        form.setData({
            agent_id: agent.id,
            name: agent.name ?? '',
            email: '',
            mobile_number: '',
            whatsapp_number: '',
            country: '',
            dropoff_location: agent.dropoff_location ?? '',
            passenger_count: agent.passenger_count ?? 1,
            language_preference: '',
            status: 'New',
            remarks: agent.remarks ?? '',
        });

        setShowModal(true);
    };

    const saveCustomer = (e) => {
        e.preventDefault();

        form.post('/customers', {
            preserveScroll: true,

            onSuccess: (page) => {
                console.log('Customer Save Success');
                console.log(page.props);

                const id = page.props.createdCustomerId;

                console.log('created customer id:', id);

                setCreatedCustomerId(id);
                setActiveTab('payment');
            },

            onError: (errors) => {
                console.error(errors);
            },
        });
    };

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
                                    <CustomerCard
                                        key={agent.id}
                                        agent={agent}
                                        onCustomerClick={openCustomerModal}
                                    />
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

            {showModal && selectedAgent && (
                <CounterModal
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    selectedAgent={selectedAgent}
                    form={form}
                    saveCustomer={saveCustomer}
                    createdCustomerId={createdCustomerId}
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    );
}

function CustomerCard({ agent, onCustomerClick }) {
    return (
        <div className="min-w-[300px] border rounded-lg bg-gray-50 p-3 shadow-sm hover:shadow-md transition">
            <h3 className="flex justify-between items-center font-semibold text-sm text-gray-800">
                <span className="truncate">{agent.name ?? 'Customer'}</span>

                <span className="ml-2 whitespace-nowrap text-red-600 font-bold">
                    {agent.distance_km ?? '-'} KM
                </span>
            </h3>

            <p className="text-xs text-gray-600 mt-1 truncate">
                {agent.passenger_count ?? 0} Pax : {agent.luggage_count ?? 0} Luggage : {agent.dropoff_location ?? '-'}
            </p>

            <div className="flex gap-1 mt-3">
                <button
                    type="button"
                    onClick={() => onCustomerClick(agent)}
                    className="flex-1 inline-flex items-center justify-center gap-1 bg-blue-700 text-white rounded py-1.5 text-[11px] font-medium hover:bg-blue-800"
                >
                    <UserPlus size={13} />
                    Customer
                </button>

                <button
                    type="button"
                    disabled
                    title="Complete customer first"
                    className="flex-1 inline-flex items-center justify-center gap-1 bg-gray-300 text-gray-500 rounded py-1.5 text-[11px] font-medium cursor-not-allowed"
                >
                    <CreditCard size={13} />
                    Payment
                </button>

                <button
                    type="button"
                    disabled
                    title="Complete customer first"
                    className="flex-1 inline-flex items-center justify-center gap-1 bg-gray-300 text-gray-500 rounded py-1.5 text-[11px] font-medium cursor-not-allowed"
                >
                    <Car size={13} />
                    Vehicle
                </button>
            </div>
        </div>
    );
}

function CounterModal({
    activeTab,
    setActiveTab,
    selectedAgent,
    form,
    saveCustomer,
    createdCustomerId,
    onClose,
}) {
    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-7xl max-h-[92vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b px-6 py-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            Customer Processing
                        </h2>

                        <p className="text-sm text-gray-500">
                            {selectedAgent?.name} · {selectedAgent?.passenger_count ?? 0} Pax · {selectedAgent?.luggage_count ?? 0} Luggage · {selectedAgent?.dropoff_location ?? '-'}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-red-600 font-semibold hover:text-red-800"
                    >
                        Close
                    </button>
                </div>

                <div className="flex border-b">
                    <TabButton
                        active={activeTab === 'customer'}
                        onClick={() => setActiveTab('customer')}
                    >
                        Customer
                    </TabButton>

                    <TabButton
                        active={activeTab === 'payment'}
                        onClick={() => setActiveTab('payment')}
                    >
                        Payment
                    </TabButton>

                    <TabButton
                        active={activeTab === 'vehicle'}
                        onClick={() => setActiveTab('vehicle')}
                    >
                        Vehicle
                    </TabButton>
                </div>

                <div className="p-6 min-h-[500px]">
                    {activeTab === 'customer' && (
                        <CustomerTab
                            agent={selectedAgent}
                            form={form}
                            saveCustomer={saveCustomer}
                        />
                    )}

                    {activeTab === 'payment' && (
                        <PaymentTab
                            agent={selectedAgent}
                            customerId={createdCustomerId}
                            setActiveTab={setActiveTab}
                        />
                    )}

                    {activeTab === 'vehicle' && (
                        <VehicleTab agent={selectedAgent} />
                    )}
                </div>
            </div>
        </div>
    );
}

function CustomerTab({ agent, form, saveCustomer }) {
    return (
        <form onSubmit={saveCustomer} className="space-y-5">
            <div className="rounded-lg bg-slate-50 border p-4 flex gap-4">
                <AgentPassport path={agent.customer_passport} />

                <div>
                    <p className="text-sm text-black-900 font-bold">
                        Agent : {agent.user?.name ?? '-'}
                    </p>

                    <p className="text-sm text-red-900 font-bold">
                        Price : {agent.currency ?? 'USD'} {Number(agent.price ?? 0).toLocaleString()}
                    </p>

                    <p className="text-sm text-gray-500">
                        Dropoff : {agent.dropoff_location ?? '-'}
                    </p>

                    <p className="text-sm text-gray-500">
                        Remarks : {agent.remarks ?? '-'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                <Field
                    label="Customer Name"
                    value={form.data.name}
                    onChange={(e) => form.setData('name', e.target.value)}
                    error={form.errors.name}
                    required
                />

                <Field
                    label="Email"
                    type="email"
                    value={form.data.email}
                    onChange={(e) => form.setData('email', e.target.value)}
                    error={form.errors.email}
                    required
                />

                <Field
                    label="WhatsApp Number"
                    value={form.data.whatsapp_number}
                    onChange={(e) => form.setData('whatsapp_number', e.target.value)}
                    error={form.errors.whatsapp_number}
                    required
                />

                <Field
                    label="Country"
                    value={form.data.country}
                    onChange={(e) => form.setData('country', e.target.value)}
                    error={form.errors.country}
                    required
                />

                <Field
                    label="Passenger Count"
                    type="number"
                    value={form.data.passenger_count}
                    onChange={(e) => form.setData('passenger_count', e.target.value)}
                    error={form.errors.passenger_count}
                    required
                />

                <Field
                    label="Dropoff Location"
                    value={form.data.dropoff_location}
                    onChange={(e) => form.setData('dropoff_location', e.target.value)}
                    error={form.errors.dropoff_location}
                    required
                />

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

                    <Error message={form.errors.language_preference} />
                </div>
            </div>
            <div>
                <label className="label">Remarks</label>

                <textarea
                    value={form.data.remarks}
                    onChange={(e) => form.setData('remarks', e.target.value)}
                    rows="2"
                    className="input"
                />

                <Error message={form.errors.remarks} />
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
                <button
                    type="submit"
                    disabled={form.processing}
                    className="bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50"
                >
                    {form.processing ? 'Saving...' : 'Save Customer & Continue'}
                </button>
            </div>
        </form>
    );
}

function PaymentTab({ agent, customerId, setActiveTab }) {
    const currencies = [
        'LKR', 'USD', 'EUR', 'GBP', 'AUD',
        'CAD', 'INR', 'AED', 'CNY', 'JPY'
    ];

    const paymentForm = useForm({
        currency: agent?.new_currency ?? agent?.currency ?? 'LKR',
        price: agent?.new_price ?? agent?.price ?? 0,
        payment_method: 'Cash',
        transaction_id: '',
        card_number: '',
        payment_notes: [
            { amount: '', count: '' },
        ],
    });

    const total = paymentForm.data.payment_notes.reduce((sum, item) => {
        return sum + Number(item.amount || 0) * Number(item.count || 0);
    }, 0);

    const updateNote = (index, field, value) => {
        const notes = [...paymentForm.data.payment_notes];
        notes[index][field] = value;
        paymentForm.setData('payment_notes', notes);
    };

    const addNoteRow = () => {
        const notes = [...paymentForm.data.payment_notes];
        notes.push({ amount: '', count: '' });
        paymentForm.setData('payment_notes', notes);
    };

    const removeNoteRow = (index) => {
        if (paymentForm.data.payment_notes.length > 1) {
            const notes = paymentForm.data.payment_notes.filter((_, i) => i !== index);
            paymentForm.setData('payment_notes', notes);
        }
    };

    const savePayment = (e) => {
        e.preventDefault();

        console.log('========== PAYMENT DEBUG ==========');
        console.log('customerId:', customerId);
        console.log('customerId type:', typeof customerId);
        console.log('selectedAgent:', agent);
        console.log('paymentForm:', paymentForm.data);

        if (!customerId) {
            console.error('customerId is NULL or UNDEFINED');
            alert('Please save customer details first.');
            return;
        }

        // Validate based on payment method
        if (paymentForm.data.payment_method === 'Cash') {
            console.log('Required Price:', paymentForm.data.price);
            console.log('Entered Total:', total);

            if (Number(total) !== Number(paymentForm.data.price)) {
                console.error('Amount mismatch');
                alert('Entered cash notes total must match the price.');
                return;
            }
        } else if (paymentForm.data.payment_method === 'POS') {
            if (!paymentForm.data.transaction_id) {
                alert('Please enter transaction ID.');
                return;
            }

            if (!paymentForm.data.card_number) {
                alert('Please enter card number.');
                return;
            }
        }

        console.log('Posting to:', `/customers/${customerId}/payment`);

        paymentForm.post(`/customers/${customerId}/payment`, {
            preserveScroll: true,

            onBefore: () => {
                console.log('Payment request starting...');
            },

            onSuccess: (page) => {
                console.log('Payment Saved Successfully');
                console.log(page);

                setActiveTab('vehicle');
            },

            onError: (errors) => {
                console.error('Payment Save Error');
                console.error(errors);
            },

            onFinish: () => {
                console.log('Payment Request Finished');
            },
        });
    };

    return (
        <form onSubmit={savePayment} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="label">Currency</label>
                    <select
                        value={paymentForm.data.currency}
                        onChange={(e) => paymentForm.setData('currency', e.target.value)}
                        className="input"
                    >
                        {currencies.map((currency) => (
                            <option key={currency} value={currency}>
                                {currency}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="label">Price</label>
                    <input
                        type="number"
                        value={paymentForm.data.price}
                        onChange={(e) => paymentForm.setData('price', e.target.value)}
                        className="input"
                    />
                </div>

                <div>
                    <label className="label">Payment Method</label>
                    <select
                        value={paymentForm.data.payment_method}
                        onChange={(e) => paymentForm.setData('payment_method', e.target.value)}
                        className="input"
                    >
                        <option value="Cash">Cash</option>
                        <option value="POS">POS</option>
                    </select>
                </div>
            </div>

            {paymentForm.data.payment_method === 'POS' && (
                <div className="border rounded-xl p-4 bg-gray-50">
                    <h3 className="font-bold mb-3">
                        POS Payment Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Transaction ID</label>
                            <input
                                type="text"
                                value={paymentForm.data.transaction_id}
                                onChange={(e) => paymentForm.setData('transaction_id', e.target.value)}
                                placeholder="Enter transaction ID"
                                className="input"
                                required
                            />
                        </div>

                        <div>
                            <label className="label">Card Number</label>
                            <input
                                type="text"
                                value={paymentForm.data.card_number}
                                onChange={(e) => paymentForm.setData('card_number', e.target.value)}
                                placeholder="Enter card number"
                                className="input"
                                required
                            />
                        </div>
                    </div>
                </div>
            )}

            {paymentForm.data.payment_method === 'Cash' && (
                <div className="border rounded-xl p-4 bg-gray-50">
                    <h3 className="font-bold mb-3">
                        Cash Notes Received
                    </h3>

                    <div className="space-y-3">
                        {paymentForm.data.payment_notes.map((note, index) => (
                            <div
                                key={index}
                                className="grid grid-cols-12 gap-2 items-end"
                            >
                                <div className="col-span-5">
                                    <label className="label">
                                        Note Value
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        value={note.amount}
                                        onChange={(e) =>
                                            updateNote(index, 'amount', e.target.value)
                                        }
                                        className="input"
                                        placeholder="1000"
                                    />
                                </div>

                                <div className="col-span-5">
                                    <label className="label">
                                        Quantity
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        value={note.count}
                                        onChange={(e) =>
                                            updateNote(index, 'count', e.target.value)
                                        }
                                        className="input"
                                        placeholder="2"
                                    />
                                </div>

                                <div className="col-span-2">
                                  <button
                                        type="button"
                                        onClick={() => removeNoteRow(index)}
                                        disabled={paymentForm.data.payment_notes.length === 1}
                                        className="w-8 h-8 flex items-center justify-center bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addNoteRow}
                            className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800"
                        >
                            + Add Note
                        </button>
                    </div>

                    <div className="mt-4 flex justify-between border-t pt-3">
                        <p className="font-semibold">
                            Required: {paymentForm.data.currency} {Number(paymentForm.data.price).toLocaleString()}
                        </p>

                        <p className={`font-bold ${
                            Number(total) === Number(paymentForm.data.price)
                                ? 'text-green-700'
                                : 'text-red-600'
                        }`}>
                            Entered: {paymentForm.data.currency} {Number(total).toLocaleString()}
                        </p>
                    </div>
                </div>
            )}

            {paymentForm.errors.payment_notes && (
                <p className="text-red-600 text-sm">
                    {paymentForm.errors.payment_notes}
                </p>
            )}

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={paymentForm.processing || (paymentForm.data.payment_method === 'Cash' && Number(total) !== Number(paymentForm.data.price))}
                    className="bg-green-700 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-800 disabled:opacity-50"
                >
                    {paymentForm.processing ? 'Saving...' : 'Save Payment & Continue'}
                </button>
            </div>
        </form>
    );
}

function VehicleTab() {
    return (
        <div>
            <h3 className="font-bold text-lg mb-4">
                Vehicle Assignment
            </h3>

            <div className="text-gray-500">
                Vehicle assignment section coming next.
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

                    <p className="text-sm font-medium text-red-800 truncate mt-1">
                        {vehicle.registration_number ?? '-'}
                    </p>

                    <p className="text-xs text-gray-600 truncate mt-1">
                        {vehicle.vehicle_type ?? '-'} : {vehicle.brand ?? '-'} {vehicle.model ?? ''}
                    </p>

                    <p className="text-xs font-bold text-gray-700 mt-1 truncate" title={languages}>
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

function AgentPassport({ path }) {
    if (!path) {
        return (
            <div className="w-32 h-24 rounded bg-gray-100 border flex items-center justify-center text-xs text-gray-400">
                No Image
            </div>
        );
    }

    return (
        <a href={`/storage/${path}`} target="_blank" rel="noreferrer">
            <img
                src={`/storage/${path}`}
                className="w-32 h-24 object-cover rounded border"
            />
        </a>
    );
}

function TabButton({ active, children, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-6 py-3 font-medium transition ${
                active
                    ? 'border-b-2 border-blue-700 text-blue-700'
                    : 'text-gray-500 hover:text-gray-800'
            }`}
        >
            {children}
        </button>
    );
}

function Field({ label, value, onChange, error, type = 'text' }) {
    return (
        <div>
            <label className="label">{label}</label>

            <input
                type={type}
                value={value ?? ''}
                onChange={onChange}
                className="input"
            />

            <Error message={error} />
        </div>
    );
}

function Error({ message }) {
    return message ? (
        <p className="text-red-600 text-sm mt-1">{message}</p>
    ) : null;
}