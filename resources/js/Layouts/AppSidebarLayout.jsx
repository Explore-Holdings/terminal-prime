import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    PaperAirplaneIcon,
    Squares2X2Icon,
    CpuChipIcon,
    BuildingStorefrontIcon,
    ClipboardDocumentListIcon,
    BanknotesIcon,
    TruckIcon,
    UserGroupIcon,
    MapIcon,
    ChatBubbleLeftRightIcon,
    ChartBarIcon,
    UsersIcon,
    ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/outline';

const iconMap = {
    Dashboard: Squares2X2Icon,
    DSS: CpuChipIcon,
    Counter: BuildingStorefrontIcon,
    Manager: ClipboardDocumentListIcon,
    Finance: BanknotesIcon,
    Drivers: TruckIcon,
    Customers: UserGroupIcon,
    Trips: MapIcon,
    'Customer Surveys': ChatBubbleLeftRightIcon,
    Reports: ChartBarIcon,
    Users: UsersIcon,
};

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
        { label: 'Tours', path: '/trips', roles: ['admin', 'counter staff', 'executive', 'manager'] },
        { label: 'Customer Surveys', path: '/customer-surveys', roles: ['admin', 'executive'] },
        { label: 'Reports', path: '/reports', roles: ['admin', 'executive'] },
        { label: 'Users', path: '/users', roles: ['admin'] },
    ];

    const visibleMenuItems = menuItems.filter((item) =>
        role.includes('executive') || item.roles.includes(role)
    );

    const isActive = (path) => url === path;

    return (
        <>
            <Head title={title} />

            <div className="min-h-screen bg-[#f5f6fa] flex">
                {/* ── Sidebar ── */}
                <aside
                    className={`fixed left-0 top-0 w-64 bg-white h-screen flex flex-col border-r border-gray-200 transition-transform duration-300 z-30 ${
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                    style={{ boxShadow: '2px 0 12px rgba(0,0,0,0.04)' }}
                >
                    {/* Brand */}
                    <div className="px-5 py-5 pb-2 flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#0f1d45] flex items-center justify-center">
                            <PaperAirplaneIcon className="w-5 h-5 -rotate-45 text-white" />
                        </div>
                        <div>
                            <h2 className="text-base font-black tracking-tight text-[#0f1d45] leading-none">Terminal Prime</h2>
                            <p className="text-[11px] text-blsck-400 font-medium mt-0.5">Airport Counter System</p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="mx-4 border-t border-gray-100" />

                    {/* Menu Section */}
                    <div className="px-4 pt-3 pb-1">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-3">Menu</p>
                    </div>

                    <nav className="px-3 space-y-0.5 flex-1 overflow-y-auto">
                        {visibleMenuItems.map((item) => {
                            const Icon = iconMap[item.label] || Squares2X2Icon;
                            const active = isActive(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                        active
                                            ? 'bg-[#0f1d45] text-white shadow-md shadow-[#0f1d45]/20'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-[#0f1d45]'
                                    }`}
                                >
                                    <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-white' : 'text-gray-400'}`} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout */}
                    <div className="mx-4 border-t border-gray-100" />
                    <div className="px-3 py-3">
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
                        >
                            <ArrowRightStartOnRectangleIcon className="w-[18px] h-[18px] shrink-0" />
                            Logout
                        </Link>
                    </div>

                    {/* User Info */}
                    <div className="mx-4 border-t border-gray-100" />
                    <div className="px-4 py-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#0f1d45] flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {(user?.name ?? 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-[#0f1d45] truncate">{user?.name ?? 'User'}</p>
                            <p className="text-xs text-gray-400 capitalize truncate">{role || 'No role'}</p>
                        </div>
                    </div>
                </aside>

                {/* ── Main Content ── */}
                <main
                    className={`flex-1 flex flex-col overflow-auto transition-all duration-300 ${
                        sidebarOpen ? 'ml-64' : 'ml-0'
                    }`}
                >
                    {/* Top Bar */}
                    <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-5 py-3 flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen((open) => !open)}
                            className="inline-flex items-center justify-center rounded-xl bg-[#0f1d45] p-2 text-white shadow-md shadow-[#0f1d45]/20 hover:bg-[#1a2d5c] transition-all duration-200"
                        >
                            {sidebarOpen ? (
                                <ChevronLeftIcon className="w-4 h-4" />
                            ) : (
                                <ChevronRightIcon className="w-4 h-4" />
                            )}
                        </button>
                        <h1 className="text-lg font-bold text-[#0f1d45]">{title}</h1>
                    </div>

                    <div className="p-5 flex-1">
                        {children}
                    </div>
                </main>
            </div>
        </>
    );
}