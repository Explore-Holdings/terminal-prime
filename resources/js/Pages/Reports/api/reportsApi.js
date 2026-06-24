import axios from 'axios';

// Leave VITE_API_BASE_URL empty for same-origin
const BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

async function get(path, params = {}) {
    const { data } = await axios.get(`${BASE}${path}`, { params });
    return data;
}

export const fetchDashboardKpis = (params = {}) =>
    get('/reports/dashboard', params);

export const fetchRevenueChart = (params = {}) =>
    get('/reports/revenue-chart', params);

export const fetchTripStatus = (params = {}) =>
    get('/reports/trip-status', params);

export const fetchTopDestinations = (params = {}) =>
    get('/reports/top-destinations', params);

export const fetchRecentTrips = (params = {}) =>
    get('/reports/recent-trips', params);