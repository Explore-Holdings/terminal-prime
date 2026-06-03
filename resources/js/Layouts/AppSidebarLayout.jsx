import { Head, Link, usePage } from '@inertiajs/react';

export default function AppSidebarLayout({ children, title = 'Airport Counter' }) {
    const { url, props } = usePage();
    const user = props.auth?.user;

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
                <aside className="fixed left-0 top-0 w-64 bg-slate-900 text-white h-screen flex flex-col">

                    <div className="p-6 border-b border-slate-700">
                        <h2 className="text-2xl font-bold">
                            TERMINAL PRIME
                        </h2>
                    </div>

                    <nav className="p-4 space-y-2 flex-1">
                        <Link href="/dashboard" className={menuClass('/dashboard')}>
                            Dashboard
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
                <main className="ml-64 flex-1 p-8 overflow-auto">
                    {children}
                </main>

            </div>
        </>
    );
}