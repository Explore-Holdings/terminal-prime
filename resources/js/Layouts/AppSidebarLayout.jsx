import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AppSidebarLayout({ children, title = 'Airport Counter' }) {
    const { url, props } = usePage();
    const user = props.auth?.user;
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const isActive = (path) => {
        if (path === '/drivers') {
            return url === '/drivers';
        }

        return url === path;
    };

    const menuClass = (path) =>
        `block px-4 py-3 rounded transition ${
            isActive(path)
                ? 'bg-blue-700 text-white font-semibold'
                : 'hover:bg-slate-700 text-gray-200'
        }`;

    return (
        <>
            <Head title={title} />

            <div className="min-h-screen bg-gray-100 flex">

                {/* Fixed Sidebar */}
                <aside className={`fixed left-0 top-0 w-64 bg-slate-900 text-white h-screen flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                    <div className="p-6 border-b border-slate-700">
                        <h2 className="text-2xl font-bold">
                            TERMINAL PRIME
                        </h2>
                    </div>

                    <nav className="p-4 space-y-2 flex-1">
                        <Link href="/dashboard" className={menuClass('/dashboard')}>
                            Dashboard
                        </Link>

                        <Link href="/customers" className={menuClass('/customers')}>
                            Customers
                        </Link>

                        <Link href="/drivers" className={menuClass('/drivers')}>
                            Drivers
                        </Link>

                        <Link href="/drivers/create" className={menuClass('/drivers/create')}>
                            Add Driver
                        </Link>

                        <Link href="/users" className={menuClass('/users')}>
                            Users
                        </Link>
                    </nav>

                    {/* Bottom Profile + Logout */}
                    <div className="p-4 border-t border-slate-700 space-y-2">
                        <div className="px-4 py-2 text-sm text-gray-300">
                            {user?.name ?? 'User'}
                        </div>

                        {/* <Link
                            href="/profile"
                            className="block px-4 py-3 rounded hover:bg-slate-700 text-gray-200"
                        >
                            View Profile
                        </Link> */}

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

                {/* Content */}
                <main className={`flex-1 p-6 overflow-auto transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
                    <div className="mb-6">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen((open) => !open)}
                            aria-label={sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
                            className="inline-flex items-center justify-center rounded-lg bg-slate-900 p-3 text-white shadow hover:bg-slate-800"
                        >
                            {sidebarOpen ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                                    <path fillRule="evenodd" d="M12.707 15.707a1 1 0 0 1-1.414 0l-5-5a1 1 0 0 1 0-1.414l5-5a1 1 0 1 1 1.414 1.414L8.414 10l4.293 4.293a1 1 0 0 1 0 1.414z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                                    <path fillRule="evenodd" d="M7.293 4.293a1 1 0 0 1 1.414 0l5 5a1 1 0 0 1 0 1.414l-5 5a1 1 0 1 1-1.414-1.414L11.586 10 7.293 5.707a1 1 0 0 1 0-1.414z" clipRule="evenodd" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {children}
                </main>

            </div>
        </>
    );
}