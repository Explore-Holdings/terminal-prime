import { Head, Link, usePage } from '@inertiajs/react';

export default function AppSidebarLayout({ children, title = 'Airport Counter' }) {

    const { url } = usePage();

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

            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white min-h-screen">

                <div className="p-6 border-b border-slate-700">
                    <h2 className="text-2xl font-bold">
                        Airport Counter
                    </h2>
                </div>

                <nav className="p-4 space-y-2">

                    <Link
                        href="/dashboard"
                        className={menuClass('/dashboard')}
                    >
                        Dashboard
                    </Link>

                    <Link
                        href="/drivers"
                        className={menuClass('/drivers')}
                    >
                        Drivers
                    </Link>

                    <Link
                        href="/drivers/create"
                        className={menuClass('/drivers/create')}
                    >
                        Add Driver
                    </Link>

                </nav>
            </aside>

            {/* Content */}
            <main className="flex-1 p-8 overflow-auto">
                {children}
            </main>

        </div>
        </>
    );
}