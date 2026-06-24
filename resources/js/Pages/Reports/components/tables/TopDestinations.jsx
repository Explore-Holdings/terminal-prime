import { formatCurrency } from '../../utils/formatCurrency';

const RANK_STYLES = [
    { badge: 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200', label: '🥇' },
    { badge: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200',       label: '🥈' },
    { badge: 'bg-orange-100 text-orange-600 ring-1 ring-orange-200', label: '🥉' },
    { badge: 'bg-blue-50 text-blue-500',                              label: '' },
    { badge: 'bg-blue-50 text-blue-500',                              label: '' },
];

function SkeletonRow() {
    return (
        <tr>
            <td className="py-3"><div className="w-7 h-7 rounded-full bg-gray-200 animate-pulse" /></td>
            {[100, 140, 48, 80, 48].map((w, i) => (
                <td key={i} className="py-3 px-2">
                    <div className={`h-3 bg-gray-200 rounded animate-pulse w-[${w}px]`} />
                </td>
            ))}
        </tr>
    );
}

export default function TopDestinations({ data, loading = false }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-800">Top Destinations</h3>
                <p className="text-xs text-gray-400 mt-0.5">Ranked by trip count</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100">
                            {['Rank', 'Location', 'Trips', 'Revenue', 'Avg Km'].map(h => (
                                <th
                                    key={h}
                                    className="pb-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide first:pl-0 last:pr-0 px-2"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            Array.from({ length: 5 }, (_, i) => <SkeletonRow key={i} />)
                        ) : !data?.length ? (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-gray-400 text-sm">
                                    No destination data for this period.
                                </td>
                            </tr>
                        ) : data.map((row, i) => {
                            const rank = i + 1;
                            const { badge, label } = RANK_STYLES[i] ?? RANK_STYLES[4];
                            return (
                                <tr key={row.location} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-3 pl-0 px-2">
                                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${badge}`}>
                                            {label || rank}
                                        </span>
                                    </td>
                                    <td className="py-3 px-2 font-medium text-gray-700 max-w-[140px]">{row.location}</td>
                                    <td className="py-3 px-2 text-gray-600 font-medium">{row.tripCount.toLocaleString()}</td>
                                    <td className="py-3 px-2 text-gray-600">{formatCurrency(row.totalRevenue)}</td>
                                    <td className="py-3 px-2 pr-0 text-gray-500">{row.avgDistance} km</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
