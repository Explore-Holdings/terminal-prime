import AppSidebarLayout from '@/Layouts/AppSidebarLayout';
import { router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import { Pencil, Trash2 } from 'lucide-react';

export default function Index({ users = [], roles = [] }) {
    const [showUserModal, setShowUserModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const userForm = useForm({
        name: '',
        email: '',
        password: '',
        role_id: '',
        designation: '',
        signature: null,
    });

    const roleForm = useForm({
        name: '',
    });

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

    const saveRole = (e) => {
        e.preventDefault();

        roleForm.post('/roles', {
            preserveScroll: true,
            onSuccess: () => {
                roleForm.reset();
                setShowRoleModal(false);
            },
        });
    };

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
                        <p className="text-xs text-gray-400">
                            ID: {row.id}
                        </p>
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
            cell: row => (
                <div className="flex justify-center gap-2">
                    <button
                        type="button"
                        onClick={() => openEditUser(row)}
                        className="inline-flex items-center gap-1 bg-green-800 px-3 py-1.5 text-white text-sm font-semibold hover:bg-green-700"
                    >
                        <Pencil size={14} />
                
                    </button>

                    <button
                        type="button"
                        onClick={() => deleteUser(row)}
                        className="inline-flex items-center gap-1 bg-red-800 px-3 py-1.5 text-white text-sm font-semibold hover:bg-red-700"
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
        <AppSidebarLayout title="Users">
            <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        User Management
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Create users, assign roles, and manage access.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setShowRoleModal(true)}
                        className="rounded-lg bg-slate-800 px-4 py-2 text-white font-semibold hover:bg-slate-900 shadow"
                    >
                        + Create Role
                    </button>

                    <button
                        type="button"
                        onClick={openCreateUser}
                        className="rounded-lg bg-blue-700 px-4 py-2 text-white font-semibold hover:bg-blue-800 shadow"
                    >
                        + Create User
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow p-5 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name, email, or role..."
                        className="md:col-span-2 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />

                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">All Roles</option>
                        {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                                {role.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
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
                        <div className="p-6 text-gray-500">
                            No users found.
                        </div>
                    }
                />
            </div>

            {showUserModal && (
                <Modal title={editingUser ? 'Edit User' : 'Create User'} subtitle={editingUser ? 'Update user details and role.' : 'Create a new system user.'} onClose={() => setShowUserModal(false)} >
                    <form onSubmit={saveUser} className="space-y-5">
                        <Input label="Name" value={userForm.data.name} onChange={(e) => userForm.setData('name', e.target.value)} error={userForm.errors.name} placeholder="Enter full name"/>

                        <Input
                            label="Email"
                            type="email"
                            value={userForm.data.email}
                            onChange={(e) => userForm.setData('email', e.target.value)}
                            error={userForm.errors.email}
                            placeholder="user@example.com"
                        />

                        <PasswordInput
                            label={editingUser ? 'Password (leave blank to keep current)' : 'Password'}
                            value={userForm.data.password}
                            onChange={(e) => userForm.setData('password', e.target.value)}
                            error={userForm.errors.password}
                            showPassword={showPassword}
                            setShowPassword={setShowPassword}
                        />

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Role <span className="text-red-600">*</span>
                            </label>

                            <select
                                value={userForm.data.role_id}
                                onChange={(e) => userForm.setData('role_id', e.target.value)}
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">Select Role</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>

                            {userForm.errors.role_id && (
                                <p className="text-red-600 text-sm mt-1">
                                    {userForm.errors.role_id}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Designation"
                                value={userForm.data.designation}
                                onChange={(e) => userForm.setData('designation', e.target.value)}
                                // error={userForm.errors.designation}
                                placeholder="e.g. Manager"
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
                                            className="h-16 object-contain border rounded p-1 bg-gray-50"
                                        />
                                    </div>
                                )}

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => userForm.setData('signature', e.target.files[0])}
                                    className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-1.5"
                                />

                                {userForm.errors.signature && (
                                    <p className="text-red-600 text-sm mt-1">
                                        {userForm.errors.signature}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <button
                                type="button"
                                onClick={() => setShowUserModal(false)}
                                className="rounded-lg bg-gray-500 px-4 py-2 text-white font-semibold hover:bg-gray-600"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={userForm.processing}
                                className="rounded-lg bg-blue-700 px-4 py-2 text-white font-semibold hover:bg-blue-800 disabled:opacity-50"
                            >
                                {userForm.processing ? 'Saving...' : editingUser ? 'Update User' : 'Save User'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {showRoleModal && (
                <Modal
                    title="Create Role"
                    subtitle="Add a new role that can be assigned to users."
                    onClose={() => setShowRoleModal(false)}
                >
                    <form onSubmit={saveRole} className="space-y-5">
                        <Input
                            label="Role Name"
                            value={roleForm.data.name}
                            onChange={(e) => roleForm.setData('name', e.target.value)}
                            error={roleForm.errors.name}
                            placeholder="admin, finance, counter staff"
                        />

                        <div className="rounded-lg bg-slate-50 p-3">
                            <p className="text-sm text-gray-500 mb-2">
                                Existing roles
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {roles.map((role) => (
                                    <RoleBadge key={role.id} role={role.name} />
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <button
                                type="button"
                                onClick={() => setShowRoleModal(false)}
                                className="rounded-lg bg-gray-500 px-4 py-2 text-white font-semibold hover:bg-gray-600"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={roleForm.processing}
                                className="rounded-lg bg-slate-800 px-4 py-2 text-white font-semibold hover:bg-slate-900 disabled:opacity-50"
                            >
                                {roleForm.processing ? 'Saving...' : 'Save Role'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </AppSidebarLayout>
    );
}

function RoleBadge({ role }) {
    const key = String(role ?? '').toLowerCase();

    const colors = {
        admin: 'bg-red-100 text-red-700',
        finance: 'bg-purple-100 text-purple-700',
        'counter staff': 'bg-green-100 text-green-700',
        agent: 'bg-blue-100 text-blue-700',
        staff: 'bg-green-100 text-green-700',
        driver: 'bg-yellow-100 text-yellow-700',
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${colors[key] ?? 'bg-gray-100 text-gray-700'}`}>
            {role ?? 'No Role'}
        </span>
    );
}

function Modal({ title, subtitle, children, onClose }) {
    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
                <div className="bg-slate-900 text-white p-6 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold">{title}</h2>
                        {subtitle && <p className="text-slate-300 text-sm mt-1">{subtitle}</p>}
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

function Input({ label, value, onChange, error, type = 'text', placeholder = '' }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
                {label} <span className="text-red-600">*</span>
            </label>

            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />

            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
        </div>
    );
}

function PasswordInput({ label, value, onChange, error, showPassword, setShowPassword }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
                {label} <span className="text-red-600">*</span>
            </label>

            <div className="relative">
                <input
                    type={showPassword ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    placeholder="Enter password"
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pr-20"
                />

                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2 text-sm text-blue-600 font-semibold"
                >
                    {showPassword ? 'Hide' : 'Show'}
                </button>
            </div>

            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
        </div>
    );
}