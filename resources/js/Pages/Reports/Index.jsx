import { Head, usePage } from '@inertiajs/react';
import { AlertTriangle, TrendingUp, ShoppingBag, Users, MapPin } from 'lucide-react';

import AppSidebarLayout from '@/Layouts/AppSidebarLayout';
import { useDashboardData } from './hooks/useDashboardData';
import { formatCurrency } from './utils/formatCurrency';

import PageHeader         from './components/layout/PageHeader';
import KpiCard            from './components/cards/KpiCard';
import StatusDonut        from './components/cards/StatusDonut';
import DriverAvailability from './components/cards/DriverAvailability';
import RevenueLineChart   from './components/charts/RevenueLineChart';
import TopDestinations    from './components/tables/TopDestinations';
import RecentTripsTable   from './components/tables/RecentTripsTable';

const KPI_CONFIG = [
    {
        key:      'revenue_today',
        title:    'Revenue Today',
        subtitle: 'Completed trips only',
        icon:     TrendingUp,
        iconBg:   'bg-blue-50',
        iconColor:'text-blue-600',
        trendKey: 'revenue_change_pct',
        format:   v => formatCurrency(v),
    },
    {
        key:      'total_trips',
        title:    'Total Trips',
        subtitle: 'In selected period',
        icon:     ShoppingBag,
        iconBg:   'bg-purple-50',
        iconColor:'text-purple-600',
        trendKey: 'trips_change_pct',
        format:   v => Number(v).toLocaleString(),
    },
    {
        key:      'active_drivers',
        title:    'Active Drivers',
        subtitle: 'On duty / on trip',
        icon:     Users,
        iconBg:   'bg-emerald-50',
        iconColor:'text-emerald-600',
        format:   v => Number(v),
    },
    {
        key:      'avg_distance_km',
        title:    'Avg Trip Distance',
        subtitle: 'Per trip in period',
        icon:     MapPin,
        iconBg:   'bg-amber-50',
        iconColor:'text-amber-500',
        format:   v => `${Number(v).toFixed(1)} km`,
    },
];

export default function ReportsIndex() {
    const { props } = usePage();
    const userName  = props.auth?.user?.name ?? 'Admin';

    const {
        kpis,
        revenueData,
        statusBreakdown,
        driverAvailability,
        topDestinations,
        recentTrips,
        tripsMeta,
        totalTripsCount,
        loading,
        error,
        activeRange,
        setActiveRange,
        customFrom,
        setCustomFrom,
        customTo,
        setCustomTo,
        chartPeriod,
        setChartPeriod,
        setCurrentPage,
    } = useDashboardData();

    return (
        <AppSidebarLayout title="Reports Dashboard">
            {/* Load Inter font for the reports page */}
            <Head>
                {/* <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
                    rel="stylesheet"
                /> */}
            </Head>

            {/* Full-bleed #EBF3FB background */}
            <div
                className="-mx-4 -mb-4 bg-[#EBF3FB] min-h-screen px-6 pb-10 pt-4"
                // style={{ fontFamily: "'Inter', sans-serif" }}
            >
                {/* ── Page Header ────────────────────────────────────── */}
                <PageHeader
                    userName={userName}
                    activeRange={activeRange}
                    customFrom={customFrom}
                    customTo={customTo}
                    onRangeChange={setActiveRange}
                    onCustomFromChange={setCustomFrom}
                    onCustomToChange={setCustomTo}
                />

                {/* ── Error Banner ────────────────────────────────────── */}
                {error && (
                    <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        {error}
                    </div>
                )}

                {/* ── KPI Cards ──────────────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
                    {KPI_CONFIG.map(cfg => (
                        <KpiCard
                            key={cfg.key}
                            title={cfg.title}
                            value={kpis ? cfg.format(kpis[cfg.key] ?? 0) : null}
                            subtitle={cfg.subtitle}
                            icon={cfg.icon}
                            iconBg={cfg.iconBg}
                            iconColor={cfg.iconColor}
                            trend={cfg.trendKey && kpis ? kpis[cfg.trendKey] : undefined}
                            loading={loading}
                        />
                    ))}
                </div>

                {/* ── Revenue Chart + Status  ───────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
                    <div className="lg:col-span-2">
                        <RevenueLineChart
                            data={revenueData}
                            period={chartPeriod}
                            onPeriodChange={setChartPeriod}
                            loading={loading}
                        />
                    </div>
                    <div className="flex flex-col">
                        <StatusDonut
                            data={statusBreakdown}
                            total={totalTripsCount}
                            loading={loading}
                        />
                    </div>
                </div>

                {/* ── Driver Availability + Top Destinations ─────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
                    <div>
                        <DriverAvailability data={driverAvailability} loading={loading} />
                    </div>
                    <div className="lg:col-span-2">
                        <TopDestinations data={topDestinations} loading={loading} />
                    </div>
                </div>

                {/* ── Recent Trips ───────────────────────────────────── */}
                <RecentTripsTable
                    trips={recentTrips}
                    meta={tripsMeta}
                    onPageChange={setCurrentPage}
                    loading={loading}
                />
            </div>
        </AppSidebarLayout>
    );
}
