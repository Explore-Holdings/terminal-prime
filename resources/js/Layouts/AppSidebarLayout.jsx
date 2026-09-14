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
    ShieldCheckIcon,
    LockClosedIcon,
    EyeIcon,
    EyeSlashIcon,
    XMarkIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    ArrowRightStartOnRectangleIcon,
    DocumentChartBarIcon,
    CalculatorIcon,
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { useIdleTimeout } from '@/hooks/useIdleTimeout';

const iconMap = {
    Dashboard: Squares2X2Icon,
    DSS: CpuChipIcon,
    Counter: BuildingStorefrontIcon,
    Manager: ClipboardDocumentListIcon,
    Finance: BanknotesIcon,
    Accountant: CalculatorIcon,
    Drivers: TruckIcon,
    Customers: UserGroupIcon,
    Trips: MapIcon,
    'Customer Surveys': ChatBubbleLeftRightIcon,
    Overview: ChartBarIcon,
    'Reports Hub': DocumentChartBarIcon,
    'Pricing Data': BanknotesIcon,
    Users: UsersIcon,
    Admin: ShieldCheckIcon,
};

export default function AppSidebarLayout({ children, title = 'Airport Counter', defaultSidebarOpen = true }) {
    const { url, props } = usePage();
    const user = props.auth?.user;
    const [sidebarOpen, setSidebarOpen] = useState(defaultSidebarOpen);

    // Admin password protection state
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [adminPassword, setAdminPassword] = useState('');
    const [adminError, setAdminError] = useState('');
    const [adminLoading, setAdminLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // 10-minute inactivity auto-logout (with 60s warning at 9 mins)
    const { isWarningVisible, secondsRemaining, stayLoggedIn } = useIdleTimeout(
        10 * 60 * 1000,
        9 * 60 * 1000
    );

    const role = String(user?.role ?? '').toLowerCase();

    const menuItems = [
        { label: 'Dashboard', path: '/dashboard', roles: ['admin', 'finance', 'counter staff', 'executive', 'manager'] },
        { label: 'DSS', path: '/dss', roles: ['admin', 'executive'] },
        { label: 'Counter', path: '/counter', roles: ['admin', 'counter staff', 'manager', 'executive'] },
        { label: 'Manager', path: '/manager-reports', roles: ['admin', 'manager', 'executive'] },
        { label: 'Finance', path: '/finance', roles: ['admin', 'finance', 'executive'] },
        { label: 'Accountant', path: '/accountant', roles: ['admin', 'accountant', 'executive'] },
        { label: 'Drivers', path: '/drivers', roles: ['admin', 'executive'] },
        { label: 'Customers', path: '/customers', roles: ['admin', 'counter staff', 'executive'] },
        { label: 'Tours', path: '/trips', roles: ['admin', 'counter staff', 'executive', 'manager'] },
        { label: 'Customer Surveys', path: '/customer-surveys', roles: ['admin', 'executive'] },
        { label: 'Overview', path: '/reports', roles: ['admin', 'executive'] },
        { label: 'Reports Hub', path: '/reports-hub', roles: ['admin', 'executive'] },
        { label: 'Pricing Data', path: '/pricing-data', roles: ['admin', 'executive'] },
        { label: 'Users', path: '/users', roles: ['admin'] },
        { label: 'Admin', path: '/admin', roles: ['admin'] },
    ];

    const visibleMenuItems = menuItems.filter((item) =>
        role.includes('executive') || item.roles.includes(role)
    );

    const isActive = (path) => url === path || url.startsWith(path + '/');

    const handleMenuClick = (e, item) => {
        if (item.label === 'Admin') {
            e.preventDefault();
            if (url.startsWith('/admin')) {
                return;
            }
            setAdminPassword('');
            setAdminError('');
            setShowAdminModal(true);
        }
    };

    const submitAdminPassword = async (e) => {
        e.preventDefault();
        if (!adminPassword) {
            setAdminError('Please enter your password.');
            return;
        }

        setAdminLoading(true);
        setAdminError('');

        try {
            const res = await axios.post('/admin/verify-password', {
                password: adminPassword,
            });

            if (res.data && res.data.success) {
                setShowAdminModal(false);
                setAdminPassword('');
                window.location.href = res.data.redirect || '/admin';
            } else {
                setAdminError(res.data?.message || 'Access denied.');
            }
        } catch (err) {
            setAdminError(err.response?.data?.message || 'Incorrect password. Access denied.');
        } finally {
            setAdminLoading(false);
        }
    };

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
                            const isAdminItem = item.label === 'Admin';

                            if (isAdminItem) {
                                return (
                                    <button
                                        key={item.path}
                                        type="button"
                                        onClick={(e) => handleMenuClick(e, item)}
                                        className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                            active
                                                ? 'bg-[#0f1d45] text-white shadow-md shadow-[#0f1d45]/20'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-[#0f1d45]'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-white' : 'text-gray-400'}`} />
                                            <span>{item.label}</span>
                                        </div>
                                        <LockClosedIcon className={`w-3.5 h-3.5 ${active ? 'text-blue-200' : 'text-gray-400'}`} />
                                    </button>
                                );
                            }

                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                        active
                                            ? 'bg-[#0f1d45] text-white shadow-md shadow-[#0f1d45]/20'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-[#0f1d45]'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-white' : 'text-gray-400'}`} />
                                        {item.label}
                                    </div>
                                    {item.label === 'Dashboard' && role === 'admin' && props.pendingAttendanceCount > 0 && (
                                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                                            {props.pendingAttendanceCount}
                                        </span>
                                    )}
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

            {/* ── Admin Password Verification Modal ── */}
            {showAdminModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden transform transition-all">
                        {/* Header */}
                        <div className="p-6 pb-4 flex items-start justify-between border-b border-gray-100 bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-[#0f1d45] text-white flex items-center justify-center shadow-lg shadow-[#0f1d45]/20 shrink-0">
                                    <LockClosedIcon className="w-6 h-6 text-blue-300" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-[#0f1d45]">Admin Verification</h3>
                                    <p className="text-xs text-gray-400 font-medium">Security authentication required</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowAdminModal(false)}
                                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={submitAdminPassword} className="p-6 space-y-4">
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Enter the dedicated Admin access key configured for this system to proceed.
                            </p>

                            {adminError && (
                                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
                                    <span>⚠️</span>
                                    <span>{adminError}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Admin Security Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={adminPassword}
                                        onChange={(e) => setAdminPassword(e.target.value)}
                                        placeholder="Enter admin access password..."
                                        autoFocus
                                        className="w-full pl-3.5 pr-10 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f1d45] focus:border-transparent font-medium"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="w-4 h-4" />
                                        ) : (
                                            <EyeIcon className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setShowAdminModal(false)}
                                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={adminLoading}
                                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0f1d45] hover:bg-[#1a2d6b] shadow-md shadow-[#0f1d45]/20 disabled:opacity-50 transition-all"
                                >
                                    {adminLoading ? 'Verifying...' : 'Unlock & Access Admin'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── 10-Minute Inactivity Warning Modal ── */}
            {isWarningVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
                    <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-amber-200 overflow-hidden transform transition-all text-center p-6 sm:p-7 space-y-4">
                        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto ring-8 ring-amber-50/50">
                            <ClockIcon className="w-8 h-8 animate-pulse" />
                        </div>

                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-200">
                                Session Inactivity
                            </span>
                            <h3 className="text-xl font-black text-[#0f1d45] mt-2">
                                Are You Still There?
                            </h3>
                            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                                You have been inactive for 9 minutes. For counter terminal security, you will be automatically logged out in:
                            </p>
                        </div>

                        {/* Countdown Pill */}
                        <div className="py-2.5 px-4 rounded-2xl bg-slate-900 text-white font-mono text-2xl font-black tracking-widest inline-flex items-center gap-2 shadow-inner">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                            <span>00:{String(secondsRemaining).padStart(2, '0')}</span>
                        </div>

                        <p className="text-[11px] text-slate-400">
                            Move your mouse, type a key, or click the button below to stay signed in.
                        </p>

                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                            <button
                                type="button"
                                onClick={stayLoggedIn}
                                className="w-full py-3 px-5 rounded-xl bg-[#0f1d45] hover:bg-[#1a2d6b] text-white font-bold text-xs shadow-lg shadow-[#0f1d45]/20 transition-all hover:scale-[1.02]"
                            >
                                I'm Still Here (Stay Logged In)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}