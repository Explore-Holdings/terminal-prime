import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';

export default function AppSidebarLayout({ children, title = 'Airport Counter', defaultSidebarOpen = true }) {
    const { url, props } = usePage();
    const user = props.auth?.user;
    const [sidebarOpen, setSidebarOpen] = useState(defaultSidebarOpen);

    const role = String(user?.role ?? '').toLowerCase();

    const menuItems = [
        { label: 'Dashboard', path: '/dashboard', roles: ['admin', 'finance', 'counter staff', 'executive', 'manager'] },
        { label: 'DSS', path: '/dss', roles: ['admin', 'executive'] },
        { label: 'Counter', path: '/counter', roles: ['admin', 'counter staff', 'manager', 'executive'] },
        { label: 'Manager', path: '/manager-reports', roles: ['admin', 'manager', 'executive'] },
        { label: 'Finance', path: '/finance', roles: ['admin', 'finance', 'executive', 'manager'] },
        { label: 'Drivers', path: '/drivers', roles: ['admin', 'executive', 'manager'] },
        { label: 'Customers', path: '/customers', roles: ['admin', 'counter staff', 'executive', 'manager'] },
        { label: 'Trips', path: '/trips', roles: ['admin', 'counter staff', 'executive', 'manager'] },
        { label: 'Customer Surveys', path: '/customer-surveys', roles: ['admin', 'executive'] },
        { label: 'Reports', path: '/reports', roles: ['admin', 'executive'] },
        { label: 'Users', path: '/users', roles: ['admin'] },
    ];

    const visibleMenuItems = menuItems.filter((item) =>
        role.includes('executive') || item.roles.includes(role)
    );

    const isActive = (path) => url === path;

    const menuClass = (path) =>
        `block px-4 py-3  text-base font-semibold transition ${isActive(path)
            ? 'bg-white text-blue-800 shadow-sm'
            : 'text-blue-100 hover:bg-white/10 hover:text-white'
        }`;

    return (
        <>
            <Head title={title} />

            <div className="min-h-screen bg-gray-50 flex">
                <aside
                    className={`fixed left-0 top-0 w-64 bg-gradient-to-b from-[#12275c] via-[#1e4a8f] to-[#2a5fa8] text-white h-screen flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                >
                    <div className="p-4 border-b border-white/10 flex items-center gap-2">
                        <PaperAirplaneIcon className="w-7 h-7 -rotate-45 text-white shrink-0" />
                        <h2 className="text-xl font-black tracking-tight">TERMINAL PRIME</h2>
                    </div>

                    <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
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

                    <div className="p-4 border-t border-white/10 space-y-2">
                        <div className="px-4 py-2 text-base font-bold text-white">
                            {user?.name ?? 'User'}
                            <br />
                            <span className="text-sm font-medium text-blue-200 capitalize">
                                {role || 'No role'}
                            </span>
                        </div>

                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="w-full text-left block px-4 py-3 bg-red-900 hover:bg-[#450a0a] text-white text-base font-bold transition shadow-sm border border-[#450a0a]"
                        >
                            Logout
                        </Link>
                    </div>
                </aside>

                <main
                    className={`flex-1 flex flex-col overflow-auto transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'
                        }`}
                >
                    <div className="p-4 pb-0">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen((open) => !open)}
                            className="inline-flex items-center justify-center rounded-lg bg-[#012643] p-2 text-white shadow hover:bg-[#033B65] transition"
                        >
                            {sidebarOpen ? (
                                <ChevronLeftIcon className="w-5 h-5" />
                            ) : (
                                <ChevronRightIcon className="w-5 h-5" />
                            )}
                        </button>
                    </div>

                    <div className="p-4 flex-1">
                        {children}
                    </div>
                </main>
            </div>
        </>
    );
}