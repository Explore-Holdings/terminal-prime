import { Head, Link, useForm } from '@inertiajs/react';
import { Car, LogIn, Printer, FileText, CheckCircle, Banknote, CreditCard, Wallet } from 'lucide-react';

export default function CheckoutSummary({ log, user, trips = [], paymentSummary = null }) {
    const { post, processing } = useForm();

    const handlePrint = () => {
        window.print();
    };

    const handleHandover = (e) => {
        e.preventDefault();
        post(`/checkout-summary/${log.id}/handover`, {
            preserveScroll: true,
        });
    };

    // Format dates
    const loginTime = new Date(log.login_at);
    const logoutTime = log.logout_at ? new Date(log.logout_at) : new Date();

    const formatDateTime = (date) => {
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    // Calculate duration in hours and minutes
    const durationMs = logoutTime - loginTime;
    const durationMins = Math.max(0, Math.floor(durationMs / 60000));
    const durationHours = Math.floor(durationMins / 60);
    const remainingMins = durationMins % 60;
    const durationStr = `${durationHours}h ${remainingMins}m`;

    const totalTrips = trips.length;
    const totalRevenue = trips.reduce((sum, t) => sum + Number(t.trip_finance?.total_amount ?? 0), 0);
    const totalDriverShare = trips.reduce((sum, t) => sum + Number(t.trip_finance?.driver_share ?? 0), 0);
    const totalBalance = trips.reduce((sum, t) => sum + Number(t.trip_finance?.balance ?? 0), 0);

    const cashNotes = paymentSummary?.cashNotes ?? [];
    const byMethod = paymentSummary?.byMethod ?? {};
    const posTransactions = paymentSummary?.posTransactions ?? [];

    return (
        <>
            <Head title="Checkout Summary" />

            <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans print:bg-white print:p-0">
                <div className="max-w-5xl w-full mx-auto space-y-6">
                    {/* Header */}
                    <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 print:border-none print:shadow-none print:p-0">
                        <div>
                            <div className="flex items-center gap-2 text-blue-700 font-bold text-sm tracking-wider uppercase">
                                <span>Shift Ended</span>
                                <span>·</span>
                                <span>Officer: {user.name}</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-2">
                                Shift Checkout Summary
                            </h1>
                            <p className="text-gray-500 mt-1 text-sm">
                                View your assigned trips, collection breakdown, and handover summary.
                            </p>

                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex flex-wrap gap-3">
                                    <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                                        <span className="text-xs font-medium text-gray-500">
                                            Checked In
                                        </span>
                                        <span className="text-sm font-semibold text-gray-800">
                                            {formatDateTime(loginTime)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                                        <span className="text-xs font-medium text-gray-500">
                                            Checked Out
                                        </span>
                                        <span className="text-sm font-semibold text-gray-800">
                                            {formatDateTime(logoutTime)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 border border-green-100">
                                        <span className="text-xs font-medium text-green-700">
                                            Duration
                                        </span>
                                        <span className="text-sm font-bold text-green-700">
                                            {durationStr}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 relative z-10 print:hidden">
                            {/* Handover to Manager Option */}
                            {log.handed_over_at ? (
                                <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-4 py-2.5 rounded-xl text-sm font-semibold">
                                    <CheckCircle size={16} />
                                    Handed Over to Manager
                                </span>
                            ) : (
                                <button
                                    onClick={handleHandover}
                                    disabled={processing}
                                    className="inline-flex items-center justify-center gap-2 bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl hover:bg-blue-800 transition disabled:opacity-50 text-sm"
                                >
                                    Handover to Manager
                                </button>
                            )}

                            {/* Print Summary */}
                            <button
                                onClick={handlePrint}
                                className="inline-flex items-center justify-center gap-2 bg-slate-100 text-slate-800 border border-slate-200 font-bold px-4 py-2.5 rounded-xl hover:bg-slate-200 transition text-sm"
                            >
                                <Printer size={16} />
                                Print
                            </button>

                            {/* Download PDF */}
                            <a
                                href={`/checkout-summary/${log.id}/pdf`}
                                className="inline-flex items-center justify-center gap-2 bg-slate-100 text-slate-800 border border-slate-200 font-bold px-4 py-2.5 rounded-xl hover:bg-slate-200 transition text-sm"
                            >
                                <FileText size={16} />
                                Download PDF
                            </a>

                            {!log.handed_over_at ? (
                                <button
                                    disabled
                                    className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white font-bold px-4 py-2.5 rounded-xl transition text-sm opacity-50 cursor-not-allowed"
                                >
                                    <LogIn size={16} />
                                    Login Page
                                </button>
                            ) : (
                                <Link
                                    href="/login"
                                    className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white font-bold px-4 py-2.5 rounded-xl hover:bg-slate-800 transition text-sm"
                                >
                                    <LogIn size={16} />
                                    Login Page
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Metadata summary visible only when printing */}
                    <div className="hidden print:block border-b pb-4 mb-4">
                        <table className="w-full text-xs">
                            <tbody>
                                <tr>
                                    <td className="font-bold py-1">Officer Name:</td>
                                    <td>{user.name}</td>
                                </tr>
                                <tr>
                                    <td className="font-bold py-1">Checked In:</td>
                                    <td>{new Date(log.login_at).toLocaleString()}</td>
                                    <td className="font-bold py-1">Checked Out:</td>
                                    <td>{log.logout_at ? new Date(log.logout_at).toLocaleString() : '-'}</td>
                                </tr>
                                <tr>
                                    <td className="font-bold py-1">Handed Over:</td>
                                    <td colSpan={3}>
                                        {log.handed_over_at ? new Date(log.handed_over_at).toLocaleString() : 'Not Yet Handed Over'}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Shift Financial Overview Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
                        <div className="bg-white border rounded-2xl p-4 shadow-sm">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Total Trips</span>
                            <span className="text-2xl font-black text-gray-900 mt-1 block">{totalTrips}</span>
                        </div>
                        <div className="bg-white border rounded-2xl p-4 shadow-sm">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Total Revenue</span>
                            <span className="text-2xl font-black text-blue-700 mt-1 block">LKR {totalRevenue.toLocaleString()}</span>
                        </div>
                        <div className="bg-white border rounded-2xl p-4 shadow-sm">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Driver Shares</span>
                            <span className="text-2xl font-black text-emerald-700 mt-1 block">LKR {totalDriverShare.toLocaleString()}</span>
                        </div>
                        <div className="bg-white border rounded-2xl p-4 shadow-sm">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Net Balance</span>
                            <span className="text-2xl font-black text-purple-700 mt-1 block">LKR {totalBalance.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Collection & Cash Handover Summary Panel */}
                    <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
                        <div className="border-b pb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Wallet size={18} className="text-blue-700" />
                                    Payment Collection & Cash Handover Breakdown
                                </h2>
                                <p className="text-xs text-gray-500 mt-0.5">Summary of all currencies, cash notes, and payment methods collected</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Card 1: Payment Methods & Currencies Collected */}
                            <div className="bg-slate-50 border rounded-xl p-4 space-y-4">
                                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                                    <CreditCard size={16} className="text-blue-600" />
                                    Collection by Payment Method & Currency
                                </h3>

                                <div className="space-y-3 text-xs">
                                    {Object.keys(byMethod).length > 0 ? (
                                        Object.entries(byMethod).map(([method, data]) => (
                                            <div key={method} className="bg-white border rounded-lg p-3 space-y-1.5">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold text-gray-900 flex items-center gap-1.5">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-extrabold ${method === 'Cash' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                                                            {method}
                                                        </span>
                                                        <span>({data.count} transaction{data.count !== 1 ? 's' : ''})</span>
                                                    </span>
                                                    <span className="font-black text-slate-900">
                                                        Total: LKR {data.total.toLocaleString()}
                                                    </span>
                                                </div>

                                                {/* Currency sub-breakdown */}
                                                <div className="flex flex-wrap gap-1.5 pt-1 border-t">
                                                    {Object.entries(data.currencies || {}).map(([cur, amt]) => (
                                                        <span key={cur} className="bg-slate-100 text-slate-700 border px-2 py-0.5 rounded-md font-semibold text-[11px]">
                                                            {cur} {Number(amt).toLocaleString()}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-400 italic">No collections recorded.</p>
                                    )}
                                </div>

                                {/* POS Transactions list if any */}
                                {posTransactions.length > 0 && (
                                    <div className="mt-3 pt-3 border-t">
                                        <h4 className="text-xs font-bold text-slate-700 mb-2">POS / Card Transactions</h4>
                                        <div className="space-y-1.5">
                                            {posTransactions.map((tx, idx) => (
                                                <div key={idx} className="bg-white border rounded p-2 text-[11px] flex justify-between items-center">
                                                    <div>
                                                        <span className="font-semibold text-gray-800">{tx.customer_name}</span>
                                                        <span className="text-gray-400 ml-1.5">({tx.customer_code})</span>
                                                        {tx.transaction_id && <div className="text-[10px] text-blue-600">TXN: {tx.transaction_id}</div>}
                                                    </div>
                                                    <span className="font-bold text-blue-700">{tx.currency} {Number(tx.amount).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Card 2: Cash Denominations Handover (Cash Notes Summary) */}
                            <div className="bg-slate-50 border rounded-xl p-4 space-y-4">
                                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                                    <Banknote size={16} className="text-emerald-600" />
                                    Cash Notes Handover Breakdown
                                </h3>

                                {cashNotes.length > 0 ? (
                                    <div className="overflow-hidden rounded-lg border bg-white">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-100 border-b text-slate-600 font-bold uppercase text-[10px]">
                                                <tr>
                                                    <th className="px-3 py-2">Currency</th>
                                                    <th className="px-3 py-2">Note Value</th>
                                                    <th className="px-3 py-2 text-center">Qty</th>
                                                    <th className="px-3 py-2 text-right">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y text-slate-700">
                                                {cashNotes.map((cn, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50">
                                                        <td className="px-3 py-2 font-bold text-slate-900">{cn.currency}</td>
                                                        <td className="px-3 py-2 font-semibold">{Number(cn.note_value).toLocaleString()}</td>
                                                        <td className="px-3 py-2 text-center font-bold text-emerald-700">× {cn.count}</td>
                                                        <td className="px-3 py-2 text-right font-black text-slate-900">
                                                            {cn.currency} {Number(cn.total).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-white border rounded-lg text-center text-xs text-gray-400 italic">
                                        No cash notes recorded for this shift.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Trips List Panel */}
                    <div className="bg-white border rounded-2xl overflow-hidden shadow-sm print:border-none print:shadow-none">
                        <div className="p-5 border-b flex justify-between items-center print:px-0">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Car size={18} className="text-blue-700" />
                                    Assigned Trips List ({totalTrips})
                                </h2>
                                <p className="text-xs text-gray-500 mt-0.5">Trips assigned during your shift with payment breakdown</p>
                            </div>

                            <div className="text-right">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Total Revenue</span>
                                <span className="text-lg font-black text-blue-700">LKR {totalRevenue.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            {trips.length > 0 ? (
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead>
                                        <tr className="bg-gray-50 border-b text-gray-600 font-semibold uppercase text-[10px]">
                                            <th className="px-5 py-3">Time</th>
                                            <th className="px-5 py-3">Customer</th>
                                            <th className="px-5 py-3">Driver & Vehicle</th>
                                            <th className="px-5 py-3">Payment & Cash Notes</th>
                                            <th className="px-5 py-3">Dropoff Location</th>
                                            <th className="px-5 py-3 text-right">Trip Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y text-gray-700">
                                        {trips.map((trip) => {
                                            const tripTime = new Date(trip.trip_assigned_at ?? trip.created_at);
                                            const customer = trip.customer;
                                            const paymentNotes = Array.isArray(customer?.payment_notes)
                                                ? customer.payment_notes
                                                : (typeof customer?.payment_notes === 'string' ? JSON.parse(customer.payment_notes || '[]') : []);

                                            return (
                                                <tr key={trip.id} className="hover:bg-gray-50/50 transition">
                                                    <td className="px-5 py-4">
                                                        <span className="font-semibold">{tripTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="font-semibold text-gray-900">{customer?.name ?? 'Guest'}</div>
                                                        <div className="text-xs text-gray-400">{customer?.customer_code}</div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="font-semibold text-gray-900">{trip.driver?.first_name + ' ' + trip.driver?.last_name}</div>
                                                        <div className="text-xs text-gray-400">{trip.driver?.vehicle?.registration_number ?? '-'} ({trip.driver?.vehicle?.vehicle_type ?? ''})</div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        {paymentNotes.length > 0 ? (
                                                            <div className="space-y-1">
                                                                {paymentNotes.map((p, pi) => (
                                                                    <div key={pi} className="flex flex-wrap items-center gap-1 text-xs">
                                                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${p.method === 'Cash' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                                                                            {p.method}
                                                                        </span>
                                                                        <span className="font-semibold text-gray-800">
                                                                            {p.currency} {Number(p.amount).toLocaleString()}
                                                                        </span>
                                                                        {p.method === 'Cash' && Array.isArray(p.notes) && p.notes.map((n, ni) => (
                                                                            <span key={ni} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] border">
                                                                                💵 {n.amount} x {n.count} ({n.currency || p.currency})
                                                                            </span>
                                                                        ))}
                                                                        {p.transaction_id && (
                                                                            <span className="text-[10px] text-blue-600 font-mono">
                                                                                TXN: {p.transaction_id}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">{customer?.payment_method ?? 'Cash'}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4 max-w-[180px] truncate" title={customer?.dropoff_location}>
                                                        {customer?.dropoff_location ?? '-'}
                                                    </td>
                                                    <td className="px-5 py-4 text-right">
                                                        <span className="font-bold text-gray-900">
                                                            LKR {Number(trip.trip_finance?.total_amount ?? 0).toLocaleString()}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-8 text-center text-gray-400">
                                    No trips assigned during this session.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="max-w-5xl w-full mx-auto text-center text-xs text-gray-500 mt-8 pt-4 border-t print:hidden">
                    <p>© {new Date().getFullYear()} Airport Counter Management System. All rights reserved.</p>
                </div>
            </div>
        </>
    );
}
