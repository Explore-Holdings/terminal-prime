import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppSidebarLayout from '@/Layouts/AppSidebarLayout';
import {
    Shield,
    Activity,
    Database,
    FileSpreadsheet,
    Search,
    Filter,
    ArrowDownToLine,
    PlusCircle,
    Edit3,
    Trash2,
    Monitor,
    Smartphone,
    Tablet,
    Globe,
    MapPin,
    Clock,
    Eye,
    X,
    CheckCircle2,
    Laptop,
    Server,
    Layers,
    User,
    Lock,
} from 'lucide-react';

export default function AdminIndex({
    activeTab = 'audit',
    stats = {},
    tables = [],
    filters = {},
    auditLogs = { data: [], links: [] },
    recentLogins = { data: [], links: [] },
}) {
    const [currentTab, setCurrentTab] = useState(activeTab);
    const [selectedLog, setSelectedLog] = useState(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedAction, setSelectedAction] = useState(filters.action || 'all');
    const [selectedTable, setSelectedTable] = useState(filters.table || 'all');
    const [dateRange, setDateRange] = useState(filters.range || 'all');
    const [loginSearch, setLoginSearch] = useState(filters.login_search || '');

    // Apply audit filters
    const applyAuditFilters = (newFilters = {}) => {
        const queryParams = {
            tab: 'audit',
            search: searchQuery,
            action: selectedAction,
            table: selectedTable,
            range: dateRange,
            ...newFilters,
        };

        // Remove default 'all' or empty params
        Object.keys(queryParams).forEach((k) => {
            if (queryParams[k] === 'all' || queryParams[k] === '' || queryParams[k] == null) {
                delete queryParams[k];
            }
        });

        router.get('/admin', queryParams, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Apply login tracker filter
    const applyLoginFilter = (e) => {
        e.preventDefault();
        router.get(
            '/admin',
            { tab: 'logins', login_search: loginSearch },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleLoginPerPageChange = (newPerPage) => {
        router.get(
            '/admin',
            {
                tab: 'logins',
                login_search: loginSearch,
                login_per_page: newPerPage,
            },
            { preserveScroll: true, preserveState: true }
        );
    };

    const handleAuditPerPageChange = (newPerPage) => {
        applyAuditFilters({ audit_per_page: newPerPage });
    };

    // Action badge renderer
    const renderActionBadge = (action) => {
        const act = (action || '').toUpperCase();
        if (act === 'CREATE') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                    <PlusCircle size={12} className="text-emerald-600" />
                    INSERT
                </span>
            );
        }
        if (act === 'UPDATE') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
                    <Edit3 size={12} className="text-blue-600" />
                    UPDATE
                </span>
            );
        }
        if (act === 'DELETE') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
                    <Trash2 size={12} className="text-rose-600" />
                    DELETE
                </span>
            );
        }
        if (act.includes('EXPORT')) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                    <FileSpreadsheet size={12} className="text-amber-600" />
                    {act.replace('_', ' ')}
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                <Activity size={12} className="text-slate-500" />
                {act}
            </span>
        );
    };

    return (
        <AppSidebarLayout title="Admin Command Center">
            <Head title="Admin Operations & Audit Intelligence" />

            <div className="space-y-6">
                {/* ── TOP BANNER ── */}
                <div className="bg-gradient-to-r from-[#0f1d45] via-[#1a2d6b] to-[#0f1d45] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-[#0f1d45]/15 relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute right-1/4 -top-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                        <div>
                            <div className="flex items-center gap-2.5 mb-2">
                                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                                    <Shield className="w-5 h-5 text-blue-300" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-blue-200 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                                    Admin Security & Audit Intelligence
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                                System Command Center
                            </h1>
                            <p className="text-blue-200/80 text-sm max-w-2xl mt-1 leading-relaxed">
                                Complete real-time audit trail of all database creates, edits, deletes, Excel exports, and live terminal login sessions across Terminal Prime.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={() => router.post('/admin/lock')}
                                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-all shadow-sm"
                                title="Lock Admin Session and Exit"
                            >
                                <Lock size={14} className="text-blue-300" />
                                Lock Admin
                            </button>
                            <a
                                href={`/admin/export?action=${selectedAction}&table=${selectedTable}&search=${encodeURIComponent(searchQuery)}`}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                            >
                                <ArrowDownToLine size={15} />
                                Export Audit Trail (CSV/Excel)
                            </a>
                        </div>
                    </div>
                </div>

                {/* ── KPI METRIC CARDS ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500">Actions Today</span>
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <Database size={15} />
                            </div>
                        </div>
                        <p className="text-xl font-black text-[#0f1d45] mt-2">
                            {stats.total_actions_today || 0}
                        </p>
                        <span className="text-[10px] text-gray-400 font-medium">All recorded operations</span>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500">Inserts</span>
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <PlusCircle size={15} />
                            </div>
                        </div>
                        <p className="text-xl font-black text-emerald-600 mt-2">
                            {stats.creates_today || 0}
                        </p>
                        <span className="text-[10px] text-gray-400 font-medium">Created records today</span>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500">Updates / Edits</span>
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Edit3 size={15} />
                            </div>
                        </div>
                        <p className="text-xl font-black text-blue-600 mt-2">
                            {stats.updates_today || 0}
                        </p>
                        <span className="text-[10px] text-gray-400 font-medium">Modified rows today</span>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500">Deletes</span>
                            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                                <Trash2 size={15} />
                            </div>
                        </div>
                        <p className="text-xl font-black text-rose-600 mt-2">
                            {stats.deletes_today || 0}
                        </p>
                        <span className="text-[10px] text-gray-400 font-medium">Deleted records today</span>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500">Exports</span>
                            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                <FileSpreadsheet size={15} />
                            </div>
                        </div>
                        <p className="text-xl font-black text-amber-600 mt-2">
                            {stats.exports_today || 0}
                        </p>
                        <span className="text-[10px] text-gray-400 font-medium">Excel/PDF exports today</span>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500">Active Sessions</span>
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center relative">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1 right-1 animate-ping" />
                                <Monitor size={15} />
                            </div>
                        </div>
                        <p className="text-xl font-black text-[#0f1d45] mt-2">
                            {stats.active_logins || 0}
                        </p>
                        <span className="text-[10px] text-emerald-600 font-bold">Online terminals now</span>
                    </div>
                </div>

                {/* ── TAB NAVIGATION ── */}
                <div className="bg-white rounded-2xl p-1.5 border border-gray-200/80 inline-flex items-center gap-1 shadow-sm">
                    <button
                        type="button"
                        onClick={() => {
                            setCurrentTab('audit');
                            router.get('/admin', { tab: 'audit' }, { preserveScroll: true, preserveState: true });
                        }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                            currentTab === 'audit'
                                ? 'bg-[#0f1d45] text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                    >
                        <Database size={15} />
                        <span>System Audit Trail & Operations</span>
                        <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                currentTab === 'audit' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                        >
                            {auditLogs.total || 0}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setCurrentTab('logins');
                            router.get('/admin', { tab: 'logins' }, { preserveScroll: true, preserveState: true });
                        }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                            currentTab === 'logins'
                                ? 'bg-[#0f1d45] text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                    >
                        <Activity size={15} />
                        <span>Live Session Tracker & Login Activity</span>
                        <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                currentTab === 'logins' ? 'bg-emerald-400 text-[#0f1d45]' : 'bg-emerald-50 text-emerald-700'
                            }`}
                        >
                            {recentLogins.total || 0}
                        </span>
                    </button>
                </div>

                {/* ── TAB 1: SYSTEM AUDIT TRAIL ── */}
                {currentTab === 'audit' && (
                    <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-5">
                        {/* Filters Bar */}
                        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pb-2 border-b border-gray-100">
                            {/* Search */}
                            <div className="relative flex-1 min-w-[260px]">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && applyAuditFilters({ search: searchQuery })}
                                    placeholder="Search task, user, IP, device ID, record ID..."
                                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f1d45] focus:border-transparent font-medium"
                                />
                            </div>

                            {/* Dropdowns */}
                            <div className="flex flex-wrap items-center gap-2">
                                {/* Action Filter */}
                                <select
                                    value={selectedAction}
                                    onChange={(e) => {
                                        setSelectedAction(e.target.value);
                                        applyAuditFilters({ action: e.target.value });
                                    }}
                                    className="text-xs font-semibold py-2 px-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#0f1d45] focus:outline-none"
                                >
                                    <option value="all">All Actions</option>
                                    <option value="CREATE">Insert / Create</option>
                                    <option value="UPDATE">Update / Edit</option>
                                    <option value="DELETE">Delete</option>
                                    <option value="exports">All Exports (Excel, PDF)</option>
                                    <option value="EXCEL_EXPORT">Excel Exports</option>
                                </select>

                                {/* Entity / Table Filter */}
                                <select
                                    value={selectedTable}
                                    onChange={(e) => {
                                        setSelectedTable(e.target.value);
                                        applyAuditFilters({ table: e.target.value });
                                    }}
                                    className="text-xs font-semibold py-2 px-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#0f1d45] focus:outline-none capitalize"
                                >
                                    <option value="all">All Entities / Tables</option>
                                    {tables.map((tbl) => (
                                        <option key={tbl} value={tbl}>
                                            {tbl}
                                        </option>
                                    ))}
                                </select>

                                {/* Date Range Filter */}
                                <select
                                    value={dateRange}
                                    onChange={(e) => {
                                        setDateRange(e.target.value);
                                        applyAuditFilters({ range: e.target.value });
                                    }}
                                    className="text-xs font-semibold py-2 px-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#0f1d45] focus:outline-none"
                                >
                                    <option value="all">All Time</option>
                                    <option value="today">Today</option>
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                </select>

                                <button
                                    type="button"
                                    onClick={() => applyAuditFilters({ search: searchQuery })}
                                    className="px-3.5 py-2 rounded-xl bg-[#0f1d45] text-white text-xs font-bold hover:bg-[#1a2d6b] transition-colors"
                                >
                                    Filter
                                </button>
                            </div>
                        </div>

                        {/* Audit Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                        <th className="pb-3 px-3">Date & Time</th>
                                        <th className="pb-3 px-3">Action</th>
                                        <th className="pb-3 px-3">Target Entity</th>
                                        <th className="pb-3 px-3">Task Executed</th>
                                        <th className="pb-3 px-3">User & Role</th>
                                        <th className="pb-3 px-3">Client Network & Device</th>
                                        <th className="pb-3 px-3 text-right">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {auditLogs.data?.length > 0 ? (
                                        auditLogs.data.map((log) => {
                                            const hasDiff =
                                                (log.old_values && Object.keys(log.old_values).length > 0) ||
                                                (log.new_values && Object.keys(log.new_values).length > 0);

                                            return (
                                                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                                                    {/* Date & Time */}
                                                    <td className="py-3.5 px-3 whitespace-nowrap">
                                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                                            <Clock size={13} className="text-gray-400 shrink-0" />
                                                            <span>
                                                                {log.created_at
                                                                    ? new Date(log.created_at).toLocaleString([], {
                                                                          month: 'short',
                                                                          day: 'numeric',
                                                                          hour: '2-digit',
                                                                          minute: '2-digit',
                                                                          second: '2-digit',
                                                                      })
                                                                    : '-'}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Action Badge */}
                                                    <td className="py-3.5 px-3 whitespace-nowrap">
                                                        {renderActionBadge(log.action)}
                                                    </td>

                                                    {/* Target Entity */}
                                                    <td className="py-3.5 px-3 whitespace-nowrap">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 capitalize border border-slate-200/60">
                                                                {log.table_name || 'System'}
                                                            </span>
                                                            {log.record_id && (
                                                                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                                                                    #{log.record_id}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Task Done */}
                                                    <td className="py-3.5 px-3 max-w-xs sm:max-w-md">
                                                        <p className="text-xs font-semibold text-slate-900 leading-snug break-words">
                                                            {log.task_done}
                                                        </p>
                                                        {log.url && (
                                                            <span className="text-[10px] font-mono text-gray-400 truncate block mt-0.5">
                                                                {log.url}
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* User & Role */}
                                                    <td className="py-3.5 px-3 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-7 h-7 rounded-full bg-[#0f1d45] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                                                                {(log.user_name || 'U').charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900 text-xs leading-none">
                                                                    {log.user_name || 'System'}
                                                                </p>
                                                                <span className="text-[10px] font-bold text-slate-500 capitalize">
                                                                    {log.user_role || 'System'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Client IP & Device ID */}
                                                    <td className="py-3.5 px-3 whitespace-nowrap">
                                                        <div>
                                                            <p className="font-mono text-xs font-bold text-slate-700">
                                                                {log.ip_address || '127.0.0.1'}
                                                            </p>
                                                            {log.device_id ? (
                                                                <span
                                                                    className="text-[10px] font-mono font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.2 mt-0.5 inline-block max-w-[150px] truncate"
                                                                    title={`Terminal Device ID: ${log.device_id}`}
                                                                >
                                                                    ID: {log.device_id}
                                                                </span>
                                                            ) : (
                                                                <span className="text-[10px] text-gray-400 font-mono">
                                                                    Internal Host
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Inspect Details Button */}
                                                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                                                        {hasDiff ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedLog(log)}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#0f1d45] bg-slate-100 hover:bg-[#0f1d45] hover:text-white rounded-lg transition-all"
                                                            >
                                                                <Eye size={12} />
                                                                Inspect
                                                            </button>
                                                        ) : (
                                                            <span className="text-[11px] text-gray-300 font-medium">
                                                                No Diff
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="py-12 text-center text-gray-400 font-medium">
                                                No audit activity matching your criteria found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Audit Pagination */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-100 mt-2">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="text-xs text-gray-500 font-medium">
                                    Showing <span className="font-bold text-slate-800">{auditLogs.from || 0}</span> to{' '}
                                    <span className="font-bold text-slate-800">{auditLogs.to || 0}</span> of{' '}
                                    <span className="font-bold text-slate-800">{auditLogs.total || 0}</span> audit records
                                </span>

                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <span>Per page:</span>
                                    <select
                                        value={auditLogs.per_page || 15}
                                        onChange={(e) => handleAuditPerPageChange(e.target.value)}
                                        className="text-xs font-bold py-1 px-2.5 rounded-lg border border-gray-200 bg-white focus:ring-1 focus:ring-[#0f1d45] focus:outline-none"
                                    >
                                        <option value="10">10</option>
                                        <option value="15">15</option>
                                        <option value="30">30</option>
                                        <option value="50">50</option>
                                    </select>
                                </div>
                            </div>

                            {auditLogs.links && auditLogs.links.length > 3 && (
                                <div className="flex items-center gap-1">
                                    {auditLogs.links.map((link, idx) => {
                                        if (!link.url) {
                                            return (
                                                <span
                                                    key={idx}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                    className="px-2.5 py-1 text-xs text-gray-300 font-semibold rounded-lg select-none cursor-not-allowed"
                                                />
                                            );
                                        }

                                        return (
                                            <Link
                                                key={idx}
                                                href={link.url}
                                                preserveScroll
                                                preserveState
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                                    link.active
                                                        ? 'bg-[#0f1d45] text-white shadow-sm'
                                                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                                                }`}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── TAB 2: LIVE SESSION TRACKER ── */}
                {currentTab === 'logins' && (
                    <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
                            <div>
                                <h3 className="text-base font-black text-[#0f1d45]">Live Terminal Sessions</h3>
                                <p className="text-xs font-medium text-gray-400">
                                    Real-time tracking of hardware devices, operating systems, browsers & GPS locations.
                                </p>
                            </div>

                            <form onSubmit={applyLoginFilter} className="flex items-center gap-2">
                                <div className="relative min-w-[240px]">
                                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={loginSearch}
                                        onChange={(e) => setLoginSearch(e.target.value)}
                                        placeholder="Search user, device ID, IP, shift..."
                                        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f1d45]"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="px-3 py-1.5 rounded-xl bg-[#0f1d45] text-white text-xs font-bold hover:bg-[#1a2d6b]"
                                >
                                    Filter
                                </button>
                            </form>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                        <th className="pb-3 px-3">User</th>
                                        <th className="pb-3 px-3">Role & Shift</th>
                                        <th className="pb-3 px-3">Device & Hardware ID</th>
                                        <th className="pb-3 px-3">Browser</th>
                                        <th className="pb-3 px-3">Location & Coordinates</th>
                                        <th className="pb-3 px-3">Logged In At</th>
                                        <th className="pb-3 px-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {recentLogins.data?.length > 0 ? (
                                        recentLogins.data.map((login) => {
                                            const isMobile = (login.device_type || '').toLowerCase() === 'mobile';
                                            const isTablet = (login.device_type || '').toLowerCase() === 'tablet';
                                            const isActive = login.status === 'active' && !login.logout_at;

                                            return (
                                                <tr key={login.id} className="hover:bg-slate-50/70 transition-colors">
                                                    {/* User */}
                                                    <td className="py-3.5 px-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-[#0f1d45] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                                                                {(login.user_name || 'U').charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-[#0f1d45] text-sm leading-snug">
                                                                    {login.user_name}
                                                                </p>
                                                                {login.user_email && (
                                                                    <span className="text-xs text-gray-400 truncate max-w-[150px] block">
                                                                        {login.user_email}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Role & Shift */}
                                                    <td className="py-3.5 px-3">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 capitalize border border-slate-200/60">
                                                                {login.user_role}
                                                            </span>
                                                            {login.shift_id && (
                                                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                                                    {login.shift_id}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Device & Hardware ID */}
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
                                                                        className="text-[10px] font-mono font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5 mt-1 inline-block max-w-[170px] truncate cursor-pointer hover:bg-indigo-100"
                                                                        title={`Terminal Device ID: ${login.device_id}`}
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

                                                    {/* Location, IP & GPS */}
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
                                                                {login.latitude && login.longitude && (
                                                                    <a
                                                                        href={`https://maps.google.com/?q=${login.latitude},${login.longitude}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-[10px] text-blue-600 hover:text-blue-800 font-mono mt-0.5 inline-flex items-center gap-1 font-semibold hover:underline"
                                                                        title="Open in Google Maps"
                                                                    >
                                                                        <span>
                                                                            GPS: {Number(login.latitude).toFixed(4)},{' '}
                                                                            {Number(login.longitude).toFixed(4)}
                                                                        </span>
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Logged In At */}
                                                    <td className="py-3.5 px-3 whitespace-nowrap">
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
                                                    <td className="py-3.5 px-3 whitespace-nowrap">
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
                                            <td colSpan={7} className="py-12 text-center text-gray-400 font-medium">
                                                No terminal session logs recorded.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Logins Pagination */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-100 mt-2">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="text-xs text-gray-500 font-medium">
                                    Showing <span className="font-bold text-slate-800">{recentLogins.from || 0}</span> to{' '}
                                    <span className="font-bold text-slate-800">{recentLogins.to || 0}</span> of{' '}
                                    <span className="font-bold text-slate-800">{recentLogins.total || 0}</span> terminal records
                                </span>

                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <span>Per page:</span>
                                    <select
                                        value={recentLogins.per_page || 10}
                                        onChange={(e) => handleLoginPerPageChange(e.target.value)}
                                        className="text-xs font-bold py-1 px-2.5 rounded-lg border border-gray-200 bg-white focus:ring-1 focus:ring-[#0f1d45] focus:outline-none"
                                    >
                                        <option value="5">5</option>
                                        <option value="10">10</option>
                                        <option value="25">25</option>
                                        <option value="50">50</option>
                                    </select>
                                </div>
                            </div>

                            {recentLogins.links && recentLogins.links.length > 3 && (
                                <div className="flex items-center gap-1">
                                    {recentLogins.links.map((link, idx) => {
                                        if (!link.url) {
                                            return (
                                                <span
                                                    key={idx}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                    className="px-2.5 py-1 text-xs text-gray-300 font-semibold rounded-lg select-none cursor-not-allowed"
                                                />
                                            );
                                        }

                                        return (
                                            <Link
                                                key={idx}
                                                href={link.url}
                                                preserveScroll
                                                preserveState
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                                    link.active
                                                        ? 'bg-[#0f1d45] text-white shadow-sm'
                                                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                                                }`}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── INSPECT LOG MODAL ── */}
                {selectedLog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                        <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
                            {/* Modal Header */}
                            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                                        <Database size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-[#0f1d45]">Audit Log Inspection</h3>
                                        <p className="text-xs text-gray-400 font-mono">
                                            Log #{selectedLog.id} • {selectedLog.table_name || 'System'}{' '}
                                            {selectedLog.record_id ? `(#${selectedLog.record_id})` : ''}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedLog(null)}
                                    className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 overflow-y-auto space-y-5 text-sm">
                                {/* Summary Info */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                                            Action
                                        </span>
                                        <div className="mt-1">{renderActionBadge(selectedLog.action)}</div>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                                            Author
                                        </span>
                                        <span className="text-xs font-bold text-slate-800 block mt-1">
                                            {selectedLog.user_name || 'System'}
                                        </span>
                                        <span className="text-[10px] text-gray-400 capitalize">
                                            {selectedLog.user_role || 'System'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                                            IP Address
                                        </span>
                                        <span className="text-xs font-mono font-bold text-slate-700 block mt-1">
                                            {selectedLog.ip_address || '127.0.0.1'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                                            Device ID
                                        </span>
                                        <span
                                            className="text-[10px] font-mono text-indigo-600 block mt-1 truncate"
                                            title={selectedLog.device_id || 'N/A'}
                                        >
                                            {selectedLog.device_id || 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                {/* Task Description */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                        Task Description
                                    </h4>
                                    <p className="text-xs font-semibold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        {selectedLog.task_done}
                                    </p>
                                </div>

                                {/* Before / After Diff */}
                                {selectedLog.action === 'UPDATE' && selectedLog.new_values && (
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                            Field Mutations (Before vs After)
                                        </h4>
                                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                                            <table className="w-full text-xs text-left">
                                                <thead className="bg-slate-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                                    <tr>
                                                        <th className="py-2 px-3">Field</th>
                                                        <th className="py-2 px-3">Previous Value</th>
                                                        <th className="py-2 px-3">New Value</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {Object.keys(selectedLog.new_values).map((field) => (
                                                        <tr key={field} className="hover:bg-slate-50/50">
                                                            <td className="py-2 px-3 font-mono font-bold text-slate-700">
                                                                {field}
                                                            </td>
                                                            <td className="py-2 px-3 font-mono text-rose-600 bg-rose-50/40 max-w-[200px] truncate">
                                                                {selectedLog.old_values && selectedLog.old_values[field] !== undefined
                                                                    ? String(selectedLog.old_values[field] ?? 'null')
                                                                    : '-'}
                                                            </td>
                                                            <td className="py-2 px-3 font-mono text-emerald-700 bg-emerald-50/40 max-w-[200px] truncate font-bold">
                                                                {String(selectedLog.new_values[field] ?? 'null')}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Raw JSON Data for CREATE / DELETE / EXPORTS */}
                                {(selectedLog.action !== 'UPDATE' || !selectedLog.new_values) && (
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                            Recorded Attributes & Metadata
                                        </h4>
                                        <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-60">
                                            {JSON.stringify(
                                                selectedLog.new_values || selectedLog.old_values || {},
                                                null,
                                                2
                                            )}
                                        </pre>
                                    </div>
                                )}

                                {selectedLog.user_agent && (
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                            User Agent
                                        </h4>
                                        <p className="text-[11px] font-mono text-gray-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 break-words">
                                            {selectedLog.user_agent}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 bg-slate-50 border-t border-gray-100 flex items-center justify-end">
                                <button
                                    type="button"
                                    onClick={() => setSelectedLog(null)}
                                    className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors"
                                >
                                    Close Inspector
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppSidebarLayout>
    );
}
