import AppSidebarLayout from '@/Layouts/AppSidebarLayout';
import { router, useForm, usePage } from '@inertiajs/react';
import React, { Fragment, useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import {
    Pencil,
    Trash2,
    Shield,
    Users,
    Check,
    X,
    Lock,
    Plus,
    Search,
    CheckSquare,
    Square,
    Sparkles,
    AlertCircle,
    Sliders,
    Layers,
    Eye,
} from 'lucide-react';

const FALLBACK_PERMISSIONS = [
    { key: 'dashboard', label: 'Dashboard', path: '/dashboard', group: 'Core Operations', description: 'System metrics, counters, and overall operational KPIs' },
    { key: 'counter', label: 'Counter Desk', path: '/counter', group: 'Core Operations', description: 'Live vehicle queue, customer check-ins, and desk bookings' },
    { key: 'trips', label: 'Tours & Trips', path: '/trips', group: 'Core Operations', description: 'Tour assignments, vehicle bookings, and dispatch logs' },
    { key: 'drivers', label: 'Drivers Directory', path: '/drivers', group: 'Fleet & Logistics', description: 'Driver profiles, duty shifts, and assigned vehicles' },
    { key: 'customers', label: 'Customers', path: '/customers', group: 'Customer Relations', description: 'Customer directory, bookings history, and invoicing' },
    { key: 'chats', label: 'Customer Chats', path: '/chats', group: 'Customer Relations', description: 'Live chat inquiries and instant messaging' },
    { key: 'customer_surveys', label: 'Customer Surveys', path: '/customer-surveys', group: 'Customer Relations', description: 'Customer feedback ratings and satisfaction surveys' },
    { key: 'finance', label: 'Finance & Petty Cash', path: '/finance', group: 'Finance & Payouts', description: 'Cash flow, driver payouts, and shift balances' },
    { key: 'accountant', label: 'Accountant Hub', path: '/accountant', group: 'Finance & Payouts', description: 'Payment slips verification and accountant approvals' },
    { key: 'pricing_data', label: 'Pricing Data', path: '/pricing-data', group: 'Finance & Payouts', description: 'Vehicle fare rates, distance matrices, and tariff import' },
    { key: 'manager_reports', label: 'Counter Manager', path: '/manager-reports', group: 'Reporting & Analytics', description: 'Managerial shift reports and printable tour summaries' },
    { key: 'agent_driver', label: 'Agent & Driver Insights', path: '/agent-driver-insights', group: 'Reporting & Analytics', description: 'Performance analytics for ticketing agents and drivers' },
    { key: 'reports', label: 'Executive Overview', path: '/reports', group: 'Reporting & Analytics', description: 'Executive business reports and graphical charts' },
    { key: 'reports_hub', label: 'Reports Hub', path: '/reports-hub', group: 'Reporting & Analytics', description: 'Universal data exporter for trips, revenue, and audits' },
    { key: 'dss', label: 'DSS (Decision Support)', path: '/dss', group: 'System Administration', description: 'Decision Support System and automated allocation insights' },
    { key: 'users', label: 'Users & Permissions', path: '/users', group: 'System Administration', description: 'User management, role assignment, and access control' },
    { key: 'admin', label: 'Admin Audit Panel', path: '/admin', group: 'System Administration', description: 'Full system audit logs, device trackers, and database changes' },
];

export const parseRolePermissions = (perms) => {
    if (Array.isArray(perms)) return perms;
    if (typeof perms === 'string') {
        try {
            const parsed = JSON.parse(perms);
            if (Array.isArray(parsed)) return parsed;
        } catch (e) {}
    }
    return [];
};

export default function Index({ users = [], roles = [], availablePermissions = [] }) {
    const { auth } = usePage().props;
    const isReadOnly = auth?.user?.isExecutiveStaff ?? false;

    // Use availablePermissions from backend if supplied, otherwise fallback to system definitions
    const effectivePermissions = useMemo(() => {
        return (availablePermissions && availablePermissions.length > 0)
            ? availablePermissions
            : FALLBACK_PERMISSIONS;
    }, [availablePermissions]);

    // Tabs: 'users' | 'permissions'
    const [activeTab, setActiveTab] = useState('users');

    // ── User Management State ──────────────────────────────────────────────
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const userForm = useForm({
        name: '',
        email: '',
        password: '',
        role_id: '',
        designation: null,
        signature: null,
    });

    // ── Role Management State ──────────────────────────────────────────────
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [matrixRoleSearch, setMatrixRoleSearch] = useState('');
    const [savingRoleId, setSavingRoleId] = useState(null);

    const roleForm = useForm({
        name: '',
        permissions: [],
    });

    // Filtered users for DataTable
    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const text = [
                user.name,
                user.email,
                user.role?.name,
            ].join(' ').toLowerCase();

            const matchesSearch = text.includes(search.toLowerCase());
            const matchesRole = roleFilter
                ? String(user.role_id) === String(roleFilter)
                : true;

            return matchesSearch && matchesRole;
        });
    }, [users, search, roleFilter]);

    // Filtered roles for Matrix
    const filteredRoles = useMemo(() => {
        if (!matrixRoleSearch.trim()) return roles;
        return roles.filter(r => r.name.toLowerCase().includes(matrixRoleSearch.toLowerCase()));
    }, [roles, matrixRoleSearch]);

    // Group available permissions by group
    const groupedPermissions = useMemo(() => {
        const groups = {};
        effectivePermissions.forEach((perm) => {
            const groupName = perm.group || 'General';
            if (!groups[groupName]) {
                groups[groupName] = [];
            }
            groups[groupName].push(perm);
        });
        return groups;
    }, [effectivePermissions]);

    // User modal handlers
    const openCreateUser = () => {
        setEditingUser(null);
        userForm.reset();
        setShowPassword(false);
        setShowUserModal(true);
    };

    const openEditUser = (user) => {
        setEditingUser(user);
        setShowPassword(false);

        userForm.setData({
            name: user.name ?? '',
            email: user.email ?? '',
            password: '',
            role_id: user.role_id ?? '',
            designation: user.designation ?? '',
            signature: null,
        });

        setShowUserModal(true);
    };

    const saveUser = (e) => {
        e.preventDefault();

        if (editingUser) {
            userForm.transform((data) => ({ ...data, _method: 'put' }));
            userForm.post(`/users/${editingUser.id}`, {
                preserveScroll: true,
                onSuccess: () => setShowUserModal(false),
            });
        } else {
            userForm.transform((data) => data);
            userForm.post('/users', {
                preserveScroll: true,
                onSuccess: () => setShowUserModal(false),
            });
        }
    };

    const deleteUser = (user) => {
        if (confirm(`Are you sure you want to delete ${user.name}?`)) {
            router.delete(`/users/${user.id}`, {
                preserveScroll: true,
            });
        }
    };

    // Role modal handlers
    const openCreateRole = () => {
        setEditingRole(null);
        roleForm.reset();
        roleForm.setData({
            name: '',
            permissions: [],
        });
        setShowRoleModal(true);
    };

    const openEditRole = (role) => {
        setEditingRole(role);
        roleForm.setData({
            name: role.name ?? '',
            permissions: parseRolePermissions(role.permissions),
        });
        setShowRoleModal(true);
    };

    const saveRole = (e) => {
        e.preventDefault();

        if (editingRole) {
            roleForm.put(`/roles/${editingRole.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    roleForm.reset();
                    setShowRoleModal(false);
                    setEditingRole(null);
                },
            });
        } else {
            roleForm.post('/roles', {
                preserveScroll: true,
                onSuccess: () => {
                    roleForm.reset();
                    setShowRoleModal(false);
                },
            });
        }
    };

    const deleteRole = (role) => {
        const roleName = role.name;
        if (['admin', 'staff', 'counter staff', 'driver', 'agent'].includes(roleName.toLowerCase())) {
            alert(`The role "${roleName}" is a system built-in role and cannot be deleted.`);
            return;
        }

        const count = Number(role.users_count) || 0;
        if (count > 0) {
            alert(`Cannot delete role "${roleName}" because it currently has ${count} user(s) assigned.`);
            return;
        }

        if (confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
            router.delete(`/roles/${role.id}`, {
                preserveScroll: true,
            });
        }
    };

    // Toggle single permission for a role in the Matrix
    const toggleMatrixPermission = (role, permissionKey) => {
        if (role.name.toLowerCase() === 'admin') return;

        const currentPerms = parseRolePermissions(role.permissions);
        const exists = currentPerms.includes(permissionKey);
        const updatedPerms = exists
            ? currentPerms.filter(k => k !== permissionKey)
            : [...currentPerms, permissionKey];

        setSavingRoleId(role.id);
        router.post(
            '/roles/sync-permissions',
            {
                role_id: role.id,
                permissions: updatedPerms,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setSavingRoleId(null),
            }
        );
    };

    // Select/Deselect all permissions for a role in Matrix
    const toggleAllRolePermissions = (role, selectAll) => {
        if (role.name.toLowerCase() === 'admin') return;

        const allKeys = effectivePermissions.map(p => p.key);
        const updatedPerms = selectAll ? allKeys : [];

        setSavingRoleId(role.id);
        router.post(
            '/roles/sync-permissions',
            {
                role_id: role.id,
                permissions: updatedPerms,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setSavingRoleId(null),
            }
        );
    };

    // DataTable columns
    const columns = [
        {
            name: 'User',
            selector: row => row.name ?? '',
            sortable: true,
            cell: row => (
                <div className="flex items-center gap-3 py-2">
                    <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                        {row.name?.charAt(0)?.toUpperCase() ?? 'U'}
                    </div>

                    <div>
                        <p className="font-semibold text-gray-800">
                            {row.name ?? '-'}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs text-gray-400">ID: {row.id}</span>
                            {row.agent_id && (
                                <span className="bg-amber-50 text-amber-800 font-mono font-bold px-1.5 py-0.5 rounded text-[10px] border border-amber-300">
                                    {row.agent_id}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            name: 'Email',
            selector: row => row.email ?? '',
            sortable: true,
        },
        {
            name: 'Role',
            selector: row => row.role?.name ?? '',
            sortable: true,
            cell: row => <RoleBadge role={row.role?.name} />,
        },
        {
            name: 'Created',
            selector: row => row.created_at ?? '',
            sortable: true,
            cell: row => row.created_at?.split('T')[0] ?? '-',
        },
        {
            name: 'Actions',
            center: true,
            omit: isReadOnly,
            cell: row => (
                <div className="flex justify-center gap-2">
                    <button
                        type="button"
                        onClick={() => openEditUser(row)}
                        className="inline-flex items-center gap-1 bg-green-800 px-3 py-1.5 text-white text-sm font-semibold rounded hover:bg-green-700 transition"
                        title="Edit User"
                    >
                        <Pencil size={14} />
                    </button>

                    <button
                        type="button"
                        onClick={() => deleteUser(row)}
                        className="inline-flex items-center gap-1 bg-red-800 px-3 py-1.5 text-white text-sm font-semibold rounded hover:bg-red-700 transition"
                        title="Delete User"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            ),
        },
    ];

    const customStyles = {
        headCells: {
            style: {
                fontWeight: 700,
                backgroundColor: '#f8fafc',
                color: '#334155',
                fontSize: '13px',
            },
        },
        rows: {
            style: {
                minHeight: '65px',
            },
        },
    };

    return (
        <AppSidebarLayout title="Users & Permissions">
            {/* ── TOP HEADER ── */}
            <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#0f1d45] tracking-tight">
                        User & Access Control
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Manage system accounts, user assignments, and dynamic module permissions for all roles.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {!isReadOnly && (
                        <>
                            <button
                                type="button"
                                onClick={openCreateRole}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2.5 text-white text-sm font-semibold hover:bg-slate-900 shadow-sm transition"
                            >
                                <Plus size={16} />
                                <span>New Role</span>
                            </button>

                            <button
                                type="button"
                                onClick={openCreateUser}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f1d45] px-4 py-2.5 text-white text-sm font-semibold hover:bg-blue-900 shadow-sm transition"
                            >
                                <Plus size={16} />
                                <span>New User</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* ── TAB SELECTOR ── */}
            <div className="bg-white rounded-2xl p-1.5 border border-gray-200/80 inline-flex items-center gap-1.5 shadow-sm mb-6">
                <button
                    type="button"
                    onClick={() => setActiveTab('users')}
                    className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                        activeTab === 'users'
                            ? 'bg-[#0f1d45] text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                    <Users size={16} />
                    <span>User Accounts</span>
                    <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            activeTab === 'users' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                    >
                        {users.length}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('permissions')}
                    className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                        activeTab === 'permissions'
                            ? 'bg-[#0f1d45] text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                    <Shield size={16} />
                    <span>Roles & Permissions Matrix</span>
                    <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            activeTab === 'permissions' ? 'bg-emerald-400 text-[#0f1d45]' : 'bg-emerald-50 text-emerald-700'
                        }`}
                    >
                        {roles.length} Roles
                    </span>
                </button>
            </div>

            {/* ══════════════════════════════════════════════════════════════════════ */}
            {/* TAB 1: USERS LIST                                                    */}
            {/* ══════════════════════════════════════════════════════════════════════ */}
            {activeTab === 'users' && (
                <>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2 relative">
                                <Search size={18} className="absolute left-3.5 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search user by name, email, or role..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                />
                            </div>

                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="w-full py-2.5 px-3 rounded-xl border border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm font-medium text-gray-700"
                            >
                                <option value="">All Roles ({roles.length})</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.name} ({Number(role.users_count) || 0})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <DataTable
                            columns={columns}
                            data={filteredUsers}
                            pagination
                            paginationPerPage={10}
                            paginationRowsPerPageOptions={[10, 25, 50, 100]}
                            highlightOnHover
                            striped
                            responsive
                            persistTableHead
                            customStyles={customStyles}
                            noDataComponent={
                                <div className="p-8 text-center text-gray-500">
                                    <Users size={32} className="mx-auto text-gray-300 mb-2" />
                                    <p className="font-semibold text-gray-600">No users found</p>
                                    <p className="text-xs text-gray-400 mt-1">Try adjusting your search criteria</p>
                                </div>
                            }
                        />
                    </div>
                </>
            )}

            {/* ══════════════════════════════════════════════════════════════════════ */}
            {/* TAB 2: ROLES & PERMISSIONS MATRIX                                    */}
            {/* ══════════════════════════════════════════════════════════════════════ */}
            {activeTab === 'permissions' && (
                <div className="space-y-6">
                    {/* Matrix Controls & Summary Cards */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Shield size={20} className="text-[#0f1d45]" />
                                    <span>Interactive Permissions Matrix</span>
                                </h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Toggle module access for any role with a single click. Changes immediately sync to the user's sidebar.
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={matrixRoleSearch}
                                        onChange={(e) => setMatrixRoleSearch(e.target.value)}
                                        placeholder="Filter roles..."
                                        className="pl-9 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs w-44 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={openCreateRole}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0f1d45] text-white rounded-lg text-xs font-bold hover:bg-blue-900 transition"
                                >
                                    <Plus size={14} />
                                    <span>New Role</span>
                                </button>
                            </div>
                        </div>

                        {/* Quick Statistics Banner */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
                            <div className="bg-slate-50 rounded-xl p-3">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Roles</span>
                                <p className="text-xl font-black text-slate-800 mt-0.5">{roles.length}</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Available Modules</span>
                                <p className="text-xl font-black text-slate-800 mt-0.5">{effectivePermissions.length}</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Registered Users</span>
                                <p className="text-xl font-black text-slate-800 mt-0.5">{users.length}</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Super Admin</span>
                                <p className="text-xl font-black text-emerald-600 mt-0.5">Universal Access</p>
                            </div>
                        </div>
                    </div>

                    {/* ── PERMISSION MATRIX TABLE ── */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-gray-200">
                                        {/* Sticky Module Column */}
                                        <th className="py-4 px-5 text-xs font-black uppercase text-slate-700 tracking-wider sticky left-0 bg-slate-50 z-20 min-w-[280px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                            Application Module & Path
                                        </th>

                                        {/* Dynamic Role Columns */}
                                        {filteredRoles.map((role) => {
                                            const isAdmin = role.name.toLowerCase() === 'admin';
                                            const isSystem = ['admin', 'staff', 'counter staff', 'driver', 'agent'].includes(role.name.toLowerCase());
                                            const rolePerms = parseRolePermissions(role.permissions);
                                            const isFull = rolePerms.length === effectivePermissions.length;

                                            return (
                                                <th
                                                    key={role.id}
                                                    className="py-4 px-4 text-center min-w-[170px] border-l border-gray-100 align-top"
                                                >
                                                    <div className="flex flex-col items-center">
                                                        <div className="flex items-center gap-1.5 mb-1">
                                                            <RoleBadge role={role.name} />
                                                            {isAdmin && <Shield size={14} className="text-red-600" />}
                                                        </div>

                                                        <span className="text-[11px] text-gray-400 font-medium mb-2">
                                                            {Number(role.users_count) || 0} assigned user{Number(role.users_count) === 1 ? '' : 's'}
                                                        </span>

                                                        {/* Role Action Controls */}
                                                        {!isAdmin && !isReadOnly && (
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openEditRole(role)}
                                                                    className="p-1 rounded text-slate-500 hover:text-blue-700 hover:bg-slate-200/60 transition"
                                                                    title="Edit Role"
                                                                >
                                                                    <Pencil size={13} />
                                                                </button>

                                                                {!isSystem && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => deleteRole(role)}
                                                                        className="p-1 rounded text-slate-400 hover:text-red-700 hover:bg-rose-50 transition"
                                                                        title="Delete Role"
                                                                    >
                                                                        <Trash2 size={13} />
                                                                    </button>
                                                                )}

                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleAllRolePermissions(role, !isFull)}
                                                                    className="ml-1 text-[10px] font-bold text-blue-600 hover:underline"
                                                                >
                                                                    {isFull ? 'Clear' : 'All'}
                                                                </button>
                                                            </div>
                                                        )}

                                                        {isAdmin && (
                                                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mt-1">
                                                                All Permitted
                                                            </span>
                                                        )}

                                                        {savingRoleId === role.id && (
                                                            <span className="text-[10px] text-amber-600 animate-pulse font-bold mt-1">
                                                                Updating...
                                                            </span>
                                                        )}
                                                    </div>
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {Object.entries(groupedPermissions).map(([groupName, groupPerms]) => (
                                        <Fragment key={groupName}>
                                            {/* Category Section Header Row */}
                                            <tr className="bg-slate-100/70">
                                                <td
                                                    colSpan={filteredRoles.length + 1}
                                                    className="py-2.5 px-5 text-xs font-black uppercase text-[#0f1d45] tracking-wider"
                                                >
                                                    <span className="inline-flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-[#0f1d45]" />
                                                        {groupName}
                                                        <span className="text-[10px] font-normal text-gray-500 lowercase">
                                                            ({groupPerms.length} items)
                                                        </span>
                                                    </span>
                                                </td>
                                            </tr>

                                            {/* Module Rows */}
                                            {groupPerms.map((perm) => (
                                                <tr key={perm.key} className="hover:bg-blue-50/30 transition-colors">
                                                    {/* Sticky Left Column: Module Details */}
                                                    <td className="py-3 px-5 sticky left-0 bg-white group-hover:bg-blue-50/30 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-gray-100">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-sm text-gray-900">
                                                                    {perm.label}
                                                                </span>
                                                                <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                                                                    {perm.path}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-gray-400 mt-0.5">
                                                                {perm.description}
                                                            </p>
                                                        </div>
                                                    </td>

                                                    {/* Role Checkbox Cells */}
                                                    {filteredRoles.map((role) => {
                                                        const isAdmin = role.name.toLowerCase() === 'admin';
                                                        const rolePerms = parseRolePermissions(role.permissions);
                                                        const isAllowed = isAdmin || rolePerms.includes(perm.key);

                                                        return (
                                                            <td
                                                                key={`${role.id}-${perm.key}`}
                                                                className="py-3 px-4 text-center border-l border-gray-100"
                                                            >
                                                                {isAdmin ? (
                                                                    <div className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
                                                                        <Check size={16} strokeWidth={3} />
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        disabled={isReadOnly}
                                                                        onClick={() => toggleMatrixPermission(role, perm.key)}
                                                                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-all ${
                                                                            isAllowed
                                                                                ? 'bg-[#0f1d45] text-white shadow-sm hover:bg-rose-700'
                                                                                : 'bg-gray-100 text-gray-300 hover:bg-slate-200 hover:text-gray-500'
                                                                        } ${isReadOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                                                                        title={`${isAllowed ? 'Revoke' : 'Grant'} ${perm.label} for ${role.name}`}
                                                                    >
                                                                        {isAllowed ? (
                                                                            <Check size={15} strokeWidth={3} />
                                                                        ) : (
                                                                            <X size={13} strokeWidth={2.5} />
                                                                        )}
                                                                    </button>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════════ */}
            {/* USER CREATE / EDIT MODAL                                             */}
            {/* ══════════════════════════════════════════════════════════════════════ */}
            {showUserModal && (
                <Modal
                    title={editingUser ? 'Edit User' : 'Create User'}
                    subtitle={editingUser ? 'Update user details and role assignment.' : 'Create a new user account with assigned role.'}
                    onClose={() => setShowUserModal(false)}
                >
                    <form onSubmit={saveUser} className="space-y-4">
                        <Input
                            label="Full Name"
                            value={userForm.data.name}
                            onChange={(e) => userForm.setData('name', e.target.value)}
                            error={userForm.errors.name}
                            placeholder="Enter user's full name"
                        />

                        <Input
                            label="Email Address"
                            type="email"
                            value={userForm.data.email}
                            onChange={(e) => userForm.setData('email', e.target.value)}
                            error={userForm.errors.email}
                            placeholder="user@airportcountersystem.com"
                        />

                        <PasswordInput
                            label={editingUser ? 'Password (leave blank to keep current)' : 'Password'}
                            value={userForm.data.password}
                            onChange={(e) => userForm.setData('password', e.target.value)}
                            error={userForm.errors.password}
                            showPassword={showPassword}
                            setShowPassword={setShowPassword}
                            required={!editingUser}
                        />

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Assigned Role <span className="text-red-600">*</span>
                            </label>

                            <select
                                value={userForm.data.role_id}
                                onChange={(e) => userForm.setData('role_id', e.target.value)}
                                className="w-full rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 text-sm"
                            >
                                <option value="">Select a Role</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>

                            {userForm.errors.role_id && (
                                <p className="text-red-600 text-sm mt-1">{userForm.errors.role_id}</p>
                            )}

                            {(() => {
                                const selectedRole = roles.find(r => String(r.id) === String(userForm.data.role_id));
                                const isAgentRole = selectedRole && selectedRole.name?.toLowerCase() === 'agent';
                                if (editingUser?.agent_id && isAgentRole) {
                                    return (
                                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5 mt-2">
                                            Assigned Agent ID: <strong className="font-mono font-bold">{editingUser.agent_id}</strong>
                                        </p>
                                    );
                                }
                                if (isAgentRole) {
                                    return (
                                        <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 mt-2">
                                            ⚡ An Agent ID (e.g. <strong>AGNT-1</strong>) will be generated automatically upon creation.
                                        </p>
                                    );
                                }
                                return null;
                            })()}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Designation"
                                value={userForm.data.designation ?? ''}
                                onChange={(e) => userForm.setData('designation', e.target.value)}
                                error={userForm.errors.designation}
                                placeholder="e.g. Senior Shift Officer"
                                required={false}
                            />

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Signature Image
                                </label>

                                {editingUser?.signature && (
                                    <div className="mb-2">
                                        <img
                                            src={`/storage/${editingUser.signature}`}
                                            alt="Signature"
                                            className="h-12 object-contain border rounded p-1 bg-gray-50"
                                        />
                                    </div>
                                )}

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => userForm.setData('signature', e.target.files[0])}
                                    className="w-full rounded-lg border border-gray-300 shadow-sm text-xs p-2"
                                />

                                {userForm.errors.signature && (
                                    <p className="text-red-600 text-sm mt-1">{userForm.errors.signature}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setShowUserModal(false)}
                                className="rounded-xl bg-gray-100 px-4 py-2.5 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={userForm.processing}
                                className="rounded-xl bg-[#0f1d45] px-5 py-2.5 text-white text-sm font-semibold hover:bg-blue-900 disabled:opacity-50 transition"
                            >
                                {userForm.processing ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ══════════════════════════════════════════════════════════════════════ */}
            {/* ROLE CREATE / EDIT MODAL                                             */}
            {/* ══════════════════════════════════════════════════════════════════════ */}
            {showRoleModal && (
                <Modal
                    title={editingRole ? `Edit Role: ${editingRole.name}` : 'Create New Role'}
                    subtitle={
                        editingRole
                            ? 'Update role name and initial permission bundle.'
                            : 'Define a new custom role and assign its allowed sidebar modules.'
                    }
                    onClose={() => {
                        setShowRoleModal(false);
                        setEditingRole(null);
                    }}
                >
                    <form onSubmit={saveRole} className="space-y-5">
                        <Input
                            label="Role Name"
                            value={roleForm.data.name}
                            onChange={(e) => roleForm.setData('name', e.target.value)}
                            error={roleForm.errors.name}
                            placeholder="e.g. shift lead, operations audit, ground staff"
                            disabled={editingRole && editingRole.name.toLowerCase() === 'admin'}
                        />

                        {/* Permissions Selector Checkboxes */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Assigned Module Permissions
                                </label>

                                <div className="flex items-center gap-2 text-xs">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            roleForm.setData(
                                                'permissions',
                                                effectivePermissions.map((p) => p.key)
                                            )
                                        }
                                        className="text-blue-600 hover:underline font-bold"
                                    >
                                        Select All
                                    </button>
                                    <span className="text-gray-300">|</span>
                                    <button
                                        type="button"
                                        onClick={() => roleForm.setData('permissions', [])}
                                        className="text-gray-500 hover:underline font-medium"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>

                            <div className="max-h-72 overflow-y-auto border border-gray-200 rounded-xl p-3 divide-y divide-gray-100 bg-slate-50/50">
                                {Object.entries(groupedPermissions).map(([grp, perms]) => (
                                    <div key={grp} className="py-2.5 first:pt-0 last:pb-0">
                                        <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider block mb-2">
                                            {grp}
                                        </span>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {perms.map((p) => {
                                                const checked = roleForm.data.permissions.includes(p.key);
                                                return (
                                                    <label
                                                        key={p.key}
                                                        className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition ${
                                                            checked
                                                                ? 'bg-blue-50/60 border-blue-200 text-blue-900 font-bold'
                                                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    roleForm.setData('permissions', [
                                                                        ...roleForm.data.permissions,
                                                                        p.key,
                                                                    ]);
                                                                } else {
                                                                    roleForm.setData(
                                                                        'permissions',
                                                                        roleForm.data.permissions.filter(
                                                                            (k) => k !== p.key
                                                                        )
                                                                    );
                                                                }
                                                            }}
                                                            className="rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                                                        />
                                                        <div>
                                                            <p className="leading-tight">{p.label}</p>
                                                            <p className="text-[10px] text-gray-400 font-mono mt-0.5">{p.path}</p>
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowRoleModal(false);
                                    setEditingRole(null);
                                }}
                                className="rounded-xl bg-gray-100 px-4 py-2.5 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={roleForm.processing}
                                className="rounded-xl bg-[#0f1d45] px-5 py-2.5 text-white text-sm font-semibold hover:bg-blue-900 disabled:opacity-50 transition"
                            >
                                {roleForm.processing ? 'Saving...' : editingRole ? 'Update Role' : 'Create Role'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </AppSidebarLayout>
    );
}

function RoleBadge({ role }) {
    const key = String(role ?? '').toLowerCase().trim();

    const colors = {
        admin: 'bg-red-100 text-red-700 border-red-200',
        finance: 'bg-purple-100 text-purple-700 border-purple-200',
        accountant: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        'counter staff': 'bg-green-100 text-green-700 border-green-200',
        agent: 'bg-blue-100 text-blue-700 border-blue-200',
        staff: 'bg-slate-100 text-slate-700 border-slate-200',
        driver: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        manager: 'bg-amber-100 text-amber-800 border-amber-200',
        coperate: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        executive: 'bg-violet-100 text-violet-700 border-violet-200',
        'executive staff': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    };

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                colors[key] ?? 'bg-gray-100 text-gray-700 border-gray-200'
            }`}
        >
            {role ?? 'No Role'}
        </span>
    );
}

function Modal({ title, subtitle, children, onClose }) {
    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="bg-[#0f1d45] text-white p-5 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
                        {subtitle && <p className="text-slate-300 text-xs mt-1">{subtitle}</p>}
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}

function Input({
    label,
    value,
    onChange,
    error,
    type = 'text',
    placeholder = '',
    required = true,
    disabled = false,
}) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
                {label} {required && <span className="text-red-600">*</span>}
            </label>

            <input
                type={type}
                value={value}
                onChange={onChange}
                disabled={disabled}
                placeholder={placeholder}
                className="w-full rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            />

            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
        </div>
    );
}

function PasswordInput({
    label,
    value,
    onChange,
    error,
    showPassword,
    setShowPassword,
    required = true,
}) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
                {label} {required && <span className="text-red-600">*</span>}
            </label>

            <div className="relative">
                <input
                    type={showPassword ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    placeholder="Enter password"
                    className="w-full rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pr-20 py-2.5 px-3 text-sm"
                />

                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-xs text-blue-600 font-semibold hover:underline"
                >
                    {showPassword ? 'Hide' : 'Show'}
                </button>
            </div>

            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
        </div>
    );
}