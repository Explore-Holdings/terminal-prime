import { Head, Link, useForm } from '@inertiajs/react';
import { router } from '@inertiajs/react';
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

export default function Index({ pendingAgents = [], ongoingTrips = [], vehicles = [] }) {
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState('customer');
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [createdCustomerId, setCreatedCustomerId] = useState(null);
    const [invoicePath, setInvoicePath] = useState(null);
    const [paymentEnabledAgentId, setPaymentEnabledAgentId] = useState(null);
    const [vehicleEnabledAgentId, setVehicleEnabledAgentId] = useState(null);

    const customerForm = useForm({
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

    const paymentForm = useForm({
        currency: 'LKR',
        price: 0,
        payment_method: 'Cash',
        transaction_id: '',
        card_number: '',
        payment_notes: [{ amount: '', count: '' }],
    });

    const resetCustomerForm = (agent) => {
        customerForm.setData({
            agent_id: agent.id,
            name: agent.name ?? '',
            email: '',
            mobile_number: '',
            whatsapp_number: '',
            country: '',
            dropoff_location: agent.dropoff_location ?? '',
            passenger_count: agent.passenger_count ?? 1,
            luggage_count: agent.luggage_count ?? 0,
            language_preference: '',
            status: 'New',
            remarks: agent.remarks ?? '',
        });

        paymentForm.setData({
            currency: agent.new_currency ?? agent.currency ?? 'LKR',
            price: agent.new_price ?? agent.price ?? 0,
            payment_method: 'Cash',
            transaction_id: '',
            card_number: '',
            payment_notes: [{ amount: '', count: '' }],
        });

        setCreatedCustomerId(null);
        setInvoicePath(null);
    };

    const openModal = (agent, tab = 'customer') => {
        const isNewAgent = selectedAgent?.id !== agent.id;

        setSelectedAgent(agent);

        if (tab === 'customer' || isNewAgent) {
            resetCustomerForm(agent);
        }

        setActiveTab(tab);
        setShowModal(true);
    };

    const saveCustomer = (e) => {
        e.preventDefault();

        customerForm.post('/customers', {
            preserveScroll: true,
            onSuccess: (page) => {
                const id = page.props.createdCustomerId;

                setCreatedCustomerId(id);
                setPaymentEnabledAgentId(selectedAgent.id);
                setActiveTab('payment');
            },
        });
    };

    return (
        <>
            <Head title="Counter" />

            <div className="min-h-screen bg-gray-100 p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Counter</h1>
                        <p className="text-gray-500 mt-1">Airport counter customer handling</p>
                    </div>

                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-slate-800"
                    >
                        <ArrowLeft size={18} />
                        Back
                    </Link>
                </div>

                <Section title="Pending Customers" icon={<Users className="text-blue-700" size={22} />}>
                    {pendingAgents.length ? (
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {pendingAgents.map((agent) => (
                                <CustomerCard
                                    key={agent.id}
                                    agent={agent}
                                    onOpen={openModal}
                                    paymentEnabled={paymentEnabledAgentId === agent.id}
                                    vehicleEnabled={vehicleEnabledAgentId === agent.id}
                                />
                            ))}
                        </div>
                    ) : (
                        <Empty text="No pending customers found." />
                    )}
                </Section>

                <Section title="Vehicles Checked In" icon={<CarFront className="text-green-700" size={22} />}>
                    {vehicles.length ? (
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {vehicles.map((vehicle) => (
                                <VehicleCard key={vehicle.id} vehicle={vehicle} />
                            ))}
                        </div>
                    ) : (
                        <Empty text="No vehicles found." />
                    )}
                </Section>

                <Section
                    title={
                        <div className="flex flex-wrap items-center gap-3">
                            <span>Ongoing Trips</span>

                            <div className="flex flex-wrap items-center gap-2 text-[11px]">
                                <div className="flex items-center gap-1">
                                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                    <span>Assigned</span>
                                </div>

                                <div className="flex items-center gap-1">
                                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                                    <span>Accepted</span>
                                </div>

                                <div className="flex items-center gap-1">
                                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                    <span>In Progress</span>
                                </div>

                                <div className="flex items-center gap-1">
                                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                    <span>Completed</span>
                                </div>

                                {/* <div className="flex items-center gap-1">
                                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                    <span>Released</span>
                                </div> */}
                            </div>
                        </div>
                    }
                    icon={<Car className="text-orange-700" size={22} />}
                    actions={
                        <Link
                            href="/trips"
                            className="ml-auto bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700"
                        >
                            View Trips
                        </Link>
                    }
                >
                    {ongoingTrips.length ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                            {ongoingTrips.map((trip) => (
                                <TripCard key={trip.id} trip={trip} />
                            ))}
                        </div>
                    ) : (
                        <Empty text="No ongoing trips found." />
                    )}
                </Section>

            </div>

            {showModal && selectedAgent && (
                <Modal
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    agent={selectedAgent}
                    customerForm={customerForm}
                    paymentForm={paymentForm}
                    saveCustomer={saveCustomer}
                    customerId={createdCustomerId}
                    invoicePath={invoicePath}
                    setInvoicePath={setInvoicePath}
                    vehicles={vehicles}
                    setVehicleEnabledAgentId={setVehicleEnabledAgentId}
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    );
}

function CustomerCard({ agent, onOpen, paymentEnabled, vehicleEnabled }) {
    return (
        <div className="min-w-[300px] border rounded-lg bg-gray-50 p-3 shadow-sm">
            <h3 className="flex justify-between font-semibold text-sm">
                <span className="truncate">{agent.name ?? 'Customer'}</span>
                <span className="text-red-600 font-bold">{agent.distance_km ?? '-'} KM</span>
            </h3>

            <p className="text-xs text-gray-600 mt-1 truncate">
                {agent.passenger_count ?? 0} Pax : {agent.luggage_count ?? 0} Luggage : {agent.dropoff_location ?? '-'}
            </p>

            <div className="flex gap-1 mt-3">
                <CardButton color="blue" onClick={() => onOpen(agent, 'customer')} icon={<UserPlus size={13} />}>
                    Customer
                </CardButton>

                <CardButton
                    color="green"
                    disabled={!paymentEnabled}
                    onClick={() => onOpen(agent, 'payment')}
                    icon={<CreditCard size={13} />}
                >
                    Payment
                </CardButton>

                <CardButton
                    color="purple"
                    disabled={!vehicleEnabled}
                    onClick={() => onOpen(agent, 'vehicle')}
                    icon={<Car size={13} />}
                >
                    Vehicle
                </CardButton>
            </div>
        </div>
    );
}

function Modal({
    activeTab,
    setActiveTab,
    agent,
    customerForm,
    paymentForm,
    saveCustomer,
    customerId,
    invoicePath,
    setInvoicePath,
    vehicles,
    setVehicleEnabledAgentId,
    onClose,
}) {
    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-7xl max-h-[92vh] overflow-y-auto">
                <div className="flex justify-between border-b px-6 py-4">
                    <div>
                        <h2 className="text-xl font-bold">Customer Processing</h2>
                        <p className="text-sm text-gray-500">
                            {agent.name} · {agent.passenger_count ?? 0} Pax · {agent.dropoff_location ?? '-'}
                        </p>
                    </div>

                    <button onClick={onClose} className="text-red-600 font-semibold">
                        Close
                    </button>
                </div>

                <div className="flex border-b">
                    <TabButton active={activeTab === 'customer'} onClick={() => setActiveTab('customer')}>
                        Customer
                    </TabButton>

                    <TabButton
                        active={activeTab === 'payment'}
                        disabled={!customerId}
                        onClick={() => setActiveTab('payment')}
                    >
                        Payment
                    </TabButton>

                    <TabButton
                        active={activeTab === 'vehicle'}
                        disabled={!invoicePath}
                        onClick={() => setActiveTab('vehicle')}
                    >
                        Vehicle
                    </TabButton>
                </div>

                <div className="p-6 min-h-[500px]">
                    {activeTab === 'customer' && (
                        <CustomerTab agent={agent} form={customerForm} onSubmit={saveCustomer} />
                    )}

                    {activeTab === 'payment' && (
                        <PaymentTab
                            agent={agent}
                            customerId={customerId}
                            form={paymentForm}
                            invoicePath={invoicePath}
                            setInvoicePath={setInvoicePath}
                            setActiveTab={setActiveTab}
                            setVehicleEnabledAgentId={setVehicleEnabledAgentId}
                        />
                    )}

                    {activeTab === 'vehicle' && (
                        <VehicleTab
                            vehicles={vehicles}
                            customerId={customerId}
                            agent={agent}
                            onClose={onClose}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

function CustomerTab({ agent, form, onSubmit }) {
    return (
        <form onSubmit={onSubmit} className="space-y-5">
            <div className="rounded-lg bg-slate-50 border p-4 flex gap-4">
                <ImageBox path={agent.customer_passport} className="w-32 h-24" />
                <div className="text-sm">
                    <p className="font-bold">Agent : {agent.user?.name ?? '-'}</p>
                    <p className="font-bold text-red-900">
                        Price : {agent.currency ?? 'USD'} {Number(agent.price ?? 0).toLocaleString()}
                    </p>
                    <p className="text-gray-500">Dropoff : {agent.dropoff_location ?? '-'}</p>
                    <p className="text-gray-500">Remarks : {agent.remarks ?? '-'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                <Field label="Customer Name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} error={form.errors.name} />
                <Field label="Email" type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} error={form.errors.email} />
                <Field label="WhatsApp" value={form.data.whatsapp_number} onChange={(e) => form.setData('whatsapp_number', e.target.value)} error={form.errors.whatsapp_number} />
                <Field label="Country" value={form.data.country} onChange={(e) => form.setData('country', e.target.value)} error={form.errors.country} />
                <Field label="Passenger Count" type="number" value={form.data.passenger_count} onChange={(e) => form.setData('passenger_count', e.target.value)} error={form.errors.passenger_count} />
                <Field label="Luggage Count" type="number" value={form.data.luggage_count} onChange={(e) => form.setData('luggage_count', e.target.value)} error={form.errors.luggage_count} />
                <Field label="Dropoff Location" value={form.data.dropoff_location} onChange={(e) => form.setData('dropoff_location', e.target.value)} error={form.errors.dropoff_location} />

                <div>
                    <label className="label">Language</label>
                    <select
                        className="input"
                        value={form.data.language_preference}
                        onChange={(e) => form.setData('language_preference', e.target.value)}
                    >
                        <option value="">Select</option>
                        {['English', 'Sinhala', 'Tamil', 'Arabic', 'Chinese', 'Russian', 'German', 'French'].map((x) => (
                            <option key={x}>{x}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="label">Remarks</label>
                <textarea
                    className="input"
                    rows="2"
                    value={form.data.remarks}
                    onChange={(e) => form.setData('remarks', e.target.value)}
                />
            </div>

            <div className="flex justify-end border-t pt-4">
                <button disabled={form.processing} className="bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold disabled:opacity-50">
                    {form.processing ? 'Saving...' : 'Save Customer & Continue'}
                </button>
            </div>
        </form>
    );
}

function PaymentTab({
    agent,
    customerId,
    form,
    invoicePath,
    setInvoicePath,
    setActiveTab,
    setVehicleEnabledAgentId,
}) {
    const total = form.data.payment_notes.reduce(
        (sum, n) => sum + Number(n.amount || 0) * Number(n.count || 0),
        0
    );

    const isCash = form.data.payment_method === 'Cash';
    const canSubmit = !form.processing && (!isCash || Number(total) === Number(form.data.price));

    const updateNote = (i, key, value) => {
        const notes = [...form.data.payment_notes];
        notes[i][key] = value;
        form.setData('payment_notes', notes);
    };

    const savePayment = (e) => {
        e.preventDefault();

        if (!customerId) {
            alert('Please save customer first.');
            return;
        }

        if (isCash && Number(total) !== Number(form.data.price)) {
            alert('Cash total must match price.');
            return;
        }

        // move instantly
        setVehicleEnabledAgentId(agent.id);
        setActiveTab('vehicle');

        // save in backend after moving
        form.post(`/customers/${customerId}/payment`, {
            preserveScroll: true,
            preserveState: true,

            onSuccess: (page) => {
                const path =
                    page.props.invoicePath ??
                    page.props.flash?.invoice_path ??
                    null;

                if (path) {
                    setInvoicePath(path);
                }
            },

            onError: () => {
                alert('Payment save failed. Please check again.');
                setActiveTab('payment');
            },
        });
    };

    return (
        <form onSubmit={savePayment} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select label="Currency" value={form.data.currency} onChange={(e) => form.setData('currency', e.target.value)} options={['LKR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'INR', 'AED', 'CNY', 'JPY']} />
                <Field label="Price" type="number" value={form.data.price} onChange={(e) => form.setData('price', e.target.value)} />
                <Select label="Payment Method" value={form.data.payment_method} onChange={(e) => form.setData('payment_method', e.target.value)} options={['Cash', 'POS']} />
            </div>

            {form.data.payment_method === 'POS' && (
                <div className="border rounded-xl p-4 bg-gray-50 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Transaction ID" value={form.data.transaction_id} onChange={(e) => form.setData('transaction_id', e.target.value)} />
                    <Field label="Card Number" value={form.data.card_number} onChange={(e) => form.setData('card_number', e.target.value)} />
                </div>
            )}

            {isCash && (
                <div className="border rounded-xl p-4 bg-gray-50 space-y-3">
                    <h3 className="font-bold">Cash Notes Received</h3>

                    {form.data.payment_notes.map((note, i) => (
                        <div key={i} className="grid grid-cols-12 gap-2 items-end">
                            <div className="col-span-5">
                                <Field label="Note Value" type="number" value={note.amount} onChange={(e) => updateNote(i, 'amount', e.target.value)} />
                            </div>

                            <div className="col-span-5">
                                <Field label="Quantity" type="number" value={note.count} onChange={(e) => updateNote(i, 'count', e.target.value)} />
                            </div>

                            <button
                                type="button"
                                disabled={form.data.payment_notes.length === 1}
                                onClick={() => form.setData('payment_notes', form.data.payment_notes.filter((_, x) => x !== i))}
                                className="col-span-2 h-10 bg-red-600 text-white rounded disabled:bg-gray-300"
                            >
                                <Trash2 size={14} className="mx-auto" />
                            </button>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={() => form.setData('payment_notes', [...form.data.payment_notes, { amount: '', count: '' }])}
                        className="bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                        + Add Note
                    </button>

                    <div className="flex justify-between border-t pt-3 font-bold">
                        <span>Required: {form.data.currency} {Number(form.data.price).toLocaleString()}</span>
                        <span className={Number(total) === Number(form.data.price) ? 'text-green-700' : 'text-red-600'}>
                            Entered: {form.data.currency} {Number(total).toLocaleString()}
                        </span>
                    </div>
                </div>
            )}

            {form.errors.payment_notes && <p className="text-red-600 text-sm">{form.errors.payment_notes}</p>}

            {invoicePath && (
                <a
                    href={`/storage/${invoicePath}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                    Open Invoice
                </a>
            )}

            <div className="flex justify-end">
                <button
                    disabled={!canSubmit}
                    className="bg-green-700 text-white px-5 py-2 rounded-lg font-semibold disabled:opacity-50"
                >
                    Continue to Vehicle
                </button>
            </div>
        </form>
    );
}

function VehicleTab({ vehicles, customerId, agent,onClose, }) {
    const assignForm = useForm({
        driver_id: '',
        agent_id: agent.id,
        remarks: '',
    });

    const assignTrip = (vehicle) => {
        const driverId = vehicle.driver_id ?? vehicle.driver?.id;

        if (!customerId) {
            alert('Customer not found.');
            return;
        }

        if (!driverId) {
            alert('Driver not found for this vehicle.');
            return;
        }

        assignForm.setData({
            driver_id: driverId,
            agent_id: agent.id,
            remarks: '',
        });

        assignForm.post(`/customers/${customerId}/assign-trip`, {
            preserveScroll: true,
            onSuccess: () => {
                onClose();

                router.reload({
                    only: ['pendingAgents', 'vehicles', 'ongoingTrips'],
                });
            },
        });
    };

    return (
        <div>
            <div className="flex justify-between mb-3">
                <h3 className="font-bold text-lg">Select Vehicle</h3>
                <span className="text-sm text-gray-500">{vehicles.length} Vehicle(s)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[600px] overflow-y-auto">
                {vehicles.map((vehicle, i) => (
                    <VehicleSelectCard
                        key={vehicle.id}
                        vehicle={vehicle}
                        index={i}
                        assigning={assignForm.processing}
                        onAssign={() => assignTrip(vehicle)}
                    />
                ))}
            </div>
        </div>
    );
}

function TripCard({ trip }) {
    const status = trip.status ?? 'Unknown';

    const cardColor = {
        Assigned: 'bg-red-50 border-red-500',
        Accepted: 'bg-yellow-50 border-yellow-500',
        'In_Progress': 'bg-blue-50 border-blue-500',
        'Completed': 'bg-green-50 border-green-500',
        // Released: 'bg-green-50 border-green-500',
    };

    const badgeColor = {
        Assigned: 'bg-red-600 text-white',
        Accepted: 'bg-yellow-500 text-white',
        'In_Progress': 'bg-blue-600 text-white',
        'Completed': 'bg-green-600 text-white',
        // Released: 'bg-green-600 text-white',
    };

    return (
        <div
            className={`border-l-4 rounded-lg shadow-sm p-2 ${
                cardColor[status] ?? 'bg-gray-50 border-gray-300'
            }`}
        >
            <div className="flex items-start justify-between mb-2">
                <div className="min-w-0">
                    <h3 className="font-semibold text-xs truncate">
                        {trip.driver?.full_name ?? 'Driver'}
                    </h3>

                    <p className="text-[10px] text-gray-500 truncate">
                        {trip.driver?.mobile_number ?? '-'}
                    </p>
                </div>

                <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold whitespace-nowrap ${
                        badgeColor[status] ??
                        'bg-gray-500 text-white'
                    }`}
                >
                    {status}
                </span>
            </div>

            <div className="space-y-1 text-[11px] text-gray-700">
                <div className="truncate">
                    <span className="font-semibold">Customer:</span>{' '}
                    {trip.customer?.name ?? '-'}
                </div>

                <div className="truncate">
                    <span className="font-semibold">Agent:</span>{' '}
                    {trip.agent?.user?.name ??
                        trip.agent?.name ??
                        '-'}
                </div>

                <div>
                    <span className="font-semibold">Assigned:</span>
                    <br />
                    <span className="text-[10px]">
                        {trip.trip_assigned_at
                            ? new Date(
                                  trip.trip_assigned_at
                              ).toLocaleDateString()
                            : '-'}
                    </span>
                </div>

                {trip.trip_started_at && (
                    <div>
                        <span className="font-semibold">
                            Started:
                        </span>{' '}
                        <span className="text-[10px]">
                            {new Date(
                                trip.trip_started_at
                            ).toLocaleDateString()}
                        </span>
                    </div>
                )}

                {trip.trip_ended_at && (
                    <div>
                        <span className="font-semibold">
                            Ended:
                        </span>{' '}
                        <span className="text-[10px]">
                            {new Date(
                                trip.trip_ended_at
                            ).toLocaleDateString()}
                        </span>
                    </div>
                )}

                {trip.remarks && (
                    <div className="text-[10px] text-gray-600 truncate">
                        <span className="font-semibold">
                            Notes:
                        </span>{' '}
                        {trip.remarks}
                    </div>
                )}
            </div>
        </div>
    );
}

function VehicleCard({ vehicle }) {
    const languages = vehicle.driver?.languages?.map((l) => l.language_name).join(', ') || '-';

    return (
        <div className="min-w-[300px] border rounded-lg bg-gray-50 p-3 shadow-sm flex gap-3">
            <ImageBox path={vehicle.pictures?.front_view ?? vehicle.front_view} className="w-32 h-24" />
            <div>
                <h3 className="font-semibold text-sm">{vehicle.driver?.full_name ?? 'Driver'} : {vehicle.driver?.mobile_number ?? '-'}</h3>
                <p className="text-sm font-medium text-red-800">{vehicle.registration_number ?? '-'}</p>
                <p className="text-xs text-gray-600">{vehicle.vehicle_type ?? '-'} : {vehicle.brand ?? '-'} {vehicle.model ?? ''}</p>
                <p className="text-xs font-bold">🌐 {languages}</p>
            </div>
        </div>
    );
}

function VehicleSelectCard({ vehicle, index, onAssign, assigning }) {
    const languages = vehicle.driver?.languages?.map((l) => l.language_name).join(', ') || '-';

    return (
        <div className="relative border rounded-lg bg-gray-50 p-3 text-center">
            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-700 text-white text-[10px] flex items-center justify-center">
                {index + 1}
            </div>

            <ImageBox path={vehicle.pictures?.front_view ?? vehicle.front_view} className="w-20 h-20 mx-auto" />

            <h3 className="mt-2 font-semibold text-xs truncate">
                {vehicle.driver?.full_name ?? 'Driver'}
            </h3>

            <p className="text-[10px] text-gray-500">
                {vehicle.driver?.mobile_number ?? '-'}
            </p>

            <p className="text-xs font-bold text-red-700">
                {vehicle.registration_number ?? '-'}
            </p>

            <p className="text-[11px] font-bold text-red-900 truncate">
                🌐 {languages}
            </p>

            <button
                type="button"
                disabled={assigning}
                onClick={onAssign}
                className="mt-2 px-3 py-1 bg-blue-700 text-white rounded text-[10px] disabled:opacity-50"
            >
                {assigning ? 'Assigning...' : 'Assign'}
            </button>
        </div>
    );
}

function Section({ title, icon, children, actions }) {
    return (
        <section className="bg-white rounded-xl shadow p-5 mb-6">
            <div className="flex items-center gap-2 mb-4 justify-between">
                <div className="flex items-center gap-2">
                    {icon}
                    <h2 className="text-lg font-bold text-gray-800">{title}</h2>
                </div>

                {actions && <div>{actions}</div>}
            </div>
            {children}
        </section>
    );
}

function CardButton({ children, icon, onClick, disabled, color }) {
    const colors = {
        blue: 'bg-blue-700 hover:bg-blue-800',
        green: 'bg-green-700 hover:bg-green-800',
        purple: 'bg-purple-700 hover:bg-purple-800',
    };

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={`flex-1 inline-flex items-center justify-center gap-1 rounded py-1.5 text-[11px] font-medium ${
                disabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : `${colors[color]} text-white`
            }`}
        >
            {icon}
            {children}
        </button>
    );
}

function TabButton({ active, disabled, children, onClick }) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={`px-6 py-3 font-medium transition ${
                disabled
                    ? 'text-gray-300 cursor-not-allowed'
                    : active
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
            <input type={type} value={value ?? ''} onChange={onChange} className="input" />
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
        </div>
    );
}

function Select({ label, value, onChange, options }) {
    return (
        <div>
            <label className="label">{label}</label>
            <select value={value} onChange={onChange} className="input">
                {options.map((x) => (
                    <option key={x} value={x}>{x}</option>
                ))}
            </select>
        </div>
    );
}

function ImageBox({ path, className }) {
    if (!path) {
        return (
            <div className={`${className} rounded bg-gray-100 border flex items-center justify-center text-xs text-gray-400`}>
                No Image
            </div>
        );
    }

    return (
        <a href={`/storage/${path}`} target="_blank" rel="noreferrer">
            <img src={`/storage/${path}`} className={`${className} rounded object-cover border`} alt="" />
        </a>
    );
}

function Empty({ text }) {
    return (
        <div className="h-[180px] rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">
            {text}
        </div>
    );
}