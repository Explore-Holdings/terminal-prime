import axios from 'axios';

// Set VITE_API_BASE_URL= in your .env (leave empty for same-origin, e.g. http://localhost:8000)
const BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

async function get(path, params = {}) {
    const { data } = await axios.get(`${BASE}${path}`, { params });
    return data;
}

export const fetchDashboardKpis   = (params) => get('/api/reports/dashboard',        params);
export const fetchRevenueChart    = (params) => get('/api/reports/revenue-chart',    params);
export const fetchTripStatus      = (params) => get('/api/reports/trip-status',      params);
export const fetchTopDestinations = (params) => get('/api/reports/top-destinations', params);
export const fetchRecentTrips     = (params) => get('/api/reports/recent-trips',     params);
