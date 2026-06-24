import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

const STATUS_STYLES = {
    Completed:   'bg-emerald-100 text-emerald-700',
    Pending:     'bg-amber-100 text-amber-700',
    Cancelled:   'bg-red-100 text-red-700',
    Assigned:    'bg-blue-100 text-blue-700',
    Accepted:    'bg-yellow-100 text-yellow-700',
    'On Route':  'bg-purple-100 text-purple-700',
    'Picked Up': 'bg-orange-100 text-orange-700',
};

const COLS = ['#', 'Passenger', 'Destination', 'Distance', 'Currency', 'Price', 'Status', 'Date'];

function SkeletonRow() {
    return (
        <tr>
            {COLS.map((c, i) => (
                <td key={i} className="py-3 px-2 first:pl-0 last:pr-0">
                    <div className="h-3 bg-gray-200 rounded animate-pulse" style={{ width: i === 0 ? 32 : i === 6 ? 64 : 80 }} />
                </td>
            ))}
        </tr>
    );
}

function buildPages(page, totalPages) {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const set = new Set([1, 2, page - 1, page, page + 1, totalPages - 1, totalPages].filter(p => p >= 1 && p <= totalPages));
    const arr = [...set].sort((a, b) => a - b);
    const result = [];
    arr.forEach((p, i) => {
        if (i > 0 && p - arr[i - 1] > 1) result.push('…');
        result.push(p);
    });
    return result;
}

export default function RecentTripsTable({ trips, meta, onPageChange, loading = false }) {
    const { currentPage = 1, lastPage = 1, total = 0 } = meta ?? {};
    const pages = buildPages(currentPage, lastPage);

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-bold text-gray-800">Recent Trips</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Newest first</p>
                </div>
                <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                    {total.toLocaleString()} trips
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[720px]">
                    <thead>
                        <tr className="border-b border-gray-100">
                            {COLS.map(h => (
                                <th
                                    key={h}
                                    className="pb-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 first:pl-0 last:pr-0"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            Array.from({ length: 8 }, (_, i) => <SkeletonRow key={i} />)
                        ) : !trips?.length ? (
                            <tr>
                                <td colSpan={COLS.length} className="py-10 text-center text-gray-400 text-sm">
                                    No trips found for this period.
                                </td>
                            </tr>
                        ) : trips.map(trip => (
                            <tr key={trip.id} className="hover:bg-gray-50/70 transition-colors">
                                <td className="py-3 pl-0 px-2 font-mono text-xs text-gray-400">#{trip.id}</td>
                                <td className="py-3 px-2 font-medium text-gray-700 whitespace-nowrap">{trip.name ?? '—'}</td>
                                <td className="py-3 px-2 text-gray-600 max-w-[140px] truncate">{trip.dropoff_location ?? '—'}</td>
                                <td className="py-3 px-2 text-gray-500 whitespace-nowrap">
                                    {trip.distance_km != null ? `${trip.distance_km} km` : '—'}
                                </td>
                                <td className="py-3 px-2 text-gray-400 text-xs font-mono">{trip.currency ?? 'LKR'}</td>
                                <td className="py-3 px-2 font-semibold text-gray-700 whitespace-nowrap">
                                    {formatCurrency(trip.price ?? 0, trip.currency ?? 'LKR')}
                                </td>
                                <td className="py-3 px-2">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${STATUS_STYLES[trip.status] ?? 'bg-gray-100 text-gray-500'}`}>
                                        {trip.status ?? '—'}
                                    </span>
                                </td>
                                <td className="py-3 px-2 pr-0 text-xs text-gray-400 whitespace-nowrap">
                                    {trip.created_at ? formatDate(trip.created_at) : '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {lastPage > 1 && !loading && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                        Page {currentPage} of {lastPage} &middot; {total.toLocaleString()} total
                    </span>

                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                        >
                            <ChevronLeft className="w-4 h-4 text-gray-600" />
                        </button>

                        {pages.map((p, i) =>
                            p === '…' ? (
                                <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">…</span>
                            ) : (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => onPageChange(p)}
                                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${
                                        p === currentPage
                                            ? 'bg-[#2563EB] text-white shadow-sm'
                                            : 'text-gray-500 hover:bg-gray-100'
                                    }`}
                                >
                                    {p}
                                </button>
                            )
                        )}

                        <button
                            type="button"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === lastPage}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                        >
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
