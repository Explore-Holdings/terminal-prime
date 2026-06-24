import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency';

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-lg min-w-[190px]">
            <p className="text-xs font-semibold text-gray-400 mb-2">{label}</p>
            {payload.map(p => (
                <div key={p.name} className="flex items-center justify-between gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                        <span className="text-gray-600">{p.name}</span>
                    </div>
                    <span className="font-semibold text-gray-800">{formatCurrency(p.value)}</span>
                </div>
            ))}
        </div>
    );
}

function yTick(v) {
    if (v >= 1_000_000) return `Rs.${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000)     return `Rs.${(v / 1_000).toFixed(0)}k`;
    return `Rs.${v}`;
}

function Skeleton() {
    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
            <div className="flex justify-between mb-6">
                <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
                    <div className="h-3 bg-gray-100 rounded w-48" />
                </div>
                <div className="h-8 bg-gray-200 rounded w-28" />
            </div>
            <div className="h-[280px] bg-gray-100 rounded-xl" />
        </div>
    );
}

export default function RevenueLineChart({ data, period, onPeriodChange, loading = false }) {
    if (loading) return <Skeleton />;

    const isEmpty = !data?.length;

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h3 className="text-sm font-bold text-gray-800">Total Revenue</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Revenue vs cancelled trip value (LKR)</p>
                </div>
                <select
                    value={period}
                    onChange={e => onPeriodChange(e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 4 Weeks</option>
                </select>
            </div>

            {isEmpty ? (
                <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">
                    No revenue data for this period.
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                        <XAxis
                            dataKey="label"
                            tick={{ fontSize: 11, fill: '#9CA3AF' }}
                            tickLine={false}
                            axisLine={false}
                            dy={6}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: '#9CA3AF' }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={yTick}
                            width={72}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E5E7EB', strokeWidth: 1 }} />
                        <Legend
                            wrapperStyle={{ fontSize: 12, paddingTop: 20 }}
                            formatter={value => <span style={{ color: '#6B7280' }}>{value}</span>}
                        />
                        <Line
                            type="monotone"
                            dataKey="revenue"
                            name="Revenue"
                            stroke="#2563EB"
                            strokeWidth={2.5}
                            dot={{ r: 4, fill: '#2563EB', strokeWidth: 0 }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="cancelled_value"
                            name="Cancelled"
                            stroke="#EF4444"
                            strokeWidth={2}
                            strokeDasharray="5 4"
                            dot={{ r: 3, fill: '#EF4444', strokeWidth: 0 }}
                            activeDot={{ r: 5, strokeWidth: 0 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
