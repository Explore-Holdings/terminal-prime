import AppSidebarLayout from '@/Layouts/AppSidebarLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Clock, Eye, Printer, FileText, Calendar, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function ManagerReports({ trips = [], reports = [], filters = {} }) {
    const currentRange = filters.range || 'today';
    const [fromDate, setFromDate] = useState(filters.from || '');
    const [toDate, setToDate] = useState(filters.to || '');

    const handleRangeChange = (range) => {
        if (range === 'custom') {
            router.get('/manager-reports', { range, from: fromDate, to: toDate }, { preserveState: true });
        } else {
            router.get('/manager-reports', { range }, { preserveState: true });
        }
    };

    const handleApplyCustom = (e) => {
        e.preventDefault();
        if (!fromDate || !toDate) {
            alert('Please select both From and To dates.');
            return;
        }
        router.get('/manager-reports', { range: 'custom', from: fromDate, to: toDate }, { preserveState: true });
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const rangeOptions = [
        { label: 'Today', value: 'today' },
        { label: 'This Week', value: 'week' },
        { label: 'This Month', value: 'month' },
        { label: 'Custom Range', value: 'custom' },
    ];

    const totalTrips = trips.length;
    const totalRevenue = trips.reduce((sum, t) => sum + Number(t.trip_finance?.total_amount ?? 0), 0);

    const exportQuery = currentRange === 'custom'
        ? `?range=custom&from=${filters.from || ''}&to=${filters.to || ''}`
        : `?range=${currentRange}`;

    return (
        <AppSidebarLayout title="Manager Reports">
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-900">
                    Manager Reports Dashboard
                </h1>
                <p className="text-gray-500 mt-1 text-sm">
                    Generate global reports and review individual shift checkouts.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Main Report Generator */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Filter Card */}
                    <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4 print:hidden">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block mb-1">
                                    Report Scope
                                </span>
                                <div className="flex rounded-lg border bg-white overflow-hidden text-sm font-medium">
                                    {rangeOptions.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => handleRangeChange(opt.value)}
                                            className={`px-4 py-2 transition ${
                                                currentRange === opt.value
                                                    ? 'bg-blue-700 text-white'
                                                    : 'text-gray-600 hover:bg-gray-50 bg-white'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <a
                                    href={`/manager-reports/trips/print${exportQuery}`}
                                    target="_blank"
                                    className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 border border-slate-200 font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-200 transition text-sm shadow-sm"
                                >
                                    <Printer size={16} />
                                    Print Report
                                </a>
                                <a
                                    href={`/manager-reports/trips/pdf${exportQuery}`}
                                    className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 border border-slate-200 font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-200 transition text-sm shadow-sm"
                                >
                                    <FileText size={16} />
                                    Download PDF
                                </a>
                            </div>
                        </div>

                        {/* Custom Date Range Form */}
                        {currentRange === 'custom' && (
                            <form onSubmit={handleApplyCustom} className="flex flex-wrap items-end gap-3 p-4 bg-gray-50 border rounded-xl">
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase">From Date</label>
                                    <input
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                        className="text-sm border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase">To Date</label>
                                    <input
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                        className="text-sm border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-4 py-2 rounded-lg text-sm transition"
                                >
                                    Apply Filter
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Trips List Panel */}
                    <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-5 border-b flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Calendar size={18} className="text-blue-700" />
                                    Trips list for this range ({totalTrips})
                                </h2>
                                <p className="text-xs text-gray-500 mt-0.5">Assigned trips during this period</p>
                            </div>

                            <div className="text-right">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Total Revenue</span>
                                <span className="text-xl font-black text-blue-700">LKR {totalRevenue.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            {trips.length > 0 ? (
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead>
                                        <tr className="bg-gray-50 border-b text-gray-600 font-semibold uppercase text-[10px]">
                                            <th className="px-6 py-3">Date & Time</th>
                                            <th className="px-6 py-3">Customer</th>
                                            <th className="px-6 py-3">Driver</th>
                                            <th className="px-6 py-3">Vehicle</th>
                                            <th className="px-6 py-3">Dropoff</th>
                                            <th className="px-6 py-3 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y text-gray-700">
                                        {trips.map((trip) => {
                                            const tripTime = new Date(trip.trip_assigned_at ?? trip.created_at);
                                            return (
                                                <tr key={trip.id} className="hover:bg-gray-50/50 transition">
                                                    <td className="px-6 py-4 text-xs">
                                                        <div className="font-semibold text-gray-800">
                                                            {tripTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        </div>
                                                        <div className="text-gray-400">
                                                            {tripTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-gray-900">{trip.customer?.name ?? 'Guest'}</div>
                                                        <div className="text-xs text-gray-400">{trip.customer?.customer_code}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-gray-900">{trip.driver?.full_name}</div>
                                                        <div className="text-xs text-gray-400">{trip.driver?.mobile_number}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-gray-900">{trip.driver?.vehicle?.registration_number ?? '-'}</div>
                                                        <div className="text-xs text-gray-400">{trip.driver?.vehicle?.vehicle_type ?? ''}</div>
                                                    </td>
                                                    <td className="px-6 py-4 max-w-[150px] truncate" title={trip.customer?.dropoff_location}>
                                                        {trip.customer?.dropoff_location ?? '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                                                        LKR {Number(trip.trip_finance?.total_amount ?? 0).toLocaleString()}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-12 text-center text-gray-400">
                                    No trips assigned for this range.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Submitted Shift Reports (Sidebar) */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-5 border-b bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Clock size={18} className="text-blue-700" />
                                Submitted Shifts
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">Shift checkouts handed over by staff</p>
                        </div>

                        <div className="divide-y max-h-[600px] overflow-y-auto">
                            {reports.length > 0 ? (
                                reports.map((report) => (
                                    <div key={report.id} className="p-4 hover:bg-gray-50 transition flex flex-col gap-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{report.user?.name}</p>
                                                <p className="text-xs text-gray-400">{report.user?.email}</p>
                                            </div>
                                            <span className="inline-flex items-center gap-0.5 bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded border border-green-200">
                                                <CheckCircle size={10} />
                                                Submitted
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs border-t pt-2">
                                            <div>
                                                <span className="text-gray-400 block font-medium">Submitted At</span>
                                                <span className="font-semibold text-gray-700">
                                                    {new Date(report.handed_over_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} @ {new Date(report.handed_over_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400 block font-medium">Total Trips</span>
                                                <span className="font-semibold text-gray-700">{report.total_trips} trips</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between border-t pt-2 mt-1">
                                            <span className="text-xs font-bold text-blue-700">
                                                LKR {Number(report.total_revenue).toLocaleString()}
                                            </span>
                                            <Link
                                                href={`/checkout-summary/${report.id}`}
                                                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                                            >
                                                View Summary <Eye size={12} />
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-400 text-sm">
                                    No shifts handed over yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
