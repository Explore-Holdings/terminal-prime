import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import AppSidebarLayout from '@/Layouts/AppSidebarLayout';
import DataTable from 'react-data-table-component';
import {
    Clock,
    UserCheck,
    Users,
    Calendar,
    Search,
    Download,
    X,
    Eye,
    Shield,
    BadgeCheck,
    Sparkles,
    CheckCircle2,
    Briefcase,
    Building2,
    CalendarDays
} from 'lucide-react';

export default function Index({
    staffAttendance = [],
    agentAttendance = [],
    stats = {},
}) {
    const [activeTab, setActiveTab] = useState('staff'); // 'staff' | 'agent'
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'custom' | specific date
    const [customDate, setCustomDate] = useState('');
    const [selectedRecord, setSelectedRecord] = useState(null);

    // Format helpers
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: '2-digit',
            });
        } catch {
            return dateStr;
        }
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return null;
        try {
            const d = new Date(timeStr);
            if (isNaN(d.getTime())) return timeStr;
            return d.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
            });
        } catch {
            return timeStr;
        }
    };

    const calculateDuration = (checkIn, checkOut) => {
        if (!checkIn) return '-';
        if (!checkOut) return 'Ongoing';
        try {
            const inTime = new Date(checkIn).getTime();
            const outTime = new Date(checkOut).getTime();
            if (isNaN(inTime) || isNaN(outTime) || outTime < inTime) return '-';
            const diffMs = outTime - inTime;
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            return `${hours}h ${minutes}m`;
        } catch {
            return '-';
        }
    };

    // Filter Logic
    const filterRecords = (records, isStaff) => {
        return records.filter((item) => {
            // Search filter
            const q = search.toLowerCase().trim();
            const name = (item.user?.name || '').toLowerCase();
            const email = (item.user?.email || '').toLowerCase();
            const designation = (item.user?.designation || '').toLowerCase();
            const agentId = (item.user?.agent_id || '').toLowerCase();
            const idCode = (isStaff ? `csa-${item.id}` : `aa-${item.id}`).toLowerCase();
            const status = (item.status || '').toLowerCase();

            const matchesSearch = !q ||
                name.includes(q) ||
                email.includes(q) ||
                designation.includes(q) ||
                agentId.includes(q) ||
                idCode.includes(q) ||
                status.includes(q);

            // Status filter
            const matchesStatus = statusFilter === 'all' || status === statusFilter.toLowerCase();

            // Date filter
            let matchesDate = true;
            if (dateFilter === 'custom' && customDate) {
                const itemDate = (item.attendance_date || '').slice(0, 10);
                matchesDate = itemDate === customDate;
            } else if (dateFilter !== 'all') {
                const itemDate = (item.attendance_date || '').slice(0, 10);
                matchesDate = itemDate === dateFilter;
            }

            return matchesSearch && matchesStatus && matchesDate;
        });
    };

    const filteredStaff = useMemo(() => filterRecords(staffAttendance, true), [staffAttendance, search, statusFilter, dateFilter, customDate]);
    const filteredAgents = useMemo(() => filterRecords(agentAttendance, false), [agentAttendance, search, statusFilter, dateFilter, customDate]);

    // Available dates for quick filtering
    const allDates = useMemo(() => {
        const set = new Set();
        staffAttendance.forEach(s => s.attendance_date && set.add(s.attendance_date.slice(0, 10)));
        agentAttendance.forEach(a => a.attendance_date && set.add(a.attendance_date.slice(0, 10)));
        return Array.from(set).sort().reverse();
    }, [staffAttendance, agentAttendance]);

    // Export CSV
    const exportCSV = () => {
        const isStaff = activeTab === 'staff';
        const data = isStaff ? filteredStaff : filteredAgents;
        const prefix = isStaff ? 'CSA' : 'AA';

        const headers = isStaff
            ? ['Ref ID', 'Staff Name', 'Email', 'Designation', 'Attendance Date', 'Check-In Time', 'Check-Out Time', 'Duration', 'Status']
            : ['Ref ID', 'Agent Name', 'Email', 'Agent Code', 'Attendance Date', 'Check-In Time', 'Check-Out Time', 'Duration', 'Status'];

        const rows = data.map((item) => {
            const duration = calculateDuration(item.check_in_time, item.check_out_time);
            return isStaff ? [
                `${prefix}-${item.id}`,
                item.user?.name || 'Unknown',
                item.user?.email || '',
                item.user?.designation || 'Counter Staff',
                item.attendance_date || '',
                item.check_in_time || '',
                item.check_out_time || 'Not Checked Out',
                duration,
                item.status || '',
            ] : [
                `${prefix}-${item.id}`,
                item.user?.name || 'Unknown',
                item.user?.email || '',
                item.user?.agent_id || 'Agent',
                item.attendance_date || '',
                item.check_in_time || '',
                item.check_out_time || 'Not Checked Out',
                duration,
                item.status || '',
            ];
        });

        const csvContent = [headers.join(','), ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${isStaff ? 'counter_staff' : 'agent'}_attendance_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // Table Columns
    const staffColumns = [
        {
            name: 'Ref #',
            selector: row => row.id,
            sortable: true,
            width: '90px',
            cell: row => (
                <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                    CSA-{row.id}
                </span>
            ),
        },
        {
            name: 'Staff Member',
            selector: row => row.user?.name ?? '-',
            sortable: true,
            cell: row => (
                <div className="py-1">
                    <div className="font-bold text-gray-900 text-sm">
                        {row.user?.name || 'Staff Member'}
                    </div>
                    {row.user?.email && (
                        <div className="text-xs text-gray-500 font-normal">
                            {row.user.email}
                        </div>
                    )}
                </div>
            ),
        },
        {
            name: 'Designation',
            selector: row => row.user?.designation ?? 'Counter Staff',
            sortable: true,
            width: '160px',
            cell: row => (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    <Building2 size={12} />
                    {row.user?.designation || 'Counter Staff'}
                </span>
            ),
        },
        {
            name: 'Date',
            selector: row => row.attendance_date,
            sortable: true,
            width: '130px',
            cell: row => (
                <div className="text-xs font-medium text-gray-800">
                    {formatDate(row.attendance_date)}
                </div>
            ),
        },
        {
            name: 'Check In Time',
            selector: row => row.check_in_time,
            sortable: true,
            width: '140px',
            cell: row => {
                const time = formatTime(row.check_in_time);
                return (
                    <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md inline-block">
                        {time || '-'}
                    </div>
                );
            },
        },
        {
            name: 'Check Out Time',
            selector: row => row.check_out_time,
            sortable: true,
            width: '140px',
            cell: row => {
                const time = formatTime(row.check_out_time);
                return time ? (
                    <div className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md inline-block">
                        {time}
                    </div>
                ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        In Progress
                    </span>
                );
            },
        },
        {
            name: 'Duration',
            width: '110px',
            cell: row => {
                const dur = calculateDuration(row.check_in_time, row.check_out_time);
                return (
                    <span className={`text-xs font-bold ${dur === 'Ongoing' ? 'text-blue-600' : 'text-gray-700'}`}>
                        {dur}
                    </span>
                );
            },
        },
        {
            name: 'Status',
            selector: row => row.status,
            sortable: true,
            width: '120px',
            cell: row => {
                const st = (row.status || '').toLowerCase();
                const isCompleted = st === 'completed';
                return (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                        isCompleted
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-600' : 'bg-blue-600 animate-pulse'}`} />
                        {row.status || 'Present'}
                    </span>
                );
            },
        },
        {
            name: 'Action',
            width: '90px',
            cell: row => (
                <button
                    type="button"
                    onClick={() => setSelectedRecord({ ...row, type: 'Staff' })}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-blue-700 hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200"
                    title="View Full Details"
                >
                    <Eye size={16} />
                </button>
            ),
        },
    ];

    const agentColumns = [
        {
            name: 'Ref #',
            selector: row => row.id,
            sortable: true,
            width: '90px',
            cell: row => (
                <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                    AA-{row.id}
                </span>
            ),
        },
        {
            name: 'Agent Name',
            selector: row => row.user?.name ?? '-',
            sortable: true,
            cell: row => (
                <div className="py-1">
                    <div className="font-bold text-gray-900 text-sm">
                        {row.user?.name || 'Agent'}
                    </div>
                    {row.user?.email && (
                        <div className="text-xs text-gray-500 font-normal">
                            {row.user.email}
                        </div>
                    )}
                </div>
            ),
        },
        {
            name: 'Agent Code',
            selector: row => row.user?.agent_id ?? '-',
            sortable: true,
            width: '140px',
            cell: row => (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <Shield size={12} />
                    {row.user?.agent_id || 'AGNT-N/A'}
                </span>
            ),
        },
        {
            name: 'Date',
            selector: row => row.attendance_date,
            sortable: true,
            width: '130px',
            cell: row => (
                <div className="text-xs font-medium text-gray-800">
                    {formatDate(row.attendance_date)}
                </div>
            ),
        },
        {
            name: 'Check In Time',
            selector: row => row.check_in_time,
            sortable: true,
            width: '140px',
            cell: row => {
                const time = formatTime(row.check_in_time);
                return (
                    <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md inline-block">
                        {time || '-'}
                    </div>
                );
            },
        },
        {
            name: 'Check Out Time',
            selector: row => row.check_out_time,
            sortable: true,
            width: '140px',
            cell: row => {
                const time = formatTime(row.check_out_time);
                return time ? (
                    <div className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md inline-block">
                        {time}
                    </div>
                ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        In Progress
                    </span>
                );
            },
        },
        {
            name: 'Duration',
            width: '110px',
            cell: row => {
                const dur = calculateDuration(row.check_in_time, row.check_out_time);
                return (
                    <span className={`text-xs font-bold ${dur === 'Ongoing' ? 'text-blue-600' : 'text-gray-700'}`}>
                        {dur}
                    </span>
                );
            },
        },
        {
            name: 'Status',
            selector: row => row.status,
            sortable: true,
            width: '120px',
            cell: row => {
                const st = (row.status || '').toLowerCase();
                const isCompleted = st === 'completed';
                return (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                        isCompleted
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-600' : 'bg-blue-600 animate-pulse'}`} />
                        {row.status || 'Present'}
                    </span>
                );
            },
        },
        {
            name: 'Action',
            width: '90px',
            cell: row => (
                <button
                    type="button"
                    onClick={() => setSelectedRecord({ ...row, type: 'Agent' })}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-blue-700 hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200"
                    title="View Full Details"
                >
                    <Eye size={16} />
                </button>
            ),
        },
    ];

    const currentData = activeTab === 'staff' ? filteredStaff : filteredAgents;
    const currentColumns = activeTab === 'staff' ? staffColumns : agentColumns;

    return (
        <AppSidebarLayout title="Attendance">
            <Head title="Attendance Logs" />

            <div className="space-y-6">
                {/* Header Banner */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <span className="p-2 bg-blue-600/30 rounded-xl text-blue-300 border border-blue-500/30">
                                <Clock size={24} />
                            </span>
                            <h1 className="text-2xl font-black tracking-tight text-white">
                                Attendance & Shift Logs
                            </h1>
                        </div>
                        <p className="mt-1 text-sm text-blue-200/80 max-w-xl">
                            Track duty check-ins, check-outs, and shift statuses for counter staff and ticketing agents in real-time.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={exportCSV}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10 hover:border-white/25 shadow-sm"
                        >
                            <Download size={15} />
                            <span>Export CSV</span>
                        </button>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Staff Records</span>
                            <span className="text-2xl font-black text-slate-800 mt-1 block">
                                {stats.totalStaffRecords ?? staffAttendance.length}
                            </span>
                            <span className="text-[11px] text-gray-500 mt-0.5 block">
                                {stats.uniqueStaff ?? 0} Distinct Personnel
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                            <Building2 size={24} />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Agent Records</span>
                            <span className="text-2xl font-black text-indigo-900 mt-1 block">
                                {stats.totalAgentRecords ?? agentAttendance.length}
                            </span>
                            <span className="text-[11px] text-gray-500 mt-0.5 block">
                                {stats.uniqueAgents ?? 0} Distinct Agents
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                            <Users size={24} />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Currently Present</span>
                            <span className="text-2xl font-black text-emerald-700 mt-1 block">
                                {stats.activePresentCount ?? 0}
                            </span>
                            <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                Active Shifts
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                            <UserCheck size={24} />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Completed Shifts</span>
                            <span className="text-2xl font-black text-slate-700 mt-1 block">
                                {stats.completedShiftsCount ?? 0}
                            </span>
                            <span className="text-[11px] text-gray-500 mt-0.5 block">
                                Checked Out
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-200">
                            <CheckCircle2 size={24} />
                        </div>
                    </div>
                </div>

                {/* Main Card with Tabs & Filters */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Top Tab Bar */}
                    <div className="border-b border-gray-200 bg-gray-50/70 p-3 sm:px-6 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => { setActiveTab('staff'); setSearch(''); }}
                                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                                    activeTab === 'staff'
                                        ? 'bg-blue-700 text-white shadow-sm'
                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                                }`}
                            >
                                <Building2 size={15} />
                                <span>Counter Staff Attendance</span>
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                    activeTab === 'staff' ? 'bg-white text-blue-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                    {staffAttendance.length}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => { setActiveTab('agent'); setSearch(''); }}
                                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                                    activeTab === 'agent'
                                        ? 'bg-blue-700 text-white shadow-sm'
                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                                }`}
                            >
                                <Users size={15} />
                                <span>Agent Attendance</span>
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                    activeTab === 'agent' ? 'bg-white text-blue-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                    {agentAttendance.length}
                                </span>
                            </button>
                        </div>

                        {/* Search and Quick Filters */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            {/* Date Filter Dropdown */}
                            <div className="relative flex items-center">
                                <CalendarDays size={14} className="absolute left-3 text-gray-400 pointer-events-none" />
                                <select
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="pl-8 pr-7 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
                                >
                                    <option value="all">All Dates</option>
                                    {allDates.map(d => (
                                        <option key={d} value={d}>
                                            {formatDate(d)}
                                        </option>
                                    ))}
                                    <option value="custom">Custom Date...</option>
                                </select>
                            </div>

                            {dateFilter === 'custom' && (
                                <input
                                    type="date"
                                    value={customDate}
                                    onChange={(e) => setCustomDate(e.target.value)}
                                    className="px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                            )}

                            {/* Status Filter */}
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
                            >
                                <option value="all">All Statuses</option>
                                <option value="present">Present</option>
                                <option value="completed">Completed</option>
                            </select>

                            {/* Search input */}
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={activeTab === 'staff' ? "Search staff name, email..." : "Search agent name, code..."}
                                    className="w-56 pl-8 pr-8 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch('')}
                                        className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={13} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto">
                        <DataTable
                            columns={currentColumns}
                            data={currentData}
                            pagination
                            paginationPerPage={15}
                            paginationRowsPerPageOptions={[10, 15, 25, 50, 100]}
                            highlightOnHover
                            striped
                            responsive
                            persistTableHead
                            customStyles={{
                                headCells: {
                                    style: {
                                        fontWeight: 700,
                                        backgroundColor: '#f8fafc',
                                        color: '#0f172a',
                                        fontSize: '12px',
                                        paddingLeft: '16px',
                                        paddingRight: '16px',
                                        borderBottom: '1px solid #e2e8f0',
                                    },
                                },
                                rows: {
                                    style: {
                                        minHeight: '56px',
                                        fontSize: '13px',
                                        paddingLeft: '8px',
                                        paddingRight: '8px',
                                    },
                                },
                            }}
                            noDataComponent={
                                <div className="p-12 text-center">
                                    <Clock size={36} className="mx-auto text-gray-300 mb-2" />
                                    <div className="text-sm font-bold text-gray-600">No attendance records found</div>
                                    <div className="text-xs text-gray-400 mt-1">Try clearing your search query or selecting a different date range.</div>
                                </div>
                            }
                        />
                    </div>
                </div>
            </div>

            {/* Attendance Details Modal */}
            {selectedRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                                    {selectedRecord.type === 'Staff' ? `CSA-${selectedRecord.id}` : `AA-${selectedRecord.id}`}
                                </span>
                                <h3 className="text-base font-bold text-gray-900">
                                    Attendance Record Details
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedRecord(null)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-5">
                            {/* Person Overview */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                    {selectedRecord.type} Information
                                </span>
                                <div className="text-base font-bold text-gray-900">
                                    {selectedRecord.user?.name || 'Unknown User'}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                    {selectedRecord.user?.email || 'No email registered'}
                                </div>
                                {selectedRecord.user?.designation && (
                                    <div className="mt-2">
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                            {selectedRecord.user.designation}
                                        </span>
                                    </div>
                                )}
                                {selectedRecord.user?.agent_id && (
                                    <div className="mt-2">
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                            Agent ID: {selectedRecord.user.agent_id}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Duty & Shift Timing */}
                            <div className="space-y-3">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                                    Shift Timing & Status
                                </span>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <span className="text-xs text-gray-400 block font-medium">Attendance Date</span>
                                        <span className="font-bold text-gray-800 mt-0.5 block">
                                            {formatDate(selectedRecord.attendance_date)}
                                        </span>
                                    </div>

                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <span className="text-xs text-gray-400 block font-medium">Shift Duration</span>
                                        <span className="font-bold text-blue-700 mt-0.5 block">
                                            {calculateDuration(selectedRecord.check_in_time, selectedRecord.check_out_time)}
                                        </span>
                                    </div>

                                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                        <span className="text-xs text-emerald-600 block font-medium">Check-In Time</span>
                                        <span className="font-bold text-emerald-900 mt-0.5 block">
                                            {formatTime(selectedRecord.check_in_time) || '-'}
                                        </span>
                                        <span className="text-[10px] text-emerald-700 font-mono block mt-0.5 truncate">
                                            {selectedRecord.check_in_time || ''}
                                        </span>
                                    </div>

                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                        <span className="text-xs text-slate-500 block font-medium">Check-Out Time</span>
                                        <span className="font-bold text-slate-800 mt-0.5 block">
                                            {formatTime(selectedRecord.check_out_time) || 'Not Checked Out'}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-mono block mt-0.5 truncate">
                                            {selectedRecord.check_out_time || 'In Progress'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Status & Timestamps */}
                            <div className="border-t border-gray-100 pt-3 text-xs text-gray-500 space-y-1.5">
                                <div className="flex justify-between items-center py-1">
                                    <span className="font-medium">Shift Status:</span>
                                    <span className="font-bold text-xs capitalize text-gray-800 px-2 py-0.5 rounded bg-gray-100">
                                        {selectedRecord.status || 'Present'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-1">
                                    <span className="font-medium">Recorded At:</span>
                                    <span>{selectedRecord.created_at ? new Date(selectedRecord.created_at).toLocaleString() : '-'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1">
                                    <span className="font-medium">Last Synchronized:</span>
                                    <span>{selectedRecord.updated_at ? new Date(selectedRecord.updated_at).toLocaleString() : '-'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setSelectedRecord(null)}
                                className="px-4 py-1.5 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppSidebarLayout>
    );
}
