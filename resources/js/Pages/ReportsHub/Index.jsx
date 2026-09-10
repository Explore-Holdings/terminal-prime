import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppSidebarLayout from '@/Layouts/AppSidebarLayout';
import ReportModal from './ReportModal';
import {
    MapIcon,
    CurrencyDollarIcon,
    UserGroupIcon,
    UsersIcon,
    BanknotesIcon,
    ComputerDesktopIcon,
    ClipboardDocumentCheckIcon,
    BriefcaseIcon,
} from '@heroicons/react/24/outline';

const formatCurrency = (amount, currency = 'LKR') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(amount || 0);
};

const REPORTS = [
    {
        id: 'trips',
        title: 'Trips Report',
        description: 'Comprehensive overview of all completed and pending trips.',
        icon: MapIcon,
        color: 'from-blue-500 to-indigo-600',
        endpoint: '/reports-hub/data/trips',
        columns: [
            { key: 'date', label: 'Date', format: v => new Date(v).toLocaleString() },
            { key: 'customer_name', label: 'Customer', bold: true },
            { key: 'driver_name', label: 'Driver' },
            { key: 'destination', label: 'Destination' },
            { key: 'status', label: 'Status' },
            { key: 'amount', label: 'Amount', align: 'right', format: (v, r) => formatCurrency(v, r.currency) }
        ],
        summaryRow: (summary) => [
            { colSpan: 5, value: 'Total Trips', align: 'right' },
            { value: summary.total, align: 'right' }
        ]
    },
    {
        id: 'revenue',
        title: 'Revenue Report',
        description: 'Financial intake broken down by payment methods and currency.',
        icon: CurrencyDollarIcon,
        color: 'from-emerald-500 to-teal-600',
        endpoint: '/reports-hub/data/revenue',
        columns: [
            { key: 'date', label: 'Date', format: v => new Date(v).toLocaleDateString() },
            { key: 'customer_name', label: 'Customer', bold: true },
            { key: 'payment_method', label: 'Payment Method' },
            { key: 'destination', label: 'Destination' },
            { key: 'amount', label: 'Amount', align: 'right', format: (v, r) => formatCurrency(v, r.currency) }
        ],
        summaryRow: (summary) => [
            { colSpan: 4, value: 'Total Completed Revenue', align: 'right' },
            { value: formatCurrency(summary.total_revenue, 'LKR'), align: 'right' }
        ]
    },
    {
        id: 'drivers',
        title: 'Drivers Report',
        description: 'Driver performance, trip counts, and total earnings.',
        icon: UserGroupIcon,
        color: 'from-orange-500 to-amber-600',
        endpoint: '/reports-hub/data/drivers',
        columns: [
            { key: 'driver_name', label: 'Driver Name', bold: true },
            { key: 'registration_number', label: 'Vehicle Reg' },
            { key: 'driver_status', label: 'Status' },
            { key: 'trips_count', label: 'Total Trips', align: 'right' },
            { key: 'completed_trips', label: 'Completed', align: 'right' },
            { key: 'total_earnings', label: 'Total Earnings', align: 'right', format: v => formatCurrency(v, 'LKR') }
        ]
    },
    {
        id: 'customers',
        title: 'Customers Report',
        description: 'Customer directory, booking frequency, and total spent.',
        icon: UsersIcon,
        color: 'from-purple-500 to-fuchsia-600',
        endpoint: '/reports-hub/data/customers',
        columns: [
            { key: 'created_at', label: 'Registered', format: v => new Date(v).toLocaleDateString() },
            { key: 'customer_name', label: 'Name', bold: true },
            { key: 'whatsapp_number', label: 'Contact' },
            { key: 'trips_count', label: 'Trips Booked', align: 'right' },
            { key: 'total_spent', label: 'Total Spent', align: 'right', format: (v, r) => formatCurrency(v, r.currency) }
        ]
    },
    {
        id: 'finance',
        title: 'Finance Report',
        description: 'Detailed ledger of trip payouts, expenses, and balances.',
        categories: ['Balance Sheet', 'Income', 'Expenses', 'Payouts'],
        icon: BanknotesIcon,
        color: 'from-cyan-500 to-blue-600',
        endpoint: '/reports-hub/data/finance',
        columns: [
            { key: 'date', label: 'Date', format: v => new Date(v).toLocaleString() },
            { key: 'type', label: 'Transaction Type', bold: true },
            { key: 'reference', label: 'Reference' },
            { key: 'status', label: 'Status' },
            { key: 'amount', label: 'Amount', align: 'right', format: v => formatCurrency(v, 'LKR') }
        ]
    },
    {
        id: 'sessions',
        title: 'Counter Sessions',
        description: 'Agent shift logs, cash collected, and checkout summaries.',
        icon: ComputerDesktopIcon,
        color: 'from-pink-500 to-rose-600',
        endpoint: '/reports-hub/data/sessions',
        columns: [
            { key: 'login_at', label: 'Login Time', format: v => new Date(v).toLocaleString() },
            { key: 'agent_name', label: 'Agent Name', bold: true },
            { key: 'duration_minutes', label: 'Duration (Mins)', align: 'right' },
            { key: 'total_trips', label: 'Trips Handled', align: 'right' },
            { key: 'total_amount', label: 'Total Collected', align: 'right', format: v => formatCurrency(v, 'LKR') }
        ]
    },
    {
        id: 'surveys',
        title: 'Survey Report',
        description: 'Customer feedback ratings and detailed comments.',
        icon: ClipboardDocumentCheckIcon,
        color: 'from-lime-500 to-green-600',
        endpoint: '/reports-hub/data/surveys',
        columns: [
            { key: 'submitted_at', label: 'Date', format: v => new Date(v).toLocaleDateString() },
            { key: 'customer_name', label: 'Customer', bold: true },
            { key: 'driver_name', label: 'Driver' },
            { key: 'overall_rating', label: 'Overall Rating', align: 'right', format: v => `${v} / 5` },
            { key: 'comments', label: 'Comments' }
        ],
        summaryRow: (summary) => [
            { colSpan: 3, value: 'Average Overall Rating', align: 'right' },
            { colSpan: 2, value: summary.avg_rating ? `${summary.avg_rating} / 5` : 'N/A', align: 'left' }
        ]
    },
    {
        id: 'manager',
        title: 'Manager Report',
        description: 'High-level aggregation of operations by agent and shift.',
        icon: BriefcaseIcon,
        color: 'from-slate-600 to-gray-800',
        endpoint: '/reports-hub/data/manager',
        columns: [
            { key: 'agent_name', label: 'Agent Name', bold: true },
            { key: 'total_trips', label: 'Total Trips', align: 'right' },
            { key: 'completed_trips', label: 'Completed', align: 'right' },
            { key: 'cancelled_trips', label: 'Cancelled', align: 'right' },
            { key: 'total_revenue', label: 'Total Revenue', align: 'right', format: v => formatCurrency(v, 'LKR') }
        ]
    }
];

