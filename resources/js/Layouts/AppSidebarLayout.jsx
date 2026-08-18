import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

export default function AppSidebarLayout({ children, title = 'Airport Counter' }) {
    const { url, props } = usePage();
    const user = props.auth?.user;
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const role = String(user?.role ?? '').toLowerCase();

    const menuItems = [
        { label: 'Dashboard', path: '/dashboard', roles: ['admin', 'finance', 'counter staff', 'executive', 'manager'] },
        { label: 'Counter', path: '/counter', roles: ['admin', 'counter staff', 'manager', 'executive'] },
        { label: 'Manager', path: '/manager-reports', roles: ['admin', 'manager', 'executive'] },
        { label: 'Customers', path: '/customers', roles: ['admin', 'counter staff', 'executive', 'manager'] },
        { label: 'Trips', path: '/trips', roles: ['admin', 'counter staff', 'executive', 'manager'] },
        { label: 'Drivers', path: '/drivers', roles: ['admin', 'executive', 'manager'] },
        { label: 'Finance', path: '/finance', roles: ['admin', 'finance', 'executive', 'manager'] },
        { label: 'Customer Surveys', path: '/customer-surveys', roles: ['admin', 'executive'] },
        { label: 'Reports', path: '/reports', roles: ['admin', 'executive'] },
        { label: 'Users', path: '/users', roles: ['admin'] },
    ];

    const visibleMenuItems = menuItems.filter((item) =>
        role.includes('executive') || item.roles.includes(role)
    );

    const isActive = (path) => url === path;

    const menuClass = (path) =>
        `block px-4 py-3 rounded transition ${isActive(path)
            ? 'bg-blue-700 text-white font-semibold'
            : 'hover:bg-slate-700 text-gray-200'
        }`;

    return (
        <>
            <Head title={title} />

            <div className="min-h-screen bg-gray-100 flex">
                <aside
                    className={`fixed left-0 top-0 w-64 bg-slate-900 text-white h-screen flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                >
                    <div className="p-6 border-b border-slate-700">
                        <h2 className="text-2xl font-bold">TERMINAL PRIME</h2>
                    </div>

                    <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
                        {visibleMenuItems.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={menuClass(item.path)}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-slate-700 space-y-2">
                        <div className="px-4 py-2 text-sm text-gray-300">
                            {user?.name ?? 'User'}
                            <br />
                            <span className="text-xs text-gray-400 capitalize">
                                {role || 'No role'}
                            </span>
                        </div>

                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="w-full text-left block px-4 py-3 rounded bg-red-600 hover:bg-red-700 text-white"
                        >
                            Logout
                        </Link>
                    </div>
                </aside>

                <main
                    className={`flex-1 p-4 overflow-auto transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'
                        }`}
                >
                    <div className="mb-6">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen((open) => !open)}
                            className="inline-flex items-center justify-center rounded-lg bg-slate-900 p-2 text-white shadow hover:bg-slate-800"
                        >
                            {sidebarOpen ? (
                                <ChevronLeftIcon className="w-5 h-5" />
                            ) : (
                                <ChevronRightIcon className="w-5 h-5" />
                            )}
                        </button>
                    </div>

                    {children}
                </main>
            </div>
        </>
    );
}