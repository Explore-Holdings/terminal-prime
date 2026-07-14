import { Head, Link, useForm } from '@inertiajs/react';
import { Car, LogIn, Printer, FileText, CheckCircle } from 'lucide-react';

export default function CheckoutSummary({ log, user, trips = [] }) {
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
                                View your assigned trips and choose your handover preference.
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
                                    <td className="font-bold py-1">IP Address:</td>
                                    <td>{log.ip_address ?? '-'}</td>
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

                    {/* Trips List Panel */}
                    <div className="bg-white border rounded-2xl overflow-hidden shadow-sm print:border-none print:shadow-none">
                        <div className="p-5 border-b flex justify-between items-center print:px-0">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Car size={18} className="text-blue-700" />
                                    Assigned Trips List ({totalTrips})
                                </h2>
                                <p className="text-xs text-gray-500 mt-0.5">Trips assigned during your shift</p>
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
                                            <th className="px-6 py-3">Time</th>
                                            <th className="px-6 py-3">Customer</th>
                                            <th className="px-6 py-3">Driver</th>
                                            <th className="px-6 py-3">Vehicle</th>
                                            <th className="px-6 py-3">Dropoff Location</th>
                                            <th className="px-6 py-3 text-right">Trip Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y text-gray-700">
                                        {trips.map((trip) => {
                                            const tripTime = new Date(trip.trip_assigned_at ?? trip.created_at);
                                            return (
                                                <tr key={trip.id} className="hover:bg-gray-50/50 transition">
                                                    <td className="px-6 py-4">
                                                        <span className="font-semibold">{tripTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-gray-900">{trip.customer?.name ?? 'Guest'}</div>
                                                        <div className="text-xs text-gray-400">{trip.customer?.customer_code}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-gray-900">{trip.driver?.first_name + ' ' + trip.driver?.last_name}</div>
                                                        <div className="text-xs text-gray-400">{trip.driver?.mobile_number}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-gray-900">{trip.driver?.vehicle?.registration_number ?? '-'}</div>
                                                        <div className="text-xs text-gray-400">{trip.driver?.vehicle?.vehicle_type ?? ''}</div>
                                                    </td>
                                                    <td className="px-6 py-4 max-w-[200px] truncate" title={trip.customer?.dropoff_location}>
                                                        {trip.customer?.dropoff_location ?? '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
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
