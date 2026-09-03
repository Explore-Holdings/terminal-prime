import AppSidebarLayout from '@/Layouts/AppSidebarLayout';
import { Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowTrendingUpIcon,
    UserGroupIcon,
    TruckIcon,
    BanknotesIcon,
} from '@heroicons/react/24/outline';
import { Calendar, X, Check, XCircle, CheckCircle, Monitor, Smartphone, Tablet, Globe, MapPin, Clock, Laptop } from 'lucide-react';

export default function Dashboard({
    stats = {},
    recentCustomers = [],
    recentDrivers = [],
    pendingAttendanceRequests = [],
    recentLogins = [],
}) {
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const { props } = usePage();
    const role = String(props.auth?.user?.role ?? '').toLowerCase();
    const userName = props.auth?.user?.name ?? 'User';

    const canViewCustomers = role.includes('executive') || ['admin', 'counter staff'].includes(role);
    const canViewDrivers = role.includes('executive') || ['admin'].includes(role);
    const canViewFinance = role.includes('executive') || ['admin', 'finance'].includes(role);
    const canViewLogins = ['admin', 'executive', 'manager'].includes(role);

    return (
        <AppSidebarLayout title="Dashboard">
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#0f1d45]">
                        Welcome back, {userName} 👋
                    </h1>
                    <p className="text-gray-400 mt-1 text-sm font-medium">
                        Here's what's happening with your airport counter today.
                    </p>
                </div>
                {role === 'admin' && (
                    <button
                        onClick={() => setShowAttendanceModal(true)}
                        className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl transition shadow-sm whitespace-nowrap relative"
                    >
                        <Calendar size={18} />
                        <span>Attendance Requests</span>
                        {props.pendingAttendanceCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md border-2 border-white">
                                {props.pendingAttendanceCount}
                            </span>
                        )}
                    </button>
                )}
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-7">
                {canViewCustomers && (
                    <DashboardCard
                        title="Total Customers"
                        value={stats.totalCustomers}
                        subtitle="Registered customers"
                        href="/customers"
                        buttonText="Manage"
                        icon={UserGroupIcon}
                        iconBg="bg-blue-50"
                        iconColor="text-[#0f1d45]"
                        // trend="+8.2%"
                    />
                )}

                {canViewDrivers && (
                    <DashboardCard
                        title="Active Drivers"
                        value={stats.totalDrivers}
                        subtitle="Registered drivers"
                        href="/drivers"
                        buttonText="Manage"
                        icon={TruckIcon}
                        iconBg="bg-emerald-50"
                        iconColor="text-emerald-600"
                        // trend="+3.1%"
                    />
                )}

                {canViewFinance && (
                    <DashboardCard
                        title="Total Revenue"
                        value={`Rs. ${Number(stats.totalFinance ?? 0).toLocaleString()}`}
                        subtitle="Total finance"
                        href="/finance"
                        buttonText="View"
                        icon={BanknotesIcon}
                        iconBg="bg-amber-50"
                        iconColor="text-amber-600"
                        // trend="+24.3%"
                    />
                )}
            </div>

            {/* Recent Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {canViewCustomers && (
                    <RecentCard
                        title="Recent Customers"
                        href="/customers"
                        headers={['Name', 'WhatsApp', 'Status']}
                        rows={recentCustomers.map((customer) => [
                            customer.name ?? '-',
                            customer.whatsapp_number ?? '-',
                            <Badge key={customer.id} value={customer.status} />,
                        ])}
                        emptyText="No customers found"
                    />
                )}

                {canViewDrivers && (
                    <RecentCard
                        title="Recent Drivers"
                        href="/drivers"
                        headers={['Reg No', 'Name', 'Status']}
                        rows={recentDrivers.map((driver) => [
                            driver.registration_number ?? '-',
                            `${driver.first_name ?? ''} ${driver.last_name ?? ''}`.trim() || '-',
                            <Badge key={driver.id} value={driver.driver_status} />,
                        ])}
                        emptyText="No drivers found"
                    />
                )}
            </div>

            {/* Recent Login & Device Activity */}
            {canViewLogins && (
                <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:shadow-[#0f1d45]/5 transition-all duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-black text-[#0f1d45]">Recent Login Activity</h2>
                                <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full border border-indigo-100">
                                    Live Session Tracker
                                </span>
                            </div>
                            <p className="text-sm font-medium text-gray-400 mt-0.5">
                                Device details, operating systems, browsers & geographic locations of logged-in staff.
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                    <th className="pb-3 px-3">User & Role</th>
                                    <th className="pb-3 px-3">Device & OS</th>
                                    <th className="pb-3 px-3">Browser</th>
                                    <th className="pb-3 px-3">Location & IP</th>
                                    <th className="pb-3 px-3">Logged In At</th>
                                    <th className="pb-3 px-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentLogins.length > 0 ? (
                                    recentLogins.map((login) => {
                                        const isMobile = (login.device_type || '').toLowerCase() === 'mobile';
                                        const isTablet = (login.device_type || '').toLowerCase() === 'tablet';
                                        const isActive = login.status === 'active' && !login.logout_at;

                                        return (
                                            <tr key={login.id} className="hover:bg-[#f5f6fa]/60 transition-colors">
                                                {/* User Info */}
                                                <td className="py-3.5 px-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-[#0f1d45] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                                                            {(login.user_name || 'U').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-[#0f1d45] text-sm leading-snug">{login.user_name}</p>
                                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 capitalize">
                                                                    {login.user_role}
                                                                </span>
                                                                {login.shift_id && (
                                                                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                                                        {login.shift_id}
                                                                    </span>
                                                                )}
                                                                {login.user_email && (
                                                                    <span className="text-xs text-gray-400 truncate max-w-[140px]">
                                                                        {login.user_email}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Device & OS */}
                                                <td className="py-3.5 px-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                                            {isMobile ? (
                                                                <Smartphone size={15} />
                                                            ) : isTablet ? (
                                                                <Tablet size={15} />
                                                            ) : (
                                                                <Monitor size={15} />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800 text-xs">
                                                                {login.device_name || 'Personal Computer'}
                                                            </p>
                                                            <p className="text-[11px] text-gray-400 font-medium">
                                                                {login.operating_system || 'Desktop OS'}
                                                            </p>
                                                            {login.device_id && (
                                                                <span
                                                                    className="text-[10px] font-mono font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100/80 rounded px-1.5 py-0.5 mt-1 inline-block max-w-[180px] truncate cursor-pointer hover:bg-indigo-100 transition-colors"
                                                                    title={`Hardware Device ID: ${login.device_id}`}
                                                                >
                                                                    ID: {login.device_id}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Browser */}
                                                <td className="py-3.5 px-3">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200">
                                                        <Globe size={13} className="text-slate-400" />
                                                        {login.browser || 'Web Browser'}
                                                    </span>
                                                </td>

                                                {/* Location & IP */}
                                                <td className="py-3.5 px-3">
                                                    <div className="flex items-start gap-1.5">
                                                        <MapPin size={14} className="text-rose-500 shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="font-bold text-slate-800 text-xs">
                                                                {login.location || 'Airport LAN'}
                                                            </p>
                                                            <p className="text-[11px] font-mono text-gray-400">
                                                                {login.ip_address}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Date & Time */}
                                                <td className="py-3.5 px-3">
                                                    <div className="flex items-center gap-1.5 text-slate-600 text-xs font-semibold">
                                                        <Clock size={13} className="text-gray-400 shrink-0" />
                                                        <span>
                                                            {login.login_at
                                                                ? new Date(login.login_at).toLocaleString([], {
                                                                      month: 'short',
                                                                      day: 'numeric',
                                                                      hour: '2-digit',
                                                                      minute: '2-digit',
                                                                  })
                                                                : '-'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="py-3.5 px-3">
                                                    {isActive ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                            Active Now
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                                                            Logged Out
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-gray-400 font-medium">
                                            No recent login activity recorded yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showAttendanceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-10">
                            <div>
                                <h2 className="text-xl font-black text-[#0f1d45]">Pending Attendance Requests</h2>
                                <p className="text-sm font-medium text-gray-400">Review and approve agent check-ins.</p>
                            </div>
                            <button
                                onClick={() => setShowAttendanceModal(false)}
                                className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-5 pt-0">
                            {pendingAttendanceRequests.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <CheckCircle className="mx-auto h-8 w-8 text-emerald-400 mb-2" />
                                    <p className="text-sm font-bold text-gray-500">All caught up!</p>
                                    <p className="text-xs text-gray-400">No pending attendance requests right now.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {pendingAttendanceRequests.map((req) => (
                                        <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#f5f6fa]/50 border border-gray-100 rounded-xl hover:bg-white hover:shadow-sm transition">
                                            <div>
                                                <p className="text-sm font-black text-[#0f1d45]">{req.user_name || 'Agent'} | Reason : {req.reason}</p>
                                                <p className="text-xs font-medium text-gray-400">Requested: {new Date(req.requested_at).toLocaleString()}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => router.post(route('attendance-requests.approve', req.id), {}, { preserveScroll: true, preserveState: true })}
                                                    className="inline-flex flex-1 justify-center items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold text-xs rounded-lg transition"
                                                >
                                                    <Check size={14} />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => router.post(route('attendance-requests.reject', req.id), {}, { preserveScroll: true, preserveState: true })}
                                                    className="inline-flex flex-1 justify-center items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs rounded-lg transition"
                                                >
                                                    <XCircle size={14} />
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AppSidebarLayout>
    );
}

function DashboardCard({ title, value, subtitle, href, buttonText, icon: Icon, iconBg, iconColor, trend }) {
    return (
        <Link href={href} className="group block">
            <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:shadow-[#0f1d45]/5 hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex items-center justify-between gap-2">
                    <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-4 h-4 ${iconColor}`} />
                    </div>

                    {trend && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <ArrowTrendingUpIcon className="w-3 h-3" />
                            {trend}
                        </span>
                    )}
                </div>

                <div className="mt-2.5">
                    <p className="text-xs font-semibold text-gray-400 truncate">
                        {title}
                    </p>

                    <p className="text-xl font-black leading-tight text-[#0f1d45] mt-0.5">
                        {value ?? 0}
                    </p>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-gray-50">
                    <p className="text-[11px] font-medium text-gray-400 truncate">
                        {subtitle}
                    </p>

                    <span className="bg-[#0f1d45] text-white px-3 py-1 text-[11px] font-bold rounded-md group-hover:bg-[#1a2d5c] transition-all whitespace-nowrap">
                        {buttonText}
                    </span>
                </div>
            </div>
        </Link>
    );
}

function RecentCard({ title, href, headers, rows, emptyText }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:shadow-[#0f1d45]/5 transition-all duration-300">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-lg font-black text-[#0f1d45]">{title}</h2>
                    <p className="text-sm font-medium text-gray-400">Latest records</p>
                </div>

                <Link
                    href={href}
                    className="bg-[#0f1d45] text-white px-4 py-2 hover:bg-[#1a2d5c] text-xs font-bold rounded-lg transition-all shadow-md shadow-[#0f1d45]/10"
                >
                    View All
                </Link>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-[#f5f6fa]">
                            {headers.map((header) => (
                                <th
                                    key={header}
                                    className="px-4 py-3 text-left text-xs font-bold text-[#0f1d45] uppercase tracking-wider"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {rows.length > 0 ? (
                            rows.map((row, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className="border-t border-gray-50 hover:bg-[#f5f6fa]/50 transition"
                                >
                                    {row.map((cell, cellIndex) => (
                                        <td key={cellIndex} className="px-4 py-3 text-gray-600 font-medium">
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={headers.length}
                                    className="p-6 text-center text-gray-400 font-medium"
                                >
                                    {emptyText}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function Badge({ value }) {
    const colors = {
        Active: 'bg-emerald-50 text-emerald-600',
        Inactive: 'bg-gray-100 text-gray-500',
        Pending: 'bg-amber-50 text-amber-600',
        New: 'bg-blue-50 text-[#0f1d45]',
        Confirmed: 'bg-emerald-50 text-emerald-600',
        Completed: 'bg-purple-50 text-purple-600',
        Cancelled: 'bg-red-50 text-red-500',
        Suspended: 'bg-red-50 text-red-500',
        Rejected: 'bg-gray-100 text-gray-500',
    };

    return (
        <span
            className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                colors[value] ?? 'bg-blue-50 text-[#0f1d45]'
            }`}
        >
            {value ?? 'N/A'}
        </span>
    );
}