import AppSidebarLayout from '@/Layouts/AppSidebarLayout';
import { router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';

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
    });

    const roleForm = useForm({
        name: '',
    });

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const matchesSearch =
                user.name?.toLowerCase().includes(search.toLowerCase()) ||
                user.email?.toLowerCase().includes(search.toLowerCase()) ||
                user.role?.name?.toLowerCase().includes(search.toLowerCase());

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
        });

        setShowUserModal(true);
    };

    const saveUser = (e) => {
        e.preventDefault();

        if (editingUser) {
            userForm.put(`/users/${editingUser.id}`, {
                preserveScroll: true,
                onSuccess: () => setShowUserModal(false),
            });
        } else {
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

    return (
        <AppSidebarLayout title="Users">
            <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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
                        onClick={() => setShowRoleModal(true)}
                        className="rounded-lg bg-slate-800 px-4 py-2 text-white font-semibold hover:bg-slate-900 shadow"
                    >
                        + Create Role
                    </button>

                    <button
                        onClick={openCreateUser}
                        className="rounded-lg bg-blue-700 px-4 py-2 text-white font-semibold hover:bg-blue-800 shadow"
                    >
                        + Create User
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                <StatCard title="Total Users" value={users.length} />
                <StatCard title="Total Roles" value={roles.length} />
                <StatCard title="Visible Results" value={filteredUsers.length} />
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
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="p-4 text-left text-sm font-bold text-slate-600">User</th>
                                <th className="p-4 text-left text-sm font-bold text-slate-600">Email</th>
                                <th className="p-4 text-left text-sm font-bold text-slate-600">Role</th>
                                <th className="p-4 text-left text-sm font-bold text-slate-600">Created</th>
                                <th className="p-4 text-center text-sm font-bold text-slate-600">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                                                    {user.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">{user.name}</p>
                                                    <p className="text-xs text-gray-400">ID: {user.id}</p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-4 text-gray-600">{user.email}</td>

                                        <td className="p-4">
                                            <RoleBadge role={user.role?.name} />
                                        </td>

                                        <td className="p-4 text-gray-600">
                                            {user.created_at?.split('T')[0] ?? '-'}
                                        </td>

                                        <td className="p-4">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => openEditUser(user)}
                                                    className="rounded-md bg-yellow-500 px-3 py-1.5 text-white text-sm font-semibold hover:bg-yellow-600"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => deleteUser(user)}
                                                    className="rounded-md bg-red-600 px-3 py-1.5 text-white text-sm font-semibold hover:bg-red-700"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showUserModal && (
                <Modal
                    title={editingUser ? 'Edit User' : 'Create User'}
                    subtitle={editingUser ? 'Update user details and role.' : 'Create a new system user.'}
                    onClose={() => setShowUserModal(false)}
                >
                    <form onSubmit={saveUser} className="space-y-5">
                        <Input
                            label="Name"
                            value={userForm.data.name}
                            onChange={(e) => userForm.setData('name', e.target.value)}
                            error={userForm.errors.name}
                            placeholder="Enter full name"
                        />

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
                                <p className="text-red-600 text-sm mt-1">{userForm.errors.role_id}</p>
                            )}
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
                            placeholder="admin, agent, staff, driver"
                        />

                        <div className="rounded-lg bg-slate-50 p-3">
                            <p className="text-sm text-gray-500 mb-2">Existing roles</p>
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

function StatCard({ title, value }) {
    return (
        <div className="bg-white rounded-xl shadow p-5">
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-blue-700 mt-1">{value}</p>
        </div>
    );
}

function RoleBadge({ role }) {
    const colors = {
        admin: 'bg-red-100 text-red-700',
        agent: 'bg-blue-100 text-blue-700',
        staff: 'bg-green-100 text-green-700',
        driver: 'bg-yellow-100 text-yellow-700',
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${colors[role] ?? 'bg-gray-100 text-gray-700'}`}>
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