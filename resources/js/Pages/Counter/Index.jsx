import { Head, Link, useForm } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { ArrowLeft, UserPlus, CreditCard, Car, Users, CarFront, Trash2, X } from 'lucide-react';

export default function Index({ pendingAgents = [], ongoingTrips = [], vehicles = [], countries = [], rateSetting = null, locationVehiclePrices = [] }) {
    const [showModal, setShowModal] = useState(false);
    const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);
    const [activeTab, setActiveTab] = useState('customer');
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [createdCustomerId, setCreatedCustomerId] = useState(null);
    const [invoicePath, setInvoicePath] = useState(null);
    const [paymentEnabledAgentId, setPaymentEnabledAgentId] = useState(null);
    const [vehicleEnabledAgentId, setVehicleEnabledAgentId] = useState(null);

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['pendingAgents', 'vehicles', 'ongoingTrips'],
                preserveScroll: true,
                preserveState: true,
            });
        }, 60000);

        return () => clearInterval(interval);
    }, []);

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
        payments: [{
            method: 'Cash',
            currency: 'LKR',
            amount: 0,
            notes: [{ amount: '', count: '', currency: 'LKR' }],
        }],
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
            payments: [{
                method: 'Cash',
                currency: agent.new_currency ?? agent.currency ?? 'LKR',
                amount: 0,
                notes: [{ amount: '', count: '', currency: agent.new_currency ?? agent.currency ?? 'LKR' }],
            }],
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

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setShowCheckoutConfirm(true)}
                            className="inline-flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 font-semibold"
                        >
                            🛑 Checkout
                        </button>
                        <Link href="/dashboard" className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-slate-800" >
                            <ArrowLeft size={18} />
                            Back
                        </Link>
                    </div>
                </div>

                <Section title="Pending Customers" icon={<Users className="text-blue-700" size={22} />}>
                    {pendingAgents.length ? (
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {pendingAgents.map((agent) => (
                                <CustomerCard key={agent.id} agent={agent} onOpen={openModal} paymentEnabled={paymentEnabledAgentId === agent.id} vehicleEnabled={vehicleEnabledAgentId === agent.id} />
                            ))}
                        </div>
                    ) : (
                        <Empty text="No pending customers found." />
                    )}
                </Section>

                <Section title="Vehicles Checked In" icon={<CarFront className="text-green-700" size={22} />}>
                    {vehicles.length ? (
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {vehicles.map((vehicle, index) => (
                                <VehicleCard key={vehicle.id} vehicle={vehicle} number={index + 1} />
                            ))}
                        </div>
                    ) : (
                        <Empty text="No vehicles found." />
                    )}
                </Section>

                <Section
                    title={
                        <div className="flex flex-wrap items-center gap-3">
                            <span>Trips</span>

                            <div className="flex flex-wrap items-center gap-4 text-[11px]">
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
                            </div>
                        </div>
                    }
                    icon={<Car className="text-orange-700" size={22} />}
                    actions={
                        <Link href="/trips" className="ml-auto bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700" >
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
                <Modal activeTab={activeTab} setActiveTab={setActiveTab} agent={selectedAgent} customerForm={customerForm} paymentForm={paymentForm} saveCustomer={saveCustomer} customerId={createdCustomerId} invoicePath={invoicePath} setInvoicePath={setInvoicePath} vehicles={vehicles} countries={countries} setVehicleEnabledAgentId={setVehicleEnabledAgentId} onClose={() => setShowModal(false)} rateSetting={rateSetting} locationVehiclePrices={locationVehiclePrices} />
            )}

            {showCheckoutConfirm && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Confirm Checkout</h2>
                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to checkout and end your current shift? This will log you out and summarize your shift trips.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowCheckoutConfirm(false)}
                                className="px-4 py-2 border rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition font-semibold"
                            >
                                Cancel
                            </button>
                            <Link
                                href="/counter/checkout"
                                method="post"
                                as="button"
                                onClick={() => setShowCheckoutConfirm(false)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition"
                            >
                                Confirm Checkout
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function CustomerCard({ agent, onOpen, paymentEnabled, vehicleEnabled }) {
    return (
        <div className="min-w-[280px] border rounded-lg bg-gray-50 p-3 shadow-sm">
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

                <CardButton color="green" disabled={!paymentEnabled} onClick={() => onOpen(agent, 'payment')} icon={<CreditCard size={13} />} >
                    Payment
                </CardButton>

                <CardButton color="purple" disabled={!vehicleEnabled} onClick={() => onOpen(agent, 'vehicle')} icon={<Car size={13} />} >
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
    countries,
    rateSetting,
    locationVehiclePrices = [],
}) {
    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-7xl max-h-[92vh] overflow-y-auto">
                <div className="flex justify-between border-b px-6 py-4">
                    <div>
                        <h2 className="text-xl font-bold">Customer Processing</h2>
                        <p className="text-sm text-gray-500">
                            {agent.name} | {agent.passenger_count ?? 0} Pax(s) & {agent.luggage_count ?? 0} Luggage(s) | {agent.dropoff_location ?? '-'}
                        </p>
                    </div>

                  <button
                        onClick={onClose}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 font-semibold hover:bg-red-100"
                    >
                        <X size={16} />
                        
                    </button>
                </div>

                <div className="flex border-b">
                    <TabButton active={activeTab === 'customer'} onClick={() => setActiveTab('customer')}>
                        Customer
                    </TabButton>

                    <TabButton active={activeTab === 'payment'} disabled={!customerId} onClick={() => setActiveTab('payment')} >
                        Payment
                    </TabButton>

                    <TabButton active={activeTab === 'vehicle'} disabled={!invoicePath} onClick={() => setActiveTab('vehicle')} >
                        Vehicle
                    </TabButton>
                </div>

                <div className="p-6 min-h-[500px]">
                    {activeTab === 'customer' && (
                        <CustomerTab agent={agent} countries={countries} form={customerForm} onSubmit={saveCustomer} />
                    )}

                    {activeTab === 'payment' && (
                        <PaymentTab agent={agent} customerId={customerId} form={paymentForm} invoicePath={invoicePath} setInvoicePath={setInvoicePath} setActiveTab={setActiveTab} setVehicleEnabledAgentId={setVehicleEnabledAgentId} />
                    )}

                    {activeTab === 'vehicle' && (
                        <VehicleTab vehicles={vehicles} customerId={customerId} agent={agent} onClose={onClose} rateSetting={rateSetting} paymentForm={paymentForm} locationVehiclePrices={locationVehiclePrices} />
                    )}
                </div>
            </div>
        </div>
    );
}

