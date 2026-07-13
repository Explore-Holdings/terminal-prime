import AppSidebarLayout from '@/Layouts/AppSidebarLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Clock, Eye, Printer, FileText } from 'lucide-react';

export default function ManagerReports({ reports = [], filters = {} }) {
    const currentFilter = filters.filter || 'all';

    const handleFilterChange = (filter) => {
        router.get('/manager-reports', { filter }, { preserveState: true });
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

    const filterOptions = [
        { label: 'All Reports', value: 'all' },
        { label: 'Today', value: 'today' },
        { label: 'This Week', value: 'week' },
        { label: 'This Month', value: 'month' },
    ];

    return (
        <AppSidebarLayout title="Manager Reports">
            <div className="mb-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Manager Reports
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        View shift checkout reports submitted by counter officers
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Today's Trips Reports Options */}
                    <div className="flex gap-2">
                        <a
                            href="/manager-reports/today-trips/print"
                            target="_blank"
                            className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 border border-slate-200 font-semibold px-3.5 py-2 rounded-lg hover:bg-slate-200 transition text-sm shadow-sm"
                        >
                            <Printer size={15} />
                            Print Today's Trips
                        </a>
                        <a
                            href="/manager-reports/today-trips/pdf"
                            className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 border border-slate-200 font-semibold px-3.5 py-2 rounded-lg hover:bg-slate-200 transition text-sm shadow-sm"
                        >
                            <FileText size={15} />
                            Download Today's Trips PDF
                        </a>
                    </div>

                    {/* Filter Options */}
                    <div className="flex rounded-lg border bg-white overflow-hidden text-sm font-medium shadow-sm">
                        {filterOptions.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleFilterChange(opt.value)}
                                className={`px-4 py-2 transition ${
                                    currentFilter === opt.value
                                        ? 'bg-blue-700 text-white'
                                        : 'text-gray-600 hover:bg-gray-50 bg-white'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Reports List Table */}
            <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                <div className="p-5 border-b">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Clock size={18} className="text-blue-700" />
                        Submitted Shift Reports ({reports.length})
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    {reports.length > 0 ? (
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead>
                                <tr className="bg-gray-50 border-b text-gray-600 font-semibold uppercase text-[10px]">
                                    <th className="px-6 py-3.5">Submitted At</th>
                                    <th className="px-6 py-3.5">Officer</th>
                                    <th className="px-6 py-3.5">Checked In</th>
                                    <th className="px-6 py-3.5">Checked Out</th>
                                    <th className="px-6 py-3.5 text-center">Total Trips</th>
                                    <th className="px-6 py-3.5 text-right">Revenue</th>
                                    <th className="px-6 py-3.5 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-gray-700">
                                {reports.map((report) => (
                                    <tr key={report.id} className="hover:bg-gray-50/50 transition">
                                        <td className="px-6 py-4 font-semibold text-gray-900">
                                            {formatDateTime(report.handed_over_at)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900">
                                                {report.user?.name}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {report.user?.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {formatDateTime(report.login_at)}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {formatDateTime(report.logout_at)}
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-blue-700">
                                            {report.total_trips}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                                            LKR {Number(report.total_revenue).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Link
                                                href={`/checkout-summary/${report.id}`}
                                                className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                                            >
                                                <Eye size={14} />
                                                View Summary
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-12 text-center text-gray-400">
                            <span className="text-3xl block mb-2">📋</span>
                            No reports submitted for this period.
                        </div>
                    )}
                </div>
            </div>
        </AppSidebarLayout>
    );
}
