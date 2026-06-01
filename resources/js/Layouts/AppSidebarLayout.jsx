import { Link } from '@inertiajs/react';

export default function AppSidebarLayout({ children }) {
    return (
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
                        className="block px-4 py-3 rounded hover:bg-slate-700"
                    >
                        Dashboard
                    </Link>

                    <Link
                        href="/drivers"
                        className="block px-4 py-3 rounded hover:bg-slate-700"
                    >
                        Drivers
                    </Link>

                    <Link
                        href="/drivers/create"
                        className="block px-4 py-3 rounded hover:bg-slate-700"
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
    );
}