function CustomerTab({ agent, form, onSubmit, countries }) {
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
                <Field label="WhatsApp" type="number" value={form.data.whatsapp_number} onChange={(e) => form.setData('whatsapp_number', e.target.value)} error={form.errors.whatsapp_number} />
                <div>
                    <label className="label">Country</label>

                    <input
                        type="text"
                        list="countries-list"
                        className="input"
                        value={form.data.country || ''}
                        onChange={(e) => form.setData('country', e.target.value)}
                        placeholder="Search country..."
                    />

                    <datalist id="countries-list">
                        {countries.map((country) => (
                            <option
                                key={country.id}
                                value={country.country_name}
                            />
                        ))}
                    </datalist>

                    {form.errors.country && (
                        <p className="text-red-600 text-sm mt-1">
                            {form.errors.country}
                        </p>
                    )}
                </div>         
                <Field label="Passenger Count" type="number" value={form.data.passenger_count} onChange={(e) => form.setData('passenger_count', e.target.value)} error={form.errors.passenger_count} />
                <Field label="Luggage Count" type="number" value={form.data.luggage_count} onChange={(e) => form.setData('luggage_count', e.target.value)} error={form.errors.luggage_count} />
                <Field label="Dropoff Location" value={form.data.dropoff_location} onChange={(e) => form.setData('dropoff_location', e.target.value)} error={form.errors.dropoff_location} />

                <div>
                    <label className="label">Language</label>

                    <input type="text" className="input" list="language-list" value={form.data.language_preference}
                        onChange={(e) =>
                            form.setData('language_preference', e.target.value)
                        }
                        placeholder="Select or type language"
                    />

                    <datalist id="language-list">
                        <option value="English" />
                        <option value="Sinhala" />
                        <option value="Tamil" />
                        <option value="Arabic" />
                        <option value="Chinese" />
                        <option value="Russian" />
                        <option value="German" />
                        <option value="French" />
                    </datalist>
                </div>
            </div>

            <div>
                <label className="label">Remarks</label>
                <textarea className="input" rows="2" value={form.data.remarks} onChange={(e) => form.setData('remarks', e.target.value)} />
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
    agent, customerId, form, invoicePath,
    setInvoicePath, setActiveTab, setVehicleEnabledAgentId,
}) {
    const CURRENCIES = ['LKR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'INR', 'AED', 'CNY', 'JPY'];
    const payments = form.data.payments ?? [];

    // amount counts only notes whose currency matches the payment currency
    const methodAmount = (p) => {
        if (p.method !== 'Cash') {
            return Number(p.amount || 0);
        }

        return (p.notes ?? []).reduce((total, note) => {
            return (
                total +
                Number(note.amount || 0) *
                Number(note.count || 0)
            );
        }, 0);
    };

    const grandTotal = payments.reduce((s, p) => s + methodAmount(p), 0);
    const price = Number(form.data.price || 0);
    const balanced = Number(grandTotal) === price;
    const canSubmit = !form.processing && balanced && payments.length > 0;

    const setPayments = (next) => form.setData('payments', next);

    const updatePayment = (i, key, val) => {
        const next = [...payments];
        next[i] = { ...next[i], [key]: val };
        setPayments(next);
    };

    const changeMethod = (i, method) => {
        const next = [...payments];
        const currency = next[i].currency ?? form.data.currency;
        next[i] = method === 'Cash'
            ? { method, currency, amount: 0, notes: [{ amount: '', count: '', currency }] }
            : { method, currency, amount: '', transaction_id: '', card_number: '' };
        setPayments(next);
    };

    const addPayment = () =>
        setPayments([...payments, {
            method: 'Cash',
            currency: form.data.currency,
            amount: 0,
            notes: [{ amount: '', count: '', currency: form.data.currency }],
        }]);

    const removePayment = (i) => setPayments(payments.filter((_, x) => x !== i));

    const updateNote = (pi, ni, key, val) => {
        const next = [...payments];
        const notes = [...next[pi].notes];
        notes[ni] = { ...notes[ni], [key]: val };
        next[pi] = { ...next[pi], notes };
        setPayments(next);
    };

    const addNote = (pi) => {
        const next = [...payments];
        const payCur = next[pi].currency ?? form.data.currency;
        next[pi] = { ...next[pi], notes: [...next[pi].notes, { amount: '', count: '', currency: payCur }] };
        setPayments(next);
    };

    const removeNote = (pi, ni) => {
        const next = [...payments];
        next[pi] = { ...next[pi], notes: next[pi].notes.filter((_, x) => x !== ni) };
        setPayments(next);
    };

    const savePayment = (e) => {
        e.preventDefault();
        if (!customerId) return alert('Please save customer first.');
        if (!balanced) return alert(`Total in ${form.data.currency} (${grandTotal}) must match price (${price}).`);

        const payload = payments.map((p) => ({
            ...p,
            currency: p.currency ?? form.data.currency,
            amount: methodAmount(p),
            // keep notes with their own currency in JSON
            notes: p.method === 'Cash'
                ? (p.notes ?? []).map((n) => ({ ...n, currency: n.currency ?? p.currency ?? form.data.currency }))
                : null,
        }));

        setVehicleEnabledAgentId(agent.id);
        setActiveTab('vehicle');

        form.transform((d) => ({ ...d, payments: payload, total_paid: grandTotal }));
        form.post(`/customers/${customerId}/payment`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: (page) => {
                const path = page.props.invoicePath ?? page.props.flash?.invoice_path ?? null;
                if (path) setInvoicePath(path);
            },
            onError: () => { alert('Payment save failed.'); setActiveTab('payment'); },
        });
    };

    return (
        <form onSubmit={savePayment} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select label="Main Currency" value={form.data.currency}
                    onChange={(e) => form.setData('currency', e.target.value)} options={CURRENCIES} />
                <Field label="Total Price" type="number" value={form.data.price}
                    onChange={(e) => form.setData('price', e.target.value)} />
            </div>

            <div className="space-y-4">
                {payments.map((p, pi) => {
                    const payCur = p.currency ?? form.data.currency;
                    return (
                        <div key={pi} className="border rounded-xl p-4 bg-gray-50 space-y-3">
                            <div className="flex items-end gap-3">
                                <div className="w-7 h-7 mb-1 rounded-full bg-blue-700 text-white text-xs font-bold flex items-center justify-center">
                                    {pi + 1}
                                </div>
                                <div className="w-40">
                                    <label className="label">Method</label>
                                    <select className="input" value={p.method}
                                        onChange={(e) => changeMethod(pi, e.target.value)}>
                                        <option value="Cash">Cash</option>
                                        <option value="POS">POS</option>
                                    </select>
                                </div>
                                {/* <div className="w-28">
                                    <label className="label">Currency</label>
                                    <select className="input" value={payCur}
                                        onChange={(e) => updatePayment(pi, 'currency', e.target.value)}>
                                        {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div> */}
                                <div className="flex-1 text-right font-bold text-green-800 pb-2">
                                    {payCur} {methodAmount(p).toLocaleString()}
                                </div>
                                <button type="button" disabled={payments.length === 1}
                                    onClick={() => removePayment(pi)}
                                    className="h-9 px-3 bg-red-600 text-white rounded disabled:bg-gray-300">
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            {p.method === 'Cash' ? (
                                <div className="border-t pt-3 space-y-2">
                                    <h4 className="font-semibold text-sm">Cash Notes</h4>
                                    {p.notes.map((n, ni) => {
                                        const noteCur = n.currency ?? payCur;
                                        // const mismatch = noteCur !== payCur;
                                        return (
                                            <div key={ni} className="grid grid-cols-12 gap-2 items-end">
                                                {/* NEW: per-note currency */}
                                                <div className="col-span-3">
                                                    <label className="label">Currency</label>
                                                    <select className="input" value={noteCur}
                                                        onChange={(e) => updateNote(pi, ni, 'currency', e.target.value)}>
                                                        {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                                    </select>
                                                </div>
                                                <div className="col-span-4">
                                                    <Field label="Note Value" type="number" value={n.amount}
                                                        onChange={(e) => updateNote(pi, ni, 'amount', e.target.value)} />
                                                </div>
                                                <div className="col-span-3">
                                                    <Field label="Qty" type="number" value={n.count}
                                                        onChange={(e) => updateNote(pi, ni, 'count', e.target.value)} />
                                                </div>
                                                <button type="button" disabled={p.notes.length === 1}
                                                    onClick={() => removeNote(pi, ni)}
                                                    className="col-span-2 h-10 bg-red-600 text-white rounded disabled:bg-gray-300">
                                                    <Trash2 size={14} className="mx-auto" />
                                                </button>

                                                {/* {mismatch && (
                                                    <p className="col-span-12 text-[11px] text-amber-600">
                                                        ⚠ {noteCur} note not counted toward {payCur} total (different currency).
                                                    </p>
                                                )} */}
                                            </div>
                                        );
                                    })}
                                    <button type="button" onClick={() => addNote(pi)}
                                        className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">+ Add Note</button>
                                </div>
                            ) : (
                                <div className="border-t pt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Field label="Amount" type="number" value={p.amount}
                                        onChange={(e) => updatePayment(pi, 'amount', e.target.value)} />
                                    <Field label="Transaction ID" value={p.transaction_id}
                                        onChange={(e) => updatePayment(pi, 'transaction_id', e.target.value)} />
                                    <Field label="Card Number" value={p.card_number}
                                        onChange={(e) => updatePayment(pi, 'card_number', e.target.value)} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <button type="button" onClick={addPayment}
                className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm">+ Add Payment Method</button>

            <div className="border rounded-xl p-4 bg-gray-50 flex justify-between font-bold">
                <span>Required: {form.data.currency} {price.toLocaleString()}</span>
                <span className={balanced ? 'text-green-700' : 'text-red-600'}>
                    Entered: {form.data.currency} {grandTotal.toLocaleString()}
                    {!balanced && <span className="ml-2 text-xs">(Balance: {(price - grandTotal).toLocaleString()})</span>}
                </span>
            </div>

            {form.errors.payments && <p className="text-red-600 text-sm">{form.errors.payments}</p>}

            {invoicePath && (
                <a href={`/storage/${invoicePath}`} target="_blank" rel="noreferrer"
                    className="inline-block bg-green-700 text-white px-4 py-2 rounded-lg">Open Invoice</a>
            )}

            <div className="flex justify-end">
                <button disabled={!canSubmit}
                    className="bg-green-700 text-white px-5 py-2 rounded-lg font-semibold disabled:opacity-50">
                    Continue to Vehicle
                </button>
            </div>
        </form>
    );
}

function VehicleTab({ vehicles, customerId, agent, onClose, rateSetting, paymentForm, locationVehiclePrices = [] }) {
    const [confirmModal, setConfirmModal] = useState(null);
    const [rateMode, setRateMode]         = useState('standard');
    const [customDriverShare, setCustomDriverShare] = useState('');
    const [customAgentShare, setCustomAgentShare]   = useState('');
    const [selectedCityId, setSelectedCityId]       = useState('');
    const [citySearch, setCitySearch]               = useState('');
    const [submitting, setSubmitting] = useState(false);

    const totalAmount       = Number(paymentForm?.data?.price ?? 0);
    const defaultDriverRate = Number(rateSetting?.driver_rate ?? 0);
    const defaultAgentRate  = Number(rateSetting?.agent_rate ?? 0);

    // Map vehicle_type string → column name in location_vehicle_prices
    const vehicleTypeMap = {
        'Sedan':        'sedan',
        'SUV':          'suv',
        'Van':          'van',
        'Luxury SUV':   'luxury_suv',
        'Luxury Sedan': 'luxury_sedan',
        'Mini Coach':   'mini_coach',
        'Economy':      'economy',
    };

    // Price rows filtered/mapped for the selected vehicle type
    const cityPrices = (() => {
        if (!confirmModal) return [];
        const col = vehicleTypeMap[confirmModal.vehicle?.vehicle_type];
        if (!col) return locationVehiclePrices.map(r => ({ ...r, price: null }));
        return locationVehiclePrices.map(r => ({ ...r, price: r[col] ?? null }));
    })();

    // Selected city price row
    const selectedCity = cityPrices.find(r => String(r.id) === String(selectedCityId)) ?? null;

    // Share calculations
    const useCustomRate = rateMode === 'custom';
    const driverShare = useCustomRate
        ? (selectedCity && selectedCity.price !== null ? Number(selectedCity.price) : 0)
        : Number(((totalAmount * defaultDriverRate) / 100).toFixed(2));
    const agentShare = useCustomRate
        ? 0
        : Number(((totalAmount * defaultAgentRate) / 100).toFixed(2));

    const openConfirm = (vehicle) => {
        setRateMode('standard');
        setCustomDriverShare('');
        setCustomAgentShare('');
        setSelectedCityId('');
        setCitySearch('');
        setConfirmModal({ vehicle });
    };

    const closeConfirm = () => setConfirmModal(null);

    const confirmAssign = () => {
        const vehicle  = confirmModal.vehicle;
        const driverId = vehicle.driver_id ?? vehicle.driver?.id;

        if (!customerId) { alert('Customer not found.');               return; }
        if (!driverId)   { alert('Driver not found for this vehicle.'); return; }

        // Snapshot shares
        const finalDriverShare = useCustomRate
            ? (selectedCity && selectedCity.price !== null ? Number(selectedCity.price) : 0)
            : Number(((totalAmount * defaultDriverRate) / 100).toFixed(2));
        const finalAgentShare = useCustomRate
            ? 0
            : Number(((totalAmount * defaultAgentRate) / 100).toFixed(2));
        const finalBalance = Number((totalAmount - finalDriverShare - finalAgentShare).toFixed(2));

        const finalDriverRate = useCustomRate ? 0 : defaultDriverRate;
        const finalAgentRate  = useCustomRate ? 0 : defaultAgentRate;

        setSubmitting(true);

        router.post(
            `/customers/${customerId}/assign-trip`,
            {
                driver_id:      driverId,
                agent_id:       agent.id,
                remarks:        '',
                driver_rate:    finalDriverRate,
                agent_rate:     finalAgentRate,
                is_custom_rate: useCustomRate,
                total_amount:   totalAmount,
                driver_share:   finalDriverShare,
                agent_share:    finalAgentShare,
                balance:        finalBalance,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    closeConfirm();
                    onClose();
                    router.reload({ only: ['pendingAgents', 'vehicles', 'ongoingTrips'] });
                },
                onFinish: () => setSubmitting(false),
            }
        );
    };

    return (
        <div>
            <div className="flex justify-between mb-3">
                <h3 className="font-bold text-lg">Select Vehicle</h3>
                <span className="text-sm text-gray-500">{vehicles.length} Vehicle(s)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 max-h-[600px] overflow-y-auto">
                {vehicles.map((vehicle, i) => (
                    <VehicleSelectCard key={vehicle.id} vehicle={vehicle} index={i} assigning={submitting} onAssign={() => openConfirm(vehicle)} />
                ))}
            </div>

            {/* ── Confirmation Modal ── */}
            {confirmModal && (
                <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-4 text-white">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Car size={20} />
                                Confirm Vehicle Assignment
                            </h3>
                            <p className="text-sm text-blue-100 mt-0.5">
                                {confirmModal.vehicle.driver?.full_name ?? 'Driver'} — {confirmModal.vehicle.registration_number ?? ''} &nbsp;·&nbsp; {confirmModal.vehicle.vehicle_type ?? ''}
                            </p>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Trip amount */}
                            <div className="bg-gray-50 rounded-xl border p-4 flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">Trip Amount</span>
                                <span className="text-2xl font-black text-gray-900">
                                    {paymentForm?.data?.currency ?? 'LKR'} {totalAmount.toLocaleString()}
                                </span>
                            </div>

                            {/* Rate mode radio buttons */}
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Rate Type</p>
                                <div className="grid grid-cols-3 gap-3">
                                    {/* Standard Rate */}
                                    <label className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 cursor-pointer transition ${rateMode === 'standard' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input
                                            type="radio"
                                            name="rateMode"
                                            value="standard"
                                            checked={rateMode === 'standard'}
                                            onChange={() => setRateMode('standard')}
                                            className="sr-only"
                                        />
                                        <span className={`text-xl ${rateMode === 'standard' ? 'text-blue-700' : 'text-gray-400'}`}>📊</span>
                                        <span className={`text-xs font-semibold ${rateMode === 'standard' ? 'text-blue-700' : 'text-gray-600'}`}>Standard Rate</span>
                                        <span className="text-[10px] text-gray-400">Based on % rates</span>
                                    </label>

                                    {/* Custom Rate */}
                                    <label className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 cursor-pointer transition ${rateMode === 'custom' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input
                                            type="radio"
                                            name="rateMode"
                                            value="custom"
                                            checked={rateMode === 'custom'}
                                            onChange={() => setRateMode('custom')}
                                            className="sr-only"
                                        />
                                        <span className={`text-xl ${rateMode === 'custom' ? 'text-orange-600' : 'text-gray-400'}`}>🏙️</span>
                                        <span className={`text-xs font-semibold ${rateMode === 'custom' ? 'text-orange-600' : 'text-gray-600'}`}>Custom Rate</span>
                                        <span className="text-[10px] text-gray-400">City-based pricing</span>
                                    </label>

                                    {/* Per KM — upcoming */}
                                    <label className="flex flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-gray-200 p-3 cursor-not-allowed opacity-50 relative">
                                        <span className="text-xl text-gray-400">📍</span>
                                        <span className="text-xs font-semibold text-gray-400">Per KM Rate</span>
                                        <span className="text-[10px] text-gray-400">Coming soon</span>
                                        <span className="absolute top-1 right-1 bg-gray-200 text-gray-500 text-[9px] font-bold px-1 rounded">SOON</span>
                                    </label>
                                </div>
                            </div>

                            {/* Panel: Standard Rate */}
                            {/* {rateMode === 'standard' && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
                                        <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Driver Rate</p>
                                        <p className="text-2xl font-black text-blue-700">{defaultDriverRate}%</p>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-3 text-center border border-green-100">
                                        <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">Agent Rate</p>
                                        <p className="text-2xl font-black text-green-700">{defaultAgentRate}%</p>
                                    </div>
                                </div>
                            )} */}

                            {/* Panel: Custom Rate — city picker */}
                            {rateMode === 'custom' && (
                                <div className="space-y-3">
                                    <p className="text-xs text-orange-700 bg-orange-50 rounded-lg px-3 py-2 font-medium">
                                        Select the destination city to load the price for this vehicle type ({confirmModal.vehicle.vehicle_type ?? 'Unknown'}).
                                    </p>

                                    {cityPrices.length === 0 ? (
                                        <p className="text-sm text-gray-500 text-center py-4">No city prices available.</p>
                                    ) : (
                                        <>
                                            {/* Search bar */}
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none text-sm">🔍</span>
                                                <input
                                                    type="text"
                                                    placeholder="Search city, district or province…"
                                                    value={citySearch}
                                                    onChange={e => setCitySearch(e.target.value)}
                                                    className="w-full pl-8 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                                                />
                                                {citySearch && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setCitySearch('')}
                                                        className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600 text-xs"
                                                    >✕</button>
                                                )}
                                            </div>

                                            <div className="max-h-52 overflow-y-auto rounded-xl border divide-y">
                                                {cityPrices
                                                    .filter(row => {
                                                        const q = citySearch.trim().toLowerCase();
                                                        if (!q) return true;
                                                        return (
                                                            (row.city ?? '').toLowerCase().includes(q) ||
                                                            (row.district ?? '').toLowerCase().includes(q) ||
                                                            (row.province ?? '').toLowerCase().includes(q)
                                                        );
                                                    })
                                                    .map((row) => (
                                                        <button
                                                            key={row.id}
                                                            type="button"
                                                            onClick={() => setSelectedCityId(String(row.id))}
                                                            className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition ${String(selectedCityId) === String(row.id) ? 'bg-orange-50 border-l-4 border-l-orange-500' : 'hover:bg-gray-50'}`}
                                                        >
                                                            <div>
                                                                <p className="text-sm font-semibold text-gray-800">{row.city}</p>
                                                                <p className="text-xs text-gray-400">{row.district}{row.province ? ` · ${row.province}` : ''}{row.zone ? ` · Zone ${row.zone}` : ''}</p>
                                                            </div>
                                                            <span className={`text-sm font-bold ${row.price !== null ? 'text-orange-600' : 'text-gray-400'}`}>
                                                                {row.price !== null ? `${paymentForm?.data?.currency ?? 'LKR'} ${Number(row.price).toLocaleString()}` : 'N/A'}
                                                            </span>
                                                        </button>
                                                    ))}
                                                {cityPrices.filter(row => {
                                                    const q = citySearch.trim().toLowerCase();
                                                    if (!q) return false;
                                                    return !(
                                                        (row.city ?? '').toLowerCase().includes(q) ||
                                                        (row.district ?? '').toLowerCase().includes(q) ||
                                                        (row.province ?? '').toLowerCase().includes(q)
                                                    );
                                                }).length === cityPrices.length && (
                                                    <p className="text-sm text-gray-400 text-center py-4">No results for "{citySearch}"</p>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    {selectedCity && selectedCity.price !== null && (
                                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex justify-between items-center">
                                            <span className="text-sm font-semibold text-orange-700">Selected: {selectedCity.city}</span>
                                            <span className="text-lg font-black text-orange-700">
                                                {paymentForm?.data?.currency ?? 'LKR'} {Number(selectedCity.price).toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex gap-3 px-6 pb-6">
                            <button
                                type="button"
                                onClick={closeConfirm}
                                className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={submitting || (rateMode === 'custom' && (!selectedCity || selectedCity.price === null))}
                                onClick={confirmAssign}
                                className="flex-1 py-2.5 rounded-lg bg-blue-700 text-white font-semibold hover:bg-blue-800 disabled:opacity-50 transition"
                            >
                                {submitting ? 'Assigning...' : 'Confirm & Assign'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
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

                    <p className="text-[10px] text-black-800 truncate">
                        {trip.driver?.mobile_number ?? '-'} | {trip.driver?.vehicle?.registration_number ?? '-'}
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
                    <span className="font-semibold">Customer :</span>{' '}
                    {trip.customer?.name ?? '-'}
                </div>

                <div className="truncate">
                    <span className="font-semibold">Agent :</span>{' '}
                     {trip.agent?.user?.name ??
                        trip.agent?.name ??
                        '-'}
                </div>

                <div>
                    <span className="font-semibold">Assigned :</span>
                    {/* <br /> */}
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

function VehicleCard({ vehicle, number }) {
    const languages =
        vehicle.driver?.languages
            ?.map((l) => l.language_name)
            .join(', ') || '-';

    return (
        <div className="min-w-[280px] border rounded-lg bg-gray-50 p-3 shadow-sm flex gap-3 relative">

            <div className="absolute top-2 left-2 bg-blue-700 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                {number}
            </div>

            <ImageBox
                path={vehicle.pictures?.front_view ?? vehicle.front_view}
                className="w-32 h-24"
            />

            <div>
                <h3 className="font-semibold text-sm">
                    {vehicle.driver?.first_name +' ' +vehicle.driver?.last_name  ?? 'Driver'}
                </h3>

                <p className="text-sm font-medium text-black-800">
                    {vehicle.driver?.mobile_number ?? '-'}
                </p>

                <p className="text-sm font-medium text-red-800">
                    {vehicle.registration_number ?? '-'}
                </p>

                <p className="text-xs text-gray-600">
                    {vehicle.vehicle_type ?? '-'} :{' '}
                    {vehicle.brand ?? '-'} {vehicle.model ?? ''}
                </p>

                <p className="text-xs font-bold">
                    🌐 {languages}
                </p>
            </div>
        </div>
    );
}

function VehicleSelectCard({ vehicle, index, onAssign, assigning }) {
    const languages =
        vehicle.driver?.languages
            ?.map((l) => l.language_name)
            .join(', ') || '-';

    return (
        <div className="relative border rounded-lg bg-gray-50 p-2 shadow-sm">

            <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-blue-700 text-white text-[10px] flex items-center justify-center font-bold">
                {index + 1}
            </div>

            <div className="flex gap-2">
                <ImageBox path={vehicle.pictures?.front_view ?? vehicle.front_view} className="w-16 h-16 flex-shrink-0 rounded" />

                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-xs truncate">
                        {vehicle.driver?.first_name +' ' +vehicle.driver?.last_name  ?? 'Driver'}
                    </h3>

                    <p className="text-[12px] text-gray-500 truncate">
                        {vehicle.driver?.mobile_number ?? '-'} | {vehicle.registration_number ?? '-'}
                    </p>

                    {/* <p className="text-[11px] font-bold text-red-700 truncate">
                        {vehicle.registration_number ?? '-'}
                    </p> */}

                    <p className="text-[12px] text-gray-600 truncate">
                        {vehicle.brand ?? '-'} {vehicle.model ?? ''}
                    </p>

                    <p className="text-[12px] text-gray-600 truncate">
                        Pax : {vehicle.seating_capacity ?? '-'} | Luggage : {vehicle.luggage_capacity ?? ''}
                    </p>

                    <p className="text-[12px] text-blue-700 truncate">
                        🌐 {languages}
                    </p>
                </div>
            </div>

            <div className="mt-0 flex justify-end">
                <button type="button" disabled={assigning} onClick={onAssign} className="px-3 py-1 bg-blue-700 text-white rounded text-[11px] font-medium hover:bg-blue-800 disabled:opacity-50" >
                    {assigning ? 'Assigning...' : 'Assign'}
                </button>
            </div>
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