export default function ReportsHubIndex() {
    const [activeReport, setActiveReport] = useState(null);

    return (
        <AppSidebarLayout title="Reports Hub">
            <Head title="Reports Hub" />
            
            <div className="max-w-7xl mx-auto space-y-8 pb-12">
                <div>
                    <h1 className="text-3xl font-black text-[#0f1d45] tracking-tight">Reports Hub</h1>
                    <p className="mt-2 text-sm text-gray-500 font-medium">
                        Access all system reports, filter by date, and export directly to PDF or Excel.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {REPORTS.map((report) => (
                        <div
                            key={report.id}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-colors duration-200 group cursor-pointer"
                            onClick={() => setActiveReport(report)}
                        >
                            <div>
                                <div className="flex items-center gap-2">
                                    <report.icon className="w-4 h-4 shrink-0 text-gray-500" />
                                    <h3 className="text-sm font-bold text-[#0f1d45] truncate">
                                        {report.title}
                                    </h3>
                                </div>
                                <p className="mt-2 text-xs text-gray-500 font-medium leading-relaxed min-h-8 line-clamp-2">
                                    {report.description}
                                </p>
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-[#0f1d45] transition-colors">
                                    View Report
                                </span>
                                <div className="text-gray-400 group-hover:text-[#0f1d45] transition-colors">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <ReportModal 
                isOpen={!!activeReport} 
                onClose={() => setActiveReport(null)} 
                config={activeReport}
            />
        </AppSidebarLayout>
    );
}
