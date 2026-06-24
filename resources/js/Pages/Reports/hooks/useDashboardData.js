import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
    fetchDashboardKpis,
    fetchRevenueChart,
    fetchTripStatus,
    fetchTopDestinations,
    fetchRecentTrips,
} from '../api/reportsApi';

// Donut chart colours per canonical status group
const STATUS_COLOURS = {
    completed:   '#10B981',
    pending:     '#F59E0B',
    cancelled:   '#EF4444',
    in_progress: '#3B82F6',
};

const STATUS_LABELS = {
    completed:   'Completed',
    pending:     'Pending',
    cancelled:   'Cancelled',
    in_progress: 'In Progress',
};

export function useDashboardData() {
    // ── Filter state ──────────────────────────────────────────────────────────
    const [activeRange,  setActiveRange]  = useState('week');
    const [customFrom,   setCustomFrom]   = useState('');
    const [customTo,     setCustomTo]     = useState('');
    // Revenue chart has its own period toggle (independent of the KPI filter)
    const [chartPeriod,  setChartPeriod]  = useState('week');
    const [currentPage,  setCurrentPage]  = useState(1);

    // ── Data state ────────────────────────────────────────────────────────────
    const [kpis,             setKpis]             = useState(null);
    const [revenueData,      setRevenueData]       = useState([]);
    const [statusBreakdown,  setStatusBreakdown]   = useState([]);
    const [driverAvailability, setDriverAvailability] = useState(null);
    const [topDestinations,  setTopDestinations]   = useState([]);
    const [recentTrips,      setRecentTrips]       = useState([]);
    const [tripsMeta,        setTripsMeta]         = useState({ currentPage: 1, lastPage: 1, total: 0 });

    // ── Request state ─────────────────────────────────────────────────────────
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);

    // Shared date-range params for every endpoint (except revenue chart)
    const rangeParams = useCallback(() => {
        const base = { range: activeRange };
        if (activeRange === 'custom' && customFrom && customTo) {
            base.from = customFrom;
            base.to   = customTo;
        }
        return base;
    }, [activeRange, customFrom, customTo]);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);

        const params = rangeParams();

        try {
            const [kpisData, chartData, statusData, destData, tripsData] = await Promise.all([
                fetchDashboardKpis(params),
                fetchRevenueChart({ range: chartPeriod }),
                fetchTripStatus(params),
                fetchTopDestinations({ ...params, limit: 5 }),
                fetchRecentTrips({ ...params, page: currentPage, per_page: 10 }),
            ]);

            // KPIs
            setKpis(kpisData);

            // Revenue chart: pass through as-is (backend already fills gaps)
            setRevenueData(Array.isArray(chartData) ? chartData : []);

            // Status donut
            setStatusBreakdown(
                Array.isArray(statusData)
                    ? statusData.map(s => ({
                        name:  STATUS_LABELS[s.status] ?? s.status,
                        value: s.count,
                        color: STATUS_COLOURS[s.status] ?? '#9CA3AF',
                        pct:   s.percentage,
                    }))
                    : []
            );

            // Driver availability (derived from KPI payload)
            const on  = kpisData.driver_on_duty_count  ?? 0;
            const off = kpisData.driver_off_duty_count ?? 0;
            const tot = on + off;
            setDriverAvailability({
                onDuty:     on,
                offDuty:    off,
                total:      tot,
                onDutyPct:  tot > 0 ? Math.round(on / tot * 100) : 0,
                offDutyPct: tot > 0 ? Math.round(off / tot * 100) : 0,
            });

            // Top destinations
            setTopDestinations(
                Array.isArray(destData)
                    ? destData.map((d, i) => ({
                        rank:         i + 1,
                        location:     d.dropoff_location ?? '-',
                        tripCount:    Number(d.trip_count ?? 0),
                        totalRevenue: Number(d.total_revenue ?? 0),
                        avgDistance:  parseFloat(Number(d.avg_distance_km ?? 0).toFixed(1)),
                    }))
                    : []
            );

            // Recent trips
            const items = tripsData?.data ?? [];
            setRecentTrips(items);
            setTripsMeta({
                currentPage: tripsData?.current_page ?? 1,
                lastPage:    tripsData?.last_page    ?? 1,
                total:       tripsData?.total        ?? 0,
            });
        } catch (err) {
            const msg = err?.response?.data?.error ?? 'Failed to load dashboard data.';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [rangeParams, chartPeriod, currentPage]);

    // Re-fetch whenever filters or page change
    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    // Reset to page 1 whenever the date filter changes
    const handleRangeChange = useCallback((range) => {
        setActiveRange(range);
        setCurrentPage(1);
    }, []);

    return {
        // Data
        kpis,
        revenueData,
        statusBreakdown,
        driverAvailability,
        topDestinations,
        recentTrips,
        tripsMeta,
        totalTripsCount: kpis?.total_trips ?? 0,

        // Status
        loading,
        error,

        // Filter controls
        activeRange,
        setActiveRange: handleRangeChange,
        customFrom,
        setCustomFrom,
        customTo,
        setCustomTo,
        chartPeriod,
        setChartPeriod,
        currentPage,
        setCurrentPage,
    };
}
